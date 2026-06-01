// ============================================================
// Fisher El — dashboards.js
// All data is fetched from the real API through the nginx gateway.
// JWT token is read from localStorage key: 'fe_auth_token'
// ============================================================

const API = {
    auth:         '/api/auth',
    bookings:     '/api/bookings',
    rooms:        '/api/bookings/rooms',
    housekeeping: '/api/housekeeping',
    finance:      '/api/finance',
};

// ------------------------------------------------------------
// Core helpers
// ------------------------------------------------------------

function getToken() {
    return localStorage.getItem('fe_auth_token') || '';
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
    };
}

async function apiFetch(url, options = {}) {
    try {
        const res = await fetch(url, {
            headers: authHeaders(),
            ...options,
        });

        if (res.status === 401) {
            showToast('Session Expired', 'Please log in again.');
            setTimeout(() => window.location.href = '/index.html', 1500);
            return null;
        }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err.message || `Server error (${res.status})`;
            showToast('Request Failed', msg);
            return null;
        }

        // 204 No Content
        if (res.status === 204) return true;

        return await res.json();
    } catch (e) {
        showToast('Network Error', 'Could not reach the server. Check your connection.');
        return null;
    }
}

function formatCurrency(value) {
    return `₱${parseFloat(value).toFixed(2)}`;
}

function showToast(title, message) {
    const toast = document.getElementById('toastHUD');
    if (!toast) return;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3500);
}

function setLoading(tbodyId, colspan, message = 'Loading...') {
    const tbody = document.getElementById(tbodyId);
    if (tbody) tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;color:#94a3b8;">${message}</td></tr>`;
}

// ------------------------------------------------------------
// Guest dashboard
// ------------------------------------------------------------

async function initGuestDashboard() {
    await refreshRoomAvailability();
    await renderGuestBookings();
}

async function refreshRoomAvailability() {
    const grid = document.getElementById('guestRoomsGrid');
    if (!grid) return;
    grid.innerHTML = '<p style="color:#94a3b8;text-align:center;">Loading rooms…</p>';

    const rooms = await apiFetch(API.rooms);
    if (!rooms) return;

    grid.innerHTML = '';
    rooms.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';

        let badgeClass = 'badge-available';
        if (room.status === 'Occupied')    badgeClass = 'badge-occupied';
        if (room.status === 'Dirty')       badgeClass = 'badge-dirty';
        if (room.status === 'Maintenance') badgeClass = 'badge-maintenance';

        const bookBtn = room.status === 'Available'
            ? `<button class="btn-luxury" style="width:100%;" onclick="bookRoom(${room.id})">
                 <i class="fa-solid fa-bookmark"></i> Book Now
               </button>`
            : `<button class="btn-secondary" style="width:100%;cursor:not-allowed;" disabled>
                 <i class="fa-solid fa-circle-ban"></i> Unavailable
               </button>`;

        card.innerHTML = `
            <div class="room-image-stub">
                <i class="fa-solid fa-bed"></i>
                <span class="room-price-tag">${formatCurrency(room.price_per_night)} / Night</span>
            </div>
            <div class="room-card-body">
                <span class="room-badge ${badgeClass}">${room.status}</span>
                <h4 class="room-card-title">${room.style} (Room ${room.room_number})</h4>
                <p class="room-card-desc">Experience royal high-class comfort in Fisher El wing. Fitted with premium amenities and a serene stay.</p>
                ${bookBtn}
            </div>
        `;
        grid.appendChild(card);
    });
}

async function bookRoom(roomId) {
    const checkIn  = document.getElementById('guestCheckIn')?.value;
    const checkOut = document.getElementById('guestCheckOut')?.value;

    if (!checkIn || !checkOut) {
        showToast('Selection Required', 'Please select both check-in and check-out dates.');
        return;
    }

    const result = await apiFetch(API.bookings, {
        method: 'POST',
        body: JSON.stringify({
            room_id:        roomId,
            check_in_date:  checkIn,
            check_out_date: checkOut,
        }),
    });

    if (!result) return;

    showToast('Booking Confirmed', `Room has been reserved. Booking #${result.id}.`);
    await refreshRoomAvailability();
    await renderGuestBookings();
}

