export default function EditorCardFooter({ saving, status, onSave }) {
  return (
    <div className="admin-editor-card-footer">
      {status && (
        <p
          className={`admin-save-status admin-save-status-${status.type}`}
        >
          {status.message}
        </p>
      )}

      <button
        type="button"
        className="admin-primary-btn"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
