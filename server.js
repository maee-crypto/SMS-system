const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const https = require('https');
const http2 = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:3000", "http://localhost:5001", "http://localhost:5002"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phishing-simulation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/simulations', require('./routes/simulations'));
app.use('/api/fake-websites', require('./routes/fake-websites'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));

// Educational disclaimer route
app.get('/api/disclaimer', (req, res) => {
  res.json({
    message: "This platform is for educational purposes only. All simulations are designed to raise awareness about cybersecurity threats.",
    purpose: "Educational simulation of social engineering and phishing attacks",
    disclaimer: "This is NOT a real phishing platform. All activities are simulated for educational purposes."
  });
});

// Keep-alive endpoint to prevent server from going idle on Render
app.get('/api/keep-alive', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`Keep-alive ping at ${timestamp}`);
  
  res.json({
    status: 'alive',
    timestamp: timestamp,
    message: 'Server is running and will stay awake!',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    pingCount: global.pingCount || 0
  });
});

// Manual ping endpoint for testing
app.get('/api/ping', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`Manual ping at ${timestamp}`);
  
  res.json({
    status: 'pong',
    timestamp: timestamp,
    message: 'Manual ping successful!',
    serverTime: new Date().toLocaleString(),
    uptime: process.uptime()
  });
});

// Self-pinging function to keep server alive
function pingSelf() {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
  const pingUrl = `${baseUrl}/api/keep-alive`;
  
  // Increment ping count
  global.pingCount = (global.pingCount || 0) + 1;
  
  console.log(`Pinging self at: ${pingUrl} (ping #${global.pingCount})`);
  
  const protocol = baseUrl.startsWith('https') ? https : http2;
  
  protocol.get(pingUrl, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Self-ping successful: ${res.statusCode} - Ping #${global.pingCount}`);
    });
  }).on('error', (err) => {
    console.error(`Self-ping failed (ping #${global.pingCount}):`, err.message);
  });
}

// Start self-pinging every 5 minutes (300,000 ms)
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes
let pingInterval;

function startKeepAlive() {
  // Initial ping after 30 seconds
  setTimeout(() => {
    pingSelf();
    // Start regular pinging
    pingInterval = setInterval(pingSelf, PING_INTERVAL);
    console.log(`Keep-alive system started. Pinging every ${PING_INTERVAL / 1000} seconds`);
  }, 30000);
}

// Stop keep-alive function
function stopKeepAlive() {
  if (pingInterval) {
    clearInterval(pingInterval);
    console.log('Keep-alive system stopped');
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  stopKeepAlive();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  stopKeepAlive();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-simulation', (data) => {
    socket.join(data.simulationId);
    console.log(`User ${socket.id} joined simulation ${data.simulationId}`);
  });
  
  socket.on('simulation-event', (data) => {
    socket.to(data.simulationId).emit('simulation-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start keep-alive system only in production
  if (process.env.NODE_ENV === 'production') {
    startKeepAlive();
    console.log('Keep-alive system enabled for production');
  } else {
    console.log('Keep-alive system disabled in development');
  }
}); 