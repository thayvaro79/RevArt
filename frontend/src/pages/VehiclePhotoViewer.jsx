import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVehicleBySlug } from "../api/vehiclesApi";

import "../styles/VehiclePhotoViewer.css";

export default function VehiclePhotoViewer() {
  const { slug, photoId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicle() {
      try {
        const data = await getVehicleBySlug(slug);
        setVehicle(data);
      } catch (err) {
        console.error("Failed to load photo viewer", err);
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
    window.scrollTo(0, 0);
  }, [slug]);

  const fallbackPhotos = useMemo(() => {
    if (!vehicle) return [];

    const images = [
      vehicle.imageUrl,
      "/images/cars/f1.webp",
      "/images/cars/f2.webp",
      "/images/cars/f3.webp",
      "/images/cars/f4.webp",
      "/images/cars/f5.webp",
      "/images/cars/f6.webp",
      "/images/cars/f7.webp",
      "/images/cars/f8.webp",
      "/images/cars/f9.webp",
    ].filter(Boolean);

    return images.map((imageUrl, index) => ({
      id: String(index),
      imageUrl,
      altText: vehicle.title,
    }));
  }, [vehicle]);

  if (loading) {
    return <main className="photo-viewer-loading">Loading...</main>;
  }

  if (!vehicle) {
    return <main className="photo-viewer-loading">Vehicle not found.</main>;
  }

  const rawPhotos =
    vehicle.photos && vehicle.photos.length > 0 ? vehicle.photos : fallbackPhotos;

  const photos = rawPhotos.map((photo, index) => ({
    id: photo.id ?? String(index),
    imageUrl:
      photo.imageUrl ||
      photo.imageURL ||
      photo.url ||
      photo.photoUrl ||
      photo.photoURL ||
      photo.fileUrl ||
      photo.fileURL ||
      photo.blobUrl ||
      photo.blobURL ||
      photo.src,
    altText: photo.altText || photo.title || vehicle.title,
  }));

  const currentIndex = photos.findIndex((photo, photoIndex) => {
    return (
      String(photo.id) === String(photoId) ||
      String(photoIndex) === String(photoId)
    );
  });

  const index = currentIndex >= 0 ? currentIndex : 0;
  const currentPhoto = photos[index];

  function previousPhoto() {
    const newIndex = index === 0 ? photos.length - 1 : index - 1;
    navigate(`/garage/${slug}/photos/${photos[newIndex].id}`);
  }

  function nextPhoto() {
    const newIndex = index === photos.length - 1 ? 0 : index + 1;
    navigate(`/garage/${slug}/photos/${photos[newIndex].id}`);
  }

  return (
    <main className="photo-viewer-page">
      <button
        type="button"
        className="photo-viewer-close"
        onClick={() => navigate(`/garage/${slug}/photos`)}
      >
        ✕
      </button>

      <button
        type="button"
        className="photo-viewer-arrow left"
        onClick={previousPhoto}
      >
        ‹
      </button>

      <div className="photo-viewer-image-wrap">
        {currentPhoto?.imageUrl ? (
          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.altText}
            className="photo-viewer-image"
          />
        ) : (
          <div className="photo-viewer-error">
            No image URL found for this photo.
          </div>
        )}
      </div>

      <button
        type="button"
        className="photo-viewer-arrow right"
        onClick={nextPhoto}
      >
        ›
      </button>

      <div className="photo-viewer-count">
        {index + 1} / {photos.length}
      </div>
    </main>
  );
}