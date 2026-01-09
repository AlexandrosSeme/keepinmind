import React, { useEffect, useState, useCallback } from "react";
import { homeAssistantService } from "../services/homeAssistantService";
import type { HomeAssistantState } from "../services/homeAssistantService";
import {
  RefreshCw,
  Settings,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  XCircle,
  Power,
  PowerOff,
} from "lucide-react";

const HomeAssistant: React.FC = () => {
  const [states, setStates] = useState<HomeAssistantState[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    baseUrl: localStorage.getItem("haBaseUrl") || "http://192.168.1.79:8123",
    accessToken:
      localStorage.getItem("haAccessToken") ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIwNDA3M2IyNGU3YTI0ZGU0ODhhNTdkOTk1Y2YxNzU5ZCIsImlhdCI6MTc0ODEyNDk3MCwiZXhwIjoyMDYzNDg0OTcwfQ.HCDRE23HhxfJfMTugjwl4IzQvzi-7kt_dRIA9g-vNr0",
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadStates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure service has latest config
      homeAssistantService.updateConfig(config.baseUrl, config.accessToken);

      const haConfig = homeAssistantService.getConfig();
      if (!haConfig || !haConfig.accessToken) {
        setConnected(false);
        setError("Παρακαλώ ρυθμίστε το Access Token στις ρυθμίσεις.");
        setLoading(false);
        return;
      }

      const testConnected = await homeAssistantService.testConnection();
      setConnected(testConnected);

      if (testConnected) {
        const allStates = await homeAssistantService.getStates();
        // Filter only L2 device
        const l2State = allStates.filter(
          (state) => state.entity_id === "light.sonoff_10013f8587"
        );

        setStates(l2State);
        setError(null); // Clear any previous errors
      } else {
        setError(
          "Δεν ήταν δυνατή η σύνδεση με το Home Assistant. Ελέγξτε:\n1. Αν το backend server (localhost:3010) τρέχει\n2. Αν το Home Assistant είναι ενεργό\n3. Αν το URL και το Access Token είναι σωστά"
        );
      }
    } catch (err: any) {
      let errorMsg = err.message || "Σφάλμα κατά τη φόρτωση των συσκευών.";

      // Check for CORS errors
      if (
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("CORS")
      ) {
        errorMsg =
          "Σφάλμα CORS: Το Home Assistant πρέπει να επιτρέπει requests από αυτόν τον server. Ελέγξτε τις ρυθμίσεις CORS στο Home Assistant.";
      } else if (err.message?.includes("401")) {
        errorMsg = "Μη έγκυρο Access Token. Παρακαλώ ελέγξτε το token.";
      } else if (err.message?.includes("404")) {
        errorMsg = "Το Home Assistant δεν βρέθηκε. Ελέγξτε τη διεύθυνση URL.";
      }

      setError(errorMsg);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [config.baseUrl, config.accessToken]);

  useEffect(() => {
    // Initialize service with current config
    homeAssistantService.updateConfig(config.baseUrl, config.accessToken);
    loadStates();

    if (autoRefresh) {
      homeAssistantService.startAutoRefresh(5000);
    }

    return () => {
      homeAssistantService.stopAutoRefresh();
    };
  }, [autoRefresh, config.baseUrl, config.accessToken, loadStates]);

  const handleTurnOn = async (entityId: string) => {
    try {
      await homeAssistantService.turnOn(entityId);
      // Refresh immediately and then again after a delay
      loadStates();
      setTimeout(() => {
        loadStates();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Σφάλμα κατά την ενεργοποίηση.");
    }
  };

  const handleTurnOff = async (entityId: string) => {
    try {
      await homeAssistantService.turnOff(entityId);
      // Refresh immediately and then again after a delay
      loadStates();
      setTimeout(() => {
        loadStates();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Σφάλμα κατά την απενεργοποίηση.");
    }
  };

  const handleSetWhite = async (entityId: string) => {
    try {
      await homeAssistantService.setColor(entityId, [255, 255, 255]); // RGB for white
      loadStates();
    } catch (err: any) {
      setError(err.message || "Σφάλμα κατά την αλλαγή χρώματος σε white.");
    }
  };

  const handleSetGreen = async (entityId: string) => {
    try {
      await homeAssistantService.setColor(entityId, [0, 255, 0]); // RGB for green
      setTimeout(() => {
        handleSetWhite(entityId);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Σφάλμα κατά την αλλαγή χρώματος σε green.");
    }
  };

  const handleSetRed = async (entityId: string) => {
    try {
      await homeAssistantService.setColor(entityId, [255, 0, 0]); // RGB for red
      setTimeout(() => {
        handleSetWhite(entityId);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Σφάλμα κατά την αλλαγή χρώματος σε red.");
    }
  };

  const handleSaveSettings = () => {
    homeAssistantService.updateConfig(config.baseUrl, config.accessToken);
    localStorage.setItem("haBaseUrl", config.baseUrl);
    localStorage.setItem("haAccessToken", config.accessToken);
    setShowSettings(false);
    // Reload states after a short delay to ensure config is saved
    setTimeout(() => {
      loadStates();
    }, 100);
  };

  const getStateBadge = (state: string) => {
    const upperState = state.toUpperCase();
    if (upperState === "ON") {
      return <span className="badge bg-success">ON</span>;
    } else if (upperState === "OFF") {
      return <span className="badge bg-secondary">OFF</span>;
    } else if (upperState === "UNAVAILABLE" || upperState === "UNKNOWN") {
      return <span className="badge bg-danger">N/A</span>;
    }
    return <span className="badge bg-info">{state}</span>;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("el-GR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const getEntityName = (state: HomeAssistantState): string => {
    return (
      state.attributes.friendly_name ||
      state.entity_id
        .split(".")[1]
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };


  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <div>
          <h2 className="h4 mb-2">L2 Control</h2>
          <p className="text-muted mb-0">
            Έλεγχος L2 (light.sonoff_10013f8587)
          </p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button
            className="btn btn-outline-secondary"
            onClick={loadStates}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "spinning" : ""}
              style={{ marginRight: "8px" }}
            />
            Ανανέωση
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} style={{ marginRight: "8px" }} />
            Ρυθμίσεις
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  {connected ? (
                    <CheckCircle size={24} className="text-success" />
                  ) : (
                    <XCircle size={24} className="text-danger" />
                  )}
                  <div>
                    <h5 className="mb-1">
                      Σύνδεση: {connected ? "Συνδεδεμένο" : "Ασύνδετο"}
                    </h5>
                    {config.baseUrl && (
                      <small className="text-muted">{config.baseUrl}</small>
                    )}
                  </div>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="autoRefresh">
                    Αυτόματη ανανέωση
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="alert alert-danger d-flex align-items-start"
              role="alert"
            >
              <AlertCircle size={20} className="me-2 mt-1" />
              <div className="flex-grow-1">
                <strong>Σφάλμα:</strong>
                <div style={{ whiteSpace: "pre-line", marginTop: "8px" }}>
                  {error}
                </div>
                {error.includes("backend server") && (
                  <div className="mt-3 p-2 bg-light rounded">
                    <small>
                      <strong>Για να εκκινήσετε το backend server:</strong>
                      <br />
                      <code>node server.js</code>
                      <br />
                      ή<br />
                      <code>npm run dev</code> (αν έχετε script)
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ρυθμίσεις Home Assistant</h3>
              <button
                className="modal-close"
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info mb-3">
                <small>
                  <strong>Πώς να βρείτε το Access Token:</strong>
                  <br />
                  1. Ανοίξτε το Home Assistant
                  <br />
                  2. Πηγαίνετε στο Profil → Long-Lived Access Tokens
                  <br />
                  3. Δημιουργήστε ένα νέο token και αντιγράψτε το
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label">Base URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.baseUrl}
                  onChange={(e) =>
                    setConfig({ ...config, baseUrl: e.target.value })
                  }
                  placeholder="http://192.168.1.79:8123"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Access Token</label>
                <input
                  type="password"
                  className="form-control"
                  value={config.accessToken}
                  onChange={(e) =>
                    setConfig({ ...config, accessToken: e.target.value })
                  }
                  placeholder="Long-Lived Access Token"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowSettings(false)}
              >
                Ακύρωση
              </button>
              <button className="btn btn-primary" onClick={handleSaveSettings}>
                Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      )}

      {/* L2 Device Card */}
      {states.length > 0 ? (
        <div className="row">
          <div className="col-12 col-md-6 col-lg-4">
            {states.map((state) => (
              <div key={state.entity_id} className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      {state.state.toLowerCase() === "on" ? (
                        <Lightbulb className="text-warning" size={24} />
                      ) : (
                        <Lightbulb size={24} />
                      )}
                      <div>
                        <h5 className="card-title mb-1">
                          {getEntityName(state)}
                        </h5>
                        <small className="text-muted d-block">
                          {state.entity_id}
                        </small>
                      </div>
                    </div>
                    {getStateBadge(state.state)}
                  </div>

                  {/* State Info */}
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">
                      Κατάσταση:
                    </small>
                    <div className="bg-light p-2 rounded">
                      <strong>{state.state}</strong>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="mb-3">
                    <small className="text-muted">
                      Τελευταία ενημέρωση: {formatTimestamp(state.last_updated)}
                    </small>
                  </div>

                  {/* Controls */}
                  <div className="d-grid gap-2">
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleTurnOn(state.entity_id)}
                        disabled={!connected || state.state.toLowerCase() === "on"}
                      >
                        <Power size={14} style={{ marginRight: "4px" }} />
                        ON
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleTurnOff(state.entity_id)}
                        disabled={!connected || state.state.toLowerCase() === "off"}
                      >
                        <PowerOff size={14} style={{ marginRight: "4px" }} />
                        OFF
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleSetGreen(state.entity_id)}
                      disabled={!connected}
                    >
                      Green
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleSetRed(state.entity_id)}
                      disabled={!connected}
                    >
                      Red
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                {loading ? (
                  <>
                    <div
                      className="spinner-border text-primary mb-3"
                      role="status"
                    >
                      <span className="visually-hidden">Φόρτωση...</span>
                    </div>
                    <p className="text-muted">
                      Φόρτωση L2 από Home Assistant...
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle size={48} className="text-muted mb-3" />
                    <h5>Το L2 δεν βρέθηκε</h5>
                    <p className="text-muted">
                      {connected
                        ? "Το L2 (light.sonoff_10013f8587) δεν βρέθηκε στο Home Assistant."
                        : "Συνδεθείτε πρώτα στο Home Assistant για να δείτε το L2."}
                    </p>
                    {!config.accessToken && (
                      <p className="text-muted small">
                        Παρακαλώ εισάγετε το Access Token στις ρυθμίσεις.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }
        .modal-close {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }
        .modal-close:hover {
          color: #1a1a1a;
        }
        .modal-body {
          padding: 20px;
          overflow-y: auto;
        }
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};

export default HomeAssistant;
