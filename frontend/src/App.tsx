import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Activity,
  CirclePlus,
  RefreshCw,
  Search,
  Ticket as TicketIcon,
} from "lucide-react";

import {
  createTicket,
  getTickets,
  getTicketStats,
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

const EMPTY_STATS: TicketStats = {
  open: 0,
  in_progress: 0,
  closed: 0,
};

const PAGE_SIZE = 10;

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

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>(EMPTY_STATS);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");

  const [loading, setLoading] = useState(false);
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
          limit: PAGE_SIZE,
          ...(statusFilter ? { status: statusFilter } : {}),
        }),
        getTicketStats(),
      ]);

      setTickets(ticketResponse.data);
      setTotalPages(Math.max(1, ticketResponse.totalPages));
      setTotalTickets(ticketResponse.total);
      setStats(statsResponse);
    } catch {
      setError("Unable to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const visibleTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tickets;
    }

    return tickets.filter((ticket) => {
      return (
        ticket.title.toLowerCase().includes(query) ||
        (ticket.description ?? "").toLowerCase().includes(query) ||
        String(ticket.id).includes(query)
      );
    });
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
      setPage(1);
      setStatusFilter("");
      setSearch("");
      setSuccess("Ticket created successfully.");

      // Refresh explicitly because the page/filter may not have changed.
      const [ticketResponse, statsResponse] = await Promise.all([
        getTickets({ page: 1, limit: PAGE_SIZE }),
        getTicketStats(),
      ]);

      setTickets(ticketResponse.data);
      setTotalPages(Math.max(1, ticketResponse.totalPages));
      setTotalTickets(ticketResponse.total);
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
      setSuccess("Ticket status updated successfully.");
      await loadData();
    } catch {
      setError("Unable to update the ticket status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefresh = () => {
    void loadData();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as TicketStatus | "");
    setPage(1);
  };

  const totalCount = stats.open + stats.in_progress + stats.closed;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <TicketIcon size={22} />
          </div>

          <div>
            <h1>TrackDesk</h1>
            <p>Simple ticket management</p>
          </div>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h2>Ticket dashboard</h2>
          <p className="page-description">
            Create, track, and manage support tickets in one place.
          </p>
        </div>

        <div className="heading-icon">
          <Activity size={26} />
        </div>
      </section>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      <section className="stats-grid" aria-label="Ticket statistics">
        <article className="stat-card">
          <div className="stat-icon stat-open">
            <TicketIcon size={20} />
          </div>
          <p>Open tickets</p>
          <strong>{stats.open}</strong>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-progress">
            <RefreshCw size={20} />
          </div>
          <p>In progress</p>
          <strong>{stats.in_progress}</strong>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-closed">
            <Activity size={20} />
          </div>
          <p>Closed tickets</p>
          <strong>{stats.closed}</strong>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-total">
            <TicketIcon size={20} />
          </div>
          <p>Total tickets</p>
          <strong>{totalCount}</strong>
        </article>
      </section>

      <section className="content-grid">
        <section className="panel create-panel">
          <div className="panel-heading">
            <div>
              <h3>Create a ticket</h3>
              <p>Add a new item to your ticket queue.</p>
            </div>

            <CirclePlus size={22} />
          </div>

          <form onSubmit={handleCreate} className="ticket-form">
            <div className="form-group">
              <label htmlFor="ticket-title">Title</label>
              <input
                id="ticket-title"
                type="text"
                placeholder="e.g. Unable to log in"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ticket-description">
                Description <span className="optional">(optional)</span>
              </label>
              <textarea
                id="ticket-description"
                placeholder="Describe the issue..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ticket-priority">Priority</label>
              <select
                id="ticket-priority"
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

            <button
              className="primary-button"
              type="submit"
              disabled={creating}
            >
              <CirclePlus size={17} />
              {creating ? "Creating..." : "Create ticket"}
            </button>
          </form>
        </section>

        <section className="panel tickets-panel">
          <div className="panel-heading">
            <div>
              <h3>All tickets</h3>
              <p>
                {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"} in
                your current filter.
              </p>
            </div>

            <span className="ticket-count">{totalTickets}</span>
          </div>

          <div className="ticket-toolbar">
            <div className="search-box">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search this page..."
                aria-label="Search tickets on this page"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              aria-label="Filter tickets by status"
              value={statusFilter}
              onChange={(event) => handleStatusFilterChange(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">
              <RefreshCw size={24} className="spin" />
              <p>Loading tickets...</p>
            </div>
          ) : visibleTickets.length === 0 ? (
            <div className="empty-state">
              <TicketIcon size={30} />
              <h4>No tickets found</h4>
              <p>
                {search
                  ? "Try a different search term."
                  : "Create a ticket to get started."}
              </p>
            </div>
          ) : (
            <div className="ticket-list">
              {visibleTickets.map((ticket) => (
                <article className="ticket-item" key={ticket.id}>
                  <div className="ticket-main">
                    <div className="ticket-title-row">
                      <h4>{ticket.title}</h4>
                      <span className="ticket-id">#{ticket.id}</span>
                    </div>

                    {ticket.description && (
                      <p className="ticket-description">{ticket.description}</p>
                    )}

                    <div className="ticket-meta">
                      <span
                        className={`priority-badge priority-${ticket.priority}`}
                      >
                        {PRIORITY_LABELS[ticket.priority]}
                      </span>

                      <span className="ticket-date">
                        Created {formatDate(ticket.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="ticket-status-control">
                    <label
                      className="visually-hidden"
                      htmlFor={`status-${ticket.id}`}
                    >
                      Status for ticket {ticket.id}
                    </label>

                    <select
                      id={`status-${ticket.id}`}
                      className={`status-select status-${ticket.status}`}
                      value={ticket.status}
                      disabled={updatingId === ticket.id}
                      onChange={(event) =>
                        void handleStatusChange(
                          ticket.id,
                          event.target.value as TicketStatus,
                        )
                      }
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>

                    {updatingId === ticket.id && (
                      <span className="updating-label">Saving...</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="pagination">
            <span>
              Showing {visibleTickets.length} on this page of {totalTickets}{" "}
              tickets
            </span>

            <div className="pagination-actions">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </section>

      <footer className="app-footer">
        <p>TrackDesk · Ticket management made simple</p>
      </footer>
    </main>
  );
}

export default App;