async function renderGuestBookings() {
    const tbody = document.getElementById('guestBookingsTable');
    if (!tbody) return;
    setLoading('guestBookingsTable', 8);

    const bookings = await apiFetch(API.bookings);
    if (!bookings) return;

    tbody.innerHTML = '';
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#94a3b8;">No current stays booked yet.</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        let statusClass = 'badge-available';
        if (booking.status === 'Cancelled')  statusClass = 'badge-dirty';
        if (booking.status === 'Completed')  statusClass = 'badge-maintenance';

        tbody.innerHTML += `
            <tr>
                <td>#FE-${booking.id}</td>
                <td>Room ${booking.room_number ?? booking.room_id}</td>
                <td>${booking.room_style ?? '—'}</td>
                <td>${booking.check_in_date}</td>
                <td>${booking.check_out_date}</td>
                <td style="font-weight:600;color:#fde68a;">${formatCurrency(booking.price_at_booking)}</td>
                <td><span class="status-pill ${statusClass}">${booking.status}</span></td>
                <td>
                    <button class="btn-luxury" style="padding:6px 12px;font-size:0.8rem;"
                        onclick="showGuestBookingDetail(${booking.id})">
                        <i class="fa-solid fa-info"></i> Details
                    </button>
                </td>
            </tr>
        `;
    });
}

async function showGuestBookingDetail(bookingId) {
    const booking = await apiFetch(`${API.bookings}/${bookingId}`);
    if (!booking) return;
    showToast(`Booking #${bookingId}`, `Status: ${booking.status} | Total: ${formatCurrency(booking.price_at_booking)}`);
}

// ------------------------------------------------------------
// Receptionist dashboard
// ------------------------------------------------------------

async function initReceptionistDashboard() {
    await renderReceptionBookings();
    await renderReceptionRooms();
}

async function renderReceptionBookings() {
    const tbody = document.getElementById('receptionBookingsTable');
    if (!tbody) return;
    setLoading('receptionBookingsTable', 5);

    const bookings = await apiFetch(API.bookings);
    if (!bookings) return;

    tbody.innerHTML = '';
    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No active guest reservations.</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const actionButton = booking.status === 'Pending'
            ? `<button class="btn-luxury" onclick="updateBookingStatus(${booking.id}, 'Confirmed')">Confirm</button>`
            : `<button class="btn-secondary" disabled>Waiting</button>`;

        tbody.innerHTML += `
            <tr>
                <td>#${booking.id}</td>
                <td>${booking.guest_name}</td>
                <td>Room ${booking.room_number ?? booking.room_id}</td>
                <td>${booking.status}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    });
}

async function renderReceptionRooms() {
    const tbody = document.getElementById('receptionRoomsTable');
    if (!tbody) return;
    setLoading('receptionRoomsTable', 4);

    const rooms = await apiFetch(API.rooms);
    if (!rooms) return;

    tbody.innerHTML = '';
    rooms.forEach(room => {
        let action = `<button class="btn-secondary" disabled>Locked</button>`;
        if (room.status === 'Available') {
            action = `<button class="btn-luxury" onclick="updateRoomStatusDirect(${room.id}, 'Occupied')">Set Occupied</button>`;
        } else if (room.status === 'Dirty' || room.status === 'Maintenance') {
            action = `<button class="btn-secondary" onclick="updateRoomStatusDirect(${room.id}, 'Available')">Reset Available</button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${room.room_number}</td>
                <td>${room.style}</td>
                <td>${room.status}</td>
                <td>${action}</td>
            </tr>
        `;
    });
}

async function updateBookingStatus(bookingId, newStatus) {
    const result = await apiFetch(`${API.bookings}/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
    });
    if (!result) return;
    showToast('Reservation Updated', `Booking #${bookingId} is now ${newStatus}.`);
    await renderReceptionBookings();
}

