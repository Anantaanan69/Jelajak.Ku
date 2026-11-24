/**
 * Jelajah.id - Modul History & Dokumentasi
 * Menampilkan tabel riwayat kunjungan perjalanan yang telah selesai dengan penomoran,
 * pencarian & filter, detail lengkap kunjungan, serta dokumentasi link Google Drive
 */

let historySearchQuery = '';
let historyFilterCategory = '';
let historyFilterCity = '';

let currentDetailHistoryPhotos = [];
let currentDetailHistoryPhotoIdx = 0;

function populateHistoryCityFilter() {
  const select = document.getElementById("filter-history-city");
  if (!select) return;
  const currentVal = select.value;

  const cities = Array.from(new Set(
    state.history
      .map(item => {
        const place = (item.placeId && state.places.find(p => p.id === item.placeId)) ||
                      state.places.find(p => p.name.toLowerCase() === item.name.toLowerCase()) || {};
        return (item.city || place.city || '').trim();
      })
      .filter(c => c !== '')
  )).sort();

  select.innerHTML = '<option value="">Semua Kota</option>' +
    cities.map(c => `<option value="${escapeHtml(c)}" ${c === currentVal ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
}

function handleSearchHistory(query) {
  historySearchQuery = (query || '').toLowerCase().trim();
  renderHistory();
}

function handleFilterHistoryCategory(cat) {
  historyFilterCategory = (cat || '').trim();
  renderHistory();
}

function handleFilterHistoryCity(city) {
  historyFilterCity = (city || '').trim();
  renderHistory();
}

function renderHistory() {
  const tbody = document.getElementById("history-tbody");
  const countEl = document.getElementById("history-title-count");
  if (countEl) countEl.innerText = state.history.length;

  if (!tbody) return;

  const filteredHistory = state.history.filter(item => {
    const place = (item.placeId && state.places.find(p => p.id === item.placeId)) ||
                  state.places.find(p => p.name.toLowerCase() === item.name.toLowerCase()) || {};
    const city = item.city || place.city || "";
    const isKuliner = (item.category || "").toLowerCase().includes("makan") ||
                      (item.category || "").toLowerCase().includes("kuliner") ||
                      place.type === "kuliner";
    const categoryName = isKuliner ? "Tempat Makan" : "Tempat Wisata";

    // Category filter
    if (historyFilterCategory && categoryName !== historyFilterCategory) {
      return false;
    }

    // City filter
    if (historyFilterCity && city.toLowerCase() !== historyFilterCity.toLowerCase()) {
      return false;
    }

    // Search query
    if (historySearchQuery) {
      const matchName = (item.name || "").toLowerCase().includes(historySearchQuery);
      const matchCity = city.toLowerCase().includes(historySearchQuery);
      const matchLoc = (item.location || "").toLowerCase().includes(historySearchQuery);
      const matchNotes = (item.notes || "").toLowerCase().includes(historySearchQuery);
      if (!matchName && !matchCity && !matchLoc && !matchNotes) {
        return false;
      }
    }

    return true;
  });

  if (filteredHistory.length === 0) {
    const isFiltering = historySearchQuery || historyFilterCategory || historyFilterCity;
    const msg = isFiltering
      ? 'Tidak ada data history yang sesuai dengan filter atau kata kunci.'
      : 'Belum ada riwayat perjalanan yang diselesaikan. Centang item di wishlist untuk memindahkannya ke sini.';
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${msg}</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredHistory.map((item, idx) => {
    const place = (item.placeId && state.places.find(p => p.id === item.placeId)) ||
                  state.places.find(p => p.name.toLowerCase() === item.name.toLowerCase()) || {};

    const isKuliner = (item.category || "").toLowerCase().includes("makan") ||
                      (item.category || "").toLowerCase().includes("kuliner") ||
                      place.type === "kuliner";
    const catClass = isKuliner ? "tag-food" : "tag-travel";
    const catLabel = isKuliner ? "Tempat Makan" : "Tempat Wisata";

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

    const dateStr = item.completedAt ? formatDate(item.completedAt) : (item.departureDate ? formatDate(item.departureDate) : "-");
    const notes = item.notes || "-";

    return '<tr>' +
      '<td style="text-align:center; font-weight:700; color:var(--text-muted);">' + (idx + 1) + '</td>' +
      '<td><b>' + escapeHtml(item.name) + '</b></td>' +
      '<td><span class="tag-badge ' + catClass + '">' + escapeHtml(catLabel) + '</span></td>' +
      '<td>' + escapeHtml(city) + '</td>' +
      '<td>' + locHtml + '</td>' +
      '<td><b>' + dateStr + '</b></td>' +
      '<td>' + escapeHtml(notes) + '</td>' +
      '<td>' +
        '<button class="btn-action-detail" onclick="openDetailHistory(\'' + item.id + '\', event)">Detail</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

// FULL DETAIL HISTORY MODAL (DILENGKAPI DOKUMENTASI LINK GOOGLE DRIVE)
function openDetailHistory(id, event, isEditing = false) {
  if (event) event.stopPropagation();
  const item = state.history.find(h => h.id === id);
  if (!item) return;

  const modalTitle = document.getElementById("detail-history-name");
  if (modalTitle) modalTitle.innerText = item.name;

  const place = (item.placeId && state.places.find(p => p.id === item.placeId)) ||
                state.places.find(p => p.name.toLowerCase() === item.name.toLowerCase()) ||
                item;

  const isKuliner = (item.category || "").toLowerCase().includes("makan") ||
                    (item.category || "").toLowerCase().includes("kuliner") ||
                    place.type === "kuliner";
  const badgeClass = isKuliner ? "tag-food" : "tag-travel";
  const badgeText = isKuliner ? "Tempat Makan" : "Tempat Wisata";

  const photos = (place.photos && place.photos.length > 0)
    ? place.photos
    : (place.photo ? [place.photo] : []);
  currentDetailHistoryPhotos = photos;
  currentDetailHistoryPhotoIdx = 0;

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
      <div style="position:relative; width:100%; height:230px; border-radius:var(--radius-md); overflow:hidden; cursor:pointer; background:#111; margin-top:8px;" onclick="openFullscreenLightbox(currentDetailHistoryPhotos, 0)" title="Klik untuk membuka layar penuh (galeri)">
        <img src="${photos[0]}" alt="${escapeHtml(item.name)}" style="width:100%; height:100%; object-fit:cover;">
        <span style="position:absolute; bottom:10px; right:10px; background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:var(--radius-pill); display:flex; align-items:center; gap:4px;">
          🔍 Layar Penuh
        </span>
      </div>
    `;
  } else {
    photoSectionHtml = `
      <div style="position:relative; width:100%; height:240px; border-radius:var(--radius-md); overflow:hidden; background:#111; margin-top:8px;">
        <img id="detail-history-active-img" src="${photos[0]}" alt="${escapeHtml(item.name)}" onclick="openFullscreenLightbox(currentDetailHistoryPhotos, currentDetailHistoryPhotoIdx)" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" title="Klik untuk membuka layar penuh (galeri)">

        <button type="button" onclick="prevDetailHistoryPhoto(event)" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); width:34px; height:34px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); color:#111; font-weight:bold; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:2;" title="Foto Sebelumnya">❮</button>

        <button type="button" onclick="nextDetailHistoryPhoto(event)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); width:34px; height:34px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); color:#111; font-weight:bold; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:2;" title="Foto Berikutnya">❯</button>

        <div style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:8px; z-index:2;">
          <span id="detail-history-photo-badge" style="background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:var(--radius-pill);">1 / ${photos.length}</span>
          <span style="background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:var(--radius-pill); cursor:pointer;" onclick="openFullscreenLightbox(currentDetailHistoryPhotos, currentDetailHistoryPhotoIdx)">🔍 Layar Penuh</span>
        </div>
      </div>
    `;
  }

  const body = document.getElementById("detail-history-body");
  if (body) {
    const docSectionHtml = isEditing
      ? `
        <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:18px;">
          <div style="margin-bottom:8px;">
            <label style="font-size:12px; color:var(--text-muted); font-weight:700; margin:0;">
              📁 LINK DOKUMENTASI (GOOGLE DRIVE):
            </label>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="detail-history-gdrive-input-${item.id}" class="form-control" placeholder="Masukkan link Google Drive (https://drive.google.com/...)" value="${escapeHtml(item.gdriveUrl || '')}" style="font-size:13px; background:#fff; width:100%;">
          </div>
        </div>
      `
      : `
        <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:18px;">
          <div style="margin-bottom:8px;">
            <label style="font-size:12px; color:var(--text-muted); font-weight:700; margin:0;">
              📁 LINK DOKUMENTASI (GOOGLE DRIVE):
            </label>
          </div>
          ${item.gdriveUrl ? `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 14px; background:#fff; border:1px solid var(--border); border-radius:var(--radius-md);">
              <span style="font-size:12.5px; color:#1E293B; word-break:break-all; flex:1; min-width:0;">${escapeHtml(item.gdriveUrl)}</span>
              <a href="${escapeHtml(item.gdriveUrl)}" target="_blank" rel="noopener noreferrer" class="btn-pill btn-dark" style="text-decoration:none; font-size:12px; padding:6px 14px; flex-shrink:0; white-space:nowrap;">
                Buka Google Drive ↗
              </a>
            </div>
          ` : `<span style="font-size:14px; color:var(--text-muted); font-weight:600;">-</span>`}
        </div>
      `;

    const footerButtonsHtml = isEditing
      ? `
        <div style="display:flex; gap:8px; align-items:center; margin-top:20px;">
          <button type="button" class="btn-pill btn-dark" onclick="saveHistoryGdriveDirect('${item.id}')">Simpan</button>
          <button type="button" class="btn-pill btn-light" onclick="openDetailHistory('${item.id}', null, false)">Batal</button>
        </div>
      `
      : `
        <div style="display:flex; gap:8px; align-items:center; margin-top:20px;">
          <button type="button" class="btn-pill btn-light" onclick="openDetailHistory('${item.id}', null, true)">Edit</button>
        </div>
      `;

    body.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; flex-wrap:wrap;">
        <span class="tag-badge ${badgeClass}">${badgeText}</span>
        <span style="font-size:13.5px; font-weight:600; color:var(--text-main);">📍 Kota: ${escapeHtml(place.city || item.city || '-')}</span>
        <span style="font-size:13.5px; font-weight:600; color:var(--text-main); margin-left:auto;">Selesai: <b>${item.completedAt ? formatDate(item.completedAt) : (item.departureDate ? formatDate(item.departureDate) : '-')}</b></span>
      </div>

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

      <!-- CATATAN PERJALANAN -->
      <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:14px;">
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:6px; font-weight:600;">CATATAN KUNJUNGAN:</p>
        <p style="font-size:13.5px; color:#3D4658; line-height:1.5;">${escapeHtml(item.notes || 'Tidak ada catatan.')}</p>
      </div>

      <!-- DOKUMENTASI LINK GOOGLE DRIVE -->
      ${docSectionHtml}

      ${footerButtonsHtml}
    `;
  }

  openModal("modal-detail-history");
}

function prevDetailHistoryPhoto(e) {
  if (e) e.stopPropagation();
  if (currentDetailHistoryPhotos.length <= 1) return;
  currentDetailHistoryPhotoIdx = (currentDetailHistoryPhotoIdx - 1 + currentDetailHistoryPhotos.length) % currentDetailHistoryPhotos.length;
  updateDetailHistoryPhotoDisplay();
}

function nextDetailHistoryPhoto(e) {
  if (e) e.stopPropagation();
  if (currentDetailHistoryPhotos.length <= 1) return;
  currentDetailHistoryPhotoIdx = (currentDetailHistoryPhotoIdx + 1) % currentDetailHistoryPhotos.length;
  updateDetailHistoryPhotoDisplay();
}

function updateDetailHistoryPhotoDisplay() {
  const img = document.getElementById("detail-history-active-img");
  const badge = document.getElementById("detail-history-photo-badge");
  if (img) img.src = currentDetailHistoryPhotos[currentDetailHistoryPhotoIdx];
  if (badge) badge.innerText = `${currentDetailHistoryPhotoIdx + 1} / ${currentDetailHistoryPhotos.length}`;
}

// MODAL & HANDLERS DOKUMENTASI GOOGLE DRIVE
function openGdriveModal(itemId, itemName) {
  document.getElementById("gdrive-item-id").value = itemId;
  const subtitle = document.getElementById("gdrive-item-subtitle");
  if (subtitle) {
    subtitle.innerText = itemName ? `Dokumentasi untuk kunjungan: ${itemName}` : "Tambahkan tautan Google Drive berisi foto/video.";
  }
  const form = document.getElementById("form-gdrive");
  if (form) form.reset();

  openModal("modal-gdrive");
}

function handleSaveGdrive(e) {
  e.preventDefault();
  const itemId = document.getElementById("gdrive-item-id").value;
  const url = document.getElementById("gdrive-url-input").value.trim();
  const caption = document.getElementById("gdrive-caption-input").value.trim();

  if (!url) {
    alert("Silakan masukkan tautan Google Drive!");
    return;
  }

  const target = state.history.find(h => h.id === itemId);
  if (target) {
    if (!target.gdriveLinks) {
      target.gdriveLinks = [];
    }
    target.gdriveLinks.push({
      url: url,
      caption: caption || "Dokumentasi Google Drive"
    });
    target.gdriveUrl = url;

    renderAll();
    // Refresh isi modal detail history jika sedang aktif
    const detailModal = document.getElementById("modal-detail-history");
    if (detailModal && detailModal.classList.contains("active")) {
      openDetailHistory(itemId);
    }
  }

  closeModal("modal-gdrive");
}

function saveHistoryGdriveDirect(id) {
  const input = document.getElementById(`detail-history-gdrive-input-${id}`);
  if (!input) return;
  const url = input.value.trim();
  const target = state.history.find(h => h.id === id);
  if (target) {
    target.gdriveUrl = url;
    if (url) {
      target.gdriveLinks = [{ url: url, caption: "Dokumentasi Google Drive" }];
    } else {
      target.gdriveLinks = [];
    }
    renderAll();
    openDetailHistory(id);
  }
}

function deleteGdriveLink(itemId, linkIdx) {
  promptConfirmDelete("Apakah anda yakin ingin menghapus tautan dokumentasi ini?", () => {
    const target = state.history.find(h => h.id === itemId);
    if (target && target.gdriveLinks) {
      target.gdriveLinks.splice(linkIdx, 1);
      target.gdriveUrl = target.gdriveLinks.length > 0 ? target.gdriveLinks[0].url : "";
      renderAll();
      openDetailHistory(itemId);
    }
  });
}
