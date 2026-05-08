import express from "express";
import { body } from "express-validator";
import { login, me, signup } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", [body("name").isLength({ min: 2 }), body("email").isEmail(), body("password").isLength({ min: 6 })], signup);
router.post("/login", [body("email").isEmail(), body("password").notEmpty()], login);
router.get("/me", protect, me);

export default router;
