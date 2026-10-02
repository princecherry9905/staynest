import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';
import { formatDate } from '../utils/format.js';

export default function Reviews({ listingId, onReviewAdded }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState('');

  const ownReview = reviews.find((review) => review.user?._id === user?._id);

  const load = () => api.get(`/listings/${listingId}/reviews`).then(({ data }) => setReviews(data));
  useEffect(() => {
    load();
  }, [listingId]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingReview) {
        await api.put(`/listings/${listingId}/reviews/${editingReview._id}`, form);
      } else {
        await api.post(`/listings/${listingId}/reviews`, form);
      }
      setEditingReview(null);
      setForm({ rating: 5, comment: '' });
      await load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEditing = (review) => {
    setEditingReview(review);
    setForm({ rating: review.rating, comment: review.comment });
    setError('');
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setForm({ rating: 5, comment: '' });
    setError('');
  };

  const removeReview = async (review) => {
    if (!window.confirm('Delete your review?')) return;
    setError('');
    try {
      await api.delete(`/listings/${listingId}/reviews/${review._id}`);
      await load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="reviews">
      <h2>Reviews ({reviews.length})</h2>
      {error && <p className="error" role="alert">{error}</p>}
      {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      {reviews.map((r) => (
        <div key={r._id} className="review">
          <div className="row-between">
            <strong>{r.user?.name}</strong>
            <span className="muted small">{formatDate(r.updatedAt || r.createdAt)}</span>
          </div>
          <div className="stars-static">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
          {editingReview?._id === r._id ? (
            <form className="form review-edit-form" onSubmit={submit}>
              <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
              <textarea required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
              <div className="row">
                <button className="btn">Save review</button>
                <button className="btn btn-ghost" type="button" onClick={cancelEditing}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <p>{r.comment}</p>
              {user?._id === r.user?._id && (
                <div className="row">
                  <button className="btn btn-ghost" type="button" onClick={() => startEditing(r)}>Edit</button>
                  <button className="btn btn-danger" type="button" onClick={() => removeReview(r)}>Delete</button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {user && !ownReview && (
        <form className="card form" onSubmit={submit}>
          <h3>Write a review</h3>
          <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          <textarea
            required
            placeholder="How was your stay?"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          <button className="btn">Submit review</button>
        </form>
      )}
    </section>
  );
}
