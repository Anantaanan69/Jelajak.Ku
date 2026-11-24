/**
 * Jelajah Ku - State Store & Supabase Sync
 */
const state = {
  currentUser: { id: 'default-user', username: 'username' },
  places: [],
  wishlist: [],
  history: []
};

// Ambil data dari Supabase jika koneksi aktif
async function loadDataFromSupabase() {
  if (!supabaseClient) return false;
  try {
    const [placesRes, wishlistRes, historyRes] = await Promise.all([
      supabaseClient.from('places').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('wishlist').select('*').order('departure_date', { ascending: true }),
      supabaseClient.from('history').select('*').order('completed_at', { ascending: false })
    ]);

    if (placesRes.data) {
      state.places = placesRes.data.map(p => ({
        id: p.id,
        type: p.type,
        name: p.name,
        city: p.city,
        location: p.location,
        photos: p.photos || [],
        videos: p.videos || []
      }));
    }

    if (wishlistRes.data) {
      state.wishlist = wishlistRes.data.map(w => ({
        id: w.id,
        placeId: w.place_id,
        name: w.name || '',
        category: w.category || '',
        city: w.city || '',
        location: w.location || '',
        departureDate: w.departure_date,
        notes: w.notes || '',
        completed: w.completed || false
      }));
    }

    if (historyRes.data) {
      state.history = historyRes.data.map(h => ({
        id: h.id,
        placeId: h.place_id,
        name: h.place_name,
        category: h.category === 'kuliner' ? 'Tempat Makan' : 'Tempat Wisata',
        city: h.city,
        location: h.location,
        departureDate: h.departure_date,
        completedAt: h.completed_at,
        notes: h.notes || '',
        gdriveUrl: h.gdrive_url || ''
      }));
    }

    if (typeof renderAll === 'function') {
      renderAll();
    }
    return true;
  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
    return false;
  }
}


    // TAB SWITCHING
