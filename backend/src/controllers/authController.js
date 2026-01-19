const authService = require('../services/authService');
const {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validatePasswordReset
} = require('../utils/validators');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: error.details.map(d => d.message)
        }
      });
    }

    // Register user
    const user = await authService.registerUser(value);

    res.status(201).json({
      message: 'Registration successful',
      user
    });
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        error: { message: error.message }
      });
    }
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        error: { message: error.details[0].message }
      });
    }

    // Login user
    const { user, accessToken, refreshToken } = await authService.loginUser(value);

    // Set HTTP-only cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user
    });
  } catch (error) {
    if (error.message === 'Invalid email or password' || error.message === 'Account is deactivated') {
      return res.status(401).json({
        error: { message: error.message }
      });
    }
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        error: { message: 'Refresh token not found' }
      });
    }

    // Generate new access token
    const accessToken = await authService.refreshAccessToken(refreshToken);

    // Set new access token cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.json({
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    return res.status(401).json({
      error: { message: 'Invalid or expired refresh token' }
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = validateForgotPassword(req.body);
    if (error) {
      return res.status(400).json({
        error: { message: error.details[0].message }
      });
    }

    const result = await authService.requestPasswordReset(value.email);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { error, value } = validatePasswordReset(req.body);
    if (error) {
      return res.status(400).json({
        error: { message: error.details[0].message }
      });
    }

    const result = await authService.resetPassword(value.token, value.password);

    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid or expired reset token') {
      return res.status(400).json({
        error: { message: error.message }
      });
    }
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached by authenticateToken middleware
    res.json({
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser
};