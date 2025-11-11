const axios = require('axios');

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const dashboardController = {
  showDashboard: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;

      // Fetch stats and recent data from backend
      let stats = {
        totalCases: 0,
        totalRecords: 0,
        pendingActions: 0
      };
      let recentCases = [];

      try {
        // Fetch cases (limit to 10)
        const casesResponse = await axios.get(`${API_URL}/cases`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org, limit: 10 }
        });
        const cases = casesResponse.data || [];
        stats.totalCases = cases.length;
        recentCases = cases.slice(0, 5); // Get 5 most recent
      } catch (err) {
        console.log('Failed to fetch cases:', err.message);
      }

      try {
        // Fetch records (limit to 10)
        const recordsResponse = await axios.get(`${API_URL}/records`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org, limit: 10 }
        });
        const records = recordsResponse.data || [];
        stats.totalRecords = records.length;
      } catch (err) {
        // Handle backend empty/invalid JSON as "no records" for dashboard
        console.log('Failed to fetch records:', err.message);
        const isParseError = typeof err.message === 'string' && err.message.includes('Unexpected end of JSON input');
        if (!isParseError) {
          // for non-parse errors we still log the message; dashboard will show zeros
          console.log('Records fetch error details:', err.response?.data || err.message);
        }
        stats.totalRecords = 0;
      }

      res.render('layouts/main', {
        pageTitle: 'Dashboard',
        currentPage: '/dashboard',
        body: 'dashboard/index',
        user: req.session.user,
        stats,
        recentCases,
        success: req.query.success ? decodeURIComponent(req.query.success) : null,
        error: req.query.error ? decodeURIComponent(req.query.error) : null
      });
    } catch (error) {
      console.error('Error loading dashboard:', error.message);
      res.render('layouts/main', {
        pageTitle: 'Dashboard',
        currentPage: '/dashboard',
        body: 'dashboard/index',
        user: req.session.user,
        stats: { totalCases: 0, totalRecords: 0, pendingActions: 0 },
        recentCases: [],
        success: null,
        error: 'Failed to load dashboard data'
      });
    }
  }
};

module.exports = dashboardController;
