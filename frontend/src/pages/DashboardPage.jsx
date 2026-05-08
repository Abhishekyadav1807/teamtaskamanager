import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/date";

const statusChoices = ["To Do", "In Progress", "Done"];
const priorityChoices = ["Low", "Medium", "High"];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "", priority: "Medium", assignedTo: "" });

  const selectedProject = projects.find((p) => p._id === selectedProjectId);
  // Role is derived from selected project membership and drives UI + allowed actions.
  const myRole = selectedProject?.members.find((m) => m.user._id === user._id)?.role;

  const loadProjects = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
    // Keep the first project selected after initial load to reduce empty-state friction.
    if (!selectedProjectId && data[0]) setSelectedProjectId(data[0]._id);
  };

  const loadTasks = async (projectId) => {
    if (!projectId) return;
    const { data } = await api.get(`/tasks/${projectId}`);
    setTasks(data);
  };

  const loadMetrics = async () => {
    const { data } = await api.get("/dashboard");
    setMetrics(data);
  };

  const boot = async () => {
    try {
      setError("");
      await loadProjects();
      await loadMetrics();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load workspace");
    }
  };

  useEffect(() => {
    boot();
  }, []);

  useEffect(() => {
    loadTasks(selectedProjectId);
  }, [selectedProjectId]);

  const statusData = useMemo(() => {
    if (!metrics) return [];
    return Object.entries(metrics.byStatus).map(([name, value]) => ({ name, value }));
  }, [metrics]);

  const perUserData = useMemo(() => {
    if (!metrics) return [];
    return Object.entries(metrics.tasksPerUser).map(([name, tasks]) => ({ name, tasks }));
  }, [metrics]);

  const createProject = async (e) => {
    e.preventDefault();
    await api.post("/projects", projectForm);
    setProjectForm({ name: "", description: "" });
    await boot();
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      setError("");
      const { data } = await api.post(`/projects/${selectedProjectId}/members`, { email: memberEmail.trim() });
      setProjects((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      setMemberEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add member");
    }
  };

  const removeMember = async (uid) => {
    const { data } = await api.delete(`/projects/${selectedProjectId}/members/${uid}`);
    setProjects((prev) => prev.map((p) => (p._id === data._id ? data : p)));
  };

  const createTask = async (e) => {
    e.preventDefault();
    await api.post(`/tasks/${selectedProjectId}`, taskForm);
    setTaskForm({ title: "", description: "", dueDate: "", priority: "Medium", assignedTo: "" });
    await loadTasks(selectedProjectId);
    await loadMetrics();
  };

  const updateTaskStatus = async (taskId, status) => {
    await api.patch(`/tasks/${selectedProjectId}/${taskId}`, { status });
    await loadTasks(selectedProjectId);
    await loadMetrics();
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>TeamTaskManager</h1>
          <p>Welcome, {user.name}</p>
        </div>
        <button className="ghost" onClick={logout}>Logout</button>
      </header>

      {error && <div className="error banner">{error}</div>}

      <section className="metrics-grid">
        <article><h3>Total Tasks</h3><strong>{metrics?.totalTasks ?? 0}</strong></article>
        <article><h3>Overdue</h3><strong>{metrics?.overdue ?? 0}</strong></article>
        <article><h3>In Progress</h3><strong>{metrics?.byStatus?.["In Progress"] ?? 0}</strong></article>
      </section>

      <section className="chart-grid">
        <article className="panel">
          <h3>Tasks by Status</h3>
          {statusData.some((item) => item.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={86} stroke="none" isAnimationActive={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={["#f4a261", "#2a9d8f", "#264653"][i % 3]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-legend">
                <span style={{ color: "#f4a261" }}>To Do</span>
                <span style={{ color: "#2a9d8f" }}>In Progress</span>
                <span style={{ color: "#264653" }}>Done</span>
              </div>
            </>
          ) : (
            <div className="chart-empty">No status data yet. Create tasks to see trends.</div>
          )}
        </article>
        <article className="panel">
          <h3>Tasks per User</h3>
          {perUserData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={perUserData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Bar dataKey="tasks" fill="#e76f51" radius={[8, 8, 0, 0]} maxBarSize={56} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No assignees yet. Assign tasks to team members.</div>
          )}
        </article>
      </section>

      <section className="work-grid">
        <article className="panel">
          <h3>Create Project</h3>
          <form className="form-grid" onSubmit={createProject}>
            <input required placeholder="Example: Mobile App Launch" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
            <textarea placeholder="Short summary of project goals" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
            <button>Create Project</button>
          </form>

          <h3>Your Projects</h3>
          <div className="project-list">
            {projects.map((p) => (
              <button key={p._id} className={selectedProjectId === p._id ? "active" : ""} onClick={() => setSelectedProjectId(p._id)}>{p.name}</button>
            ))}
          </div>

          {selectedProject && (
            <div>
              <h3>Members</h3>
              <ul className="member-list">
                {selectedProject.members.map((m) => (
                  <li key={m.user._id}>
                    <span>{m.user.name} ({m.role})</span>
                    {myRole === "Admin" && m.user._id !== user._id && <button className="danger" onClick={() => removeMember(m.user._id)}>Remove</button>}
                  </li>
                ))}
              </ul>
              {myRole === "Admin" && (
                <form className="inline-form" onSubmit={addMember}>
                  <input type="email" required placeholder="teammate@company.com" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
                  <button>Add Member</button>
                </form>
              )}
            </div>
          )}
        </article>

        <article className="panel">
          <h3>{myRole === "Admin" ? "Create Task" : "Assigned Tasks"}</h3>
          {myRole === "Admin" && (
            <form className="form-grid" onSubmit={createTask}>
              <input required placeholder="Task title (e.g. Design login screen)" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
              <textarea placeholder="Context, acceptance criteria, links..." value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              <input type="date" required value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>{priorityChoices.map((x) => <option key={x}>{x}</option>)}</select>
              <select required value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                <option value="">Choose assignee...</option>
                {selectedProject?.members.map((m) => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
              </select>
              <button>Create Task</button>
            </form>
          )}

          <div className="task-list">
            {tasks.map((t) => (
              <article key={t._id} className="task-card">
                <div>
                  <h4>{t.title}</h4>
                  <p>{t.description || "No extra notes added for this task."}</p>
                  <small>Due: {formatDate(t.dueDate)} | Priority: {t.priority} | Owner: {t.assignedTo?.name}</small>
                </div>
                <select value={t.status} onChange={(e) => updateTaskStatus(t._id, e.target.value)}>
                  {statusChoices.map((s) => <option key={s}>{s}</option>)}
                </select>
              </article>
            ))}
            {tasks.length === 0 && <p className="empty">No tasks yet. Start by creating one and assigning ownership.</p>}
          </div>
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
