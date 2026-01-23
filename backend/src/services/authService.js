const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/jwt');
const { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail } = require('./emailService');
const crypto = require('crypto');

/**
 * Register new user
 */
const registerUser = async ({ email, password, firstName, lastName }) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      emailVerified: false
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true
    }
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(verificationToken);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  // Send verification email
  await sendVerificationEmail(user.email, user.firstName, verificationToken);

  /* Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.firstName);*/

  return user;
};

// Add this new function
const verifyEmail = async (token) => {
  const tokenHash = hashToken(token);

  const verificationToken = await prisma.emailVerificationToken.findFirst({
    where: { tokenHash },
  });

  // Token not found or expired
  if (
    !verificationToken ||
    verificationToken.expiresAt < new Date()
  ) {
    throw new Error('Invalid or expired verification token');
  }

  // ✅ Idempotent behavior (important)
  if (verificationToken.used) {
    return { message: 'Email already verified' };
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true }
    }),
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true, usedAt: new Date() }
    })
  ]);

  return { message: 'Email verified successfully' };
};

/**
 * Login user
 */
const loginUser = async ({ email, password }) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  if (!user.emailVerified) {
    throw new Error('Please verify your email before logging in');
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email
  });

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt
    }
  });

  // Return user data and tokens
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    },
    accessToken,
    refreshToken
  };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);

  // Find refresh token in database
  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revoked: false,
      expiresAt: {
        gt: new Date() // Not expired
      }
    },
    include: {
      user: true
    }
  });

  if (!storedToken) {
    throw new Error('Invalid or expired refresh token');
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    id: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role
  });

  return accessToken;
};

/**
 * Logout user
 */
const logoutUser = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);

  // Revoke refresh token
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: {
      revoked: true,
      revokedAt: new Date()
    }
  });
};

/**
 * Request password reset
 */
const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    // Don't reveal if user exists for security
    return { message: 'If an account exists, a reset email has been sent' };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(resetToken);

  // Store in database
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour from now

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  // Send reset email
  await sendPasswordResetEmail(user.email, user.firstName, resetToken);

  return { message: 'If an account exists, a reset email has been sent' };
};

/**
 * Reset password
 */
const resetPassword = async (token, newPassword) => {
  const tokenHash = hashToken(token);

  // Find valid reset token
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  if (!resetToken) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        used: true,
        usedAt: new Date()
      }
    }),
    // Revoke all refresh tokens for security
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId },
      data: {
        revoked: true,
        revokedAt: new Date()
      }
    })
  ]);

  return { message: 'Password reset successful' };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail
};