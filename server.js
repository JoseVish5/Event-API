const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load .env variables (for local testing; Render uses its own ENV panel)
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase using JSON-parsed credentials from env variable
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n') // Ensure newlines are correct
    }),
    databaseURL: "https://event-reg-app-default-rtdb.firebaseio.com"
  });
} catch (error) {
  console.error("Firebase Admin Initialization Error:", error.message);
  process.exit(1); // Exit if Firebase fails to initialize
}

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
    console.error("Error fetching registrations:", err.message);
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
    console.error("Error adding registration:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
