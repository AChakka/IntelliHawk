import React from "react";
import "./settings.css";

const DEFAULTS = {
  passThreshold: 70,
  autoQuarantine: false,
  emailNotifications: true,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem("ih_settings");
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(next) {
  localStorage.setItem("ih_settings", JSON.stringify(next));
}

function Badge({ tone = "neutral", children }) {
  return <span className={`set-badge set-badge--${tone}`}>{children}</span>;
}

export default function Settings() {
  const [settings, setSettings] = React.useState(loadSettings);
  const [draft, setDraft] = React.useState(settings);
  const [savedAt, setSavedAt] = React.useState(null);

  const passText = `Pass if score ≥ ${draft.passThreshold}%`;

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setDraft((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  }

  function handleSave() {
    // clamp to 0..100 for safety
    const clamped = {
      ...draft,
      passThreshold: Math.max(0, Math.min(100, Number(draft.passThreshold) || 0)),
    };
    setDraft(clamped);
    setSettings(clamped);
    saveSettings(clamped);
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setTimeout(() => setSavedAt(null), 2500);
  }

  function handleReset() {
    setDraft(DEFAULTS);
  }

  return (
    <div className="set-page">
      <div className="set-container">
        <div className="set-top">
          {/* System Settings */}
          <section className="set-card set-card--left">
            <div className="set-card-head">
              <h2 className="set-title">System Settings</h2>
              {savedAt && <span className="set-saved">Saved · {savedAt}</span>}
            </div>

            <div className="set-group">
              <label htmlFor="passThreshold" className="set-label">
                Pass Threshold
                <span className="set-help">{passText}</span>
              </label>

              <div className="set-field-row">
                <input
                  id="passThreshold"
                  name="passThreshold"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={draft.passThreshold}
                  onChange={handleChange}
                  className="set-input set-input--small"
                />
                <span className="set-field-suffix">%</span>
              </div>
            </div>

            <div className="set-group set-group--toggles">
              <label className="set-switch">
                <input
                  type="checkbox"
                  name="autoQuarantine"
                  checked={draft.autoQuarantine}
                  onChange={handleChange}
                />
                <span className="set-switch-ui"></span>
                Auto-quarantine high-risk users
              </label>

              <label className="set-switch">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={draft.emailNotifications}
                  onChange={handleChange}
                />
                <span className="set-switch-ui"></span>
                Email notifications to admins
              </label>
            </div>

            <div className="set-actions">
              <button type="button" className="set-btn set-btn--primary" onClick={handleSave}>
                Save Settings
              </button>
              <button type="button" className="set-btn set-btn--ghost" onClick={handleReset}>
                Reset to Defaults
              </button>
            </div>
          </section>

          {/* Admin Information */}
          <aside className="set-card set-card--right">
            <div className="set-card-head">
              <h2 className="set-title">Admin Information</h2>
            </div>

            <div className="set-admin">
              <div className="set-admin-avatar" aria-label="Admin avatar">AU</div>
              <div className="set-admin-meta">
                <div className="set-admin-name">Admin User</div>
                <div className="set-admin-sub">admin@intellihawk.io</div>
                <div className="set-admin-row">
                  <Badge tone="info">Role: Super Admin</Badge>
                  <Badge tone="success">2FA Enabled</Badge>
                </div>
              </div>
            </div>

            <div className="set-admin-grid">
              <div className="set-kv">
                <div className="set-kv-k">Org</div>
                <div className="set-kv-v">IntelliHawk</div>
              </div>
              <div className="set-kv">
                <div className="set-kv-k">Region</div>
                <div className="set-kv-v">US-East</div>
              </div>
              <div className="set-kv">
                <div className="set-kv-k">Last Login</div>
                <div className="set-kv-v">Today 10:24 AM</div>
              </div>
              <div className="set-kv">
                <div className="set-kv-k">Accounts</div>
                <div className="set-kv-v">4 linked</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
