import { useEffect, useState } from "react";
import { updatePageSection } from "../../api/pageSectionsApi";
import ImageUploadField from "./ImageUploadField";
import EditorCardFooter from "./EditorCardFooter";

function toForm(section) {
  return {
    heading: section?.heading || "",
    body: section?.body || "",
    imageUrl: section?.imageUrl || "",
  };
}

export default function SectionEditorCard({
  pageName,
  sectionKey,
  label,
  fields,
  initialSection,
  folder,
  destinationHint,
  compact = false,
}) {
  const [form, setForm] = useState(() => toForm(initialSection));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setForm(toForm(initialSection));
  }, [initialSection]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      const updated = await updatePageSection(pageName, sectionKey, form);
      setForm(toForm(updated));
      setStatus({ type: "success", message: "Saved." });
    } catch (error) {
      console.error(`Failed to save ${pageName}/${sectionKey}:`, error);
      setStatus({ type: "error", message: "Couldn't save. Try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`admin-form-card admin-editor-card${
        compact ? " admin-editor-card--compact" : ""
      }`}
    >
      <h2>{label}</h2>

      {destinationHint && <p className="admin-field-hint">{destinationHint}</p>}

      {fields.includes("image") && (
        <ImageUploadField
          label="Image"
          imageUrl={form.imageUrl}
          folder={folder}
          onUploaded={(url) => updateField("imageUrl", url)}
        />
      )}

      {fields.includes("heading") && (
        <label className="admin-field">
          <span>Headline</span>
          <input
            value={form.heading}
            onChange={(event) => updateField("heading", event.target.value)}
          />
        </label>
      )}

      {fields.includes("body") && (
        <label className="admin-field">
          <span>Body</span>
          <textarea
            rows={4}
            value={form.body}
            onChange={(event) => updateField("body", event.target.value)}
          />
        </label>
      )}

      <EditorCardFooter saving={saving} status={status} onSave={handleSave} />
    </div>
  );
}
