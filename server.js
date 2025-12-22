// Simple Express server to proxy Maileroo API requests
// This avoids CORS issues when calling Maileroo API from the browser

import express from 'express';
import cors from 'cors';

// Node.js 18+ has built-in fetch, no need to import

const app = express();
const PORT = process.env.PORT || 3001;

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
        display_name: req.body.from?.name || req.body.from?.display_name || 'Fighting Rooster Athens'
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Maileroo proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Maileroo proxy server running on http://localhost:${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/maileroo/send`);
});

