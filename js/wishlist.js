/**
 * Jelajah.id - Modul Wishlist & Perjalanan Rencana
 * Menangani penambahan wishlist berbasis data tempat, tanggal keberangkatan,
 * pop-up konfirmasi centang, serta modal detail wishlist lengkap
 */

let pendingWishlistCheckId = null;
let pendingWishlistCheckbox = null;

let currentDetailWishlistPhotos = [];
let currentDetailWishlistPhotoIdx = 0;

let previewWishlistPhotos = [];
let previewWishlistPhotoIdx = 0;

let wishlistSearchQuery = '';
let wishlistFilterCategory = '';
let wishlistFilterCity = '';

function populateWishlistCityFilter() {
  const select = document.getElementById("filter-wishlist-city");
  if (!select) return;
  const currentVal = select.value;

  const cities = Array.from(new Set(
    state.wishlist
      .filter(w => !w.completed)
      .map(w => {
        const place = (w.placeId && state.places.find(p => p.id === w.placeId)) ||
                      state.places.find(p => p.name.toLowerCase() === w.name.toLowerCase()) || {};
        return (w.city || place.city || '').trim();
      })
      .filter(c => c !== '')
  )).sort();

  select.innerHTML = '<option value="">Semua Kota</option>' +
    cities.map(c => `<option value="${escapeHtml(c)}" ${c === currentVal ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
}

function handleSearchWishlist(query) {
  wishlistSearchQuery = (query || '').toLowerCase().trim();
  renderWishlist();
}

function handleFilterWishlistCategory(cat) {
  wishlistFilterCategory = (cat || '').trim();
  renderWishlist();
}

function handleFilterWishlistCity(city) {
  wishlistFilterCity = (city || '').trim();
  renderWishlist();
}

function renderWishlist() {
  const tbody = document.getElementById("wishlist-tbody");
  if (!tbody) return;

  const allActive = state.wishlist.filter(w => !w.completed);
  const titleCount = document.getElementById("wishlist-title-count");
  if (titleCount) titleCount.innerText = allActive.length;

  const activeList = allActive.filter(item => {
    const place = (item.placeId && state.places.find(p => p.id === item.placeId)) ||
                  state.places.find(p => p.name.toLowerCase() === item.name.toLowerCase()) || {};
    const city = item.city || place.city || "";
    const isKuliner = (item.category || "").toLowerCase().includes("makan") || (item.category || "").toLowerCase().includes("kuliner");
    const categoryName = isKuliner ? "Tempat Makan" : "Tempat Wisata";

    if (wishlistFilterCategory && categoryName !== wishlistFilterCategory) {
      return false;
    }

    if (wishlistFilterCity && city.toLowerCase() !== wishlistFilterCity.toLowerCase()) {
      return false;
    }

    if (wishlistSearchQuery) {
      const matchName = (item.name || "").toLowerCase().includes(wishlistSearchQuery);
      const matchCity = city.toLowerCase().includes(wishlistSearchQuery);
      const matchLoc = (item.location || "").toLowerCase().includes(wishlistSearchQuery);
      const matchNotes = (item.notes || "").toLowerCase().includes(wishlistSearchQuery);
      if (!matchName && !matchCity && !matchLoc && !matchNotes) {
        return false;
      }
    }

    return true;
  });

  if (activeList.length === 0) {
    const isFiltering = wishlistSearchQuery || wishlistFilterCategory || wishlistFilterCity;
    const msg = isFiltering
      ? 'Tidak ada wishlist yang cocok dengan kata kunci atau filter yang dipilih.'
      : 'Belum ada wishlist aktif. Klik "Tambah Wishlist" untuk membuat rencana perjalanan.';
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${msg}</td></tr>`;
    return;
  }

  tbody.innerHTML = activeList.map(item => {
    const isKuliner = (item.category || "").toLowerCase() === "kuliner" || (item.category || "").toLowerCase() === "tempat makan";
    const catClass = isKuliner ? "tag-food" : "tag-travel";
    const catLabel = isKuliner ? "Tempat Makan" : "Tempat Wisata";
    const depDate = item.departureDate ? formatDate(item.departureDate) : "-";

    const place = (item.placeId && state.places.find(p => p.id === item.placeId)) ||
                  state.places.find(p => p.name.toLowerCase() === item.name.toLowerCase()) || {};
    const city = item.city || place.city || "-";

    const rawLoc = item.location || place.location || "";
    const mapsHref = (rawLoc && rawLoc.startsWith("http"))
      ? rawLoc
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + (city !== '-' ? city : '') + ' ' + rawLoc)}`;

    const locHtml = rawLoc
      ? '<a href="' + mapsHref + '" target="_blank" rel="noopener noreferrer" class="btn-pill btn-light" style="text-decoration:none; font-size:11.5px; padding:4px 10px; border:1px solid var(--border); display:inline-flex; align-items:center; gap:4px; color:#1E293B; font-weight:600; white-space:nowrap;" title="Buka lokasi di Google Maps">' +
          '📍 Buka Maps ↗' +
        '</a>'
      : '-';

    return '<tr>' +
      '<td>' +
        '<label class="checkbox-wrap" title="Centang untuk konfirmasi selesai">' +
          '<input type="checkbox" onchange="promptConfirmCheckWishlist(\'' + item.id + '\', this)">' +
          '<span class="custom-box">' +
            '<svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
          '</span>' +
        '</label>' +
      '</td>' +
      '<td><b>' + escapeHtml(item.name) + '</b></td>' +
      '<td><span class="tag-badge ' + catClass + '">' + escapeHtml(catLabel) + '</span></td>' +
      '<td>' + escapeHtml(city) + '</td>' +
      '<td>' + locHtml + '</td>' +
      '<td><b>' + depDate + '</b></td>' +
      '<td>' + escapeHtml(item.notes || "-") + '</td>' +
      '<td>' +
        '<div style="display:flex; gap:6px; align-items:center;">' +
          '<button class="btn-action-detail" onclick="openDetailWishlist(\'' + item.id + '\', event)">Detail</button>' +
          '<button class="btn-action-delete" onclick="deleteWishlist(\'' + item.id + '\')">Hapus</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join("");
}

function promptConfirmCheckWishlist(id, checkboxEl) {
  pendingWishlistCheckId = id;
  pendingWishlistCheckbox = checkboxEl;

  const item = state.wishlist.find(w => w.id === id);
  const name = item ? item.name : "rencana ini";

  const msgEl = document.getElementById("confirm-wishlist-message");
  if (msgEl) {
    msgEl.innerText = `Apakah anda yakin ingin menyelesaikan kunjungan ke "${name}" dan memindahkannya ke menu History?`;
  }

  openModal("modal-confirm-wishlist");
}

function confirmCheckWishlistYes() {
  if (pendingWishlistCheckId) {
    checkWishlist(pendingWishlistCheckId);
  }
  closeModal("modal-confirm-wishlist");
  pendingWishlistCheckId = null;
  pendingWishlistCheckbox = null;
}

function confirmCheckWishlistNo() {
  if (pendingWishlistCheckbox) {
    pendingWishlistCheckbox.checked = false;
  }
  closeModal("modal-confirm-wishlist");
  pendingWishlistCheckId = null;
  pendingWishlistCheckbox = null;
}

function checkWishlist(id) {
  const idx = state.wishlist.findIndex(w => w.id === id);
  if (idx !== -1) {
    const item = state.wishlist[idx];
    item.completed = true;
    const place = (item.placeId && state.places.find(p => p.id === item.placeId)) ||
                  state.places.find(p => p.name.toLowerCase() === item.name.toLowerCase()) || {};
    state.history.unshift({
      id: "h-" + Date.now(),
      placeId: item.placeId || place.id || null,
      name: item.name,
      city: item.city || place.city || "",
      location: item.location,
      category: item.category,
      departureDate: item.departureDate,
      completedAt: new Date().toISOString().split("T")[0],
      notes: item.notes,
      docs: []
    });
    state.wishlist.splice(idx, 1);
    renderAll();
  }
}

function deleteWishlist(id) {
  const item = state.wishlist.find(w => w.id === id);
  const name = item ? item.name : "wishlist ini";
  promptConfirmDelete(`Apakah anda yakin ingin menghapus "${name}" dari wishlist?`, () => {
    state.wishlist = state.wishlist.filter(w => w.id !== id);
    renderAll();
  });
}

function openAddWishlistModal() {
  const form = document.getElementById("form-add-wishlist");
  if (form) form.reset();

  const typeSelect = document.getElementById("wishlist-entry-type");
  if (typeSelect) typeSelect.value = "";

  handleWishlistTypeChange("");
  openModal("modal-add-wishlist");
}

function handleWishlistTypeChange(type) {
  const placeSelect = document.getElementById("wishlist-place-select");
  if (!placeSelect) return;

  if (!type) {
    placeSelect.innerHTML = '<option value="">-- Pilih Kategori Terlebih Dahulu --</option>';
    handleWishlistPlaceChange("");
    return;
  }

  const filteredPlaces = state.places.filter(p => p.type === type);

  if (filteredPlaces.length === 0) {
    placeSelect.innerHTML = '<option value="">-- Belum ada data tempat, tambahkan di menu terlebih dahulu --</option>';
    handleWishlistPlaceChange("");
    return;
  }

  placeSelect.innerHTML = '<option value="">-- Pilih Tempat / Destinasi --</option>' +
    filteredPlaces.map(p => {
      const cityLabel = p.city ? ` (${p.city})` : "";
      return `<option value="${p.id}">${escapeHtml(p.name + cityLabel)}</option>`;
    }).join("");

  handleWishlistPlaceChange("");
}

function handleWishlistPlaceChange(placeId) {
  const locationInput = document.getElementById("wishlist-place-location");
  const helperBox = document.getElementById("wishlist-place-helper");
  const previewBox = document.getElementById("wishlist-place-detail-preview");
  if (locationInput) locationInput.value = "";

  if (!placeId) {
    if (helperBox) helperBox.innerHTML = "";
    if (previewBox) previewBox.innerHTML = "";
    previewWishlistPhotos = [];
    previewWishlistPhotoIdx = 0;
    return;
  }

  const place = state.places.find(p => p.id === placeId);
  if (!place) {
    if (previewBox) previewBox.innerHTML = "";
    return;
  }

  if (locationInput) {
    locationInput.value = place.location || (place.city || "");
  }
  if (helperBox) {
    helperBox.innerHTML = `
      <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
        📍 Kota: <b>${escapeHtml(place.city || '-')}</b> | Detail data otomatis dimuat di bawah.
      </div>
    `;
  }

  // Render Full Place Details Preview inside Add Wishlist modal
  renderWishlistPlacePreview(place);
}

function renderWishlistPlacePreview(place) {
  const previewBox = document.getElementById("wishlist-place-detail-preview");
  if (!previewBox) return;

  const isKuliner = place.type === "kuliner";
  const badgeClass = isKuliner ? "tag-food" : "tag-travel";
  const badgeText = isKuliner ? "Tempat Makan" : "Tempat Wisata";

  const photos = (place.photos && place.photos.length > 0)
    ? place.photos
    : (place.photo ? [place.photo] : []);
  previewWishlistPhotos = photos;
  previewWishlistPhotoIdx = 0;

  const videos = (place.videos && place.videos.length > 0)
    ? place.videos
    : (place.videoUrl ? [place.videoUrl] : []);

  const mapsHref = place.location && place.location.startsWith("http")
    ? place.location
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.city || '') + ' ' + (place.location || ''))}`;

  let photoSectionHtml = '';
  if (photos.length === 0) {
    photoSectionHtml = `<span style="font-size:14px; color:var(--text-muted); font-weight:600;">-</span>`;
  } else if (photos.length === 1) {
    photoSectionHtml = `
      <div style="position:relative; width:100%; height:200px; border-radius:var(--radius-md); overflow:hidden; cursor:pointer; background:#111; margin-top:6px;" onclick="openFullscreenLightbox(previewWishlistPhotos, 0)" title="Klik untuk membuka layar penuh (galeri)">
        <img src="${photos[0]}" alt="${escapeHtml(place.name)}" style="width:100%; height:100%; object-fit:cover;">
        <span style="position:absolute; bottom:8px; right:8px; background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11px; font-weight:600; padding:3px 8px; border-radius:var(--radius-pill);">
          🔍 Layar Penuh
        </span>
      </div>
    `;
  } else {
    photoSectionHtml = `
      <div style="position:relative; width:100%; height:200px; border-radius:var(--radius-md); overflow:hidden; background:#111; margin-top:6px;">
        <img id="preview-wishlist-img" src="${photos[0]}" alt="${escapeHtml(place.name)}" onclick="openFullscreenLightbox(previewWishlistPhotos, previewWishlistPhotoIdx)" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" title="Klik untuk membuka layar penuh (galeri)">
        <button type="button" onclick="prevPreviewWishlistPhoto(event)" style="position:absolute; left:8px; top:50%; transform:translateY(-50%); width:30px; height:30px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); color:#111; font-weight:bold; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); z-index:2;">❮</button>
        <button type="button" onclick="nextPreviewWishlistPhoto(event)" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:30px; height:30px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); color:#111; font-weight:bold; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); z-index:2;">❯</button>
        <div style="position:absolute; bottom:8px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:6px; z-index:2;">
          <span id="preview-wishlist-badge" style="background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11px; font-weight:600; padding:3px 8px; border-radius:var(--radius-pill);">1 / ${photos.length}</span>
          <span style="background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11px; font-weight:600; padding:3px 8px; border-radius:var(--radius-pill); cursor:pointer;" onclick="openFullscreenLightbox(previewWishlistPhotos, previewWishlistPhotoIdx)">🔍 Layar Penuh</span>
        </div>
      </div>
    `;
  }

  previewBox.innerHTML = `
    <div style="background:#FAFBFD; border:1px solid #DFE3EB; border-radius:var(--radius-lg); padding:16px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px; flex:1 1 200px; min-width:0;">
          <span class="tag-badge ${badgeClass}" style="flex-shrink:0;">${badgeText}</span>
          <span style="font-size:13px; font-weight:600; color:var(--text-main); word-break:break-word;">📍 Kota: ${escapeHtml(place.city || '-')}</span>
        </div>
        <a href="${mapsHref}" target="_blank" class="btn-pill btn-dark" style="text-decoration:none; font-size:11.5px; padding:6px 14px; flex-shrink:0; display:inline-flex; align-items:center; gap:4px;">
          Buka Google Maps ↗
        </a>
      </div>

      <div style="margin-bottom:12px;">
        <p style="font-size:12px; color:var(--text-muted); font-weight:600; margin-bottom:4px;">FOTO TEMPAT (${photos.length}):</p>
        ${photoSectionHtml}
      </div>

      <div>
        <p style="font-size:12px; color:var(--text-muted); font-weight:600; margin-bottom:4px;">VIDEO DOKUMENTASI (${videos.length}):</p>
        ${videos.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${videos.map((vid, i) => `
              <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px; background:#fff; border:1px solid var(--border); border-radius:var(--radius-md);">
                <span style="font-size:12px; font-weight:600; color:var(--text-main);">🎬 Video ke-${i+1}</span>
                <a href="${vid}" target="_blank" class="btn-pill btn-light" style="text-decoration:none; font-size:11.5px; padding:4px 12px; border:1px solid var(--border); font-weight:600; flex-shrink:0; display:inline-flex; align-items:center; gap:4px;">
                  Tonton Video ↗
                </a>
              </div>
            `).join('')}
          </div>
        ` : `<span style="font-size:14px; color:var(--text-muted); font-weight:600;">-</span>`}
      </div>
    </div>
  `;
}

function prevPreviewWishlistPhoto(e) {
  if (e) e.stopPropagation();
  if (previewWishlistPhotos.length <= 1) return;
  previewWishlistPhotoIdx = (previewWishlistPhotoIdx - 1 + previewWishlistPhotos.length) % previewWishlistPhotos.length;
  updatePreviewWishlistPhotoDisplay();
}

function nextPreviewWishlistPhoto(e) {
  if (e) e.stopPropagation();
  if (previewWishlistPhotos.length <= 1) return;
  previewWishlistPhotoIdx = (previewWishlistPhotoIdx + 1) % previewWishlistPhotos.length;
  updatePreviewWishlistPhotoDisplay();
}

function updatePreviewWishlistPhotoDisplay() {
  const img = document.getElementById("preview-wishlist-img");
  const badge = document.getElementById("preview-wishlist-badge");
  if (img) img.src = previewWishlistPhotos[previewWishlistPhotoIdx];
  if (badge) badge.innerText = `${previewWishlistPhotoIdx + 1} / ${previewWishlistPhotos.length}`;
}

function handleSaveWishlist(e) {
  e.preventDefault();
  const type = document.getElementById("wishlist-entry-type").value;
  const placeId = document.getElementById("wishlist-place-select").value;
  const departureDate = document.getElementById("wishlist-departure").value;
  const notes = document.getElementById("wishlist-notes").value.trim();

  if (!placeId) {
    alert("Silakan pilih tempat terlebih dahulu!");
    return;
  }

  const place = state.places.find(p => p.id === placeId);
  if (!place) return;

  state.wishlist.unshift({
    id: "w-" + Date.now(),
    placeId: place.id,
    name: place.name,
    city: place.city || "",
    location: place.location || (place.city || ""),
    category: type === "kuliner" ? "Tempat Makan" : "Tempat Wisata",
    departureDate: departureDate,
    notes: notes,
    completed: false
  });

  closeModal("modal-add-wishlist");
  renderAll();
}

// FULL DETAIL WISHLIST MODAL (MENAMPILKAN DETAIL LENGKAP TEMPAT SEPERTI PADA TEMPAT MAKAN / WISATA)
function openDetailWishlist(id, event, isEditing = false) {
  if (event) event.stopPropagation();
  const item = state.wishlist.find(w => w.id === id);
  if (!item) return;

  const modalTitle = document.getElementById("detail-wishlist-name");
  if (modalTitle) modalTitle.innerText = item.name;

  // Temukan data tempat terkait
  const place = (item.placeId && state.places.find(p => p.id === item.placeId)) ||
                state.places.find(p => p.name.toLowerCase() === item.name.toLowerCase()) ||
                item;

  const isKuliner = (item.category || "").toLowerCase().includes("makan") || (item.category || "").toLowerCase().includes("kuliner") || place.type === "kuliner";
  const badgeClass = isKuliner ? "tag-food" : "tag-travel";
  const badgeText = isKuliner ? "Tempat Makan" : "Tempat Wisata";

  const photos = (place.photos && place.photos.length > 0)
    ? place.photos
    : (place.photo ? [place.photo] : []);
  currentDetailWishlistPhotos = photos;
  currentDetailWishlistPhotoIdx = 0;

  const videos = (place.videos && place.videos.length > 0)
    ? place.videos
    : (place.videoUrl ? [place.videoUrl] : []);

  const mapsHref = (place.location && place.location.startsWith("http"))
    ? place.location
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.city || '') + ' ' + (place.location || ''))}`;

  let photoSectionHtml = '';
  if (photos.length === 0) {
    photoSectionHtml = `<span style="font-size:15px; color:var(--text-muted); font-weight:600;">-</span>`;
  } else if (photos.length === 1) {
    photoSectionHtml = `
      <div style="position:relative; width:100%; height:230px; border-radius:var(--radius-md); overflow:hidden; cursor:pointer; background:#111; margin-top:8px;" onclick="openFullscreenLightbox(currentDetailWishlistPhotos, 0)" title="Klik untuk membuka layar penuh (galeri)">
        <img src="${photos[0]}" alt="${escapeHtml(item.name)}" style="width:100%; height:100%; object-fit:cover;">
        <span style="position:absolute; bottom:10px; right:10px; background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:var(--radius-pill); display:flex; align-items:center; gap:4px;">
          🔍 Layar Penuh
        </span>
      </div>
    `;
  } else {
    photoSectionHtml = `
      <div style="position:relative; width:100%; height:240px; border-radius:var(--radius-md); overflow:hidden; background:#111; margin-top:8px;">
        <img id="detail-wishlist-active-img" src="${photos[0]}" alt="${escapeHtml(item.name)}" onclick="openFullscreenLightbox(currentDetailWishlistPhotos, currentDetailWishlistPhotoIdx)" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" title="Klik untuk membuka layar penuh (galeri)">

        <button type="button" onclick="prevDetailWishlistPhoto(event)" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); width:34px; height:34px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); color:#111; font-weight:bold; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:2;" title="Foto Sebelumnya">❮</button>

        <button type="button" onclick="nextDetailWishlistPhoto(event)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); width:34px; height:34px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); color:#111; font-weight:bold; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:2;" title="Foto Berikutnya">❯</button>

        <div style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:8px; z-index:2;">
          <span id="detail-wishlist-photo-badge" style="background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:var(--radius-pill);">1 / ${photos.length}</span>
          <span style="background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:var(--radius-pill); cursor:pointer;" onclick="openFullscreenLightbox(currentDetailWishlistPhotos, currentDetailWishlistPhotoIdx)">🔍 Layar Penuh</span>
        </div>
      </div>
    `;
  }

  const body = document.getElementById("detail-wishlist-body");
  if (body) {
    const departureHtml = isEditing
      ? `
        <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:14px;">
          <label style="font-size:12px; color:var(--text-muted); font-weight:600; display:block; margin-bottom:6px;">TANGGAL BERANGKAT:</label>
          <input type="date" id="detail-wishlist-departure-input-${item.id}" class="form-control" value="${item.departureDate || ''}" style="font-size:13px; background:#fff; width:100%;" required>
        </div>
      `
      : '';

    const notesContentHtml = isEditing
      ? `
        <div style="margin-top:6px;">
          <textarea id="detail-wishlist-notes-input-${item.id}" class="form-control" rows="3" placeholder="Tulis catatan rencana..." style="font-size:13px; background:#fff; width:100%; font-family:inherit;">${escapeHtml(item.notes || '')}</textarea>
        </div>
      `
      : `<p style="font-size:13.5px; color:#3D4658; line-height:1.5; margin:0;">${escapeHtml(item.notes || 'Tidak ada catatan khusus.')}</p>`;

    const footerButtonsHtml = isEditing
      ? `
        <div style="display:flex; gap:8px; align-items:center; margin-top:20px;">
          <button type="button" class="btn-pill btn-dark" onclick="saveWishlistDirect('${item.id}')">Simpan</button>
          <button type="button" class="btn-pill btn-light" onclick="openDetailWishlist('${item.id}', null, false)">Batal</button>
        </div>
      `
      : `
        <div style="display:flex; gap:8px; align-items:center; margin-top:20px;">
          <button type="button" class="btn-pill btn-light" onclick="openDetailWishlist('${item.id}', null, true)">Edit</button>
          <button type="button" class="btn-pill btn-dark" style="background:#169E5F; color:#fff;" onclick="promptConfirmCheckWishlist('${item.id}', null); closeModal('modal-detail-wishlist');">
            Selesaikan
          </button>
        </div>
      `;

    body.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; flex-wrap:wrap;">
        <span class="tag-badge ${badgeClass}">${badgeText}</span>
        <span style="font-size:13.5px; font-weight:600; color:var(--text-main);">📍 Kota: ${escapeHtml(place.city || '-')}</span>
        <span style="font-size:13.5px; font-weight:600; color:var(--text-main); margin-left:auto;">Berangkat: <b>${item.departureDate ? formatDate(item.departureDate) : '-'}</b></span>
      </div>

      <!-- EDIT TANGGAL BERANGKAT (HANYA MUNCUL SAAT EDIT) -->
      ${departureHtml}

      <!-- LOKASI GOOGLE MAPS -->
      <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:14px;">
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:8px; font-weight:600;">LOKASI GOOGLE MAPS:</p>
        ${(item.location || place.location) ? `
          <a href="${mapsHref}" target="_blank" rel="noopener noreferrer" class="btn-pill btn-dark" style="text-decoration:none; font-size:12.5px; padding:8px 18px; display:inline-flex; align-items:center; gap:6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Buka Google Maps ↗
          </a>
        ` : `<span style="font-size:14px; color:var(--text-muted); font-weight:600;">-</span>`}
      </div>

      <!-- FOTO TEMPAT / MENU LENGKAP -->
      <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:14px;">
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:4px; font-weight:600;">FOTO TEMPAT / MENU (${photos.length}):</p>
        ${photoSectionHtml}
      </div>

      <!-- LINK VIDEO LENGKAP -->
      <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:14px;">
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:8px; font-weight:600;">VIDEO (${videos.length}):</p>
        ${videos.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
            ${videos.map((vid, i) => `
              <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 14px; background:#fff; border:1px solid var(--border); border-radius:var(--radius-md);">
                <span style="font-size:13px; font-weight:600; color:var(--text-main); display:inline-flex; align-items:center; gap:6px;">
                  🎬 Video ke-${i + 1}
                </span>
                <a href="${vid}" target="_blank" rel="noopener noreferrer" class="btn-pill btn-dark" style="text-decoration:none; font-size:12px; padding:6px 14px; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;">
                  Tonton Video ↗
                </a>
              </div>
            `).join('')}
          </div>
        ` : `<span style="font-size:14px; color:var(--text-muted); font-weight:600;">-</span>`}
      </div>

      <!-- CATATAN RENCANA -->
      <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:18px;">
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:6px; font-weight:600;">CATATAN RENCANA:</p>
        ${notesContentHtml}
      </div>

      ${footerButtonsHtml}
    `;
  }

  openModal("modal-detail-wishlist");
}

