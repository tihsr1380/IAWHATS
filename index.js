const express = require('express');
const { create } = require('@wppconnect-team/wppconnect');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let client;

app.post('/api/:session/start-session', async (req, res) => {
  try {
    const session = req.params.session;
    client = await create({
      session,
      catchQR: (base64Qr, asciiQR) => {
        console.log('QR RECEIVED', asciiQR);
      },
    });
    res.json({ status: 'Session started', session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/:session/qrcode', (req, res) => {
  if (!client || !client.getQrCode) {
    return res.status(400).json({ error: 'Session not initialized or QR not ready' });
  }
  client.getQrCode().then(qr => {
    res.send(`<img src="${qr}" />`);
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

app.post('/api/:session/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!client) return res.status(400).json({ error: 'Client not initialized' });
    const result = await client.sendText(`${phone}@c.us`, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

