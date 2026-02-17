import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getIncident, updateIncident } from "../api";
import { useFetch } from "../hooks";
import {
  SEVERITIES,
  STATUSES,
  formatDateTime,
  severityClass,
  statusClass,
} from "../utils";

export default function IncidentDetail() {
  const { id } = useParams();
  const {
    data: incident,
    loading,
    error,
    refetch,
  } = useFetch(() => getIncident(id), [id]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastHiding, setToastHiding] = useState(false);

  useEffect(() => {
    if (incident) {
      setForm({
        severity: incident.severity,
        status: incident.status,
        summary: incident.summary ?? "",
        owner: incident.owner ?? "",
        service: incident.service ?? "",
      });
    }
  }, [incident]);

  const showToast = useCallback((type, msg) => {
    setToastHiding(false);
    setToast({ type, msg });
    setTimeout(() => setToastHiding(true), 2800);
    setTimeout(() => {
      setToast(null);
      setToastHiding(false);
    }, 3200);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateIncident(id, form);
      await refetch();
      setEditing(false);
      showToast("success", "Incident updated successfully");
    } catch (err) {
      showToast("error", err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (incident) {
      setForm({
        severity: incident.severity,
        status: incident.status,
        summary: incident.summary ?? "",
        owner: incident.owner ?? "",
        service: incident.service ?? "",
      });
    }
  };

  const change = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h1>Incident Tracker</h1>
        </div>
        <div className="container">
          <div className="loading-wrap">
            <div className="spinner" />
            <span className="loading-text">Loading…</span>
          </div>
        </div>
      </>
    );
  }

  if (error || !incident) {
    return (
      <>
        <div className="page-header">
          <h1>Incident Tracker</h1>
        </div>
        <div className="container">
          <div className="error-msg">⚠ {error || "Incident not found"}</div>
          <Link to="/" className="btn" style={{ marginTop: 12 }}>
            ← Back
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`toast toast-${toast.type}${toastHiding ? " hiding" : ""}`}
        >
          {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
        </div>
      )}

      <div className="page-header">
        <h1>Incident Tracker</h1>
        <Link to="/" className="btn btn-outline btn-sm">
          ← Back to List
        </Link>
      </div>

      <div className="container">
        <div className="card" style={{ padding: "28px 32px" }}>
          <h2 className="detail-title">{incident.title}</h2>

          <div className="detail-form-grid">
            {/* Service */}
            <div className="detail-row">
              <div className="detail-label">Service:</div>
              <div className="detail-value">
                {editing ? (
                  <input
                    className="form-input"
                    value={form.service}
                    onChange={(e) => change("service", e.target.value)}
                    placeholder="e.g. Auth, Payments"
                  />
                ) : (
                  incident.service || "—"
                )}
              </div>
            </div>

            {/* Severity */}
            <div className="detail-row">
              <div className="detail-label">Severity:</div>
              <div className="detail-value">
                {editing ? (
                  <select
                    className="form-select"
                    style={{ width: "auto" }}
                    value={form.severity}
                    onChange={(e) => change("severity", e.target.value)}
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={severityClass(incident.severity)}>
                    {incident.severity}
                  </span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="detail-row">
              <div className="detail-label">Status:</div>
              <div className="detail-value">
                {editing ? (
                  <select
                    className="form-select"
                    style={{ width: "auto" }}
                    value={form.status}
                    onChange={(e) => change("status", e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={statusClass(incident.status)}>
                    {incident.status}
                  </span>
                )}
              </div>
            </div>

            {/* Owner / Assigned To */}
            <div className="detail-row">
              <div className="detail-label">Assigned To:</div>
              <div className="detail-value">
                {editing ? (
                  <input
                    className="form-input"
                    value={form.owner}
                    onChange={(e) => change("owner", e.target.value)}
                    placeholder="e.g. dev@team"
                  />
                ) : (
                  incident.owner || "—"
                )}
              </div>
            </div>

            {/* Occurred At */}
            <div className="detail-row">
              <div className="detail-label">Occurred At:</div>
              <div className="detail-value">
                {formatDateTime(incident.created_at)}
              </div>
            </div>

            {/* Summary */}
            <div className="detail-row">
              <div className="detail-label">Summary:</div>
              <div className="detail-value">
                {editing ? (
                  <textarea
                    className="form-textarea"
                    value={form.summary}
                    onChange={(e) => change("summary", e.target.value)}
                    placeholder="Describe the incident…"
                  />
                ) : (
                  <div
                    style={{
                      background: "#f7f8fa",
                      padding: "12px 14px",
                      borderRadius: 6,
                      lineHeight: 1.6,
                      minHeight: 60,
                    }}
                  >
                    {incident.summary || "No summary provided."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="detail-actions">
            {editing ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  className="btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setEditing(true)}
              >
                Edit Incident
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
