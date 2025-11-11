const axios = require('axios');

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Mock data for testing
const mockPolicies = [
  {
    policyId: 'policy-001',
    categories: ['Evidence', 'FIR'],
    allowedOrgs: ['Org1MSP'],
    allowedRoles: ['investigator', 'forensics', 'admin'],
    createdBy: 'Org1MSP',
    createdAt: new Date('2025-11-10').toISOString(),
    docType: 'policy'
  },
  {
    policyId: 'policy-002',
    categories: ['Report'],
    allowedOrgs: ['Org1MSP', 'Org2MSP'],
    allowedRoles: ['admin', 'judge'],
    createdBy: 'Org1MSP',
    createdAt: new Date('2025-11-09').toISOString(),
    docType: 'policy'
  }
];

const USE_MOCK = true;

const policiesController = {
  // List all policies (admin only)
  listPolicies: async (req, res) => {
    try {
      // Check if user is admin
      if (req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
          message: 'Access Denied - Admin only',
          status: 403
        });
      }

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
        policies = response.data;
      }

      res.render('layouts/main', {
        pageTitle: 'Policies',
        currentPage: '/policies',
        body: 'policies/list',
        policies,
        user: req.session.user,
        error: null,
        success: null
      });
    } catch (error) {
      console.error('Error listing policies:', error.message);
      res.render('layouts/main', {
        pageTitle: 'Policies',
        currentPage: '/policies',
        body: 'policies/list',
        policies: [],
        user: req.session.user,
        error: error.response?.data?.message || 'Failed to load policies',
        success: null
      });
    }
  },

  // Show create policy form (admin only)
  showCreateForm: async (req, res) => {
    try {
      if (req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
          message: 'Access Denied - Admin only',
          status: 403
        });
      }

      res.render('layouts/main', {
        pageTitle: 'Create Policy',
        currentPage: '/policies',
        body: 'policies/create',
        user: req.session.user,
        organizations: ['Org1MSP', 'Org2MSP'],
        roles: ['admin', 'investigator', 'forensics', 'judge'],
        error: null,
        success: null
      });
    } catch (error) {
      console.error('Error loading create form:', error.message);
      res.render('layouts/main', {
        pageTitle: 'Create Policy',
        currentPage: '/policies',
        body: 'policies/create',
        user: req.session.user,
        organizations: ['Org1MSP', 'Org2MSP'],
        roles: ['admin', 'investigator', 'forensics', 'judge'],
        error: 'Failed to load form',
        success: null
      });
    }
  },

  // Create new policy (admin only)
  createPolicy: async (req, res) => {
    try {
      if (req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
          message: 'Access Denied - Admin only',
          status: 403
        });
      }

      const token = req.session.token;
      const org = req.session.user.organization;
      const { categories, allowedOrgs, allowedRoles } = req.body;

      // Validate input
      if (!categories || categories.length === 0) {
        return res.redirect('/policies/create?error=Please select at least one category');
      }
      if (!allowedOrgs || allowedOrgs.length === 0) {
        return res.redirect('/policies/create?error=Please select at least one organization');
      }
      if (!allowedRoles || allowedRoles.length === 0) {
        return res.redirect('/policies/create?error=Please select at least one role');
      }

      const policyData = {
        categories: Array.isArray(categories) ? categories : [categories],
        allowedOrgs: Array.isArray(allowedOrgs) ? allowedOrgs : [allowedOrgs],
        allowedRoles: Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
      };

      let policyId;

      if (USE_MOCK) {
        const newPolicy = {
          policyId: `policy-${Date.now()}`,
          ...policyData,
          createdBy: org,
          createdAt: new Date().toISOString(),
          docType: 'policy'
        };
        mockPolicies.push(newPolicy);
        policyId = newPolicy.policyId;
      } else {
        const response = await axios.post(
          `${API_URL}/policies`,
          policyData,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { org }
          }
        );
        policyId = response.data.policyId;
      }

      res.redirect(`/policies/${policyId}?success=${encodeURIComponent('Policy created successfully')}`);
    } catch (error) {
      console.error('Error creating policy:', error.message);
      res.redirect(`/policies/create?error=${encodeURIComponent(error.response?.data?.message || 'Failed to create policy')}`);
    }
  },

  // Show policy detail (admin only)
  showPolicyDetail: async (req, res) => {
    try {
      if (req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
          message: 'Access Denied - Admin only',
          status: 403
        });
      }

      const token = req.session.token;
      const org = req.session.user.organization;
      const { id } = req.params;

      let policy;

      if (USE_MOCK) {
        policy = mockPolicies.find(p => p.policyId === id);
        if (!policy) {
          return res.status(404).render('error', {
            message: 'Policy not found',
            status: 404
          });
        }
      } else {
        const response = await axios.get(`${API_URL}/policies/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
        policy = response.data;
      }

      res.render('layouts/main', {
        policy,
        pageTitle: `Policy ${policy.policyId}`,
        currentPage: '/policies',
        body: 'policies/detail',
        user: req.session.user,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (error) {
      console.error('Error loading policy detail:', error.message);
      res.redirect(`/policies?error=${encodeURIComponent(error.response?.data?.message || 'Policy not found')}`);
    }
  },

  // Delete policy (admin only)
  deletePolicy: async (req, res) => {
    try {
      if (req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
          message: 'Access Denied - Admin only',
          status: 403
        });
      }

      const token = req.session.token;
      const org = req.session.user.organization;
      const { id } = req.params;

      if (USE_MOCK) {
        const index = mockPolicies.findIndex(p => p.policyId === id);
        if (index === -1) {
          return res.status(404).render('error', {
            message: 'Policy not found',
            status: 404
          });
        }
        mockPolicies.splice(index, 1);
      } else {
        await axios.delete(`${API_URL}/policies/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
      }

      res.redirect(`/policies?success=${encodeURIComponent('Policy deleted successfully')}`);
    } catch (error) {
      console.error('Error deleting policy:', error.message);
      res.redirect(`/policies?error=${encodeURIComponent(error.response?.data?.message || 'Failed to delete policy')}`);
    }
  }
};

module.exports = policiesController;
