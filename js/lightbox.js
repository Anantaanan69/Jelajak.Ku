/**
 * Jelajah.id - Reusable Fullscreen Lightbox Gallery Module
 */
let lightboxPhotos = [];
let lightboxCurrentIdx = 0;

function openFullscreenLightbox(photos, startIndex = 0) {
  if (!photos || photos.length === 0) return;
  lightboxPhotos = photos;
  lightboxCurrentIdx = startIndex;
  updateLightboxDisplay();
  const modal = document.getElementById("modal-lightbox");
  if (modal) modal.classList.add("active");
}

function closeFullscreenLightbox(e) {
  if (e && e.target && e.target.closest(".lightbox-content img")) return;
  const modal = document.getElementById("modal-lightbox");
  if (modal) modal.classList.remove("active");
}

function lightboxNext(e) {
  if (e) e.stopPropagation();
  if (lightboxPhotos.length <= 1) return;
  lightboxCurrentIdx = (lightboxCurrentIdx + 1) % lightboxPhotos.length;
  updateLightboxDisplay();
}

function lightboxPrev(e) {
  if (e) e.stopPropagation();
  if (lightboxPhotos.length <= 1) return;
  lightboxCurrentIdx = (lightboxCurrentIdx - 1 + lightboxPhotos.length) % lightboxPhotos.length;
  updateLightboxDisplay();
}

function updateLightboxDisplay() {
  const img = document.getElementById("lightbox-img");
  const counter = document.getElementById("lightbox-counter");
  const prevBtn = document.getElementById("lightbox-btn-prev");
  const nextBtn = document.getElementById("lightbox-btn-next");

  if (img) img.src = lightboxPhotos[lightboxCurrentIdx];
  if (counter) counter.innerText = `${lightboxCurrentIdx + 1} / ${lightboxPhotos.length}`;

  if (lightboxPhotos.length <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (counter) counter.style.display = "none";
  } else {
    if (prevBtn) prevBtn.style.display = "flex";
    if (nextBtn) nextBtn.style.display = "flex";
    if (counter) counter.style.display = "block";
  }
}

window.addEventListener("keydown", (e) => {
  const lb = document.getElementById("modal-lightbox");
  if (lb && lb.classList.contains("active")) {
    if (e.key === "Escape") closeFullscreenLightbox();
    if (e.key === "ArrowRight") lightboxNext();
    if (e.key === "ArrowLeft") lightboxPrev();
  }
});
