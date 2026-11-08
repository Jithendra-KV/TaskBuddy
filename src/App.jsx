import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "taskbuddy.tasks";
const categories = ["Work", "Personal", "Study"];
const filters = [
  { id: "all", label: "All tasks", icon: "grid" },
  { id: "today", label: "Today", icon: "sun" },
  { id: "upcoming", label: "Upcoming", icon: "calendar" },
  { id: "completed", label: "Completed", icon: "check" },
];

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function toDateInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function createStarterTasks() {
  return [
    {
      id: crypto.randomUUID(),
      title: "Plan the week ahead",
      description: "Set a few priorities and make room for focused work.",
      category: "Personal",
      priority: "Medium",
      dueDate: dateOffset(0),
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      title: "Review project notes",
      description: "Gather feedback and note the next steps.",
      category: "Work",
      priority: "High",
      dueDate: dateOffset(0),
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      title: "Read a few chapters",
      description: "A little progress adds up.",
      category: "Study",
      priority: "Low",
      dueDate: dateOffset(1),
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      title: "Send the project update",
      description: "Share this week's progress with the team.",
      category: "Work",
      priority: "Medium",
      dueDate: dateOffset(2),
      completed: true,
    },
  ];
}

function readTasks() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === null ? createStarterTasks() : JSON.parse(saved);
}

function Icon({ name, size = 18 }) {
  const shared = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  const shapes = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    edit: <><path d="m14 5 5 5M4 20l4.3-.9L19 8.4a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 14h11l1-14M9 7V4h6v3" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  };

  return <svg {...shared}>{shapes[name] || shapes.grid}</svg>;
}

