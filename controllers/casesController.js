const axios = require('axios');

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Mock data for testing
const mockCases = [
  {
    id: 'case-001',
    title: 'Robbery at Downtown Bank',
    status: 'Open',
    jurisdiction: 'Downtown District',
    caseType: 'Robbery',
    description: 'Armed robbery occurred at First National Bank on Main Street',
    createdBy: 'john_doe',
    createdAt: new Date('2025-11-10').toISOString(),
    organization: 'Org1MSP',
    policyId: null,
    docType: 'case'
  },
  {
    id: 'case-002',
    title: 'Vehicle Theft Investigation',
    status: 'Under Investigation',
    jurisdiction: 'Central District',
    caseType: 'Theft',
    description: 'Multiple vehicle thefts reported in the central area',
    createdBy: 'jane_smith',
    createdAt: new Date('2025-11-09').toISOString(),
    organization: 'Org1MSP',
    policyId: null,
    docType: 'case'
  },
  {
    id: 'case-003',
    title: 'Document Forgery Case',
    status: 'Closed',
    jurisdiction: 'North District',
    caseType: 'Forgery',
    description: 'Investigation into forged government documents',
    createdBy: 'john_doe',
    createdAt: new Date('2025-11-08').toISOString(),
    organization: 'Org1MSP',
    policyId: null,
    docType: 'case'
  }
];

const mockRecords = [];
const mockPolicies = [];

// USE MOCK DATA - set to false when connecting to backend
const USE_MOCK = true;

const casesController = {
  // List all cases
  listCases: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { status, jurisdiction } = req.query;

      let cases = [];

      if (USE_MOCK) {
        // Use mock data
        cases = mockCases;
        if (status) {
          cases = cases.filter(c => c.status === status);
        }
        if (jurisdiction) {
          cases = cases.filter(c => 
            c.jurisdiction.toLowerCase().includes(jurisdiction.toLowerCase())
          );
        }
      } else {
        // Call backend API
        const response = await axios.get(`${API_URL}/cases`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            org,
            status: status || undefined,
            jurisdiction: jurisdiction || undefined
          }
        });
        cases = response.data;
      }

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

      if (USE_MOCK) {
        policies = mockPolicies;
      } else {
        const response = await axios.get(`${API_URL}/policies`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
        policies = response.data || [];
      }

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

      if (USE_MOCK) {
        const newCase = {
          id: `case-${Date.now()}`,
          ...caseData,
          createdBy: req.session.user.username,
          createdAt: new Date().toISOString(),
          organization: org,
          docType: 'case'
        };
        mockCases.push(newCase);
        caseId = newCase.id;
      } else {
        const response = await axios.post(
          `${API_URL}/cases`,
          caseData,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { org }
          }
        );
        caseId = response.data.caseId;
      }

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

      if (USE_MOCK) {
        caseData = mockCases.find(c => c.id === id);
        if (!caseData) {
          return res.status(404).render('error', {
            message: 'Case not found',
            status: 404
          });
        }
        records = mockRecords.filter(r => r.caseId === id);
      } else {
        // Fetch case details
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

      if (USE_MOCK) {
        const index = mockCases.findIndex(c => c.id === id);
        if (index === -1) {
          return res.status(404).render('error', {
            message: 'Case not found',
            status: 404
          });
        }
        mockCases.splice(index, 1);
      } else {
        await axios.delete(`${API_URL}/cases/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
      }

      res.redirect(`/cases?success=${encodeURIComponent('Case deleted successfully')}`);
    } catch (error) {
      console.error('Error deleting case:', error.message);
      res.redirect(`/cases?error=${encodeURIComponent(error.response?.data?.message || 'Failed to delete case')}`);
    }
  }
};

module.exports = casesController;
