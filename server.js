// Simple Express server to proxy Maileroo API requests
// This avoids CORS issues when calling Maileroo API from the browser

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Node.js 18+ has built-in fetch, no need to import

const app = express();
// Changed default port to 3010 to avoid conflicts with other apps using 3001
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());

// Maileroo API proxy endpoint
app.post('/api/maileroo/send', async (req, res) => {
  try {
    console.log('📤 Received request to send email via Maileroo');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', req.headers);

    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required. Please provide X-Api-Key header.'
      });
    }

    // Maileroo API endpoint (correct according to documentation)
    const endpoint = 'https://smtp.maileroo.com/api/v2/emails';
    
    // Transform payload to Maileroo format
    // Maileroo expects: from.address, from.display_name, to[].address, to[].display_name
    const mailerooPayload = {
      from: {
        address: req.body.from?.email || req.body.from?.address,
        display_name: req.body.from?.name || req.body.from?.display_name || 'Colosseum Gym'
      },
      to: (Array.isArray(req.body.to) ? req.body.to : [req.body.to]).map((recipient) => ({
        address: recipient.email || recipient.address,
        display_name: recipient.name || recipient.display_name || recipient.email?.split('@')[0] || ''
      })),
      subject: req.body.subject,
      html: req.body.html || req.body.text || '',
      plain: req.body.text || req.body.html || '',
    };
    
    console.log('📤 Transformed payload for Maileroo:', JSON.stringify(mailerooPayload, null, 2));

    try {
      console.log(`🔄 Sending request to Maileroo: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(mailerooPayload),
      });

      console.log(`📊 Response status: ${response.status}`);

      const data = await response.json().catch(() => ({}));
      console.log('📥 Response data:', data);

      if (response.ok) {
        console.log(`✅ Success! Email sent via Maileroo`);
        return res.status(response.status).json({
          success: true,
          messageId: data.id || data.messageId,
          ...data
        });
      } else {
        console.error(`❌ Maileroo API error:`, data);
        
        // Check for domain verification error
        let errorMessage = data.message || data.error || 'Failed to send email';
        if (errorMessage.includes('not associated') || errorMessage.includes('domain')) {
          errorMessage = `Domain verification error: ${errorMessage}\n\n` +
            `Το Maileroo απαιτεί verified domain. Το Gmail δεν λειτουργεί.\n\n` +
            `Λύση:\n` +
            `1. Πήγαινε στο https://app.maileroo.com → Domains\n` +
            `2. Πρόσθεσε το domain σου (π.χ. fightingrooster.gr)\n` +
            `3. Πρόσθεσε DNS records (SPF, DKIM, DMARC) που θα σου δώσει το Maileroo\n` +
            `4. Verify το domain\n` +
            `5. Χρησιμοποίησε email@yourdomain.com στο Settings`;
        }
        
        return res.status(response.status).json({
          success: false,
          error: errorMessage,
          ...data
        });
      }
    } catch (error) {
      console.error(`❌ Error calling Maileroo API:`, error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to connect to Maileroo API',
        details: error
      });
    }

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Home Assistant API proxy endpoint
// This avoids CORS issues when calling Home Assistant API from the browser
app.all('/api/home-assistant/*', async (req, res) => {
  try {
    const haBaseUrl = req.headers['x-ha-base-url'] || process.env.HA_BASE_URL || 'http://192.168.1.79:8123';
    const accessToken = req.headers['x-ha-access-token'] || process.env.HA_ACCESS_TOKEN || '';
    
    if (!accessToken) {
      console.error('❌ Home Assistant proxy: No access token provided');
      return res.status(400).json({
        success: false,
        error: 'Home Assistant Access Token is required. Provide X-HA-Access-Token header or set HA_ACCESS_TOKEN env variable.'
      });
    }

    // Extract the endpoint path (everything after /api/home-assistant/)
    const endpoint = req.path.replace('/api/home-assistant', '');
    const url = `${haBaseUrl.replace(/\/$/, '')}/api${endpoint}`;
    
    console.log(`🏠 Home Assistant proxy: ${req.method} ${url}`);
    console.log(`   Base URL: ${haBaseUrl}`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Token: ${accessToken.substring(0, 20)}...`);

    // Forward query parameters
    const urlObj = new URL(url);
    Object.keys(req.query).forEach(key => {
      urlObj.searchParams.append(key, req.query[key]);
    });
    const finalUrl = urlObj.toString();

    // Prepare request body for POST/PUT/PATCH
    let requestBody;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      requestBody = JSON.stringify(req.body);
      console.log(`   Request body: ${requestBody}`);
    }

    try {
      const response = await fetch(finalUrl, {
        method: req.method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log(`   Response status: ${response.status}`);

      // Read response body only once
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          const text = await response.text();
          data = { error: text || 'No response body' };
        }
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: text || 'No response body' };
        }
      }

      if (response.ok) {
        console.log(`✅ Home Assistant proxy: Success`);
        return res.status(response.status).json(data);
      } else {
        console.error(`❌ Home Assistant proxy error: ${response.status}`, data);
        return res.status(response.status).json({
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
          ...data
        });
      }
    } catch (fetchError) {
      console.error('❌ Home Assistant proxy fetch error:', fetchError);
      return res.status(500).json({
        success: false,
        error: `Failed to connect to Home Assistant at ${haBaseUrl}: ${fetchError.message}`,
        details: fetchError.message
      });
    }
  } catch (error) {
    console.error('❌ Home Assistant proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to connect to Home Assistant',
      details: error.toString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Maileroo proxy server is running' });
});

// Test Home Assistant connection endpoint
app.get('/api/home-assistant/test', async (req, res) => {
  try {
    const haBaseUrl = req.headers['x-ha-base-url'] || req.query.baseUrl || process.env.HA_BASE_URL || 'http://192.168.1.79:8123';
    const accessToken = req.headers['x-ha-access-token'] || req.query.token || process.env.HA_ACCESS_TOKEN || '';
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Access Token is required'
      });
    }

    const testUrl = `${haBaseUrl.replace(/\/$/, '')}/api/config`;
    console.log(`🧪 Testing Home Assistant connection: ${testUrl}`);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return res.json({
        success: true,
        message: 'Connection successful',
        version: data.version,
        location_name: data.location_name,
      });
    } else {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      });
    }
  } catch (error) {
    console.error('❌ Test connection error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to connect',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Maileroo proxy server running on http://localhost:${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/maileroo/send`);
});

