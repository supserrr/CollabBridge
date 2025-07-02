// backend/src/controllers/authController.js
const { query } = require('../config/database');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { validationResult } = require('express-validator');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { firebaseToken, name, email, role, bio = '', phone = '', location = '' } = req.body;

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const firebaseUid = decodedToken.uid;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Create user in our database
      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role,
        bio: bio.trim(),
        phone: phone.trim(),
        location: location.trim()
      };

      const newUser = await User.create(userData);

      // Generate JWT token for our app
      const appToken = jwt.sign(
        { 
          userId: newUser.user_id, 
          email: newUser.email, 
          role: newUser.role,
          firebaseUid 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.user_id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          bio: newUser.bio,
          phone: newUser.phone,
          location: newUser.location,
          rating: newUser.rating,
          created_at: newUser.created_at
        },
        token: appToken
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({
          error: 'Firebase token expired',
          message: 'Please sign in again'
        });
      }

      res.status(500).json({
        error: 'Registration failed',
        message: 'An error occurred during registration'
      });
    }
  }

  // Login existing user
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { firebaseToken } = req.body;

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const firebaseEmail = decodedToken.email;
      const firebaseUid = decodedToken.uid;

      // Find user in our database
      const user = await User.findByEmail(firebaseEmail);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No account found with this email. Please register first.'
        });
      }

      // Generate JWT token for our app
      const appToken = jwt.sign(
        { 
          userId: user.user_id, 
          email: user.email, 
          role: user.role,
          firebaseUid 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          rating: user.rating,
          availability_status: user.availability_status,
          created_at: user.created_at
        },
        token: appToken
      });

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({
          error: 'Firebase token expired',
          message: 'Please sign in again'
        });
      }

      res.status(500).json({
        error: 'Login failed',
        message: 'An error occurred during login'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User profile not found'
        });
      }

      res.status(200).json({
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          rating: user.rating,
          availability_status: user.availability_status,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        message: 'An error occurred while fetching user profile'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user.userId;
      const { name, bio, phone, location, availability_status } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (bio !== undefined) updateData.bio = bio.trim();
      if (phone !== undefined) updateData.phone = phone.trim();
      if (location !== undefined) updateData.location = location.trim();
      if (availability_status !== undefined) updateData.availability_status = availability_status;

      const updatedUser = await User.update(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User profile not found'
        });
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.user_id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          bio: updatedUser.bio,
          phone: updatedUser.phone,
          location: updatedUser.location,
          rating: updatedUser.rating,
          availability_status: updatedUser.availability_status,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: 'An error occurred while updating user profile'
      });
    }
  }

  // Logout (mainly for token invalidation on client side)
  static async logout(req, res) {
    try {
      // In a stateless JWT system, logout is primarily handled on the client side
      // However, we can add token blacklisting here if needed in the future
      
      res.status(200).json({
        message: 'Logout successful',
        instructions: 'Please remove the token from client storage'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: 'An error occurred during logout'
      });
    }
  }

  // Verify token endpoint (for client-side token validation)
  static async verifyToken(req, res) {
    try {
      // If we reach here, it means the auth middleware passed
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User associated with token not found'
        });
      }

      res.status(200).json({
        valid: true,
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          rating: user.rating,
          availability_status: user.availability_status
        }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        error: 'Token verification failed',
        message: 'An error occurred during token verification'
      });
    }
  }

  // Delete user account
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.userId;
      const { firebaseToken } = req.body;

      if (!firebaseToken) {
        return res.status(400).json({
          error: 'Firebase token required',
          message: 'Firebase token is required for account deletion'
        });
      }

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const firebaseUid = decodedToken.uid;

      // Delete user from our database
      const deletedUser = await User.delete(userId);
      
      if (!deletedUser) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User account not found'
        });
      }

      // Delete user from Firebase Auth
      try {
        await admin.auth().deleteUser(firebaseUid);
      } catch (firebaseError) {
        console.error('Firebase user deletion error:', firebaseError);
        // Continue even if Firebase deletion fails
      }

      res.status(200).json({
        message: 'Account deleted successfully',
        user_id: deletedUser.user_id
      });

    } catch (error) {
      console.error('Account deletion error:', error);
      res.status(500).json({
        error: 'Account deletion failed',
        message: 'An error occurred while deleting the account'
      });
    }
  }
}

module.exports = AuthController;