import express from 'express';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Proxy API requests to backend
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const backendUrl = process.env.BACKEND_API || 'http://localhost:5000';
    console.log(`Proxying request to: ${backendUrl}/api/chat`);
    
    const response = await axios.post(`${backendUrl}/api/chat`, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Backend error',
      details: error.message 
    });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend proxy server listening at http://0.0.0.0:${port}`);
  console.log(`Backend API: ${process.env.BACKEND_API || 'http://localhost:5000'}`);
});
