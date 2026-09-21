const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['online-test', 'interview', 'deadline'],
    required: true 
  },
  date: { type: Date, required: true },
  time: { type: String, default: '' },
  companyName: { type: String, default: '' },
  roundType: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

calendarEventSchema.index({ student: 1, date: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
