import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const projects = await Project.find({ "members.user": req.user._id });
  const projectIds = projects.map((p) => p._id);

  const tasks = await Task.find({ project: { $in: projectIds } }).populate("assignedTo", "name");

  const membershipMap = new Map();
  projects.forEach((p) => {
    const me = p.members.find((m) => m.user.toString() === req.user._id.toString());
    membershipMap.set(p._id.toString(), me?.role);
  });

  const visibleTasks = tasks.filter((t) => {
    const role = membershipMap.get(t.project.toString());
    return role === "Admin" || t.assignedTo?._id?.toString() === req.user._id.toString();
  });

  const now = new Date();
  const byStatus = { "To Do": 0, "In Progress": 0, Done: 0 };
  const tasksPerUser = {};
  let overdue = 0;

  visibleTasks.forEach((task) => {
    byStatus[task.status] += 1;
    const key = task.assignedTo?.name || "Unassigned";
    tasksPerUser[key] = (tasksPerUser[key] || 0) + 1;
    if (task.status !== "Done" && new Date(task.dueDate) < now) overdue += 1;
  });

  res.json({
    totalTasks: visibleTasks.length,
    byStatus,
    tasksPerUser,
    overdue
  });
});
