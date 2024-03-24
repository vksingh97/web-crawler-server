const router = require('express').Router();
const authenticateJwtToken = require('../routes/middlewares/auth');
const userController = require('../routes/controllers/user');
const crawlerController = require('../routes/controllers/crawler');

// Health Check
router.get('/healthz', (_req, res) => res.json({ status: 'success' }));

// Login
router.post('/login', userController.loginUser);

// Signup
router.post('/signup', userController.signupUser);

// Crawl Url
router.post(
  '/crawl-url',
  authenticateJwtToken,
  crawlerController.crawlUrlAndVectorize
);

// Submit Query
router.post('/ask-query', authenticateJwtToken, crawlerController.askQuery);

// Logout user
router.delete('/logout', authenticateJwtToken, userController.logoutUser);

module.exports = router;
