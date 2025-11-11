const axios = require('axios');

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Mock data for testing
const mockRecords = [
  {
    id: 'record-001',
    caseId: 'case-001',
    recordType: 'Evidence',
    description: 'Crime scene photos',
    fileHash: 'sha256:abc123def456',
    offChainUri: 'minio://bucket/record-001',
    ownerOrg: 'Org1MSP',
    createdAt: new Date('2025-11-10').toISOString(),
    policyId: null,
    docType: 'record'
  },
  {
    id: 'record-002',
    caseId: 'case-001',
    recordType: 'Report',
    description: 'Initial investigation report',
    fileHash: 'sha256:xyz789uvw012',
    offChainUri: 'minio://bucket/record-002',
    ownerOrg: 'Org1MSP',
    createdAt: new Date('2025-11-09').toISOString(),
    policyId: null,
    docType: 'record'
  }
];

const USE_MOCK = true;

const recordsController = {
  // List all records
  listRecords: async (req, res) => {
    try {
      const token = req.session.token;
      const org = req.session.user.organization;
      const { caseId, recordType, dateFrom, dateTo } = req.query;

      let records = [];

      if (USE_MOCK) {
        records = mockRecords;
        
        if (caseId) {
          records = records.filter(r => r.caseId === caseId);
        }
        if (recordType) {
          records = records.filter(r => r.recordType === recordType);
        }
        if (dateFrom) {
          records = records.filter(r => new Date(r.createdAt) >= new Date(dateFrom));
        }
        if (dateTo) {
          records = records.filter(r => new Date(r.createdAt) <= new Date(dateTo));
        }
      } else {
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
      }

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
      console.error('Error listing records:', error.message);
      res.render('layouts/main', {
        pageTitle: 'Records',
        currentPage: '/records',
        body: 'records/list',
        records: [],
        user: req.session.user,
        filters: {},
        error: error.response?.data?.message || 'Failed to load records',
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

      // For simplicity, in mock mode we don't fetch cases
      // In production, you'd fetch available cases and policies here

      res.render('layouts/main', {
        pageTitle: 'Upload Record',
        currentPage: '/records',
        body: 'records/create',
        user: req.session.user,
        selectedCaseId: caseId || null,
        policies: [],
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

      if (USE_MOCK) {
        const newRecord = {
          id: `record-${Date.now()}`,
          ...recordData,
          fileHash: `sha256:${Math.random().toString(36).substring(7)}`,
          offChainUri: `minio://bucket/record-${Date.now()}`,
          createdAt: new Date().toISOString(),
          docType: 'record'
        };
        mockRecords.push(newRecord);
        recordId = newRecord.id;
      } else {
        const formData = new FormData();
        formData.append('file', file.buffer || Buffer.from(file.data));
        formData.append('caseId', caseId);
        formData.append('recordType', recordType);
        formData.append('description', description);
        formData.append('ownerOrg', org);
        if (policyId) {
          formData.append('policyId', policyId);
        }

        const response = await axios.post(
          `${API_URL}/records`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            params: { org }
          }
        );
        recordId = response.data.recordId;
      }

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

      let record;

      if (USE_MOCK) {
        record = mockRecords.find(r => r.id === id);
        if (!record) {
          return res.status(404).render('error', {
            message: 'Record not found',
            status: 404
          });
        }
      } else {
        const response = await axios.get(`${API_URL}/records/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
        record = response.data;
      }

      res.render('layouts/main', {
        record,
        pageTitle: `Record ${record.recordType}`,
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

      if (USE_MOCK) {
        // In mock mode, just return a simple message
        const record = mockRecords.find(r => r.id === id);
        if (!record) {
          return res.status(404).json({ message: 'Record not found' });
        }
        // Mock download - return file metadata instead
        res.setHeader('Content-Disposition', `attachment; filename="record-${id}.txt"`);
        res.setHeader('Content-Type', 'text/plain');
        res.send(`This is a mock record file.\nRecord ID: ${id}\nType: ${record.recordType}\nDescription: ${record.description}`);
      } else {
        const response = await axios.get(`${API_URL}/records/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org },
          responseType: 'stream'
        });

        res.setHeader('Content-Disposition', `attachment; filename="record-${id}"`);
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
      }
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

      if (USE_MOCK) {
        const index = mockRecords.findIndex(r => r.id === id);
        if (index === -1) {
          return res.status(404).render('error', {
            message: 'Record not found',
            status: 404
          });
        }
        mockRecords.splice(index, 1);
      } else {
        await axios.delete(`${API_URL}/records/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { org }
        });
      }

      res.redirect(`/records?success=${encodeURIComponent('Record deleted successfully')}`);
    } catch (error) {
      console.error('Error deleting record:', error.message);
      res.redirect(`/records?error=${encodeURIComponent(error.response?.data?.message || 'Failed to delete record')}`);
    }
  }
};

module.exports = recordsController;
