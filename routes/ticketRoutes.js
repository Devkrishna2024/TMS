const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { createTicket, assignUserToTicket, getTicketDetails, getTicketAnalytics } = require('../controllers/ticketController');

const router = express.Router();

router.get('/analytics', protect, getTicketAnalytics);
router.post('/', protect, createTicket);

router.get('/:ticketId', protect, getTicketDetails);
router.post('/:ticketId/assign', protect, assignUserToTicket);

module.exports = router;