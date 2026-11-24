/**
 * Jelajah.id - Calendar Module (Kalender Nasional Indonesia)
 * Tampilan kalender bulanan nasional (dimulai hari Minggu, tanggal merah hari libur nasional resmi & hari Minggu)
 * Terintegrasi otomatis dengan event rencana perjalanan Wishlist
 */

let calendarSelectedMonth = 10; // 0 = Jan, 10 = Nov
let calendarSelectedYear = 2026;

const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Data Hari Libur Nasional Resmi Indonesia (2024 - 2027)
const HARI_LIBUR_NASIONAL = {
  // 2024
  "2024-01-01": "Tahun Baru 2024 Masehi",
  "2024-02-08": "Isra Mi'raj Nabi Muhammad SAW",
  "2024-02-10": "Tahun Baru Imlek 2575 Kongzili",
  "2024-03-11": "Hari Suci Nyepi Tahun Baru Saka 1946",
  "2024-03-29": "Wafat Yesus Kristus",
  "2024-03-31": "Hari Paskah",
  "2024-04-10": "Hari Raya Idul Fitri 1445 H",
  "2024-04-11": "Hari Raya Idul Fitri 1445 H",
  "2024-05-01": "Hari Buruh Internasional",
  "2024-05-09": "Kenaikan Yesus Kristus",
  "2024-05-23": "Hari Raya Waisak 2568 BE",
  "2024-06-01": "Hari Lahir Pancasila",
  "2024-06-17": "Hari Raya Idul Adha 1445 H",
  "2024-07-07": "Tahun Baru Islam 1446 H",
  "2024-08-17": "Hari Kemerdekaan RI",
  "2024-09-16": "Maulid Nabi Muhammad SAW",
  "2024-12-25": "Hari Raya Natal",

  // 2025
  "2025-01-01": "Tahun Baru 2025 Masehi",
  "2025-01-27": "Isra Mi'raj Nabi Muhammad SAW",
  "2025-01-29": "Tahun Baru Imlek 2576 Kongzili",
  "2025-03-29": "Hari Suci Nyepi Saka 1947",
  "2025-03-31": "Hari Raya Idul Fitri 1446 H",
  "2025-04-01": "Hari Raya Idul Fitri 1446 H",
  "2025-04-18": "Wafat Yesus Kristus",
  "2025-04-20": "Hari Paskah",
  "2025-05-01": "Hari Buruh Internasional",
  "2025-05-12": "Hari Raya Waisak 2569 BE",
  "2025-05-29": "Kenaikan Yesus Kristus",
  "2025-06-01": "Hari Lahir Pancasila",
  "2025-06-06": "Hari Raya Idul Adha 1446 H",
  "2025-06-27": "Tahun Baru Islam 1447 H",
  "2025-08-17": "Hari Kemerdekaan RI",
  "2025-09-05": "Maulid Nabi Muhammad SAW",
  "2025-12-25": "Hari Raya Natal",

  // 2026
  "2026-01-01": "Tahun Baru 2026 Masehi",
  "2026-01-16": "Isra Mi'raj Nabi Muhammad SAW",
  "2026-02-17": "Tahun Baru Imlek 2577 Kongzili",
  "2026-03-20": "Hari Suci Nyepi Saka 1948",
  "2026-03-21": "Hari Raya Idul Fitri 1447 H (Hari 1)",
  "2026-03-22": "Hari Raya Idul Fitri 1447 H (Hari 2)",
  "2026-04-03": "Wafat Yesus Kristus (Jumat Agung)",
  "2026-04-05": "Hari Paskah",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-14": "Kenaikan Yesus Kristus",
  "2026-05-27": "Hari Raya Idul Adha 1447 H",
  "2026-05-31": "Hari Raya Waisak 2570 BE",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-17": "Tahun Baru Islam 1448 H",
  "2026-08-17": "Hari Kemerdekaan Republik Indonesia ke-81",
  "2026-08-25": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Raya Natal",

  // 2027
  "2027-01-01": "Tahun Baru 2027 Masehi",
  "2027-02-06": "Tahun Baru Imlek 2578 Kongzili",
  "2027-03-10": "Hari Raya Idul Fitri 1448 H",
  "2027-03-11": "Hari Raya Idul Fitri 1448 H",
  "2027-03-26": "Wafat Yesus Kristus",
  "2027-05-01": "Hari Buruh Internasional",
  "2027-05-06": "Kenaikan Yesus Kristus",
  "2027-05-17": "Hari Raya Idul Adha 1448 H",
  "2027-05-20": "Hari Raya Waisak 2571 BE",
  "2027-06-01": "Hari Lahir Pancasila",
  "2027-06-06": "Tahun Baru Islam 1449 H",
  "2027-08-17": "Hari Kemerdekaan RI",
  "2027-08-14": "Maulid Nabi Muhammad SAW",
  "2027-12-25": "Hari Raya Natal"
};

function initCalendarFilters() {
  const monthSelect = document.getElementById("calendar-filter-month");
  const yearSelect = document.getElementById("calendar-filter-year");
  if (!monthSelect || !yearSelect) return;

  // Populate Months
  monthSelect.innerHTML = MONTH_NAMES_ID.map((name, idx) =>
    `<option value="${idx}" ${idx === calendarSelectedMonth ? 'selected' : ''}>${name}</option>`
  ).join("");

  // Populate Years (2024 - 2030)
  const currentYear = new Date().getFullYear();
  const startYear = Math.min(2024, currentYear - 1);
  const endYear = Math.max(2030, currentYear + 4);
  const years = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  yearSelect.innerHTML = years.map(y =>
    `<option value="${y}" ${y === calendarSelectedYear ? 'selected' : ''}>${y}</option>`
  ).join("");
}

