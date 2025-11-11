const axios = require('axios');
const FormData = require('form-data');

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const recordsController = {
  // List all records
  listRecords: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { caseId, recordType, dateFrom, dateTo } = req.query;

      let records = [];

      const response = await axios.get(`${API_URL}/records`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          org,
          caseId: caseId || undefined,
          recordType: recordType || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined
        }
      });
      records = response.data;

      res.render('layouts/main', {
        pageTitle: 'Records',
        currentPage: '/records',
        body: 'records/list',
        records,
        user: req.session.user,
        filters: { caseId, recordType, dateFrom, dateTo },
        error: null,
        success: null
      });
    } catch (error) {
      // If backend returned an empty body or invalid JSON (e.g. "Unexpected end of JSON input"),
      // treat it as "no records" and render an empty list gracefully without surfacing raw parse errors.
      console.error('Error listing records:', error.message);
      const isParseError = typeof error.message === 'string' && error.message.includes('Unexpected end of JSON input');
      const friendlyError = isParseError ? null : (error.response?.data?.message || 'Failed to load records');

      res.render('layouts/main', {
        pageTitle: 'Records',
        currentPage: '/records',
        body: 'records/list',
        records: [],
        user: req.session.user,
        filters: {},
        error: friendlyError,
        success: null
      });
    }
  },

  // Show create record form
  showCreateForm: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { caseId } = req.query;

      // Fetch cases that the user has access to so frontend can show a dropdown
      let cases = [];
      try {
        const casesResp = await axios.get(`${API_URL}/cases`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
        cases = casesResp.data || [];
      } catch (err) {
        console.log('Failed to fetch cases for record upload form:', err.message);
        cases = [];
      }
      // Fetch policies that the user can use (may be empty)
      let policies = [];
      try {
        const policiesResp = await axios.get(`${API_URL}/policies`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
        policies = policiesResp.data || [];
      } catch (err) {
        console.log('Failed to fetch policies for record upload form:', err.message);
        policies = [];
      }

      res.render('layouts/main', {
        pageTitle: 'Upload Record',
        currentPage: '/records',
        body: 'records/create',
        user: req.session.user,
  selectedCaseId: caseId || null,
  cases,
  policies,
        error: null,
        success: null
      });
    } catch (error) {
      console.error('Error loading create form:', error.message);
      res.render('layouts/main', {
        pageTitle: 'Upload Record',
        currentPage: '/records',
        body: 'records/create',
        user: req.session.user,
        selectedCaseId: null,
        policies: [],
        error: 'Failed to load form',
        success: null
      });
    }
  },

  // Create/Upload record
  createRecord: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { caseId, recordType, description, policyId } = req.body;
      const file = req.file;

      if (!file) {
        return res.redirect(`/records/create?error=${encodeURIComponent('No file uploaded')}`);
      }

      const recordData = {
        caseId,
        recordType,
        description,
        ownerOrg: org,
        policyId: policyId || undefined
      };

      let recordId;

      const formData = new FormData();
      // Attach file buffer and metadata. Multer should provide `file.buffer` and `file.originalname` when using memoryStorage.
      const fileBuffer = file.buffer || (file.data ? Buffer.from(file.data) : null);
      const filename = file.originalname || `upload-${Date.now()}`;
      if (fileBuffer) {
        formData.append('file', fileBuffer, { filename, contentType: file.mimetype || 'application/octet-stream' });
      } else {
        // If file buffer isn't available, attempt to attach the raw file field (may work for diskStorage setups)
        formData.append('file', file.path || file);
      }
      formData.append('caseId', caseId);
      formData.append('recordType', recordType);
      formData.append('description', description);
      formData.append('ownerOrg', org);
      if (policyId) {
        formData.append('policyId', policyId);
      }

      const headers = Object.assign({ Authorization: `Bearer ${token}` }, formData.getHeaders());
      const response = await axios.post(`${API_URL}/records`, formData, { headers, params: { org } });
      recordId = response.data.recordId;

      res.redirect(`/records/${recordId}?success=${encodeURIComponent('Record uploaded successfully')}`);
    } catch (error) {
      console.error('Error creating record:', error.message);
      res.redirect(`/records/create?error=${encodeURIComponent(error.response?.data?.message || 'Failed to upload record')}`);
    }
  },

  // Show record detail
  showRecordDetail: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { id } = req.params;

      let record = {
        id: id,
        recordType: 'Unknown',
        caseId: 'N/A',
        createdAt: new Date(),
        ownerOrg: org,
        fileHash: 'N/A',
        offChainUri: 'N/A',
        policyId: null,
        description: 'Unable to load record details'
      };

      // Fetch all records and find the matching one to get full metadata
      // Since GET /records/:id returns a file stream, we fetch the list and find by ID
      try {
        const response = await axios.get(`${API_URL}/records`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
        
        const records = response.data;
        if (Array.isArray(records)) {
          const foundRecord = records.find(r => r.id === id);
          if (foundRecord) {
            record = foundRecord;
          } else {
            console.log(`Record with ID ${id} not found in records list`);
          }
        }
      } catch (err) {
        // Backend error or no records available
        // Continue with partial record so detail page still renders
        console.log('Could not fetch records list from backend:', err.message);
      }

      res.render('layouts/main', {
        record,
        pageTitle: `Record ${record.recordType || 'Details'}`,
        currentPage: '/records',
        body: 'records/detail',
        user: req.session.user,
        success: req.query.success || null,
        error: req.query.error || null
      });
    } catch (error) {
      console.error('Error loading record detail:', error.message);
      res.redirect(`/records?error=${encodeURIComponent(error.response?.data?.message || 'Record not found')}`);
    }
  },

  // Download record
  downloadRecord: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { id } = req.params;

      const response = await axios.get(`${API_URL}/records/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { org },
        responseType: 'stream'
      });

      res.setHeader('Content-Disposition', `attachment; filename="record-${id}"`);
      res.setHeader('Content-Type', response.headers['content-type']);
      response.data.pipe(res);
    } catch (error) {
      console.error('Error downloading record:', error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to download record'
      });
    }
  },

  // Delete record
  deleteRecord: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { id } = req.params;

      await axios.delete(`${API_URL}/records/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { org }
      });

      res.redirect(`/records?success=${encodeURIComponent('Record deleted successfully')}`);
    } catch (error) {
      console.error('Error deleting record:', error.message);
      res.redirect(`/records?error=${encodeURIComponent(error.response?.data?.message || 'Failed to delete record')}`);
    }
  }
};

module.exports = recordsController;
