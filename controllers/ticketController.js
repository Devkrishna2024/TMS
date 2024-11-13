
const Ticket = require('../models/ticket');
const User = require('../models/user');

const createTicket = async (req, res) => {
  const { title, description, type, venue, status, priority, dueDate } = req.body;

  if (new Date(dueDate) < new Date()) {
    return res.status(400).json({ message: 'Due date must be in the future' });
  }

  const ticket = new Ticket({
    title,
    description,
    type,
    venue,
    status,
    priority,
    dueDate,
    createdBy: req.user._id,
  });

  await ticket.save();
  res.status(201).json(ticket);
};

const assignUserToTicket = async (req, res) => {
  const { userId } = req.body;
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId);
  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ message: 'User does not exist' });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (ticket.status === 'closed') return res.status(400).json({ message: 'Cannot assign users to a closed ticket' });

  ticket.addAssignedUser(userId);
  await ticket.save();

  res.json({ message: 'User assigned successfully' });
};

const getTicketDetails = async (req, res) => {
  const ticket = await Ticket.findById(req.params.ticketId).populate('assignedUsers', 'name email');
  
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  res.json({
    ...ticket.toObject(),
    statistics: {
      totalAssigned: ticket.assignedUsers.length,
      status: ticket.status,
    },
  });
};

module.exports = { createTicket, assignUserToTicket, getTicketDetails };