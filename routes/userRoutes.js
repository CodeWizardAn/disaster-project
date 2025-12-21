import express from 'express';
import { dbOperations, notificationService } from '../services/firebaseService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Create a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, userType, location, deviceToken } = req.body;

    if (!name || !email || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userId = uuidv4();
    const userData = {
      name,
      email,
      phone,
      userType, // 'victim', 'volunteer', 'coordinator'
      location,
      deviceToken,
      verified: false
    };

    await dbOperations.createUser(userId, userData);

    res.json({
      success: true,
      userId,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user profile
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await dbOperations.getUser(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update user profile
 */
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    await dbOperations.updateUser(userId, updates);

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update device token for push notifications
 */
router.post('/:userId/device-token', async (req, res) => {
  try {
    const { userId } = req.params;
    const { deviceToken } = req.body;

    if (!deviceToken) {
      return res.status(400).json({ error: 'Device token required' });
    }

    await dbOperations.updateUser(userId, { deviceToken });

    res.json({
      success: true,
      message: 'Device token updated'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send test notification
 */
router.post('/:userId/test-notification', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, body } = req.body;

    await notificationService.sendToUser(
      userId,
      title || 'Test Notification',
      body || 'This is a test notification'
    );

    res.json({
      success: true,
      message: 'Test notification sent'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
