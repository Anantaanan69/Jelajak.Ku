/**
 * Jelajah.id - Utility Functions
 */

function escapeHtml(text) {
  if (!text) return "";
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
  }
  return dateStr;
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove("active");
}

function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add("active");
}

// GLOBAL DELETE CONFIRMATION MODAL HELPER
let pendingDeleteAction = null;

function promptConfirmDelete(message, onConfirm) {
  pendingDeleteAction = onConfirm;
  const msgEl = document.getElementById("confirm-delete-message");
  if (msgEl) {
    msgEl.innerText = message || "Data yang dihapus tidak dapat dikembalikan.";
  }
  openModal("modal-confirm-delete");
}

function executeConfirmDelete() {
  if (typeof pendingDeleteAction === "function") {
    pendingDeleteAction();
  }
  closeModal("modal-confirm-delete");
  pendingDeleteAction = null;
}

function closeConfirmDelete() {
  closeModal("modal-confirm-delete");
  pendingDeleteAction = null;
}
