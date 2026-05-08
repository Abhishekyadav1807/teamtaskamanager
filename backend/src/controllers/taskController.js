import { validationResult } from "express-validator";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const membershipFor = (project, userId) => project.members.find((m) => m.user.toString() === userId.toString());

export const createTask = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const myMembership = membershipFor(project, req.user._id);
  if (!myMembership || myMembership.role !== "Admin") return res.status(403).json({ message: "Admin only" });

  const assigneeMembership = membershipFor(project, req.body.assignedTo);
  if (!assigneeMembership) return res.status(400).json({ message: "Assignee must be a project member" });

  const task = await Task.create({ ...req.body, project: projectId, createdBy: req.user._id });
  const populated = await task.populate("assignedTo", "name email");
  res.status(201).json(populated);
});

export const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const myMembership = membershipFor(project, req.user._id);
  if (!myMembership) return res.status(403).json({ message: "Not a project member" });

  const query = myMembership.role === "Admin" ? { project: projectId } : { project: projectId, assignedTo: req.user._id };
  const tasks = await Task.find(query).populate("assignedTo", "name email").sort({ dueDate: 1 });
  res.json(tasks);
});

export const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const myMembership = membershipFor(project, req.user._id);
  if (!myMembership) return res.status(403).json({ message: "Not a project member" });

  const task = await Task.findOne({ _id: taskId, project: projectId });
  if (!task) return res.status(404).json({ message: "Task not found" });

  const isAdmin = myMembership.role === "Admin";
  const isAssignee = task.assignedTo.toString() === req.user._id.toString();
  if (!isAdmin && !isAssignee) return res.status(403).json({ message: "Forbidden" });

  const allowedForMember = ["status"];
  const updates = req.body;

  Object.keys(updates).forEach((key) => {
    if (isAdmin || allowedForMember.includes(key)) task[key] = updates[key];
  });

  if (updates.assignedTo && isAdmin) {
    const assigneeMembership = membershipFor(project, updates.assignedTo);
    if (!assigneeMembership) return res.status(400).json({ message: "Assignee must be a project member" });
  }

  await task.save();
  const populated = await task.populate("assignedTo", "name email");
  res.json(populated);
});
