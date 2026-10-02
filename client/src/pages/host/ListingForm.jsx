import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import { STAY_TYPES } from '../../utils/format.js';
import { validateListingForm } from '../../utils/validateListingForm.js';

const empty = {
  title: '',
  description: '',
  type: 'homestay',
  city: '',
  state: '',
  address: '',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  amenities: '',
  imageUrl: '',
};

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validationErrors = validateListingForm(form);
  const isValid = Object.keys(validationErrors).length === 0;
  const visibleError = (key) => (touched[key] || submitted ? validationErrors[key] : '');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) =>
      setForm({
        ...empty,
        ...data,
        amenities: data.amenities.join(', '),
        imageUrl: data.images[0] || '',
      })
    );
  }, [id, isEdit]);

  const set = (key) => (e) => {
    const { value } = e.target;
    setForm((current) => ({ ...current, [key]: value }));
    setTouched((current) => ({ ...current, [key]: true }));
  };

  // TODO: replace the image URL field with real image upload (Cloudinary / multer).
  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (!isValid) return;
    const { title, description, type, city, state, address, imageUrl, amenities } = form;
    const payload = {
      title,
      description,
      type,
      city,
      state,
      address,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    if (imageUrl) payload.images = [imageUrl];
    try {
      setIsSubmitting(true);
      if (isEdit) await api.put(`/listings/${id}`, payload);
      else await api.post('/listings', payload);
      navigate('/host');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="card form wide" onSubmit={submit}>
      <h1>{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>
      <div>
        <input required placeholder="Title" value={form.title} onChange={set('title')} aria-invalid={Boolean(visibleError('title'))} aria-describedby="title-error" />
        {visibleError('title') && <p id="title-error" className="field-error">{visibleError('title')}</p>}
      </div>
      <div>
        <textarea required placeholder="Describe your place" value={form.description} onChange={set('description')} aria-invalid={Boolean(visibleError('description'))} aria-describedby="description-error" />
        {visibleError('description') && <p id="description-error" className="field-error">{visibleError('description')}</p>}
      </div>
      <div className="row">
        <select value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="grow">
          <input required type="number" min="0" step="0.01" placeholder="Price per night (₹)" value={form.pricePerNight} onChange={set('pricePerNight')} aria-invalid={Boolean(visibleError('pricePerNight'))} aria-describedby="price-error" />
          {visibleError('pricePerNight') && <p id="price-error" className="field-error">{visibleError('pricePerNight')}</p>}
        </div>
      </div>
      <div className="row">
        <input required placeholder="City" value={form.city} onChange={set('city')} />
        <input required placeholder="State" value={form.state} onChange={set('state')} />
      </div>
      <input required placeholder="Address" value={form.address} onChange={set('address')} />
      <div className="row">
        <label className="grow">Max guests
          <input type="number" min="1" value={form.maxGuests} onChange={set('maxGuests')} />
        </label>
        <label className="grow">Bedrooms
          <input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} />
        </label>
      </div>
      <input placeholder="Amenities (comma separated: WiFi, AC, Parking)" value={form.amenities} onChange={set('amenities')} />
      <div>
        <input type="url" placeholder="Image URL (optional)" value={form.imageUrl} onChange={set('imageUrl')} aria-invalid={Boolean(visibleError('imageUrl'))} aria-describedby="image-error" />
        {visibleError('imageUrl') && <p id="image-error" className="field-error">{visibleError('imageUrl')}</p>}
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={!isValid || isSubmitting}>{isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Publish listing'}</button>
    </form>
  );
}
