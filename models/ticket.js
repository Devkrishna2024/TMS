const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  venue: { type: String, required: true },
  status: { type: String, default: 'open' },
  priority: { type: String, required: true },
  dueDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

ticketSchema.methods.addAssignedUser = function (userId) {
  if (!this.assignedUsers.includes(userId)) {
    this.assignedUsers.push(userId);
  }
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;