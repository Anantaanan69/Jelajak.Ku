/**
 * Jelajah Ku - App Orchestrator & Global Events
 * Mengatur autentikasi login/logout, sidebar responsive toggle, navigasi tab, dan data counter dashboard
 */

// STATE AUTENTIKASI LOGIN
let isAuthenticated = false;

function checkAuth() {
  let stored = null;
  try {
    stored = sessionStorage.getItem("jelajah_auth");
  } catch (err) {}

  if (stored === "true" || isAuthenticated) {
    isAuthenticated = true;
    showAppScreen();
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  const loginView = document.getElementById("view-login");
  if (loginView) loginView.style.display = "flex";
  document.body.classList.add("not-authenticated");
  const uInput = document.getElementById("login-username");
  const pInput = document.getElementById("login-password");
  if (uInput) {
    uInput.value = "";
    setTimeout(() => {
      uInput.value = "";
      uInput.focus();
    }, 100);
  }
  if (pInput) {
    pInput.value = "";
    setTimeout(() => { pInput.value = ""; }, 100);
  }
}

function showAppScreen() {
  const loginView = document.getElementById("view-login");
  if (loginView) loginView.style.display = "none";
  document.body.classList.remove("not-authenticated");
  renderAll();
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const uInput = document.getElementById("login-username");
  const pInput = document.getElementById("login-password");
  const errEl = document.getElementById("login-error-msg");
  const errTxt = document.getElementById("login-error-text");

  const u = uInput ? uInput.value.trim() : "";
  const p = pInput ? pInput.value : "";

  // Validasi Username: username, Password: password
  if (u === "username" && p === "password") {
    isAuthenticated = true;
    try {
      sessionStorage.setItem("jelajah_auth", "true");
    } catch (err) {}
    if (errEl) errEl.style.display = "none";
    showAppScreen();
  } else {
    if (errEl) {
      errEl.style.display = "flex";
      if (errTxt) errTxt.innerText = "Username atau password salah! (Gunakan: username / password)";
    }
  }
}

function handleLogout() {
  openModal("modal-confirm-logout");
}

function executeLogout() {
  closeModal("modal-confirm-logout");
  isAuthenticated = false;
  try {
    sessionStorage.removeItem("jelajah_auth");
  } catch (err) {}
  const uInput = document.getElementById("login-username");
  const pInput = document.getElementById("login-password");
  const errEl = document.getElementById("login-error-msg");
  if (uInput) uInput.value = "";
  if (pInput) pInput.value = "";
  if (errEl) errEl.style.display = "none";
  closeSidebar();
  showLoginScreen();
}

function togglePasswordVisibility() {
  const pInput = document.getElementById("login-password");
  const eyeOpen = document.getElementById("eye-icon-open");
  const eyeClosed = document.getElementById("eye-icon-closed");
  const btn = document.getElementById("btn-toggle-password");
  if (!pInput) return;

  if (pInput.type === "password") {
    pInput.type = "text";
    if (eyeOpen) eyeOpen.style.display = "none";
    if (eyeClosed) eyeClosed.style.display = "block";
    if (btn) btn.title = "Sembunyikan password";
  } else {
    pInput.type = "password";
    if (eyeOpen) eyeOpen.style.display = "block";
    if (eyeClosed) eyeClosed.style.display = "none";
    if (btn) btn.title = "Tampilkan password";
  }
}

// SIDEBAR TOGGLE & MINIMIZE DESKTOP
function toggleSidebar() {
  document.body.classList.toggle("sidebar-minimized");
}

function closeSidebar() {
  document.body.classList.add("sidebar-minimized");
}

function openSidebar() {
  document.body.classList.remove("sidebar-minimized");
}

// MOBILE STICKY MENU TOGGLE (HIDE / UNHIDE HANYA ICON)
function toggleMobileMenu() {
  const topNav = document.getElementById("mobile-sticky-topbar");
  if (!topNav) return;
  topNav.classList.toggle("is-collapsed");
}

function selectMobileTab(tabId) {
  switchTab(tabId);
  const topNav = document.getElementById("mobile-sticky-topbar");
  if (topNav) {
    topNav.classList.add("is-collapsed");
  }
}

// TAB NAVIGATION
function switchTab(tabId) {
  // Update desktop sidebar navigation button via data-tab (akurat baik saat sidebar expanded maupun minimized/hide)
  document.querySelectorAll(".nav-btn").forEach(btn => {
    const btnTab = btn.getAttribute("data-tab");
    if (btnTab === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update mobile vertical menu item
  document.querySelectorAll(".mobile-menu-item").forEach(btn => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document.querySelectorAll(".section-view").forEach(v => v.classList.remove("active"));
  const targetView = document.getElementById("view-" + tabId);
  if (targetView) targetView.classList.add("active");

  renderAll();
}

function renderCounts() {
  const kulinerCount = state.places.filter(p => p.type === "kuliner").length;
  const wisataCount = state.places.filter(p => p.type === "wisata").length;
  const wishlistCount = state.wishlist.filter(w => !w.completed).length;
  const historyCount = state.history.length;

  // Title count di tab Tempat Makan, Tempat Wisata, & Wishlist
  const countKulinerTitle = document.getElementById("kuliner-title-count");
  if (countKulinerTitle) countKulinerTitle.innerText = kulinerCount;

  const countWisataTitle = document.getElementById("wisata-title-count");
  if (countWisataTitle) countWisataTitle.innerText = wisataCount;

  const countWishlistTitle = document.getElementById("wishlist-title-count");
  if (countWishlistTitle) countWishlistTitle.innerText = wishlistCount;

  const countHistoryTitle = document.getElementById("history-title-count");
  if (countHistoryTitle) countHistoryTitle.innerText = historyCount;

  // Card bagian atas di Dashboard
  const elKuliner = document.getElementById("stat-count-kuliner");
  const elWisata = document.getElementById("stat-count-wisata");
  const elWishlist = document.getElementById("stat-count-wishlist");
  const elHistory = document.getElementById("stat-count-history");

  if (elKuliner) elKuliner.innerText = kulinerCount;
  if (elWisata) elWisata.innerText = wisataCount;
  if (elWishlist) elWishlist.innerText = wishlistCount;
  if (elHistory) elHistory.innerText = historyCount;
}

function renderAll() {
  if (typeof populateCityFilter === "function") populateCityFilter();
  if (typeof populateCityFilterWisata === "function") populateCityFilterWisata();
  if (typeof populateWishlistCityFilter === "function") populateWishlistCityFilter();
  if (typeof populateHistoryCityFilter === "function") populateHistoryCityFilter();
  renderCounts();
  if (typeof renderKuliner === "function") renderKuliner();
  if (typeof renderWisata === "function") renderWisata();
  if (typeof renderWishlist === "function") renderWishlist();
  if (typeof renderHistory === "function") renderHistory();
  if (typeof renderCalendar === "function") renderCalendar();
}

// Initial boot
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initCalendarFilters === "function") initCalendarFilters();
  checkAuth();
  if (typeof loadDataFromSupabase === "function") {
    loadDataFromSupabase();
  }
});
if (document.readyState === "complete" || document.readyState === "interactive") {
  if (typeof initCalendarFilters === "function") initCalendarFilters();
  checkAuth();
  if (typeof loadDataFromSupabase === "function") {
    loadDataFromSupabase();
  }
}
