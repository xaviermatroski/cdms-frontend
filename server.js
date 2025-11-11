const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
}));

// After your session middleware, add this:
app.use((req, res, next) => {
  // If no session user, create a mock one (for testing)
  if (!req.session.user) {
    req.session.user = {
      username: 'john_doe',
      fullName: 'John Doe',
      role: 'admin',
      organization: 'Org1MSP',
      token: 'mock-token'
    };
    req.session.token = 'mock-token';
  }
  res.locals.user = req.session.user;
  res.locals.currentPage = req.path;
  next();
});

// Import controllers cases
const casesController = require('./controllers/casesController');

// Cases routes
app.get('/cases', casesController.listCases);
app.get('/cases/create', casesController.showCreateForm);
app.post('/cases', casesController.createCase);
app.get('/cases/:id', casesController.showCaseDetail);
app.get('/cases/:id/delete', casesController.deleteCase);

// Import contollers records
const recordsController = require('./controllers/recordsController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Records routes
app.get('/records', recordsController.listRecords);
app.get('/records/create', recordsController.showCreateForm);
app.post('/records', upload.single('file'), recordsController.createRecord);
app.get('/records/:id', recordsController.showRecordDetail);
app.get('/records/:id/download', recordsController.downloadRecord);
app.get('/records/:id/delete', recordsController.deleteRecord);

// Import controller policies
const policiesController = require('./controllers/policiesController');

// Policies routes (admin only)
app.get('/policies', policiesController.listPolicies);
app.get('/policies/create', policiesController.showCreateForm);
app.post('/policies', policiesController.createPolicy);
app.get('/policies/:id', policiesController.showPolicyDetail);
app.get('/policies/:id/delete', policiesController.deletePolicy);

// Import controller profile
const profileController = require('./controllers/profileController');

// Profile routes
app.get('/profile', profileController.showProfile);

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.render('layouts/main', {
    pageTitle: 'Dashboard',
    currentPage: '/dashboard',
    body: 'dashboard/index',
    success: req.query.success ? decodeURIComponent(req.query.success) : null,
    error: req.query.error ? decodeURIComponent(req.query.error) : null
  });
});

// Records route
app.get('/records', (req, res) => {
  res.render('layouts/main', {
    pageTitle: 'Records',
    currentPage: '/records',
    body: 'dashboard/index'
  });
});

// Policies route
app.get('/policies', (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      message: 'Access Denied - Admin only',
      status: 403
    });
  }
  res.render('layouts/main', {
    pageTitle: 'Policies',
    currentPage: '/policies',
    body: 'dashboard/index'
  });
});

// Home page
app.get('/', (req, res) => {
  res.render('index');
});

// Error page template
app.get('/error', (req, res) => {
  res.render('error', {
    message: 'An error occurred',
    status: 500
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    status: 404
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
});
