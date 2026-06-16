require('dotenv').config();
const express = require('express');
const cors = require('cors');
const gameRoutes = require('./src/routes/gameRoutes');
const { startWorker } = require('./src/services/queue');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'https://chess-analysis-app-wheat.vercel.app',
    methods: ['GET', 'POST'],
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