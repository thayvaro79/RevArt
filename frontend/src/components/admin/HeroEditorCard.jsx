import { useEffect, useState } from "react";
import { getPageHero, updatePageHero } from "../../api/pageHeroesApi";
import ImageUploadField from "./ImageUploadField";
import EditorCardFooter from "./EditorCardFooter";

const EMPTY_HERO = {
  eyebrowText: "",
  title: "",
  subtitle: "",
  buttonText: "",
  buttonUrl: "",
  imageUrl: "",
};

function toForm(hero) {
  return {
    eyebrowText: hero?.eyebrowText || "",
    title: hero?.title || "",
    subtitle: hero?.subtitle || "",
    buttonText: hero?.buttonText || "",
    buttonUrl: hero?.buttonUrl || "",
    imageUrl: hero?.imageUrl || "",
  };
}

export default function HeroEditorCard({ heroPageKey }) {
  const [form, setForm] = useState(EMPTY_HERO);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const hero = await getPageHero(heroPageKey);
        if (active) setForm(toForm(hero));
      } catch (error) {
        console.error(`Failed to load ${heroPageKey} hero:`, error);
        if (active) setLoadError("Couldn't load the current hero content.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [heroPageKey]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      const updated = await updatePageHero(heroPageKey, form);
      setForm(toForm(updated));
      setStatus({ type: "success", message: "Saved." });
    } catch (error) {
      console.error(`Failed to save ${heroPageKey} hero:`, error);
      setStatus({ type: "error", message: "Couldn't save. Try again." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-form-card admin-editor-card">
        <h2>Hero</h2>
        <p className="admin-field-hint">Loading…</p>
      </div>
    );
  }

  return (
    <div className="admin-form-card admin-editor-card">
      <h2>Hero</h2>

      {loadError && <p className="admin-error-banner">{loadError}</p>}

      <ImageUploadField
        label="Hero Image"
        imageUrl={form.imageUrl}
        folder={`${heroPageKey}/hero`}
        onUploaded={(url) => updateField("imageUrl", url)}
      />

      <div className="admin-form-grid">
        <label className="admin-field">
          <span>Eyebrow Text</span>
          <input
            value={form.eyebrowText}
            onChange={(event) => updateField("eyebrowText", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Title</span>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span>Subtitle</span>
          <textarea
            rows={2}
            value={form.subtitle}
            onChange={(event) => updateField("subtitle", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Button Text</span>
          <input
            value={form.buttonText}
            onChange={(event) => updateField("buttonText", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Button Link</span>
          <input
            value={form.buttonUrl}
            onChange={(event) => updateField("buttonUrl", event.target.value)}
          />
        </label>
      </div>

      <EditorCardFooter saving={saving} status={status} onSave={handleSave} />
    </div>
  );
}
