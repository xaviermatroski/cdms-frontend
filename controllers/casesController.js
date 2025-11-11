const axios = require('axios');

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const casesController = {
  // List all cases
  listCases: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { status, jurisdiction } = req.query;

      let cases = [];

      const response = await axios.get(`${API_URL}/cases`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          org,
          status: status || undefined,
          jurisdiction: jurisdiction || undefined
        }
      });
      cases = response.data;

      res.render('layouts/main', {
        pageTitle: 'Cases',
        currentPage: '/cases',
        body: 'cases/list',
        user: req.session.user,
        cases,
        filters: { status: status || '', jurisdiction: jurisdiction || '' },
        error: null,
        success: null
      });
    } catch (error) {
      console.error('Error listing cases:', error.message);
      res.render('layouts/main', {
        pageTitle: 'Cases',
        currentPage: '/cases',
        body: 'cases/list',
        user: req.session.user,
        cases: [],
        filters: {},
        error: error.response?.data?.message || 'Failed to load cases',
        success: null
      });
    }
  },

  // Show create case form
  showCreateForm: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;

      let policies = [];

      const response = await axios.get(`${API_URL}/policies`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { org }
      });
      policies = response.data || [];

      res.render('layouts/main', {
        pageTitle: 'Create Case',
        currentPage: '/cases',
        body: 'cases/create',
        user: req.session.user,
        policies,
        error: null,
        success: null
      });
    } catch (error) {
      console.error('Error loading create form:', error.message);
      res.render('layouts/main', {
        pageTitle: 'Create Case',
        currentPage: '/cases',
        body: 'cases/create',
        user: req.session.user,
        policies: [],
        error: 'Failed to load policies',
        success: null
      });
    }
  },

  // Create new case
  createCase: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { title, description, status, jurisdiction, caseType, policyId } = req.body;

      const caseData = {
        title,
        description,
        status,
        jurisdiction,
        caseType,
        policyId: policyId || undefined
      };

      let caseId;

      const response = await axios.post(
        `${API_URL}/cases`,
        caseData,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        }
      );
      caseId = response.data.caseId;

      res.redirect(`/cases/${caseId}?success=${encodeURIComponent('Case created successfully')}`);
    } catch (error) {
      console.error('Error creating case:', error.message);
      res.redirect(`/cases/create?error=${encodeURIComponent(error.response?.data?.message || 'Failed to create case')}`);
    }
  },

  // Show case detail
  showCaseDetail: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { id } = req.params;

      let caseData;
      let records = [];

      const caseResponse = await axios.get(`${API_URL}/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { org }
      });
      caseData = caseResponse.data;

      // Fetch linked records
      try {
        const recordsResponse = await axios.get(`${API_URL}/records/case/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
        records = recordsResponse.data || [];
      } catch (e) {
        console.log('No records found for case');
      }

      res.render('layouts/main', {
        case: caseData,
        records,
        pageTitle: caseData.title,
        currentPage: '/cases',
        body: 'cases/detail',
        user: req.session.user,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (error) {
      console.error('Error loading case detail:', error.message);
      res.redirect(`/cases?error=${encodeURIComponent(error.response?.data?.message || 'Case not found')}`);
    }
  },

  // Delete case
  deleteCase: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { id } = req.params;

      await axios.delete(`${API_URL}/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { org }
      });

      res.redirect(`/cases?success=${encodeURIComponent('Case deleted successfully')}`);
    } catch (error) {
      console.error('Error deleting case:', error.message);
      res.redirect(`/cases?error=${encodeURIComponent(error.response?.data?.message || 'Failed to delete case')}`);
    }
  }
};

module.exports = casesController;
