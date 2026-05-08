import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });

  res.status(201).json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email }
  });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
