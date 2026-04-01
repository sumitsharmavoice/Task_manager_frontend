"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Plus, Search, Filter, ChevronLeft, ChevronRight,
  Pencil, Trash2, Check, RotateCcw, Loader2, ClipboardList,
  LayoutGrid, List, X, AlertTriangle,
} from "lucide-react";
import { tasksApi, Task } from "@/lib/tasksApi";

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterStatus = "" | "true" | "false";
type ViewMode = "grid" | "list";

// ─── Task Modal ───────────────────────────────────────────────────────────────
function TaskModal({
  task,
  onClose,
  onSaved,
}: {
  task?: Task | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [loading, setLoading] = useState(false);
  const isEdit = !!task;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    setLoading(true);
    try {
      if (isEdit && task) {
        await tasksApi.update(task.id, { title: title.trim(), description: description.trim() || undefined });
        toast.success("Task updated ✓");
      } else {
        await tasksApi.create({ title: title.trim(), description: description.trim() || undefined });
        toast.success("Task created ✓");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            {isEdit ? "Edit Task" : "New Task"}
          </h2>
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
              placeholder="What needs to be done?"
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
              placeholder="Add more details about this task…"
              className="input-base"
              rows={3}
              maxLength={1000}
              style={{ resize: "vertical", minHeight: "80px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Saving…" : isEdit ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
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
      onClose();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "var(--danger-bg)", border: "1px solid rgba(239,68,68,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertTriangle size={24} color="var(--danger)" />
          </div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Delete task?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            &ldquo;<strong style={{ color: "var(--text-primary)" }}>{task.title}</strong>&rdquo; will be permanently removed.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading} className="btn btn-danger" style={{ flex: 1 }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={15} />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card (grid) ─────────────────────────────────────────────────────────
function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggle,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggle: (t: Task) => void;
}) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(task);
    setToggling(false);
  };

  return (
    <div
      className="glass-card animate-fadeIn"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        cursor: "default",
        borderLeft: task.status ? "3px solid var(--success)" : "3px solid transparent",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`checkbox-custom${task.status ? " checked" : ""}`}
          style={{ marginTop: "1px" }}
          title={task.status ? "Mark as pending" : "Mark as done"}
        >
          {toggling ? (
            <Loader2 size={12} className="animate-spin" style={{ color: "#fff" }} />
          ) : task.status ? (
            <Check size={12} color="#fff" strokeWidth={3} />
          ) : null}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 600,
              fontSize: "0.95rem",
              color: task.status ? "var(--text-muted)" : "var(--text-primary)",
              textDecoration: task.status ? "line-through" : "none",
              wordBreak: "break-word",
              transition: "all 0.2s",
            }}
          >
            {task.title}
          </p>
          {task.description && (
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                marginTop: "4px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
        <span className={`badge ${task.status ? "badge-success" : "badge-pending"}`}>
          {task.status ? "Completed" : "Pending"}
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => onEdit(task)}
            className="btn btn-ghost btn-icon btn-sm"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="btn btn-danger btn-icon btn-sm"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
        {new Date(task.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}

// ─── Task Row (list) ──────────────────────────────────────────────────────────
function TaskRow({
  task,
  onEdit,
  onDelete,
  onToggle,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggle: (t: Task) => void;
}) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(task);
    setToggling(false);
  };

  return (
    <div
      className="glass-card animate-fadeIn"
      style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        borderLeft: task.status ? "3px solid var(--success)" : "3px solid transparent",
      }}
    >
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={`checkbox-custom${task.status ? " checked" : ""}`}
        title={task.status ? "Mark as pending" : "Mark as done"}
      >
        {toggling ? (
          <Loader2 size={12} className="animate-spin" style={{ color: "#fff" }} />
        ) : task.status ? (
          <Check size={12} color="#fff" strokeWidth={3} />
        ) : null}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: "0.9rem",
            color: task.status ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: task.status ? "line-through" : "none",
          }}
        >
          {task.title}
        </p>
        {task.description && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {task.description}
          </p>
        )}
      </div>

      <span className={`badge ${task.status ? "badge-success" : "badge-pending"}`} style={{ flexShrink: 0 }}>
        {task.status ? "Done" : "Pending"}
      </span>

      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0, display: "none" }} className="sm-show">
        {new Date(task.createdAt).toLocaleDateString()}
      </p>

      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
        <button onClick={() => onEdit(task)} className="btn btn-ghost btn-icon btn-sm" title="Edit">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(task)} className="btn btn-danger btn-icon btn-sm" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchInput, setSearchInput] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const LIMIT = 8;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTasks = useCallback(async (pg: number, q: string, st: FilterStatus) => {
    setLoading(true);
    try {
      const params: any = { page: pg, limit: LIMIT };
      if (q) params.search = q;
      if (st) params.status = st;
      const res = await tasksApi.list(params);
      const data = res.data as Task[];
      setTasks(data);
      setHasMore(data.length === LIMIT);

      // Fetch all-status counts for stats
      if (!q && !st) {
        setStats({
          total: data.length,
          completed: data.filter((t) => t.status).length,
          pending: data.filter((t) => !t.status).length,
        });
      }
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(page, search, filterStatus);
  }, [page, search, filterStatus, fetchTasks]);

  // Debounced search
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  const handleStatusFilter = (s: FilterStatus) => {
    setFilterStatus(s);
    setPage(1);
  };

  const handleToggle = async (task: Task) => {
    try {
      await tasksApi.toggle(task.id);
      await fetchTasks(page, search, filterStatus);
      toast.success(task.status ? "Marked as pending" : "Marked as done ✓");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const handleSaved = () => fetchTasks(page, search, filterStatus);
  const handleDeleted = () => fetchTasks(page, search, filterStatus);

  const filterBtns: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "" },
    { label: "Pending", value: "false" },
    { label: "Completed", value: "true" },
  ];

  return (
    <div className="page-enter">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "6px" }}>
          My Tasks
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Organize your work and track your progress
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {[
          { label: "Total Tasks", value: tasks.length, color: "var(--accent)", bg: "var(--accent-glow)" },
          { label: "Completed", value: tasks.filter((t) => t.status).length, color: "var(--success)", bg: "var(--success-bg)" },
          { label: "In Progress", value: tasks.filter((t) => !t.status).length, color: "var(--warning)", bg: "rgba(245,158,11,0.1)" },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card"
            style={{ padding: "20px 24px" }}
          >
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 500 }}>
              {s.label}
            </p>
            <p style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: "200px" }}>
          <Search
            size={16}
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tasks…"
            className="input-base"
            style={{ paddingLeft: "38px", paddingRight: searchInput ? "36px" : "14px" }}
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {filterBtns.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusFilter(f.value)}
              className="btn btn-sm"
              style={{
                background: filterStatus === f.value ? "var(--accent)" : "var(--bg-card)",
                color: filterStatus === f.value ? "#fff" : "var(--text-secondary)",
                border: filterStatus === f.value ? "1px solid var(--accent)" : "1px solid var(--border)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {(["grid", "list"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              style={{
                padding: "7px 12px",
                background: viewMode === v ? "var(--accent)" : "transparent",
                border: "none",
                cursor: "pointer",
                color: viewMode === v ? "#fff" : "var(--text-muted)",
                transition: "all 0.2s",
                display: "flex",
              }}
              title={`${v} view`}
            >
              {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
            </button>
          ))}
        </div>

        {/* New task */}
        <button
          onClick={() => setShowCreate(true)}
          className="btn btn-primary"
          style={{ flexShrink: 0 }}
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* ── Task list / grid ─────────────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : "1fr",
            gap: "12px",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: viewMode === "grid" ? "120px" : "72px" }} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ClipboardList size={36} color="var(--text-muted)" />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "6px" }}>
              {search || filterStatus ? "No tasks found" : "No tasks yet"}
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {search || filterStatus
                ? "Try adjusting your search or filter."
                : "Create your first task to get started!"}
            </p>
          </div>
          {!search && !filterStatus && (
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              <Plus size={16} /> Create first task
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "14px",
          }}
        >
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onEdit={setEditTask}
              onDelete={setDeleteTask}
              onToggle={handleToggle}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onEdit={setEditTask}
              onDelete={setDeleteTask}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {!loading && tasks.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-ghost btn-sm"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span
            style={{
              padding: "6px 16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="btn btn-ghost btn-sm"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showCreate && (
        <TaskModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />
      )}
      {editTask && (
        <TaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTask && (
        <DeleteModal
          task={deleteTask}
          onClose={() => setDeleteTask(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
