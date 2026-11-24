/**
 * Jelajah.id - Modul Tempat Wisata
 * Menangani state, pencarian, filter kota, multi-video, upload foto, carousel, dan CRUD tempat wisata
 */
    // TEMPAT WISATA MODULE
    let wisataSearchQuery = '';
    let wisataFilterCity = '';
    let tempWisataPhotos = [];
    let wisataSlideInterval = null;
    let currentDetailWisataPhotos = [];
    let currentDetailWisataPhotoIdx = 0;

    function populateCityFilterWisata() {
      const select = document.getElementById('filter-wisata-city');
      if (!select) return;
      const currentVal = select.value;
      const cities = Array.from(new Set(
        state.places
          .filter(p => p.type === 'wisata' && p.city && p.city.trim() !== '')
          .map(p => p.city.trim())
      )).sort();

      select.innerHTML = '<option value="">Semua Kota</option>' +
        cities.map(c => `<option value="${escapeHtml(c)}" ${c === currentVal ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
    }

    function handleSearchWisata(query) {
      wisataSearchQuery = (query || '').toLowerCase().trim();
      renderWisata();
    }

    function handleFilterCityWisata(city) {
      wisataFilterCity = (city || '').trim();
      renderWisata();
    }

    function addWisataVideoInput(val = '') {
      const container = document.getElementById('wisata-video-inputs-container');
      if (!container) return;
      const count = container.children.length + 1;
      const row = document.createElement('div');
      row.className = 'wisata-video-row';
      row.style = 'display:flex; gap:8px; align-items:center;';
      row.innerHTML = `
        <input type="url" class="form-control wisata-video-url-input" placeholder="Contoh: https://youtube.com/... (link video review/drone #${count})" value="${escapeHtml(val)}">
        <button type="button" class="btn-pill btn-light" style="padding:10px 12px; border:1px solid var(--border); color:#8E95A5;" onclick="removeWisataVideoInput(this)" title="Hapus link video">✕</button>
      `;
      container.appendChild(row);
    }

    function removeWisataVideoInput(btn) {
      const container = document.getElementById('wisata-video-inputs-container');
      if (!container) return;
      const row = btn.closest('.wisata-video-row');
      if (row) row.remove();
      if (container.children.length === 0) {
        addWisataVideoInput();
      }
    }

    function openAddWisataModal() {
      document.getElementById('form-add-wisata').reset();
      document.getElementById('wisata-edit-id').value = '';
      document.getElementById('modal-wisata-title').innerText = 'Tambah Tempat Wisata';
      document.getElementById('btn-submit-wisata').innerText = 'Simpan Tempat Wisata';
      document.getElementById('wisata-file-label').innerText = '📷 Klik untuk upload 1 atau lebih foto wisata (PNG, JPG)';
      tempWisataPhotos = [];
      renderWisataPreviewGallery();

      const videoContainer = document.getElementById('wisata-video-inputs-container');
      if (videoContainer) {
        videoContainer.innerHTML = '';
        addWisataVideoInput();
      }

      document.getElementById('modal-add-wisata').classList.add('active');
    }

    function openEditWisata(id) {
      const item = state.places.find(p => p.id === id);
      if (!item) return;

      closeModal('modal-detail-wisata');
      document.getElementById('form-add-wisata').reset();
      document.getElementById('wisata-edit-id').value = item.id;
      document.getElementById('modal-wisata-title').innerText = 'Edit Tempat Wisata';
      document.getElementById('btn-submit-wisata').innerText = 'Perbarui Tempat Wisata';

      document.getElementById('wisata-name').value = item.name || '';
      document.getElementById('wisata-city').value = item.city || '';
      document.getElementById('wisata-location').value = item.location || '';

      const videoContainer = document.getElementById('wisata-video-inputs-container');
      if (videoContainer) {
        videoContainer.innerHTML = '';
        const vids = (item.videos && item.videos.length > 0) ? item.videos : (item.videoUrl ? [item.videoUrl] : []);
        if (vids.length > 0) {
          vids.forEach(v => addWisataVideoInput(v));
        } else {
          addWisataVideoInput();
        }
      }

      const photos = item.photos && item.photos.length > 0 ? item.photos : (item.photo ? [item.photo] : []);
      tempWisataPhotos = [...photos];
      renderWisataPreviewGallery();
      document.getElementById('wisata-file-label').innerText = tempWisataPhotos.length > 0
        ? `${tempWisataPhotos.length} foto tersedia (klik untuk tambah)`
        : '📷 Klik untuk upload 1 atau lebih foto wisata (PNG, JPG)';

      document.getElementById('modal-add-wisata').classList.add('active');
    }

    function handleWisataPhotosPreview(input) {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      let loaded = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
          tempWisataPhotos.push(e.target.result);
          loaded++;
          if (loaded === files.length) {
            renderWisataPreviewGallery();
            document.getElementById('wisata-file-label').innerText = `${tempWisataPhotos.length} foto dipilih (klik untuk tambah)`;
          }
        };
        reader.readAsDataURL(file);
      });
      input.value = '';
    }

    function removeWisataPhoto(index) {
      tempWisataPhotos.splice(index, 1);
      renderWisataPreviewGallery();
      document.getElementById('wisata-file-label').innerText = tempWisataPhotos.length > 0
        ? `${tempWisataPhotos.length} foto dipilih (klik untuk tambah)`
        : '📷 Klik untuk upload 1 atau lebih foto wisata (PNG, JPG)';
    }

    function renderWisataPreviewGallery() {
      const gallery = document.getElementById('wisata-preview-gallery');
      if (!gallery) return;
      if (tempWisataPhotos.length === 0) {
        gallery.innerHTML = '';
        return;
      }
      gallery.innerHTML = tempWisataPhotos.map((src, i) => `
        <div style="position:relative; width:70px; height:70px; border-radius:6px; overflow:hidden; border:1px solid #D2D8E5;">
          <img src="${src}" style="width:100%; height:100%; object-fit:cover;">
          <button type="button" onclick="removeWisataPhoto(${i})" title="Hapus foto" style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.65); color:#fff; border:none; width:18px; height:18px; border-radius:50%; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center; line-height:1;">✕</button>
        </div>
      `).join('');
    }

    function handleSaveWisata(e) {
      e.preventDefault();
      const editId = document.getElementById('wisata-edit-id').value;
      const name = document.getElementById('wisata-name').value.trim();
      const city = document.getElementById('wisata-city').value.trim();
      const location = document.getElementById('wisata-location').value.trim();

      const videoInputs = Array.from(document.querySelectorAll('.wisata-video-url-input'));
      const videos = videoInputs.map(input => input.value.trim()).filter(v => v !== '');
      const videoUrl = videos[0] || '';

      const photos = [...tempWisataPhotos];
      const photo = photos[0] || '';

      if (editId) {
        const item = state.places.find(p => p.id === editId);
        if (item) {
          item.name = name;
          item.city = city;
          item.location = location;
          item.videos = videos;
          item.videoUrl = videoUrl;
          item.photos = photos;
          item.photo = photo;
        }
      } else {
        state.places.unshift({
          id: 'p-' + Date.now(),
          type: 'wisata',
          name,
          city,
          location,
          videos,
          videoUrl,
          photos,
          photo
        });
      }

      closeModal('modal-add-wisata');
      renderAll();
    }

    function nextDetailWisataPhoto(e) {
      if (e) e.stopPropagation();
      if (currentDetailWisataPhotos.length <= 1) return;
      currentDetailWisataPhotoIdx = (currentDetailWisataPhotoIdx + 1) % currentDetailWisataPhotos.length;
      updateDetailWisataPhotoDisplay();
    }

    function prevDetailWisataPhoto(e) {
      if (e) e.stopPropagation();
      if (currentDetailWisataPhotos.length <= 1) return;
      currentDetailWisataPhotoIdx = (currentDetailWisataPhotoIdx - 1 + currentDetailWisataPhotos.length) % currentDetailWisataPhotos.length;
      updateDetailWisataPhotoDisplay();
    }

    function updateDetailWisataPhotoDisplay() {
      const img = document.getElementById('detail-wisata-active-img');
      const badge = document.getElementById('detail-wisata-photo-badge');
      if (img) img.src = currentDetailWisataPhotos[currentDetailWisataPhotoIdx];
      if (badge) badge.innerText = `${currentDetailWisataPhotoIdx + 1} / ${currentDetailWisataPhotos.length}`;
    }

    function openDetailWisata(id) {
      const item = state.places.find(p => p.id === id);
      if (!item) return;

      document.getElementById('detail-wisata-name').innerText = item.name;
      const body = document.getElementById('detail-wisata-body');

      const mapsHref = item.location && item.location.startsWith('http')
        ? item.location
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + (item.city || '') + ' ' + (item.location || ''))}`;

      const photos = item.photos && item.photos.length > 0 ? item.photos : (item.photo ? [item.photo] : []);
      currentDetailWisataPhotos = photos;
      currentDetailWisataPhotoIdx = 0;

      const videos = (item.videos && item.videos.length > 0)
        ? item.videos
        : (item.videoUrl ? [item.videoUrl] : []);

      let photoSectionHtml = '';
      if (photos.length === 0) {
        photoSectionHtml = `<span style="font-size:15px; color:var(--text-muted); font-weight:600;">-</span>`;
      } else if (photos.length === 1) {
        photoSectionHtml = `
          <div style="position:relative; width:100%; height:230px; border-radius:var(--radius-md); overflow:hidden; cursor:pointer; background:#111; margin-top:8px;" onclick="openFullscreenLightbox(currentDetailWisataPhotos, 0)" title="Klik untuk membuka layar penuh (galeri)">
            <img src="${photos[0]}" alt="${escapeHtml(item.name)}" style="width:100%; height:100%; object-fit:cover;">
            <span style="position:absolute; bottom:10px; right:10px; background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:var(--radius-pill); display:flex; align-items:center; gap:4px;">
              🔍 Layar Penuh
            </span>
          </div>
        `;
      } else {
        photoSectionHtml = `
          <div style="position:relative; width:100%; height:240px; border-radius:var(--radius-md); overflow:hidden; background:#111; margin-top:8px;">
            <img id="detail-wisata-active-img" src="${photos[0]}" alt="${escapeHtml(item.name)}" onclick="openFullscreenLightbox(currentDetailWisataPhotos, currentDetailWisataPhotoIdx)" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" title="Klik untuk membuka layar penuh (galeri)">

            <button type="button" onclick="prevDetailWisataPhoto(event)" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); width:34px; height:34px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); color:#111; font-weight:bold; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:2;" title="Foto Sebelumnya">❮</button>

            <button type="button" onclick="nextDetailWisataPhoto(event)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); width:34px; height:34px; border-radius:50%; border:none; background:rgba(255,255,255,0.9); color:#111; font-weight:bold; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.3); z-index:2;" title="Foto Berikutnya">❯</button>

            <div style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:8px; z-index:2;">
              <span id="detail-wisata-photo-badge" style="background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:var(--radius-pill);">1 / ${photos.length}</span>
              <span style="background:rgba(17,20,34,0.75); backdrop-filter:blur(4px); color:#fff; font-size:11.5px; font-weight:600; padding:4px 10px; border-radius:var(--radius-pill); cursor:pointer;" onclick="openFullscreenLightbox(currentDetailWisataPhotos, currentDetailWisataPhotoIdx)">🔍 Layar Penuh</span>
            </div>
          </div>
        `;
      }

      body.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
          <span class="tag-badge tag-travel">Tempat Wisata</span>
          <span style="font-size:13.5px; font-weight:600; color:var(--text-main);">📍 Kota: ${escapeHtml(item.city || '-')}</span>
        </div>

        <!-- LOKASI GOOGLE MAPS -->
        <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:14px;">
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:8px; font-weight:600;">LOKASI GOOGLE MAPS:</p>
          ${item.location ? `
            <a href="${mapsHref}" target="_blank" rel="noopener noreferrer" class="btn-pill btn-dark" style="text-decoration:none; font-size:12.5px; padding:8px 18px; display:inline-flex; align-items:center; gap:6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Buka Google Maps ↗
            </a>
          ` : `<span style="font-size:14px; color:var(--text-muted); font-weight:600;">-</span>`}
        </div>

        <!-- FOTO TEMPAT WISATA -->
        <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:14px;">
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:4px; font-weight:600;">FOTO TEMPAT WISATA (${photos.length}):</p>
          ${photoSectionHtml}
        </div>

        <!-- LINK VIDEO -->
        <div style="background:#FAFBFD; border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; margin-bottom:18px;">
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

        <div style="display:flex; align-items:center; margin-top:16px; gap:8px;">
          <button type="button" class="btn-pill btn-light" style="color:#D63333; font-size:12px;" onclick="deleteWisataPlace('${item.id}')">Hapus</button>
          <button type="button" class="btn-pill btn-light" style="font-size:12px; border:1px solid var(--border);" onclick="openEditWisata('${item.id}')">Edit</button>
        </div>
      `;

      document.getElementById('modal-detail-wisata').classList.add('active');
    }

    function deleteWisataPlace(id) {
      const place = state.places.find(p => p.id === id);
      const name = place ? place.name : 'tempat wisata ini';
      promptConfirmDelete(`Apakah anda yakin ingin menghapus "${name}"?`, () => {
        state.places = state.places.filter(p => p.id !== id);
        closeModal('modal-detail-wisata');
        renderAll();
      });
    }

    function renderWisata() {
      const grid = document.getElementById('grid-wisata');
      let items = state.places.filter(p => p.type === 'wisata');

      // Filter Kota
      if (wisataFilterCity) {
        items = items.filter(p => (p.city || '').toLowerCase() === wisataFilterCity.toLowerCase());
      }

      // Filter Search
      if (wisataSearchQuery) {
        items = items.filter(p =>
          (p.name || '').toLowerCase().includes(wisataSearchQuery) ||
          (p.city || '').toLowerCase().includes(wisataSearchQuery) ||
          (p.location || '').toLowerCase().includes(wisataSearchQuery)
        );
      }

      if (items.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">${wisataSearchQuery || wisataFilterCity ? 'Tidak ada tempat wisata yang sesuai filter.' : 'Belum ada catatan tempat wisata. Klik "Tambah Tempat Wisata" untuk mencatat.'}</div>`;
        if (wisataSlideInterval) clearInterval(wisataSlideInterval);
        return;
      }

      grid.innerHTML = items.map(p => {
        const photos = p.photos && p.photos.length > 0 ? p.photos : (p.photo ? [p.photo] : []);
        let thumbContent = '<span>🏖️ Tanpa Foto</span>';
        if (photos.length === 1) {
          thumbContent = `<img src="${photos[0]}" alt="${escapeHtml(p.name)}">`;
        } else if (photos.length > 1) {
          thumbContent = `
            <div class="card-slideshow-wisata" data-place-id="${p.id}" data-index="0" style="position:relative; width:100%; height:100%;">
              <img class="slide-img" src="${photos[0]}" alt="${escapeHtml(p.name)}" style="width:100%; height:100%; object-fit:cover; transition:opacity 0.4s ease;">
              <span class="photo-slide-badge">1/${photos.length}</span>
            </div>
          `;
        }

        return `
          <div class="place-item place-clickable" onclick="openDetailWisata('${p.id}')" title="Klik untuk melihat detail lengkap">
            <div class="place-thumb">
              ${thumbContent}
              <span class="place-category-badge" style="display:flex; align-items:center; gap:4px;">
                🔍 Lihat Detail
              </span>
            </div>
            <div class="place-body">
              <h4 style="font-size:16px;">${escapeHtml(p.name)}</h4>
              <div class="place-location" style="margin-top:4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D74EC" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <b>${escapeHtml(p.city || '-')}</b>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Jalankan interval 5 detik untuk berganti foto otomatis pada card yang memiliki > 1 foto
      if (wisataSlideInterval) clearInterval(wisataSlideInterval);
      wisataSlideInterval = setInterval(() => {
        const grid = document.getElementById('grid-wisata');
        if (!grid) return;
        grid.querySelectorAll('.card-slideshow-wisata').forEach(el => {
          try {
            const placeId = el.getAttribute('data-place-id');
            const place = state.places.find(p => p.id === placeId);
            if (!place) return;
            const photos = place.photos && place.photos.length > 0 ? place.photos : (place.photo ? [place.photo] : []);
            if (photos.length <= 1) return;
            let idx = parseInt(el.getAttribute('data-index') || '0', 10);
            idx = (idx + 1) % photos.length;
            el.setAttribute('data-index', idx);
            const img = el.querySelector('.slide-img');
            const badge = el.querySelector('.photo-slide-badge');
            if (img) img.src = photos[idx];
            if (badge) badge.innerText = `${idx + 1}/${photos.length}`;
          } catch (e) {}
        });
      }, 5000);
    }
