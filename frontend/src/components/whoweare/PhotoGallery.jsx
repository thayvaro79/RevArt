export default function PhotoGallery({ photos, altText }) {
  if (!photos || photos.length === 0) {
    return <p className="photo-gallery-empty">No photos available yet.</p>;
  }

  return (
    <div className="photo-gallery">
      {photos.map((photo) => (
        <div className="photo-gallery-item" key={photo.id}>
          <img src={photo.imageUrl} alt={altText} />
        </div>
      ))}
    </div>
  );
}