function formatDueDate(value) {
  if (!value) return "No due date";
  const date = new Date(`${value}T00:00:00`);
  const today = toDateInputValue(new Date());
  const tomorrow = dateOffset(1);
  if (value === today) return "Today";
  if (value === tomorrow) return "Tomorrow";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function TaskDialog({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [category, setCategory] = useState(task?.category ?? "Work");
  const [priority, setPriority] = useState(task?.priority ?? "Medium");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? dateOffset(0));

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      ...(task ?? {}),
      id: task?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate,
      completed: task?.completed ?? false,
    });
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">{task ? "KEEP IT MOVING" : "ONE THING AT A TIME"}</p>
            <h2 id="dialog-title">{task ? "Edit task" : "Create a task"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" />
          </button>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>What needs to get done?</span>
            <input autoFocus maxLength="100" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Prepare the presentation" />
          </label>
          <label className="field">
            <span>A little more detail <small>Optional</small></span>
            <textarea maxLength="240" rows="3" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a note to future you..." />
          </label>
          <div className="form-row">
            <label className="field">
              <span>List</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                {["Low", "Medium", "High"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <label className="field">
            <span>Due date</span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <div className="dialog-actions">
            <button className="button button-quiet" type="button" onClick={onClose}>Cancel</button>
            <button className="button button-primary" type="submit">{task ? "Save changes" : "Add task"} <Icon name="arrow" size={16} /></button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  return (
    <article className={`task-card${task.completed ? " task-card-completed" : ""}`}>
      <button
        className={`task-check${task.completed ? " is-checked" : ""}`}
        type="button"
        aria-label={task.completed ? `Mark ${task.title} as not completed` : `Mark ${task.title} as completed`}
        onClick={() => onToggle(task.id)}
      >
        {task.completed && <Icon name="check" size={15} />}
      </button>
      <div className="task-copy">
        <h3>{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`category-tag category-${task.category.toLowerCase()}`}>
            <span className="category-dot" />{task.category}
          </span>
          <span className={`priority-tag priority-${task.priority.toLowerCase()}`}>{task.priority} priority</span>
          <span className="due-date"><Icon name="clock" size={14} />{formatDueDate(task.dueDate)}</span>
        </div>
      </div>
      <div className="task-actions">
        <button className="icon-button" type="button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}><Icon name="edit" size={17} /></button>
        <button className="icon-button delete-button" type="button" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}><Icon name="trash" size={17} /></button>
      </div>
    </article>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [dialogTask, setDialogTask] = useState(undefined);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const today = toDateInputValue(new Date());
  const openTasks = tasks.filter((task) => !task.completed);
  const dueToday = openTasks.filter((task) => task.dueDate === today);
  const completedTasks = tasks.filter((task) => task.completed);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (filter === "today" && (task.completed || task.dueDate !== today)) return false;
      if (filter === "upcoming" && (task.completed || !task.dueDate || task.dueDate <= today)) return false;
      if (filter === "completed" && !task.completed) return false;
      if (filter === "all" && task.completed) return false;
      if (categoryFilter && task.category !== categoryFilter) return false;
      if (query && !`${task.title} ${task.description} ${task.category}`.toLowerCase().includes(query)) return false;
      return true;
    }).sort((first, second) => {
      if (first.completed !== second.completed) return Number(first.completed) - Number(second.completed);
      if (first.dueDate && second.dueDate) return first.dueDate.localeCompare(second.dueDate);
      return first.dueDate ? -1 : second.dueDate ? 1 : first.title.localeCompare(second.title);
    });
  }, [tasks, filter, categoryFilter, search, today]);

  const activeFilterLabel = categoryFilter ?? filters.find((item) => item.id === filter)?.label ?? "All tasks";

  function selectFilter(nextFilter) {
    setFilter(nextFilter);
    setCategoryFilter(null);
  }

  function saveTask(task) {
    setTasks((current) => current.some((item) => item.id === task.id)
      ? current.map((item) => item.id === task.id ? task : item)
      : [task, ...current]);
    setDialogTask(undefined);
    setNotice(task.id && tasks.some((item) => item.id === task.id) ? "Your changes are saved." : "Your new task is on the list.");
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setNotice("Task deleted.");
  }

  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="TaskBuddy home" onClick={(event) => { event.preventDefault(); selectFilter("all"); }}>
          <span className="brand-mark"><Icon name="check" size={19} /></span>
          <span>task<span>buddy</span></span>
        </a>
        <div className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>
          <nav className="main-nav" aria-label="Task views">
            {filters.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-label={item.label}
                className={`nav-link${filter === item.id && !categoryFilter ? " active" : ""}`}
                onClick={() => selectFilter(item.id)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.id === "all" && <span className="nav-count">{openTasks.length}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-section lists-section">
          <div className="sidebar-label-row">
            <p className="sidebar-label">YOUR LISTS</p>
            <span className="list-count">03</span>
          </div>
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              aria-label={category}
              className={`list-link${categoryFilter === category ? " selected" : ""}`}
              onClick={() => { setCategoryFilter(category); setFilter("all"); }}
            >
              <span className={`list-dot dot-${category.toLowerCase()}`} />
              <span>{category}</span>
              <span className="list-task-count">{openTasks.filter((task) => task.category === category).length}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-sparkle">✳</span>
            <p>Small steps make<br />big things happen.</p>
            <span className="tip-caption">YOU'RE DOING GREAT</span>
          </div>
          <div className="profile-row">
            <div className="avatar">T</div>
            <div className="profile-copy"><strong>TaskBuddy</strong><span>Your personal space</span></div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{activeFilterLabel}</strong></div>
          <div className="topbar-tools">
            <label className="search-box">
              <Icon name="search" size={18} />
              <input aria-label="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." />
            </label>
            <div className="top-avatar" aria-label="TaskBuddy profile">T</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="date-eyebrow">{dateLabel.toUpperCase()}</p>
              <h1>A little progress<br className="mobile-break" /> goes a long way<span>.</span></h1>
              <p className="welcome-subtitle">Let’s make space for what matters today.</p>
            </div>
            <button className="button button-primary new-task-button" type="button" onClick={() => setDialogTask(null)}>
              <Icon name="plus" size={19} /> New task
            </button>
          </section>

          <section className="summary-banner" aria-label="Daily progress">
            <div className="banner-copy">
              <span className="banner-kicker"><span className="banner-sparkle">✳</span> YOUR DAILY CHECK-IN</span>
              <h2>{dueToday.length === 0 ? "You’ve got room to breathe." : `${dueToday.length} ${dueToday.length === 1 ? "thing" : "things"} on your plate today.`}</h2>
              <p>{dueToday.length === 0 ? "Pick one small thing to get started." : `${completedTasks.length} ${completedTasks.length === 1 ? "task" : "tasks"} complete. Keep your momentum going.`}</p>
              <button className="banner-link" type="button" onClick={() => selectFilter("today")}>See today’s tasks <Icon name="arrow" size={15} /></button>
            </div>
            <div className="banner-art" aria-hidden="true">
              <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
              <div className="art-card"><span className="art-card-check"><Icon name="check" size={16} /></span><span className="art-card-lines"><i /><i /><i /></span><span className="art-card-sun">✳</span></div>
              <span className="art-star star-one">✦</span><span className="art-star star-two">✳</span>
            </div>
            <div className="banner-progress">
              <div className="progress-ring" style={{ "--progress": `${tasks.length ? (completedTasks.length / tasks.length) * 100 : 0}%` }}>
                <span>{tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0}<small>%</small></span>
              </div>
              <span>tasks<br />done</span>
            </div>
          </section>

          <section className="stats-grid" aria-label="Task summary">
            <article className="stat-card">
              <div className="stat-icon stat-violet"><Icon name="grid" size={18} /></div>
              <div className="stat-copy"><span>Open tasks</span><strong>{openTasks.length}</strong></div>
              <span className="stat-note">left to do</span>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-peach"><Icon name="sun" size={18} /></div>
              <div className="stat-copy"><span>Due today</span><strong>{dueToday.length}</strong></div>
              <span className="stat-note">on your plate</span>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-mint"><Icon name="check" size={18} /></div>
              <div className="stat-copy"><span>Completed</span><strong>{completedTasks.length}</strong></div>
              <span className="stat-note">nice work!</span>
            </article>
          </section>

          <section className="tasks-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR FOCUS</p>
                <h2>{categoryFilter ? `${categoryFilter} tasks` : filter === "today" ? "Today’s tasks" : filter === "upcoming" ? "Coming up" : filter === "completed" ? "Nicely done" : "Your tasks"} <span className="heading-count">{visibleTasks.length}</span></h2>
              </div>
              <div className="task-filter-tabs" role="group" aria-label="Filter tasks by status">
                <button className={filter === "all" ? "tab-active" : ""} type="button" onClick={() => selectFilter("all")}>In progress</button>
                <button className={filter === "completed" ? "tab-active" : ""} type="button" onClick={() => selectFilter("completed")}>Completed</button>
              </div>
            </div>
            <div className="task-list">
              {visibleTasks.length > 0 ? visibleTasks.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} onEdit={setDialogTask} onDelete={deleteTask} />
              )) : (
                <div className="empty-state">
                  <div className="empty-icon"><Icon name={search ? "search" : "check"} size={22} /></div>
                  <h3>{search ? "No matches this time" : "Nothing on this list yet"}</h3>
                  <p>{search ? "Try another search, or clear it to see all your tasks." : "A clear list is a lovely place to start. Add a task whenever you’re ready."}</p>
                  {search ? <button className="text-button" type="button" onClick={() => setSearch("")}>Clear search</button> : <button className="text-button" type="button" onClick={() => setDialogTask(null)}>Create your first task <Icon name="arrow" size={15} /></button>}
                </div>
              )}
            </div>
            {visibleTasks.length > 0 && (
              <button className="add-another" type="button" onClick={() => setDialogTask(null)}><span><Icon name="plus" size={17} /></span> Add another task</button>
            )}
          </section>
          <footer className="page-footer"><span>One thing at a time.</span><span>Made for your everyday ✳</span></footer>
        </div>
      </main>

      {notice && <div className="toast" role="status">{notice}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}><Icon name="close" size={15} /></button></div>}
      {dialogTask !== undefined && <TaskDialog task={dialogTask} onClose={() => setDialogTask(undefined)} onSave={saveTask} />}
    </div>
  );
}