function handleCalendarMonthChange(val) {
  calendarSelectedMonth = parseInt(val, 10);
  renderCalendar();
}

function handleCalendarYearChange(val) {
  calendarSelectedYear = parseInt(val, 10);
  renderCalendar();
}

function goToCurrentMonth() {
  const now = new Date();
  calendarSelectedMonth = now.getMonth();
  calendarSelectedYear = now.getFullYear();
  syncCalendarSelects();
  renderCalendar();
}

function prevCalendarMonth() {
  calendarSelectedMonth--;
  if (calendarSelectedMonth < 0) {
    calendarSelectedMonth = 11;
    calendarSelectedYear--;
  }
  syncCalendarSelects();
  renderCalendar();
}

function nextCalendarMonth() {
  calendarSelectedMonth++;
  if (calendarSelectedMonth > 11) {
    calendarSelectedMonth = 0;
    calendarSelectedYear++;
  }
  syncCalendarSelects();
  renderCalendar();
}

function syncCalendarSelects() {
  const monthSelect = document.getElementById("calendar-filter-month");
  const yearSelect = document.getElementById("calendar-filter-year");
  if (monthSelect) monthSelect.value = calendarSelectedMonth;
  if (yearSelect) yearSelect.value = calendarSelectedYear;
}

function renderCalendar() {
  const gridContainer = document.getElementById("calendar-grid-days");
  if (!gridContainer) return;

  const year = calendarSelectedYear;
  const month = calendarSelectedMonth;

  // Kalender Nasional dimulai hari Minggu (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
  const firstDayObj = new Date(year, month, 1);
  const startDayOfWeek = firstDayObj.getDay(); // 0 = Minggu

  // Jumlah hari bulan ini
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Jumlah hari bulan sebelumnya
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Hari ini
  const today = new Date();
  const isCurrentYear = today.getFullYear() === year;
  const isCurrentMonth = today.getMonth() === month;
  const currentDayNum = today.getDate();

  // Dapatkan wishlist aktif
  const activeWishlist = (state.wishlist || []).filter(w => !w.completed && w.departureDate);

  let html = "";

  // 1. Hari-hari padding dari bulan sebelumnya
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDayNum = daysInPrevMonth - i;
    html += `
      <div class="calendar-day-cell other-month">
        <div class="calendar-day-header">
          <span class="calendar-day-number">${prevDayNum}</span>
        </div>
      </div>
    `;
  }

  // 2. Hari-hari bulan ini
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentYear && isCurrentMonth && (day === currentDayNum);
    const dayOfWeek = (startDayOfWeek + day - 1) % 7;
    const isSunday = (dayOfWeek === 0); // Hari Minggu (Tanggal Merah Nasional)

    // Format YYYY-MM-DD
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;

    // Cek apakah tanggal merah libur nasional resmi
    const holidayName = HARI_LIBUR_NASIONAL[dateStr] || null;
    const isRedDate = isSunday || Boolean(holidayName);

    // Cari item wishlist pada tanggal ini
    const matchingWishlist = activeWishlist.filter(w => w.departureDate === dateStr);

    let holidayBadgeHtml = "";
    if (holidayName) {
      holidayBadgeHtml = `
        <div class="calendar-holiday-badge" title="${escapeHtml(holidayName)}">
          <span>🇮🇩</span> <span style="overflow:hidden; text-overflow:ellipsis;">${escapeHtml(holidayName)}</span>
        </div>
      `;
    }

    let wishlistEventsHtml = "";
    if (matchingWishlist.length > 0) {
      wishlistEventsHtml = matchingWishlist.map(item => {
        const isKuliner = (item.category || "").toLowerCase().includes("makan") || (item.category || "").toLowerCase().includes("kuliner");
        const icon = isKuliner ? "🍽️" : "🏖️";
        const pillClass = isKuliner ? "kuliner" : "wisata";
        return `
          <div class="calendar-event-pill ${pillClass}" onclick="openDetailWishlist('${item.id}', event)" title="${escapeHtml(item.name)} (${isKuliner ? 'Tempat Makan' : 'Tempat Wisata'}) - Klik untuk detail">
            <span>${icon}</span>
            <span style="overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.name)}</span>
          </div>
        `;
      }).join("");
    }

    html += `
      <div class="calendar-day-cell ${isToday ? 'today' : ''} ${isRedDate ? 'is-red-date' : ''}">
        <div class="calendar-day-header">
          <span class="calendar-day-number ${isRedDate ? 'red-number' : ''}">${day}</span>
          ${matchingWishlist.length > 0 ? `<span class="day-plan-count">${matchingWishlist.length} rencana</span>` : ''}
        </div>
        <div class="calendar-events-container">
          ${holidayBadgeHtml}
          ${wishlistEventsHtml}
        </div>
      </div>
    `;
  }

  // 3. Hari-hari padding ke depan untuk menutup baris grid kelipatan 7
  const totalCellsSoFar = startDayOfWeek + daysInMonth;
  const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
  for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
    html += `
      <div class="calendar-day-cell other-month">
        <div class="calendar-day-header">
          <span class="calendar-day-number">${nextDay}</span>
        </div>
      </div>
    `;
  }

  gridContainer.innerHTML = html;
}

