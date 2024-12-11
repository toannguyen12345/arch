// Import dependencies
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Dashboard from './models/dashboardModel.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import staffRoutes from './routes/staffRoutes.js';

// Load environment variables
dotenv.config({ path: './.env' }); // Chỉ định cụ thể đường dẫn file .env nếu cần

// Log toàn bộ biến môi trường để kiểm tra
console.log("ENVIRONMENT VARIABLES:", process.env);
console.log("CLOUDINARY_UPLOAD_PRESET:", process.env.CLOUDINARY_UPLOAD_PRESET);

// Connect to MongoDB
connectDB();

// Initialize Express application
const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Route to fetch all dashboard items
app.get('/dashboard', async (req, res) => {
  try {
    const items = await Dashboard.find();
    console.log(items);
    res.json(items);
  } catch (error) {
    console.error(`Error fetching dashboard items: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch dashboard items' });
  }
});

// Register API routes
app.use('/api/students', studentRoutes);
app.use('/api/login', adminRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/staffs', staffRoutes);

// Cloudinary configuration routes
app.get('/api/config/cloudinary', (req, res) => {
  res.send(process.env.CLOUDINARY_URL || 'Cloudinary URL not configured');
});

app.get('/api/config/cloudinarypreset', (req, res) => {
  res.send(process.env.CLOUDINARY_UPLOAD_PRESET || 'Cloudinary preset not configured');
});

// Static file handling for production
const __dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  // Default route for development
  app.get('/', async (req, res) => {
    res.send('API is running...');
  });
}

// Error handling middleware
// Fallback route for 404 errors
app.use((req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// General error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
