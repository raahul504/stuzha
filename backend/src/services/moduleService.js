const prisma = require('../config/database');

/**
 * Create module in a course
 */
const createModule = async (courseId, moduleData, userId) => {
  // Verify course exists and user has permission
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  if (course.createdBy !== userId) {
    throw new Error('Unauthorized to modify this course');
  }

  // Get next order index
  const lastModule = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { orderIndex: 'desc' },
  });

  const orderIndex = lastModule ? lastModule.orderIndex + 1 : 0;

  const module = await prisma.module.create({
    data: {
      courseId,
      title: moduleData.title,
      description: moduleData.description,
      orderIndex,
    },
  });

  return module;
};

/**
 * Get all modules for a course
 */
const getModulesByCourse = async (courseId) => {
  const modules = await prisma.module.findMany({
    where: { courseId },
    include: {
      contentItems: {
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  return modules;
};

/**
 * Update module
 */
const updateModule = async (moduleId, updateData, userId) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  if (module.course.createdBy !== userId) {
    throw new Error('Unauthorized to modify this module');
  }

  const updated = await prisma.module.update({
    where: { id: moduleId },
    data: updateData,
  });

  return updated;
};

/**
 * Delete module
 */
const deleteModule = async (moduleId, userId) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  if (module.course.createdBy !== userId) {
    throw new Error('Unauthorized to delete this module');
  }

  await prisma.module.delete({
    where: { id: moduleId },
  });

  return { message: 'Module deleted successfully' };
};

/**
 * Reorder modules
 */
const reorderModules = async (courseId, moduleOrders, userId) => {
  // Verify permission
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  if (course.createdBy !== userId) {
    throw new Error('Unauthorized to modify this course');
  }

  // Update all module orders in transaction
  await prisma.$transaction(
    moduleOrders.map(({ moduleId, orderIndex }) =>
      prisma.module.update({
        where: { id: moduleId },
        data: { orderIndex },
      })
    )
  );

  return { message: 'Modules reordered successfully' };
};

module.exports = {
  createModule,
  getModulesByCourse,
  updateModule,
  deleteModule,
  reorderModules,
};