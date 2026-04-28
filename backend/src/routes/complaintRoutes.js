const express = require('express');
const router = express.Router();
const complaintsController = require('../controllers/complaintsController');
const { protect } = require('../middleware/auth');

// 1. Public tracking route (No login required)
router.get('/track/:complaintId', complaintsController.trackComplaint);

// 2. Protect all routes below this line
router.use(protect);

router
  .route('/')
  .get(complaintsController.getComplaints) // Get user's own or all (admin)
  .post(complaintsController.upload, complaintsController.createComplaint); // Upload + Save

router
  .route('/:id')
  .get(complaintsController.getComplaint)
  .delete(complaintsController.deleteComplaint);

// 3. Admin/Officer only route
router.patch('/:id/status', complaintsController.updateStatus);

module.exports = router;