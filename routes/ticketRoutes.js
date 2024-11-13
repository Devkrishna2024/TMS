const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { createTicket, assignUserToTicket, getTicketDetails } = require('../controllers/ticketController');

const router = express.Router();

router.post('/', protect, createTicket);
router.post('/:ticketId/assign', protect, assignUserToTicket);
router.get('/:ticketId', protect, getTicketDetails);

module.exports = router;