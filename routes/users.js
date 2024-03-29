const express = require("express");
const { check } = require("express-validator");
const { getUsers, login, signup } = require("../controllers/users");

const router = express.Router();

router.get("/", getUsers);
router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  signup
);
router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  login
);

module.exports = router;
