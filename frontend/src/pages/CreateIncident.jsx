import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createIncident } from "../api";
import { SEVERITIES, STATUSES, SERVICES } from "../utils";

const INITIAL = {
  title: "",
  summary: "",
  severity: "",
  status: "",
  service: "",
  owner: "",
};

export default function CreateIncident() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastHiding, setToastHiding] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.severity) e.severity = "Choose a severity level";
    if (!form.service) e.service = "Service is required";
    if (!form.summary.trim()) e.summary = "Summary is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (type, msg) => {
    setToastHiding(false);
    setToast({ type, msg });
    setTimeout(() => setToastHiding(true), 2800);
    setTimeout(() => {
      setToast(null);
      setToastHiding(false);
    }, 3200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const created = await createIncident({
        title: form.title.trim(),
        summary: form.summary.trim(),
        severity: form.severity,
        status: form.status || "OPEN",
        service: form.service || undefined,
        owner: form.owner.trim() || undefined,
      });
      showToast("success", "Incident created!");
      setTimeout(() => navigate(`/incidents/${created.id}`), 600);
    } catch (err) {
      showToast("error", err.message || "Failed to create incident");
    } finally {
      setSaving(false);
    }
  };

  const change = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

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
        <div className="card" style={{ maxWidth: 640, padding: "28px 32px" }}>
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 700,
              marginBottom: 24,
              color: "var(--text)",
            }}
          >
            Create New Incident
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className="form-group">
              <label>Title</label>
              <input
                className={`form-input${errors.title ? " error" : ""}`}
                placeholder="Issue Title..."
                value={form.title}
                onChange={(e) => change("title", e.target.value)}
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            {/* Service */}
            <div className="form-group">
              <label>Service</label>
              <select
                className={`form-select${errors.service ? " error" : ""}`}
                value={form.service}
                onChange={(e) => change("service", e.target.value)}
              >
                <option value="">Select Service</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.service && (
                <div className="form-error">{errors.service}</div>
              )}
            </div>

            {/* Severity radio buttons */}
            <div className="form-group">
              <label>Severity</label>
              <div className="radio-group">
                {SEVERITIES.map((s) => (
                  <label className="radio-item" key={s}>
                    <input
                      type="radio"
                      name="severity"
                      value={s}
                      checked={form.severity === s}
                      onChange={() => change("severity", s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
              {errors.severity && (
                <div className="form-error">{errors.severity}</div>
              )}
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => change("status", e.target.value)}
              >
                <option value="">Select Status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div className="form-group">
              <label>Assigned To</label>
              <input
                className="form-input"
                placeholder="Optional"
                value={form.owner}
                onChange={(e) => change("owner", e.target.value)}
              />
            </div>

            {/* Summary */}
            <div className="form-group">
              <label>Summary</label>
              <textarea
                className={`form-textarea${errors.summary ? " error" : ""}`}
                placeholder="Describe the incident..."
                value={form.summary}
                onChange={(e) => change("summary", e.target.value)}
              />
              {errors.summary && (
                <div className="form-error">{errors.summary}</div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Creating…" : "Create Incident"}
              </button>
              <Link to="/" className="btn">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
