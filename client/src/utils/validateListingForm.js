export const validateListingForm = (values) => {
  const errors = {};
  const titleLength = values.title.trim().length;
  if (titleLength < 10) errors.title = 'Title must be at least 10 characters.';
  else if (titleLength > 100) errors.title = 'Title must be 100 characters or fewer.';

  if (values.description.trim().length < 30) {
    errors.description = 'Description must be at least 30 characters.';
  }

  const price = Number(values.pricePerNight);
  if (values.pricePerNight === '' || !Number.isFinite(price) || price <= 0) {
    errors.pricePerNight = 'Price must be greater than 0.';
  }

  if (values.imageUrl.trim()) {
    try {
      const imageUrl = new URL(values.imageUrl.trim());
      if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error('Invalid protocol');
    } catch {
      errors.imageUrl = 'Enter a valid image URL starting with http:// or https://.';
    }
  }

  return errors;
};
