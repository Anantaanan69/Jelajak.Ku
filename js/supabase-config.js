// Supabase Configuration
// Isi SUPABASE_ANON_KEY dengan anon key dari Supabase Dashboard -> Project Settings -> API
const SUPABASE_CONFIG = {
  url: 'https://lydfyyderwfyraktwjfv.supabase.co',
  anonKey: 'sb_publishable_utOEUJ-ouqfmjY2VOK3NJA_ZHygIw5Q' // Paste your anon public key here
};

// Inisialisasi Supabase Client jika SDK dan key tersedia
let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.anonKey) {
  supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}
