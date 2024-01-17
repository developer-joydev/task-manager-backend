const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: String },
    completionStatus: { type: Boolean, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
