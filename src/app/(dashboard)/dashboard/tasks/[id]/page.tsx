"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Check,
  Loader2,
  AlertTriangle,
  Calendar,
  Tag,
  X,
} from "lucide-react";
import { tasksApi, Task } from "@/lib/tasksApi";

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  task,
  onClose,
  onSaved,
}: {
  task: Task;
  onClose: () => void;
  onSaved: (updated: Task) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      const res = await tasksApi.update(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Task updated ✓");
      onSaved(res.data);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Edit Task</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Title <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-base"
              autoFocus
              maxLength={200}
            />
          </div>
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Description <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-base"
              rows={4}
              maxLength={1000}
              style={{ resize: "vertical", minHeight: "90px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({
  task,
  onClose,
  onDeleted,
}: {
  task: Task;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await tasksApi.delete(task.id);
      toast.success("Task deleted");
      onDeleted();
    } catch {
      toast.error("Failed to delete task");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "var(--danger-bg)", border: "1px solid rgba(239,68,68,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <AlertTriangle size={24} color="var(--danger)" />
          </div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Delete task?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            &ldquo;<strong style={{ color: "var(--text-primary)" }}>{task.title}</strong>&rdquo; will be permanently removed.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="btn btn-danger" style={{ flex: 1 }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={15} />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Detail Page ─────────────────────────────────────────────────────────
export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchTask = async () => {
    try {
      const res = await tasksApi.getById(id);
      setTask(res.data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        toast.error("Task not found");
        router.push("/dashboard");
      } else {
        toast.error("Failed to load task");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleToggle = async () => {
    if (!task) return;
    setToggling(true);
    try {
      const res = await tasksApi.toggle(task.id);
      setTask(res.data);
      toast.success(res.data.status ? "Marked as done ✓" : "Marked as pending");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  const handleDeleted = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="page-enter">
        <div className="skeleton" style={{ height: "28px", width: "160px", marginBottom: "32px" }} />
        <div className="glass-card" style={{ padding: "36px" }}>
          <div className="skeleton" style={{ height: "32px", width: "60%", marginBottom: "16px" }} />
          <div className="skeleton" style={{ height: "16px", width: "30%", marginBottom: "28px" }} />
          <div className="skeleton" style={{ height: "80px", marginBottom: "24px" }} />
          <div className="skeleton" style={{ height: "40px", width: "140px" }} />
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="page-enter">
      {/* Back link */}
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-secondary)",
          textDecoration: "none",
          fontSize: "0.875rem",
          marginBottom: "24px",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Main card */}
      <div
        className="glass-card"
        style={{
          padding: "36px",
          borderLeft: task.status ? "4px solid var(--success)" : "4px solid var(--accent)",
          maxWidth: "760px",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: task.status ? "var(--text-muted)" : "var(--text-primary)",
                textDecoration: task.status ? "line-through" : "none",
                wordBreak: "break-word",
                marginBottom: "10px",
              }}
            >
              {task.title}
            </h1>
            <span className={`badge ${task.status ? "badge-success" : "badge-pending"}`}>
              {task.status ? "Completed" : "Pending"}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => setShowEdit(true)}
              className="btn btn-ghost btn-sm"
              title="Edit task"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Pencil size={15} />
              Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="btn btn-danger btn-sm"
              title="Delete task"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description ? (
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "18px 20px",
              marginBottom: "28px",
            }}
          >
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Description
            </p>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {task.description}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px dashed var(--border)",
              borderRadius: "10px",
              padding: "18px 20px",
              marginBottom: "28px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No description added</p>
          </div>
        )}

        {/* Meta info */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={15} color="var(--text-muted)" />
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Created{" "}
              <strong style={{ color: "var(--text-secondary)" }}>
                {new Date(task.createdAt).toLocaleDateString("en-US", {
                  weekday: "short", year: "numeric", month: "long", day: "numeric",
                })}
              </strong>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Tag size={15} color="var(--text-muted)" />
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              ID:{" "}
              <code style={{ fontSize: "0.78rem", color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "2px 6px", borderRadius: "4px" }}>
                {task.id}
              </code>
            </span>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`btn ${task.status ? "btn-ghost" : "btn-success"}`}
          style={{ minWidth: "180px" }}
        >
          {toggling ? (
            <Loader2 size={16} className="animate-spin" />
          ) : task.status ? (
            <><X size={16} /> Mark as pending</>
          ) : (
            <><Check size={16} /> Mark as done</>
          )}
          {!toggling && null}
        </button>
      </div>

      {/* Modals */}
      {showEdit && (
        <EditModal
          task={task}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => setTask(updated)}
        />
      )}
      {showDelete && (
        <DeleteModal
          task={task}
          onClose={() => setShowDelete(false)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
