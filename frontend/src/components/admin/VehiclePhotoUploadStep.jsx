import { useEffect, useRef, useState } from "react";
import {
  uploadVehiclePhoto,
  getVehiclePhotos,
  setVehiclePhotoCover,
} from "../../api/vehiclePhotosApi";
import { VEHICLE_PHOTO_CATEGORIES } from "../../constants/vehiclePhotoCategories";
import { CameraIcon, ImagesIcon, StarIcon, CloseIcon } from "./icons";

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function VehiclePhotoUploadStep({ vehicleId, onDone }) {
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [pending, setPending] = useState([]);
  const [selectedLocalIds, setSelectedLocalIds] = useState(new Set());
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const libraryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const nextSortOrderRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadExisting() {
      try {
        const data = await getVehiclePhotos(vehicleId);
        if (cancelled) return;
        setExistingPhotos(data || []);
        nextSortOrderRef.current = (data || []).length;
      } catch (err) {
        console.error("Failed to load existing photos:", err);
        if (!cancelled) setLoadError("Couldn't load existing photos.");
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    }

    loadExisting();

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  useEffect(() => {
    return () => {
      pending.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
    // Only revoke on unmount, not on every pending change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const hasCoverAlready =
      existingPhotos.some((p) => p.isCover) || pending.some((p) => p.isCover);

    const newItems = files.map((file, index) => ({
      localId: makeLocalId(),
      file,
      previewUrl: URL.createObjectURL(file),
      category: "Exterior",
      isCover: !hasCoverAlready && index === 0,
      status: "idle",
      progress: 0,
      errorMessage: null,
    }));

    setPending((current) => [...current, ...newItems]);
  }

  function handleLibraryChange(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleCameraChange(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function toggleSelected(localId) {
    setSelectedLocalIds((current) => {
      const next = new Set(current);
      if (next.has(localId)) next.delete(localId);
      else next.add(localId);
      return next;
    });
  }

  function assignCategoryToSelected(category) {
    if (selectedLocalIds.size === 0) return;

    setPending((current) =>
      current.map((item) =>
        selectedLocalIds.has(item.localId) ? { ...item, category } : item
      )
    );
    setSelectedLocalIds(new Set());
  }

  function removePending(localId) {
    setPending((current) => {
      const target = current.find((item) => item.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.localId !== localId);
    });
    setSelectedLocalIds((current) => {
      const next = new Set(current);
      next.delete(localId);
      return next;
    });
  }

  function setPendingCover(localId) {
    setPending((current) =>
      current.map((item) => ({ ...item, isCover: item.localId === localId }))
    );
  }

  async function setExistingCover(photoId) {
    const previous = existingPhotos;

    setExistingPhotos((current) =>
      current.map((p) => ({ ...p, isCover: p.id === photoId }))
    );

    try {
      await setVehiclePhotoCover(photoId);
    } catch (err) {
      console.error("Failed to set cover photo:", err);
      setExistingPhotos(previous);
    }
  }

  async function uploadPendingItem(item) {
    setPending((current) =>
      current.map((p) =>
        p.localId === item.localId
          ? { ...p, status: "uploading", progress: 0, errorMessage: null }
          : p
      )
    );

    try {
      const sortOrder = nextSortOrderRef.current++;

      const result = await uploadVehiclePhoto(
        item.file,
        {
          tenantId: 1,
          vehicleId,
          category: item.category,
          sortOrder,
          isCover: false,
        },
        (progressEvent) => {
          if (!progressEvent.total) return;
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setPending((current) =>
            current.map((p) =>
              p.localId === item.localId ? { ...p, progress } : p
            )
          );
        }
      );

      if (item.isCover) {
        await setVehiclePhotoCover(result.id);
      }

      URL.revokeObjectURL(item.previewUrl);

      setExistingPhotos((current) => {
        const withoutOldCover = item.isCover
          ? current.map((p) => ({ ...p, isCover: false }))
          : current;

        return [
          ...withoutOldCover,
          {
            id: result.id,
            imageUrl: result.url,
            category: result.category,
            sortOrder,
            isCover: item.isCover,
          },
        ];
      });

      setPending((current) => current.filter((p) => p.localId !== item.localId));
    } catch (err) {
      console.error("Photo upload failed:", err);
      setPending((current) =>
        current.map((p) =>
          p.localId === item.localId
            ? { ...p, status: "error", errorMessage: "Upload failed — tap to retry" }
            : p
        )
      );
    }
  }

  async function handleUploadAll() {
    const toUpload = pending.filter((item) => item.status !== "uploading");
    if (toUpload.length === 0) return;

    setUploading(true);

    for (const item of toUpload) {
      // Sequential on purpose: keeps per-file progress simple and avoids
      // saturating a mobile connection with many parallel uploads.
      await uploadPendingItem(item);
    }

    setUploading(false);
  }

  const hasCover =
    existingPhotos.some((p) => p.isCover) || pending.some((p) => p.isCover);
  const pendingCount = pending.length;

  return (
    <div className="admin-form-card admin-photo-step">
      <p className="admin-field-hint">
        Vehicle saved as Draft. Add photos now, or finish and add them later.
      </p>

      {loadError && <p className="admin-error-banner">{loadError}</p>}

      <div className="admin-photo-actions">
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() => libraryInputRef.current?.click()}
        >
          <ImagesIcon />
          Choose Photos
        </button>
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() => cameraInputRef.current?.click()}
        >
          <CameraIcon />
          Take Photo
        </button>

        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleLibraryChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handleCameraChange}
        />
      </div>

      {!hasCover && (existingPhotos.length > 0 || pending.length > 0) && (
        <p className="admin-field-hint">
          No cover photo set yet — tap the star on a photo to make it the cover.
        </p>
      )}

      {selectedLocalIds.size > 0 && (
        <div className="admin-photo-category-bar">
          <span className="admin-photo-category-bar-label">
            Set category for {selectedLocalIds.size} selected:
          </span>
          {VEHICLE_PHOTO_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className="admin-photo-category-chip"
              onClick={() => assignCategoryToSelected(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {loadingExisting ? (
        <p className="admin-empty-state">Loading photos…</p>
      ) : existingPhotos.length === 0 && pending.length === 0 ? (
        <p className="admin-empty-state">No photos yet.</p>
      ) : (
        <div className="admin-photo-grid">
          {existingPhotos.map((photo) => (
            <div
              key={`existing-${photo.id}`}
              className="admin-photo-thumb admin-photo-thumb-uploaded"
            >
              <img src={photo.imageUrl} alt={photo.category} />
              <button
                type="button"
                className={`admin-photo-cover-btn${
                  photo.isCover ? " admin-photo-cover-btn-active" : ""
                }`}
                onClick={() => setExistingCover(photo.id)}
                aria-label={photo.isCover ? "Cover photo" : "Set as cover photo"}
              >
                <StarIcon filled={photo.isCover} />
              </button>
              <span className="admin-photo-thumb-category">{photo.category}</span>
            </div>
          ))}

          {pending.map((item) => (
            <div
              key={item.localId}
              className={`admin-photo-thumb${
                selectedLocalIds.has(item.localId)
                  ? " admin-photo-thumb-selected"
                  : ""
              }`}
              onClick={() =>
                item.status !== "uploading" && toggleSelected(item.localId)
              }
            >
              <img src={item.previewUrl} alt="" />

              <button
                type="button"
                className={`admin-photo-cover-btn${
                  item.isCover ? " admin-photo-cover-btn-active" : ""
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  setPendingCover(item.localId);
                }}
                aria-label={item.isCover ? "Cover photo" : "Set as cover photo"}
              >
                <StarIcon filled={item.isCover} />
              </button>

              <button
                type="button"
                className="admin-photo-remove-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  removePending(item.localId);
                }}
                aria-label="Remove photo"
              >
                <CloseIcon />
              </button>

              <span className="admin-photo-thumb-category">{item.category}</span>

              {item.status === "uploading" && (
                <div className="admin-photo-thumb-status-overlay">
                  {item.progress}%
                </div>
              )}

              {item.status === "error" && (
                <button
                  type="button"
                  className="admin-photo-thumb-status-overlay admin-photo-thumb-error"
                  onClick={(event) => {
                    event.stopPropagation();
                    uploadPendingItem(item);
                  }}
                >
                  {item.errorMessage}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-primary-btn"
          disabled={pendingCount === 0 || uploading}
          onClick={handleUploadAll}
        >
          {uploading
            ? "Uploading…"
            : pendingCount > 0
            ? `Upload ${pendingCount} Photo${pendingCount === 1 ? "" : "s"}`
            : "Upload Photos"}
        </button>
        <button
          type="button"
          className="admin-secondary-btn"
          disabled={uploading}
          onClick={onDone}
        >
          Done
        </button>
      </div>
    </div>
  );
}
