import express from "express";
import { body } from "express-validator";
import { addMember, createProject, getProjects, removeMember } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getProjects);
router.post("/", [body("name").isLength({ min: 2 })], createProject);
router.post("/:projectId/members", [body("email").isEmail()], addMember);
router.delete("/:projectId/members/:userId", removeMember);

export default router;
