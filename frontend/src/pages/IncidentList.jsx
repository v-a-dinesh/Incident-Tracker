import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { getIncidents } from "../api";
import { useDebounce, useFetch } from "../hooks";
import {
  SEVERITIES,
  STATUSES,
  SERVICES,
  formatDate,
  severityClass,
  statusClass,
} from "../utils";

const PAGE_SIZE = 10;

export default function IncidentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState([]);
  const [status, setStatus] = useState([]);
  const [service, setService] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const debouncedSearch = useDebounce(search);

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      severity: severity.length ? severity.join(",") : undefined,
      status: status.length ? status.join(",") : undefined,
      sortBy,
      order: sortOrder,
    }),
    [page, debouncedSearch, severity, status, sortBy, sortOrder],
  );

  const { data, loading, error } = useFetch(
    () => getIncidents(params),
    [params],
  );

  const incidents = data?.data ?? [];
  const totalCount = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  /* ── Handlers ────────────────────────────────────────────── */
  const toggleSeverity = useCallback((val) => {
    setPage(1);
    setSeverity((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  }, []);

  const handleSort = useCallback(
    (field) => {
      if (sortBy === field) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder(field === "created_at" ? "desc" : "asc");
      }
      setPage(1);
    },
    [sortBy],
  );

  const sortIcon = (field) =>
    sortBy === field ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

  /* ── Pagination numbers ──────────────────────────────────── */
  const pageNumbers = useMemo(() => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, page - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("…");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="page-header">
        <h1>Incident Tracker</h1>
        <Link to="/incidents/new" className="btn btn-primary">
          + New Incident
        </Link>
      </div>

      <div className="container">
        <div className="card">
          {/* ── Filter Bar ───────────────────────────────── */}
          <div className="filters-bar">
            {/* Service dropdown */}
            <div className="filter-group">
              <span className="filter-label">Service</span>
              <select
                className="filter-select"
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity checkboxes */}
            <div className="checkbox-group">
              {SEVERITIES.map((s) => (
                <label className="checkbox-item" key={s}>
                  <input
                    type="checkbox"
                    checked={severity.includes(s)}
                    onChange={() => toggleSeverity(s)}
                  />
                  {s}
                </label>
              ))}
            </div>

            {/* Status dropdown */}
            <div className="filter-group">
              <span className="filter-label">Status</span>
              <select
                className="filter-select"
                value={status.length === 1 ? status[0] : ""}
                onChange={(e) => {
                  setStatus(e.target.value ? [e.target.value] : []);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <input
              className="search-input"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* ── Error ──────────────────────────────────────── */}
          {error && (
            <div className="error-msg" style={{ margin: 16 }}>
              ⚠ {error}
            </div>
          )}

          {/* ── Loading ────────────────────────────────────── */}
          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <span className="loading-text">Loading incidents…</span>
            </div>
          ) : incidents.length === 0 ? (
            <div className="empty-state">
              <h3>No incidents found</h3>
              <p>Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <>
              {/* ── Table ─────────────────────────────────── */}
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th
                        className={sortBy === "title" ? "sorted" : ""}
                        onClick={() => handleSort("title")}
                      >
                        Title{sortIcon("title")}
                      </th>
                      <th
                        className={sortBy === "severity" ? "sorted" : ""}
                        onClick={() => handleSort("severity")}
                      >
                        Severity{sortIcon("severity")}
                      </th>
                      <th>Status</th>
                      <th
                        className={sortBy === "created_at" ? "sorted" : ""}
                        onClick={() => handleSort("created_at")}
                      >
                        Created At{sortIcon("created_at")}
                      </th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((inc) => (
                      <tr
                        key={inc.id}
                        onClick={() =>
                          (window.location.href = `/incidents/${inc.id}`)
                        }
                      >
                        <td className="col-title">
                          <Link to={`/incidents/${inc.id}`}>{inc.title}</Link>
                          {inc.service && (
                            <span
                              className="col-service"
                              style={{ marginLeft: 8, fontWeight: 400 }}
                            >
                              {inc.service}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={severityClass(inc.severity)}>
                            {inc.severity}
                          </span>
                        </td>
                        <td>
                          <span className={statusClass(inc.status)}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="col-date">
                          {formatDate(inc.created_at)}
                        </td>
                        <td className="col-owner">{inc.owner || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ────────────────────────────── */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Page {page} of {totalPages}
                  </div>

                  <div className="pagination-pages">
                    <button
                      className="page-btn nav-btn"
                      disabled={page <= 1}
                      onClick={() => setPage(1)}
                    >
                      &laquo;
                    </button>
                    <button
                      className="page-btn nav-btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      &lsaquo; Prev
                    </button>

                    {pageNumbers.map((n, i) =>
                      typeof n === "string" ? (
                        <span key={`e${i}`} className="page-ellipsis">
                          {n}
                        </span>
                      ) : (
                        <button
                          key={n}
                          className={`page-btn${n === page ? " active" : ""}`}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      ),
                    )}

                    <button
                      className="page-btn nav-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next &rsaquo;
                    </button>
                    <button
                      className="page-btn nav-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage(totalPages)}
                    >
                      &raquo;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
