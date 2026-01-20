const prisma = require('../config/database');

/**
 * Create content item in a module
 */
const createContentItem = async (moduleId, contentData, userId) => {
  // Verify module exists and user has permission
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

  // Get next order index
  const lastContent = await prisma.contentItem.findFirst({
    where: { moduleId },
    orderBy: { orderIndex: 'desc' },
  });

  const orderIndex = lastContent ? lastContent.orderIndex + 1 : 0;

  // Validate content type specific fields
  const { contentType, ...rest } = contentData;

  let contentItemData = {
    moduleId,
    contentType,
    orderIndex,
    title: rest.title,
    description: rest.description,
    isPreview: rest.isPreview || false,
  };

  // Add type-specific fields
  if (contentType === 'VIDEO') {
    contentItemData = {
      ...contentItemData,
      videoUrl: rest.videoUrl,
      videoDurationSeconds: rest.videoDurationSeconds,
      videoSizeBytes: rest.videoSizeBytes,
    };
  } else if (contentType === 'ARTICLE') {
    contentItemData = {
      ...contentItemData,
      articleContent: rest.articleContent,
      articleFileUrl: rest.articleFileUrl,
    };
  } else if (contentType === 'ASSESSMENT') {
    contentItemData = {
      ...contentItemData,
      assessmentPassPercentage: rest.assessmentPassPercentage || 70,
      assessmentTimeLimitMinutes: rest.assessmentTimeLimitMinutes,
    };
  }

  const contentItem = await prisma.contentItem.create({
    data: contentItemData,
  });

  return contentItem;
};

/**
 * Get content items for a module
 */
const getContentByModule = async (moduleId) => {
  const contentItems = await prisma.contentItem.findMany({
    where: { moduleId },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  return contentItems;
};

/**
 * Update content item
 */
const updateContentItem = async (contentId, updateData, userId) => {
  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
    include: { module: { include: { course: true } } },
  });

  if (!content) {
    throw new Error('Content item not found');
  }

  if (content.module.course.createdBy !== userId) {
    throw new Error('Unauthorized to modify this content');
  }

  const updated = await prisma.contentItem.update({
    where: { id: contentId },
    data: updateData,
  });

  return updated;
};

/**
 * Delete content item
 */
const deleteContentItem = async (contentId, userId) => {
  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
    include: { module: { include: { course: true } } },
  });

  if (!content) {
    throw new Error('Content item not found');
  }

  if (content.module.course.createdBy !== userId) {
    throw new Error('Unauthorized to delete this content');
  }

  await prisma.contentItem.delete({
    where: { id: contentId },
  });

  return { message: 'Content item deleted successfully' };
};

/**
 * Reorder content items
 */
const reorderContentItems = async (moduleId, contentOrders, userId) => {
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

  await prisma.$transaction(
    contentOrders.map(({ contentId, orderIndex }) =>
      prisma.contentItem.update({
        where: { id: contentId },
        data: { orderIndex },
      })
    )
  );

  return { message: 'Content items reordered successfully' };
};

module.exports = {
  createContentItem,
  getContentByModule,
  updateContentItem,
  deleteContentItem,
  reorderContentItems,
};