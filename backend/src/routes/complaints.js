const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/complaintsController');
const { protect, restrictTo } = require('../middleware/auth');

const complaintValidation = [
  body('title').trim().isLength({ min: 10, max: 200 }).withMessage('Title must be 10-200 characters'),
  body('description').trim().isLength({ min: 50, max: 5000 }).withMessage('Description must be 50-5000 characters'),
  body('victimDetails.incidentDate').isISO8601().withMessage('Valid incident date required'),
];

// Public routes
router.get('/track/:complaintId', ctrl.trackComplaint);

// Protected routes
router.use(protect);
router.post('/', ctrl.upload, complaintValidation, ctrl.createComplaint);
router.get('/', ctrl.getComplaints);
router.get('/:id', ctrl.getComplaint);

// Admin/Officer routes
router.patch('/:id/status', restrictTo('admin', 'officer'), ctrl.updateStatus);
router.delete('/:id', restrictTo('admin'), ctrl.deleteComplaint);

module.exports = router;
