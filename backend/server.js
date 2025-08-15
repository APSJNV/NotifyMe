const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/NotifyMe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Import and initialize after DB connection
  const { initializeScheduledJobs } = require('./routes/msgs');
  await initializeScheduledJobs();
})
.catch((err) => console.error('MongoDB connection error:', err));

// Import routes after app initialization
const { router: msgRoutes } = require('./routes/msgs');
const noteRoutes = require('./routes/notes');
const { router: authRoutes } = require('./middleware/auth');

// Routes
app.use('/api/msgs', msgRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'MERN Notification Scheduler API Server' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
