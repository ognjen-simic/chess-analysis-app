require('dotenv').config();
const express = require('express');
const cors = require('cors');
const gameRoutes = require('./src/routes/gameRoutes');
const { startWorker } = require('./src/services/queue');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://chess-analysis-app-wheat.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  }
}));

app.use(express.json());
app.use('/api/games', gameRoutes);

app.get('/', (req, res) => {
  res.send('Chess Analysis API is Running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startWorker();
});