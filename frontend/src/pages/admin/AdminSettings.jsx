export default function AdminSettings() {
  return (
    <div className="admin-settings-page">
      <div className="admin-page-heading">
        <h1>Settings</h1>
        <p>Dealership and account settings.</p>
      </div>

      <div className="admin-panel">
        <div className="admin-settings-row">
          <span>Dealership</span>
          <span>RevArt Garage</span>
        </div>
        <div className="admin-settings-row">
          <span>Tenant ID</span>
          <span>1</span>
        </div>
        <div className="admin-settings-row">
          <span>API Environment</span>
          <span>{import.meta.env.PROD ? "Production" : "Local"}</span>
        </div>
      </div>

      <p className="admin-field-hint">
        Editable dealership settings (branding, notification emails, user
        accounts) aren't wired up to the API yet.
      </p>
    </div>
  );
}
