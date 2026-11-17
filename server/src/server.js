import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Start HTTP Server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CareerPilot Backend API running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Allowed Frontend Origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start CareerPilot server:', err);
    process.exit(1);
  }
};

startServer();

