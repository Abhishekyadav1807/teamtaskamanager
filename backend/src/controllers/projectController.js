import { validationResult } from "express-validator";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getMembership = (project, userId) => project.members.find((m) => m.user.toString() === userId.toString());

export const createProject = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const project = await Project.create({
    name: req.body.name,
    description: req.body.description || "",
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: "Admin" }]
  });

  res.status(201).json(project);
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ "members.user": req.user._id })
    .populate("members.user", "name email")
    .sort({ updatedAt: -1 });
  res.json(projects);
});

export const addMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const myMembership = getMembership(project, req.user._id);
  if (!myMembership || myMembership.role !== "Admin") return res.status(403).json({ message: "Admin only" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const exists = getMembership(project, user._id);
  if (exists) return res.status(409).json({ message: "User already in project" });

  project.members.push({ user: user._id, role: "Member" });
  await project.save();

  const refreshed = await Project.findById(projectId).populate("members.user", "name email");
  res.json(refreshed);
});

export const removeMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const myMembership = getMembership(project, req.user._id);
  if (!myMembership || myMembership.role !== "Admin") return res.status(403).json({ message: "Admin only" });

  if (userId === req.user._id.toString()) return res.status(400).json({ message: "Admin cannot remove self" });

  project.members = project.members.filter((m) => m.user.toString() !== userId);
  await project.save();

  const refreshed = await Project.findById(projectId).populate("members.user", "name email");
  res.json(refreshed);
});
