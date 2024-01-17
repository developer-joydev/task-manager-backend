const HttpError = require("../utils/HttpError");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getCurrentUserId = async (req) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new HttpError(401, "Unautthorized Error");
  }
  let extractToken;
  try {
    extractToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new HttpError(401, "Invalid/expired acess token");
  }
  return extractToken?._id;
};

const verifyJWT = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const userId = await getCurrentUserId(req);
    const user = User?.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new HttpError(401, "Invalid/expired acess token");
    }

    req.userData = { userId: userId };
    next();
  } catch (error) {
    throw new HttpError(401, "Invalid/expired acess token");
  }
};

module.exports = verifyJWT;