async function updateRoomStatusDirect(roomId, newStatus) {
    const result = await apiFetch(`${API.rooms}/${roomId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
    });
    if (!result) return;
    showToast('Room Status Updated', `Room has been set to ${newStatus}.`);
    await renderReceptionRooms();
}

// ------------------------------------------------------------
// Housekeeper dashboard
// ------------------------------------------------------------

async function initHousekeeperDashboard() {
    await renderHousekeeperCleaning();
    await renderHousekeepingLogs();
}

async function renderHousekeeperCleaning() {
    const tbody = document.getElementById('housekeeperCleaningTable');
    if (!tbody) return;
    setLoading('housekeeperCleaningTable', 4);

    const rooms = await apiFetch(`${API.rooms}?status=Dirty,Maintenance`);
    if (!rooms) return;

    tbody.innerHTML = '';
    if (rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">All rooms are clean and ready.</td></tr>';
        return;
    }

    rooms.forEach(room => {
        tbody.innerHTML += `
            <tr>
                <td>${room.room_number}</td>
                <td>${room.style}</td>
                <td>${room.status}</td>
                <td><button class="btn-luxury" onclick="markRoomClean(${room.id})">Mark Clean</button></td>
            </tr>
        `;
    });
}

async function renderHousekeepingLogs() {
    const tbody = document.getElementById('housekeepingLogsTable');
    if (!tbody) return;
    setLoading('housekeepingLogsTable', 5);

    const logs = await apiFetch(`${API.housekeeping}/logs`);
    if (!logs) return;

    tbody.innerHTML = '';
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No housekeeping logs yet.</td></tr>';
        return;
    }

    logs.forEach(log => {
        tbody.innerHTML += `
            <tr>
                <td>${log.room_number}</td>
                <td>${log.housekeeper_name}</td>
                <td>${log.task_description}</td>
                <td>${log.status}</td>
                <td>${log.timestamp ?? log.created_at}</td>
            </tr>
        `;
    });
}

async function markRoomClean(roomId) {
    const result = await apiFetch(`${API.housekeeping}/logs`, {
        method: 'POST',
        body: JSON.stringify({
            room_id:          roomId,
            task_description: 'Room refreshed and linens replaced',
            status:           'Cleaned',
        }),
    });
    if (!result) return;
    showToast('Room Cleared', 'Room is now ready for guests.');
    await renderHousekeeperCleaning();
    await renderHousekeepingLogs();
}

// ------------------------------------------------------------
// Manager dashboard
// ------------------------------------------------------------

async function initManagerDashboard() {
    await calculateManagerAnalytics();
    await renderManagerInvoices();
}

async function calculateManagerAnalytics() {
    const summary = await apiFetch(`${API.finance}/analytics`);
    if (!summary) return;

    const el = id => document.getElementById(id);
    if (el('statRevenue'))   el('statRevenue').textContent   = formatCurrency(summary.total_revenue ?? 0);
    if (el('statOccupancy')) el('statOccupancy').textContent = `${parseFloat((summary.paid_count / Math.max(1, summary.invoice_count)) * 100).toFixed(1)}%`;
    if (el('statInvoices'))  el('statInvoices').textContent  = `${summary.unpaid_count ?? 0} Pending`;
}

async function renderManagerInvoices() {
    const tbody = document.getElementById('managerInvoicesTable');
    if (!tbody) return;
    setLoading('managerInvoicesTable', 5);

    const invoices = await apiFetch(`${API.finance}/invoices`);
    if (!invoices) return;

    tbody.innerHTML = '';
    if (invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No invoices available.</td></tr>';
        return;
    }

    invoices.forEach(invoice => {
        tbody.innerHTML += `
            <tr>
                <td>#${invoice.id}</td>
                <td>${invoice.guest_name}</td>
                <td>${formatCurrency(invoice.total_amount)}</td>
                <td>${invoice.payment_status}</td>
                <td>
                    <button class="btn-secondary" onclick="reviewInvoice(${invoice.id})">Review</button>
                </td>
            </tr>
        `;
    });
}

async function reviewInvoice(invoiceId) {
    const invoice = await apiFetch(`${API.finance}/invoices/${invoiceId}`);
    if (!invoice) return;
    showToast(
        `Invoice #${invoiceId}`,
        `${invoice.guest_name} — ${formatCurrency(invoice.total_amount)} — ${invoice.payment_status}`
    );
}