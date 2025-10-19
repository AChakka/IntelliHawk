const express = require('express');
const https = require('https');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper function to make HTTPS requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Start SSL Labs analysis
app.post('/api/ssl-check/start', async (req, res) => {
  const { domain } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const url = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&startNew=on&all=done`;
    const data = await makeRequest(url);
    res.json(data);
  } catch (error) {
    console.error('Error starting SSL analysis:', error);
    res.status(500).json({ 
      error: 'Failed to start SSL analysis',
      details: error.message 
    });
  }
});

// Poll SSL Labs for results
app.get('/api/ssl-check/poll/:domain', async (req, res) => {
  const domain = req.params.domain;

  try {
    const url = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&all=done`;
    const data = await makeRequest(url);
    res.json(data);
  } catch (error) {
    console.error('Error polling SSL analysis:', error);
    res.status(500).json({ 
      error: 'Failed to poll SSL analysis',
      details: error.message 
    });
  }
});

// Get SSL Labs API info
app.get('/api/ssl-check/info', async (req, res) => {
  try {
    const data = await makeRequest('https://api.ssllabs.com/api/v3/info');
    res.json(data);
  } catch (error) {
    console.error('Error getting API info:', error);
    res.status(500).json({ 
      error: 'Failed to get API info',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`SSL Checker API running on http://localhost:${PORT}`);
});