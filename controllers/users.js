const { validationResult } = require("express-validator");
const HttpError = require("../utils/HttpError");
const HttpResponse = require("../utils/HttpResponse");
const User = require("../models/User");

const createAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    return { accessToken };
  } catch (error) {
    throw new HttpError(
      500,
      "Not able to generate access token. Please try again."
    );
  }
};

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(500, "Not able to fetch user details.");
    return next(error);
  }
  res.json(new HttpResponse(201, { data: users }, "Users found"));
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError(500, "Not able to fetch user details.");
    return next(error);
  }
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      404,
      "Not able to fetch provided user details."
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      422,
      "The email or username is already exists."
    );
    return next(error);
  }

  const newUser = new User({
    name,
    email,
    password,
    tasks: [],
  });
  let user;
  try {
    user = await newUser.save();
  } catch (err) {
    const error = new HttpError(
      500,
      "Not able to save the info. Please try again."
    );
    return next(error);
  }

  const { accessToken } = await createAccessToken(user._id);
  res
    .status(201)
    .json(
      new HttpResponse(
        201,
        { user: newUser, accessToken },
        "New user created successfully"
      )
    );
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next("Invalid request inputs.");
  }
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(500, "User does not exist in the system.");
    return next(error);
  }
  if (!user) {
    const error = new HttpError(401, "Invalid username/password");
    return next(error);
  }
  const isPasswordValid = await user.isCorrectPassword(password);

  if (!user || !isPasswordValid) {
    const error = new HttpError(401, "Invalid username/password");
    return next(error);
  }
  const { accessToken } = await createAccessToken(user._id);
  res
    .status(200)
    .json(
      new HttpResponse(
        200,
        { user: user, accessToken },
        "Logged in successfully"
      )
    );
};

module.exports = { login, getUsers, signup };
