const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  text:    { type: String, required: true },
  type:    { type: String, enum: ['board', 'card', 'list', 'pin', 'delete'], default: 'card' },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', default: null },
}, { timestamps: true });

activitySchema.post('save', async function () {
  const count = await this.constructor.countDocuments({ userId: this.userId });
  if (count > 100) {
    const oldest = await this.constructor
      .find({ userId: this.userId })
      .sort({ createdAt: 1 })
      .limit(count - 100)
      .select('_id');
    await this.constructor.deleteMany({ _id: { $in: oldest.map(d => d._id) } });
  }
});

module.exports = mongoose.model('Activity', activitySchema);