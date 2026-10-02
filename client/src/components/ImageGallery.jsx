import { useEffect, useState } from 'react';

export default function ImageGallery({ images = [], title }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imageList = Array.isArray(images) ? images.filter(Boolean) : [];
  const currentIndex = Math.min(selectedIndex, Math.max(imageList.length - 1, 0));
  const imageKey = imageList.join('|');

  useEffect(() => {
    setSelectedIndex(0);
  }, [imageKey]);

  if (imageList.length === 0) return null;

  return (
    <div className="image-gallery">
      <img
        className="gallery-main-image"
        src={imageList[currentIndex]}
        alt={`${title} — image ${currentIndex + 1} of ${imageList.length}`}
      />
      {imageList.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Listing photos">
          {imageList.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`gallery-thumbnail${index === currentIndex ? ' active' : ''}`}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={index === currentIndex}
              onClick={() => setSelectedIndex(index)}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