function saveWishlistDirect(id) {
  const notesInput = document.getElementById(`detail-wishlist-notes-input-${id}`);
  const depInput = document.getElementById(`detail-wishlist-departure-input-${id}`);
  const target = state.wishlist.find(w => w.id === id);
  if (!target) return;

  if (notesInput) {
    target.notes = notesInput.value.trim();
  }
  if (depInput && depInput.value) {
    target.departureDate = depInput.value;
  }

  renderAll();
  openDetailWishlist(id, null, false);
}

function prevDetailWishlistPhoto(e) {
  if (e) e.stopPropagation();
  if (currentDetailWishlistPhotos.length <= 1) return;
  currentDetailWishlistPhotoIdx = (currentDetailWishlistPhotoIdx - 1 + currentDetailWishlistPhotos.length) % currentDetailWishlistPhotos.length;
  updateDetailWishlistPhotoDisplay();
}

function nextDetailWishlistPhoto(e) {
  if (e) e.stopPropagation();
  if (currentDetailWishlistPhotos.length <= 1) return;
  currentDetailWishlistPhotoIdx = (currentDetailWishlistPhotoIdx + 1) % currentDetailWishlistPhotos.length;
  updateDetailWishlistPhotoDisplay();
}

function updateDetailWishlistPhotoDisplay() {
  const img = document.getElementById("detail-wishlist-active-img");
  const badge = document.getElementById("detail-wishlist-photo-badge");
  if (img) img.src = currentDetailWishlistPhotos[currentDetailWishlistPhotoIdx];
  if (badge) badge.innerText = `${currentDetailWishlistPhotoIdx + 1} / ${currentDetailWishlistPhotos.length}`;
}
