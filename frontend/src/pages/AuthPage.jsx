import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthPage = ({ mode }) => {
  const isSignup = mode === "signup";
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignup) await signup(form);
      else await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to continue");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>{isSignup ? "Set up your team space" : "Welcome back"}</h1>
        <p>Track work, assign ownership, and keep delivery moving.</p>
        <form onSubmit={submit} className="form-grid">
          {isSignup && <input placeholder="Your full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
          <input type="email" placeholder="Work email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password (min 6 chars)" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <div className="error">{error}</div>}
          <button disabled={busy}>{busy ? "Signing you in..." : isSignup ? "Create account" : "Log in"}</button>
        </form>
        <div className="auth-switch">
          {isSignup ? "Already have an account?" : "New here?"} <Link to={isSignup ? "/login" : "/signup"}>{isSignup ? "Login" : "Create account"}</Link>
        </div>
      </section>
    </main>
  );
};

export default AuthPage;
