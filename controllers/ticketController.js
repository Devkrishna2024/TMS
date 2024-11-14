
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


const getTicketAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, status, priority, type, venue } = req.query;

    // Build the filter object dynamically based on provided query parameters
    let filter = {};
    if (startDate) filter.createdDate = { $gte: new Date(startDate) };
    if (endDate) filter.createdDate = { ...filter.createdDate, $lte: new Date(endDate) };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (venue) filter.venue = venue;

    // Aggregation pipeline for analytics
    const analytics = await Ticket.aggregate([
      { $match: filter },
      {
        $facet: {
          totalTickets: [{ $count: "count" }],
          closedTickets: [{ $match: { status: "closed" } }, { $count: "count" }],
          openTickets: [{ $match: { status: "open" } }, { $count: "count" }],
          inProgressTickets: [{ $match: { status: "in-progress" } }, { $count: "count" }],
          priorityDistribution: [
            {
              $group: {
                _id: "$priority",
                count: { $sum: 1 }
              }
            }
          ],
          typeDistribution: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 }
              }
            }
          ],
          tickets: [
            {
              $project: {
                id: "$_id",
                title: "$title",
                status: "$status",
                priority: "$priority",
                type: "$type",
                venue: "$venue",
                createdDate: "$createdDate",
                createdBy: "$createdBy"
              }
            }
          ]
        }
      }
    ]);

    const result = {
      totalTickets: analytics[0].totalTickets[0]?.count || 0,
      closedTickets: analytics[0].closedTickets[0]?.count || 0,
      openTickets: analytics[0].openTickets[0]?.count || 0,
      inProgressTickets: analytics[0].inProgressTickets[0]?.count || 0,
      priorityDistribution: analytics[0].priorityDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      typeDistribution: analytics[0].typeDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      tickets: analytics[0].tickets
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { createTicket, assignUserToTicket, getTicketDetails, getTicketAnalytics };