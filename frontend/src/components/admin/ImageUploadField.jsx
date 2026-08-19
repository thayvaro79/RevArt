import { useRef, useState } from "react";
import { uploadContentImage } from "../../api/contentImagesApi";

export default function ImageUploadField({
  imageUrl,
  folder,
  onUploaded,
  label = "Image",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadContentImage(file, folder);
      onUploaded(result.url);
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Upload failed. The current image was kept — try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-field">
      <span>{label}</span>

      <div className="admin-image-upload">
        <div className="admin-image-preview">
          {imageUrl ? (
            <img src={imageUrl} alt="" />
          ) : (
            <span className="admin-image-preview-empty">No image</span>
          )}
        </div>

        <div className="admin-image-upload-actions">
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : imageUrl ? "Replace Image" : "Upload Image"}
          </button>

          {error && <p className="admin-image-upload-error">{error}</p>}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
