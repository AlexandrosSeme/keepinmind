// Home Assistant REST API Service

interface HomeAssistantConfig {
  baseUrl: string;
  accessToken: string;
}

interface HomeAssistantState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

class HomeAssistantService {
  private config: HomeAssistantConfig | null = null;
  private states: Map<string, HomeAssistantState> = new Map();
  private refreshInterval: number | null = null;

  constructor() {
    // Load config from localStorage
    this.loadConfig();
  }

  private loadConfig(): void {
    const baseUrl =
      localStorage.getItem("haBaseUrl") || "http://192.168.1.79:8123";
    const accessToken = localStorage.getItem("haAccessToken") || "";

    this.config = {
      baseUrl: baseUrl.replace(/\/$/, ""), // Remove trailing slash
      accessToken,
    };
  }

  updateConfig(baseUrl: string, accessToken: string): void {
    localStorage.setItem("haBaseUrl", baseUrl);
    localStorage.setItem("haAccessToken", accessToken);
    this.loadConfig();
  }

  getConfig(): HomeAssistantConfig | null {
    return this.config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    if (!this.config || !this.config.accessToken) {
      throw new Error(
        "Home Assistant δεν ειναι ρυθμισμενο. Παρακαλω εισαγετε Access Token.",
      );
    }

    // Use backend proxy server to avoid CORS issues
    // The proxy server runs on http://localhost:3010
    const proxyUrl = "http://localhost:3010/api/home-assistant";
    const directUrl = `${this.config.baseUrl}/api${endpoint}`;

    // Try proxy first, fallback to direct connection
    const tryProxy = async (): Promise<Response> => {
      const url = `${proxyUrl}${endpoint}`;
      const headers: HeadersInit = {
        "X-HA-Base-Url": this.config!.baseUrl,
        "X-HA-Access-Token": this.config!.accessToken,
        "Content-Type": "application/json",
        ...options.headers,
      };

      return fetch(url, {
        ...options,
        headers,
      });
    };

    const tryDirect = async (): Promise<Response> => {
      const headers: HeadersInit = {
        Authorization: `Bearer ${this.config!.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      };

      return fetch(directUrl, {
        ...options,
        headers,
      });
    };

    try {
      // Try proxy first
      let response: Response;

      try {
        response = await tryProxy();
        // If proxy returns 500 or connection error, try direct
        if (!response.ok && response.status >= 500) {
          response = await tryDirect();
        }
      } catch {
        // Proxy not available, try direct connection
        try {
          response = await tryDirect();
        } catch (directError) {
          const message =
            directError instanceof Error ? directError.message : "";
          // Both failed
          if (
            message.includes("Failed to fetch") ||
            message.includes("CORS") ||
            message.includes("NetworkError")
          ) {
            throw new Error(
              `Δεν ηταν δυνατη η συνδεση με το Home Assistant.\n\nΠιθανες αιτιες:\n1. Το backend server (localhost:3010) δεν τρεχει\n2. Το Home Assistant δεν ειναι προσβασιμο στο ${this.config.baseUrl}\n3. Σφαλμα CORS (προσπαθηστε να προσθεσετε CORS headers στο Home Assistant)\n\nΛυση: Εκκινηστε το backend server με: node server.js`,
            );
          }
          throw directError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        if (response.status === 401) {
          throw new Error(
            "Μη εγκυρο Access Token. Παρακαλω ελεγξτε το token στις ρυθμισεις.",
          );
        } else if (response.status === 404) {
          throw new Error(
            `Το Home Assistant δεν βρεθηκε στο ${this.config.baseUrl}. Ελεγξτε το URL.`,
          );
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      // Re-throw if it's already a formatted error
      if (message && !message.includes("Failed to fetch")) {
        throw error;
      }

      // Handle network errors
      if (
        message.includes("Failed to fetch") ||
        message.includes("NetworkError")
      ) {
        throw new Error(
          `Σφαλμα συνδεσης: Δεν ηταν δυνατη η συνδεση με το Home Assistant.\n\nΕλεγξτε:\n1. Αν το Home Assistant ειναι ενεργο στο ${this.config.baseUrl}\n2. Αν το backend server (localhost:3010) τρεχει\n3. Αν το Access Token ειναι σωστο\n\nΓια να εκκινησετε το backend server: node server.js`,
        );
      }
      throw error;
    }
  }

  async getStates(): Promise<HomeAssistantState[]> {
    const states = await this.request<HomeAssistantState[]>("/states");

    // Update local cache
    states.forEach((state) => {
      this.states.set(state.entity_id, state);
    });

    return states;
  }

  async callService(
    domain: string,
    service: string,
    entityId?: string | string[],
    serviceData?: Record<string, unknown>,
  ): Promise<unknown> {
    // Home Assistant API expects only entity_id and service_data in the body
    // Domain and service are in the URL path
    const payload: Record<string, unknown> = {};

    if (entityId) {
      payload.entity_id = entityId;
    }

    if (serviceData) {
      // Merge service_data into payload (Home Assistant accepts both formats)
      Object.assign(payload, serviceData);
    }

    return this.request(`/services/${domain}/${service}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async turnOn(entityId: string | string[]): Promise<unknown> {
    const domain = Array.isArray(entityId)
      ? entityId[0].split(".")[0]
      : entityId.split(".")[0];

    return this.callService(domain, "turn_on", entityId);
  }

  async turnOff(entityId: string | string[]): Promise<unknown> {
    const domain = Array.isArray(entityId)
      ? entityId[0].split(".")[0]
      : entityId.split(".")[0];

    return this.callService(domain, "turn_off", entityId);
  }

  async setColor(
    entityId: string,
    rgb: [number, number, number],
  ): Promise<unknown> {
    return this.callService("light", "turn_on", entityId, {
      rgb_color: rgb,
    });
  }

  async getHomeAssistantConfig(): Promise<unknown> {
    return this.request("/config");
  }

  startAutoRefresh(intervalMs: number = 5000): void {
    this.stopAutoRefresh();
    this.refreshInterval = window.setInterval(() => {
      this.getStates().catch(() => {
        // Silently handle auto-refresh errors
      });
    }, intervalMs);
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval !== null) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getHomeAssistantConfig();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const homeAssistantService = new HomeAssistantService();
export type { HomeAssistantState, HomeAssistantConfig };
