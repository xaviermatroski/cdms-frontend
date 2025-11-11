const axios = require('axios');

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const profileController = {
  // Show user profile
  showProfile: async (req, res) => {
    try {
      const user = req.session.user;

      const profile = {
        username: user.username,
        fullName: user.fullName,
        email: user.email || user.username + '@cdms.gov',
        role: user.role,
        organization: user.organization,
        status: 'Active',
        permissions: getPermissions(user.role)
      };

      res.render('layouts/main', {
        profile,
        pageTitle: 'My Profile',
        currentPage: '/profile',
        body: 'profile/index',
        user: req.session.user,
        error: null,
        success: null
      });
    } catch (error) {
      console.error('Error loading profile:', error.message);
      res.render('layouts/main', {
        profile: null,
        pageTitle: 'My Profile',
        currentPage: '/profile',
        body: 'profile/index',
        user: req.session.user,
        error: 'Failed to load profile',
        success: null
      });
    }
  }
};

// Helper function to get permissions based on role
function getPermissions(role) {
  const permissions = {
    admin: [
      'View all cases',
      'Create cases',
      'Delete cases',
      'View all records',
      'Upload records',
      'Delete records',
      'Manage policies',
      'Manage users',
      'View reports'
    ],
    investigator: [
      'View assigned cases',
      'Create cases',
      'View assigned records',
      'Upload records',
      'Search records',
      'Generate reports'
    ],
    forensics: [
      'View case evidence',
      'Upload evidence',
      'Analyze evidence',
      'Generate forensic reports'
    ],
    judge: [
      'View cases',
      'View court-approved records',
      'Access sealed evidence'
    ]
  };

  return permissions[role] || [];
}

module.exports = profileController;
