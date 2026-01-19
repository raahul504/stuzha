const courseService = require('../services/courseService');
const Joi = require('joi');

// Validation schemas
const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  slug: Joi.string().min(3).max(255).required(),
  description: Joi.string().required(),
  shortDescription: Joi.string().max(500).optional(),
  thumbnailUrl: Joi.string().uri().optional(),
  price: Joi.number().min(0).required(),
  currency: Joi.string().length(3).default('USD'),
  difficultyLevel: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').optional(),
  estimatedDurationHours: Joi.number().integer().min(0).optional(),
  isPublished: Joi.boolean().default(false),
});

/**
 * Create new course
 * POST /api/courses
 */
const createCourse = async (req, res, next) => {
  try {
    const { error, value } = createCourseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: { message: error.details[0].message },
      });
    }

    const course = await courseService.createCourse(value, req.user.id);

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all courses
 * GET /api/courses
 */
const getAllCourses = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Optional auth
    const courses = await courseService.getAllCourses(userId);

    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course by ID
 * GET /api/courses/:id
 */
const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const course = await courseService.getCourseById(id, userId);

    res.json({ course });
  } catch (error) {
    if (error.message === 'Course not found') {
      return res.status(404).json({ error: { message: error.message } });
    }
    next(error);
  }
};

/**
 * Get user's enrolled courses
 * GET /api/courses/my-courses
 */
const getUserCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getUserCourses(req.user.id);

    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

/**
 * Enroll in course
 * POST /api/courses/:id/enroll
 */
const enrollInCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await courseService.enrollInCourse(req.user.id, id);

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment,
    });
  } catch (error) {
    if (
      error.message === 'Course not found' ||
      error.message === 'Already enrolled in this course' ||
      error.message === 'Course is not available for enrollment'
    ) {
      return res.status(400).json({ error: { message: error.message } });
    }
    next(error);
  }
};

/**
 * Update course
 * PUT /api/courses/:id
 */
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.updateCourse(id, req.body, req.user.id);

    res.json({
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    if (
      error.message === 'Course not found' ||
      error.message === 'Unauthorized to update this course'
    ) {
      return res.status(error.message === 'Course not found' ? 404 : 403).json({
        error: { message: error.message },
      });
    }
    next(error);
  }
};

/**
 * Delete course
 * DELETE /api/courses/:id
 */
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await courseService.deleteCourse(id, req.user.id);

    res.json(result);
  } catch (error) {
    if (
      error.message === 'Course not found' ||
      error.message === 'Unauthorized to delete this course'
    ) {
      return res.status(error.message === 'Course not found' ? 404 : 403).json({
        error: { message: error.message },
      });
    }
    next(error);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  getUserCourses,
  enrollInCourse,
  updateCourse,
  deleteCourse,
};