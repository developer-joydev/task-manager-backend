const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const HttpError = require("../utils/HttpError");
const HttpResponse = require("../utils/HttpResponse");
const Task = require("../models/Task");
const User = require("../models/User");

const getTasks = async (req, res, next) => {
  const userId = req?.userData?.userId;
  let tasksByUser;
  try {
    tasksByUser = await User.findById(userId).populate("tasks");
  } catch (er) {
    const error = new HttpError(500, "Something went wrong");
    return next(error);
  }
  res.json(200, new HttpResponse(200, { data: tasksByUser?.tasks }));
};

const getTaskById = async (req, res, next) => {
  const taskId = req.params.taskId;
  let filteredTasks;
  try {
    filteredTasks = await Task.findById(taskId);
  } catch (er) {
    throw new HttpError(500, "Something went wrong");
  }

  if (!filteredTasks) {
    const error = new HttpError(404, "No Tasks found");
    return next(error);
  }
  return res.json(
    new HttpResponse(
      200,
      {
        data: filteredTasks,
      },
      "Fetched Tasks"
    )
  );
};

const createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(error);
  }
  const userId = req?.userData?.userId;

  const { title, description, dueDate } = req.body;
  const formData = new Task({
    title,
    description,
    completionStatus: false,
    creator: userId,
    dueDate,
  });

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    throw new HttpError(500, "Could not fetch the user details.");
  }

  if (!user) {
    const error = new HttpError(404, "The user info not found.");
    return next(error);
  }
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await formData.save({ session: session });
    user.tasks.push(formData);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      500,
      "New task creation failed. Please try again."
    );
    return next(error);
  }

  res
    .status(201)
    .json({ tasks: formData, messge: "New task created successfully." });
};

const updateTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next("Invalid request inputs");
  }
  const taskId = req.params.taskId;
  const { title, description, dueDate } = req.body;

  let taskByTaskId;
  try {
    taskByTaskId = await Task.findById(taskId);
  } catch (er) {
    throw new HttpError(500, "Something went wrong");
  }
  const userId = req?.userData?.userId;

  if (taskByTaskId.creator.toString() !== userId) {
    const error = new HttpError(
      401,
      "You don't have right permissions to update."
    );
    return next(error);
  }
  taskByTaskId.title = title;
  taskByTaskId.description = description;
  taskByTaskId.dueDate = dueDate;
  try {
    await taskByTaskId.save();
  } catch (er) {
    const error = new HttpError(500, "Not able to update the task.");
    return next(error);
  }

  res
    .status(200)
    .json(
      new HttpResponse(
        200,
        { task: taskByTaskId },
        "Task updated successfully."
      )
    );
};

const updateTaskStatus = async (req, res, next) => {
  const taskId = req.params.taskId;
  let taskByTaskId;
  try {
    taskByTaskId = await Task.findById(taskId);
  } catch (er) {
    throw new HttpError(500, "Something went wrong");
  }
  const userId = req?.userData?.userId;

  if (taskByTaskId.creator.toString() !== userId) {
    const error = new HttpError(
      401,
      "You don't have right permissions to update"
    );
    return next(error);
  }
  taskByTaskId.completionStatus = !taskByTaskId.completionStatus;
  try {
    await taskByTaskId.save();
  } catch (er) {
    const error = new HttpError(
      500,
      "The task is not updated. Please try again."
    );
    return next(error);
  }

  res
    .status(200)
    .json(
      new HttpResponse(
        200,
        { task: taskByTaskId },
        "Task updated successfully."
      )
    );
};

const deleteTask = async (req, res, next) => {
  const taskId = req.params.taskId;

  let task;
  try {
    task = await Task.findById(taskId).populate("creator");
  } catch (er) {
    throw new HttpError(500, "Something went wrong.");
  }

  if (!task) {
    const error = new HttpError(404, "The task not found.");
    return next(error);
  }
  const userId = req?.userData?.userId;
  if (task.creator._id.toString() !== userId) {
    const error = new HttpError(
      401,
      "You don't have right permissions to delete"
    );
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await task.deleteOne({ session });
    await task.creator.tasks.pull(task);
    await task.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(500, "Not able to delete. Please try again.");
    return next(error);
  }
  res.status(200).json({ messge: "Task deleted successfully." });
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
