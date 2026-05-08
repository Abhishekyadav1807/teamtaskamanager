import express from "express";
import { body } from "express-validator";
import { createTask, getTasks, updateTask } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/:projectId", getTasks);
router.post(
  "/:projectId",
  [body("title").isLength({ min: 2 }), body("dueDate").isISO8601(), body("priority").isIn(["Low", "Medium", "High"]), body("assignedTo").isMongoId()],
  createTask
);
router.patch("/:projectId/:taskId", updateTask);

export default router;
