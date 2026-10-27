import app from './src/app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Internship REST API Server running on port ${PORT}`);
  console.log(`📌 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`📌 Internships API available at: http://localhost:${PORT}/api/internships`);
  console.log(`🌐 Interactive API Explorer UI at: http://localhost:${PORT}/`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
