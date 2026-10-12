import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  ClipboardList,
  Menu,
  RefreshCw,
  Search,
  Ticket as TicketIcon,
  X,
} from "lucide-react";

import {
  createTicket,
  getTickets,
  getTicketStats,
  updateTicketPriority,
  updateTicketStatus,
} from "./api/ticket";

import type {
  CreateTicketInput,
  Ticket,
  TicketPriority,
  TicketStats,
  TicketStatus,
} from "./types/ticket";

import "./App.css";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;

const EMPTY_STATS: TicketStats = {
  open: 0,
  in_progress: 0,
  closed: 0,
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>(EMPTY_STATS);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [search, setSearch] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [ticketResponse, statsResponse] = await Promise.all([
        getTickets({
          page,
          limit,
          ...(statusFilter ? { status: statusFilter } : {}),
        }),
        getTicketStats(),
      ]);

      setTickets(ticketResponse.data);
      setTotalTickets(ticketResponse.total);
      setTotalPages(Math.max(1, ticketResponse.totalPages));
      setStats(statsResponse);
    } catch {
      setError("Unable to load tickets. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visibleTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tickets;
    }

    return tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(query) ||
        (ticket.description ?? "").toLowerCase().includes(query) ||
        String(ticket.id).includes(query),
    );
  }, [tickets, search]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a ticket title.");
      return;
    }

    const input: CreateTicketInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    };

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      await createTicket(input);

      setTitle("");
      setDescription("");
      setPriority("medium");
      setShowCreateForm(false);
      setSearch("");
      setStatusFilter("");
      setPage(1);
      setSuccess("Ticket created successfully.");

      const [ticketResponse, statsResponse] = await Promise.all([
        getTickets({ page: 1, limit }),
        getTicketStats(),
      ]);

      setTickets(ticketResponse.data);
      setTotalTickets(ticketResponse.total);
      setTotalPages(Math.max(1, ticketResponse.totalPages));
      setStats(statsResponse);
    } catch {
      setError("Unable to create the ticket. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (ticketId: number, status: TicketStatus) => {
    setUpdatingId(ticketId);
    setError("");
    setSuccess("");

    try {
      await updateTicketStatus(ticketId, status);
      setSuccess("Ticket status updated.");
      await loadData();
    } catch {
      setError("Unable to update ticket status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePriorityChange = async (
    ticketId: number,
    priority: TicketPriority,
  ) => {
    setUpdatingId(ticketId);
    setError("");
    setSuccess("");

    try {
      await updateTicketPriority(ticketId, priority);
      setSuccess("Ticket priority updated.");
      await loadData();
    } catch {
      setError("Unable to update ticket priority.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value as TicketStatus | "");
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    const nextLimit = Number(value) as (typeof PAGE_SIZE_OPTIONS)[number];
    setLimit(nextLimit);
    setPage(1);
  };

  const handleRefresh = () => {
    void loadData();
  };

  const totalCount = stats.open + stats.in_progress + stats.closed;
  const firstItem = totalTickets === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, totalTickets);

  return (
    <div className="dashboard">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <TicketIcon size={23} />
          </div>
          <span>Mini Ticket Tracker</span>

          <button
            className="sidebar-close"
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            type="button"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ClipboardList size={19} />
            <span>Tickets</span>
            <span className="nav-count">{totalTickets}</span>
          </button>
        </nav>
      </aside>

      {mobileMenuOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            Dashboard <span>/</span> <strong>Tickets</strong>
          </div>

          <div className="header-actions">
            <span className="system-status">
              <span className="status-dot" />
              Tickets Tracker
            </span>

            <button
              className="header-avatar"
              type="button"
              aria-label="Support team profile"
            >
              TT
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="page-title-row">
            <div>
              <p className="eyebrow">TICKETS</p>
              <p className="page-subtitle">
                Manage, prioritize, and track support requests.
              </p>
            </div>

            <button
              className="create-button"
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowCreateForm(true);
              }}
            >
              <CirclePlus size={18} />
              Create ticket
            </button>
          </section>

          {error && (
            <div className="dashboard-alert error-alert" role="alert">
              {error}
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {success && (
            <div className="dashboard-alert success-alert" role="status">
              <CheckCircle2 size={17} />
              {success}
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setSuccess("")}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <section className="metrics-grid">
            <article className="metric-card">
              <div className="metric-top">
                <span>Total tickets</span>
                <div className="metric-icon total-icon">
                  <ClipboardList size={19} />
                </div>
              </div>
              <strong>{totalCount}</strong>
              <span className="metric-footnote">Across all statuses</span>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Open</span>
                <div className="metric-icon open-icon">
                  <TicketIcon size={19} />
                </div>
              </div>
              <strong>{stats.open}</strong>
              <span className="metric-footnote">Awaiting resolution</span>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>In progress</span>
                <div className="metric-icon progress-icon">
                  <RefreshCw size={19} />
                </div>
              </div>
              <strong>{stats.in_progress}</strong>
              <span className="metric-footnote">Currently being handled</span>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>Closed</span>
                <div className="metric-icon closed-icon">
                  <CheckCircle2 size={19} />
                </div>
              </div>
              <strong>{stats.closed}</strong>
              <span className="metric-footnote">Resolved tickets</span>
            </article>
          </section>

          <section className="table-panel">
            <div className="table-panel-heading">
              <div>
                <h2>All tickets</h2>
                <p>View and manage your support queue.</p>
              </div>

              <button
                className="icon-button"
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                aria-label="Refresh tickets"
                title="Refresh tickets"
              >
                <RefreshCw size={17} className={loading ? "spin" : ""} />
              </button>
            </div>

            <div className="table-toolbar">
              <div className="table-search">
                <Search size={18} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, description or ID..."
                  aria-label="Search tickets"
                />
              </div>

              <div className="table-filters">
                <select
                  value={statusFilter}
                  onChange={(event) => handleStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="">All statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={limit}
                  onChange={(event) => handleLimitChange(event.target.value)}
                  aria-label="Number of records to show"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-scroll">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th className="id-column">ID</th>
                    <th>Ticket</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="action-column">Update status</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="table-message">
                        <RefreshCw size={20} className="spin" />
                        Loading tickets...
                      </td>
                    </tr>
                  ) : visibleTickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="table-message">
                        <TicketIcon size={24} />
                        <strong>No tickets found</strong>
                        <span>Try changing your search or filters.</span>
                      </td>
                    </tr>
                  ) : (
                    visibleTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="ticket-id-cell">#{ticket.id}</td>

                        <td>
                          <div className="table-ticket-title">
                            <strong>{ticket.title}</strong>
                            <span>
                              {ticket.description || "No description provided"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <select
                            className={`row-priority-select priority-${ticket.priority}`}
                            value={ticket.priority}
                            disabled={updatingId === ticket.id}
                            aria-label={`Update priority for ticket ${ticket.id}`}
                            onChange={(event) =>
                              void handlePriorityChange(
                                ticket.id,
                                event.target.value as TicketPriority,
                              )
                            }
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>

                          {updatingId === ticket.id && (
                            <span className="saving-text">Saving...</span>
                          )}
                        </td>

                        <td>
                          <span
                            className={`status-badge status-badge-${ticket.status}`}
                          >
                            <span className="badge-dot" />
                            {STATUS_LABELS[ticket.status]}
                          </span>
                        </td>

                        <td className="date-cell">
                          {formatDate(ticket.created_at)}
                        </td>

                        <td>
                          <select
                            className="row-status-select"
                            value={ticket.status}
                            disabled={updatingId === ticket.id}
                            aria-label={`Update status for ticket ${ticket.id}`}
                            onChange={(event) =>
                              void handleStatusChange(
                                ticket.id,
                                event.target.value as TicketStatus,
                              )
                            }
                          >
                            {Object.entries(STATUS_LABELS).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                          {updatingId === ticket.id && (
                            <span className="saving-text">Saving...</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing {firstItem}–{lastItem} of {totalTickets} tickets
              </span>

              <div className="pagination">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft size={17} />
                </button>

                <span>
                  Page <strong>{page}</strong> of {totalPages}
                </span>

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </section>

          <footer className="dashboard-footer">
            Mini Ticket Tracker <span>2026</span>
          </footer>
        </div>
      </main>

      {showCreateForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !creating) {
              setShowCreateForm(false);
            }
          }}
        >
          <section
            className="create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-modal-title"
          >
            <div className="modal-heading">
              <div>
                <h2 id="create-modal-title">Create ticket</h2>
                <p>Enter the details for the new support request.</p>
              </div>

              <button
                className="icon-button"
                type="button"
                aria-label="Close form"
                disabled={creating}
                onClick={() => setShowCreateForm(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCreate}>
              <div className="form-field">
                <label htmlFor="new-ticket-title">Title</label>
                <input
                  id="new-ticket-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter a descriptive title"
                  maxLength={255}
                  required
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="new-ticket-description">Description</label>
                <textarea
                  id="new-ticket-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the issue or request..."
                  rows={5}
                />
              </div>

              <div className="form-field">
                <label htmlFor="new-ticket-priority">Priority</label>
                <select
                  id="new-ticket-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as TicketPriority)
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={creating}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>

                <button
                  className="create-button"
                  type="submit"
                  disabled={creating}
                >
                  <CirclePlus size={17} />
                  {creating ? "Creating..." : "Create ticket"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
