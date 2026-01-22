// backend/src/controllers/userController.js - NEW FILE

const userService = require('../services/userService');
const Joi = require('joi');

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

/**
 * Get user profile
 * GET /api/user/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/user/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: { message: error.details[0].message },
      });
    }

    const user = await userService.updateProfile(req.user.id, value);

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    if (error.message === 'Email already in use') {
      return res.status(400).json({
        error: { message: error.message },
      });
    }
    next(error);
  }
};

/**
 * Change password
 * PUT /api/user/password
 */
const changePassword = async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: { message: error.details[0].message },
      });
    }

    const result = await userService.changePassword(
      req.user.id,
      value.currentPassword,
      value.newPassword
    );

    res.json(result);
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({
        error: { message: error.message },
      });
    }
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};