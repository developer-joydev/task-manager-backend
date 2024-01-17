const express = require("express");
const { check } = require("express-validator");
const verifyJWT = require("../middleware/auth");
const {
  createTask,
  deleteTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
} = require("../controllers/tasks");

const router = express.Router();
router.use(verifyJWT);

router.get("/", getTasks);
router.get("/:taskId", getTaskById);

router.post(
  "/",
  [check("title").not().isEmpty(), check("description").not().isEmpty()],
  createTask
);
router.patch(
  "/:taskId",
  [check("title").not().isEmpty(), check("description").not().isEmpty()],
  updateTask
);
router.patch("/:taskId/status", updateTaskStatus);
router.delete("/:taskId", deleteTask);

module.exports = router;
