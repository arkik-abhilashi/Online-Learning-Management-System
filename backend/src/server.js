const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const { initSocket } = require('./socket');
const swaggerSetup = require('./swagger');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const quizRoutes = require('./routes/quizRoutes');
const studentRoutes = require('./routes/studentRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studentFeaturesRoutes = require('./routes/studentFeaturesRoutes');
const publicRoutes = require('./routes/publicRoutes');
const instructorRoutes = require('./routes/instructorRoutes'); // جدید
const messageRoutes = require('./routes/messageRoutes'); // جدید

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));

swaggerSetup(app);

app.get('/', (req, res) => res.json({ message: 'LMS API running...' }));
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/sessions', sessionRoutes);
app.use('/api/sessions/:sessionId/quizzes', quizRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student/features', studentFeaturesRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/messages', messageRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

initSocket(server);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
