/**
 * Jelajah Ku - State Store & Supabase Sync
 */
const state = {
  currentUser: { id: 'default-user', username: 'username' },
  places: [],
  wishlist: [],
  history: []
};

function updateDbStatusBadge(status, text) {
  const badges = [
    document.getElementById('db-status-badge'),
    document.getElementById('db-status-badge-mobile')
  ];

  badges.forEach(b => {
    if (!b) return;
    if (status === 'connected') {
      b.style.background = '#E8F5E9';
      b.style.color = '#169E5F';
      b.innerHTML = '<span style="width:7px; height:7px; border-radius:50%; background:#169E5F;"></span> ' + (text || 'Database Terhubung');
    } else if (status === 'error') {
      b.style.background = '#FEECEE';
      b.style.color = '#D63333';
      b.innerHTML = '<span style="width:7px; height:7px; border-radius:50%; background:#D63333;"></span> ' + (text || 'Database Belum Terhubung');
    } else {
      b.style.background = '#F1F5F9';
      b.style.color = '#64748B';
      b.innerHTML = '<span style="width:7px; height:7px; border-radius:50%; background:#94A3B8;"></span> Memeriksa...';
    }
  });
}

// Ambil data dari Supabase jika koneksi aktif
async function loadDataFromSupabase() {
  if (!supabaseClient) {
    updateDbStatusBadge('error', 'Database Belum Terhubung (Key kosong)');
    return false;
  }
  try {
    const [placesRes, wishlistRes, historyRes] = await Promise.all([
      supabaseClient.from('places').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('wishlist').select('*').order('departure_date', { ascending: true }),
      supabaseClient.from('history').select('*').order('completed_at', { ascending: false })
    ]);

    if (placesRes.error || wishlistRes.error || historyRes.error) {
      const err = placesRes.error || wishlistRes.error || historyRes.error;
      console.error('Supabase query error:', err);
      updateDbStatusBadge('error', 'Izin Akses Database Ditolak');
      return false;
    }

    updateDbStatusBadge('connected', 'Database Terhubung');

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
    updateDbStatusBadge('error', 'Koneksi Database Gagal');
    return false;
  }
}


    // TAB SWITCHING
