const axios = require('axios');

const API_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const authController = {
  showLogin: (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session && req.session.user && req.session.token) {
      return res.redirect('/dashboard');
    }

    res.render('auth/login', {
      pageTitle: 'Login',
      error: null,
      success: null
    });
  },

  doLogin: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).render('auth/login', { pageTitle: 'Login', error: 'Username and password are required', success: null });
      }

      // Call backend login endpoint
      const resp = await axios.post(`${API_URL}/users/login`, { username, password });
      if (!resp || !resp.data || !resp.data.accessToken) {
        const message = resp && resp.data && resp.data.message ? resp.data.message : 'Login failed';
        return res.status(401).render('auth/login', { pageTitle: 'Login', error: message, success: null });
      }

      const token = resp.data.accessToken;

      // Fetch profile using token
      let profile = null;
      try {
        const profileResp = await axios.get(`${API_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
        profile = profileResp.data;
      } catch (err) {
        // If profile fetch fails, still continue with minimal info from token (username)
        profile = { username };
      }

      // Save user in session
      req.session.user = {
        username: profile.username || username,
        fullName: profile.fullName || profile.fullname || profile.name || username,
        role: profile.role || 'investigator',
        organization: profile.organization || profile.organizationId || 'Org1MSP',
        token
      };
      req.session.token = token;

      // Redirect to dashboard with success
      return res.redirect('/dashboard?success=' + encodeURIComponent('Logged in successfully'));
    } catch (error) {
      console.error('Login error:', error.message || error);
      let msg = 'Login failed';
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      }
      return res.status(401).render('auth/login', { pageTitle: 'Login', error: msg, success: null });
    }
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error('Failed to destroy session during logout', err);
      res.clearCookie('connect.sid');
      res.redirect('/?success=' + encodeURIComponent('Logged out successfully'));
    });
  }
};

// Registration helpers
authController.showRegister = (req, res) => {
  if (req.session && req.session.user && req.session.token) {
    return res.redirect('/dashboard');
  }
  res.render('auth/register', { pageTitle: 'Register', error: null, success: null });
};

authController.doRegister = async (req, res) => {
  try {
    const { username, password, confirmPassword, fullName, email, role, organizationId } = req.body;
    if (!username || !password || !confirmPassword || !fullName || !email) {
      return res.status(400).render('auth/register', { pageTitle: 'Register', error: 'All fields are required', success: null });
    }
    if (password !== confirmPassword) {
      return res.status(400).render('auth/register', { pageTitle: 'Register', error: 'Passwords do not match', success: null });
    }

    // Call backend register endpoint
    const resp = await axios.post(`${API_URL}/users/register`, { username, password, fullName, email, role: role || 'investigator', organizationId: organizationId || 'Org1MSP' });
    // If backend responds without error, attempt to login the new user
    if (resp && (resp.status === 201 || resp.status === 200 || resp.data)) {
      // Immediately authenticate
      try {
        const loginResp = await axios.post(`${API_URL}/users/login`, { username, password });
        if (loginResp && loginResp.data && loginResp.data.accessToken) {
          const token = loginResp.data.accessToken;
          // Fetch profile
          let profile = { username };
          try {
            const profileResp = await axios.get(`${API_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
            profile = profileResp.data;
          } catch (err) {
            // ignore
          }

          req.session.user = {
            username: profile.username || username,
            fullName: profile.fullName || profile.fullname || profile.name || username,
            role: profile.role || 'investigator',
            organization: profile.organization || profile.organizationId || 'Org1MSP',
            token
          };
          req.session.token = token;
          return res.redirect('/dashboard?success=' + encodeURIComponent('Registered and logged in'));
        }
        // If login failed, show success message and redirect to login page
        return res.redirect('/auth/login?success=' + encodeURIComponent('Registration successful. Please log in.'));
      } catch (loginErr) {
        console.error('Auto-login failed after registration:', loginErr.message || loginErr);
        return res.redirect('/auth/login?success=' + encodeURIComponent('Registration successful. Please log in.'));
      }
    }

    return res.status(400).render('auth/register', { pageTitle: 'Register', error: resp.data?.message || 'Registration failed', success: null });
  } catch (error) {
    console.error('Registration error:', error.message || error);
    let msg = 'Registration failed';
    if (error.response && error.response.data && error.response.data.message) {
      msg = error.response.data.message;
    }
    return res.status(400).render('auth/register', { pageTitle: 'Register', error: msg, success: null });
  }
};

module.exports = authController;
