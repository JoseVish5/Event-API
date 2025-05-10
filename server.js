// server.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://event-reg-app-default-rtdb.firebaseio.com"
});

const db = admin.database();

// GET all registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const snapshot = await db.ref('event_integration').once('value');
    const data = snapshot.val() || {};
    const registrations = Object.entries(data).map(([id, user]) => ({
      id,
      ...user
    }));
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new registration
app.post('/api/registrations', async (req, res) => {
  try {
    const newRef = db.ref('event_integration').push();
    await newRef.set(req.body);
    res.status(201).json({ id: newRef.key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Default route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Event Registration API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
