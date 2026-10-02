import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import Loader from '../components/Loader.jsx';
import { STAY_TYPES } from '../utils/format.js';

const initial = { city: '', type: '', guests: '', maxPrice: '' };

export default function Home() {
  const [filters, setFilters] = useState(initial);
  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = (params, nextPage = 1, nextSort = 'newest') => {
    setLoading(true);
    setError('');
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
    api
      .get('/listings', { params: { ...clean, page: nextPage, limit: 8, sort: nextSort } })
      .then(({ data }) => {
        setListings(data.listings);
        setPage(data.page);
        setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search(initial, 1, 'newest');
  }, []);

  const set = (key) => (e) => setFilters((current) => ({ ...current, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    search(filters, 1, sort);
  };

  const changeSort = (e) => {
    const nextSort = e.target.value;
    setSort(nextSort);
    search(filters, 1, nextSort);
  };

  return (
    <section>
      <div className="hero">
        <h1>Find your next nest.</h1>
        <p className="muted">Homestays, havelis, villas and hostels across India.</p>
        <form className="search-bar card" onSubmit={submit}>
          <input placeholder="Where to? (e.g. Jaipur)" value={filters.city} onChange={set('city')} />
          <select value={filters.type} onChange={set('type')}>
            <option value="">Any type</option>
            {STAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" min="1" placeholder="Guests" value={filters.guests} onChange={set('guests')} />
          <input type="number" min="0" placeholder="Max ₹/night" value={filters.maxPrice} onChange={set('maxPrice')} />
          <button className="btn">Search</button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}
      <div className="row-between listing-controls">
        <p className="muted">{pagination.total} stays found</p>
        <label className="sort-control">Sort by
          <select value={sort} onChange={changeSort} disabled={loading}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </label>
      </div>
      {loading ? (
        <Loader />
      ) : listings.length === 0 ? (
        <p className="muted">No stays match your search.</p>
      ) : (
        <div className="grid">
          {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      )}
      {!loading && pagination.totalPages > 0 && (
        <nav className="pagination" aria-label="Listing pages">
          <button className="btn btn-ghost" type="button" onClick={() => search(filters, page - 1, sort)} disabled={page <= 1}>
            Previous
          </button>
          <span className="muted" aria-live="polite">Page {page} of {pagination.totalPages}</span>
          <button className="btn btn-ghost" type="button" onClick={() => search(filters, page + 1, sort)} disabled={page >= pagination.totalPages}>
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
