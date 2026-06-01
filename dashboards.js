const mockRooms = [
    { id: 1, room_number: '101', style: 'Deluxe', price_per_night: 420.00, status: 'Available' },
    { id: 2, room_number: '102', style: 'Family', price_per_night: 620.00, status: 'Occupied' },
    { id: 3, room_number: '201', style: 'Business Suite', price_per_night: 540.00, status: 'Dirty' },
    { id: 4, room_number: '202', style: 'Royal Suite', price_per_night: 1320.00, status: 'Available' },
    { id: 5, room_number: '301', style: 'Executive', price_per_night: 780.00, status: 'Available' },
    { id: 6, room_number: '302', style: 'Premium', price_per_night: 890.00, status: 'Maintenance' }
];

let mockBookings = [
    { id: 1021, guest_id: 1, guest_name: 'VIP Guest', guest_email: 'guest@fisherel.com', room_id: 3, check_in_date: '2026-05-29', check_out_date: '2026-06-01', price_at_booking: 540.00, status: 'Confirmed' }
];

let mockInvoices = [
    { id: 4001, booking_id: 1021, guest_id: 1, guest_name: 'VIP Guest', guest_email: 'guest@fisherel.com', subtotal: 540.00, tax: 64.80, total_amount: 604.80, payment_status: 'Unpaid', roomCharges: [{ charge_description: "Fisher El Stay Room Booking Fee", amount: 540.00 }] }
];

let mockHousekeepingLogs = [
    { id: 501, room_id: 3, room_number: '201', housekeeper_name: 'Fisher El Housekeeper', task_description: 'Standard cleaning & linen update', status: 'Cleaned', timestamp: '2026-05-29 14:30' }
];

function formatCurrency(value) {
    return `₱${value.toFixed(2)}`;
}

function showToast(title, message) {
    const toast = document.getElementById('toastHUD');
    if (!toast) return;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3500);
}

// Guest functions
function refreshRoomAvailability() {
    const grid = document.getElementById('guestRoomsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    mockRooms.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';
        let badgeClass = 'badge-available';
        if (room.status === 'Occupied') badgeClass = 'badge-occupied';
        if (room.status === 'Dirty') badgeClass = 'badge-dirty';
        if (room.status === 'Maintenance') badgeClass = 'badge-maintenance';

        card.innerHTML = `
            <div class="room-image-stub">
                <i class="fa-solid fa-bed"></i>
                <span class="room-price-tag">${formatCurrency(room.price_per_night)} / Night</span>
            </div>
            <div class="room-card-body">
                <span class="room-badge ${badgeClass}">${room.status}</span>
                <h4 class="room-card-title">${room.style} (Room ${room.room_number})</h4>
                <p class="room-card-desc">Experience royal high-class comfort in Fisher El wing. Fitted with premium amenities and a serene stay.</p>
                ${room.status === 'Available' ? `<button class="btn-luxury" style="width: 100%;" onclick="bookRoom(${room.id})"><i class="fa-solid fa-bookmark"></i> Book Now</button>` : `<button class="btn-secondary" style="width: 100%; cursor: not-allowed;" disabled><i class="fa-solid fa-circle-ban"></i> Unavailable</button>`}
            </div>
        `;
        grid.appendChild(card);
    });
}

function bookRoom(roomId) {
    const checkIn = document.getElementById('guestCheckIn').value;
    const checkOut = document.getElementById('guestCheckOut').value;
    if (!checkIn || !checkOut) {
        showToast('Selection Required', 'Please select both check-in and check-out dates.');
        return;
    }
    const room = mockRooms.find(r => r.id === roomId);
    if (!room || room.status !== 'Available') {
        showToast('Room Unavailable', 'That room is no longer available.');
        return;
    }
    const nights = Math.max(1, (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price_per_night * nights;
    const bookingId = Math.floor(1000 + Math.random() * 9000);
    mockBookings.push({
        id: bookingId,
        guest_id: 1,
        guest_name: 'VIP Guest',
        guest_email: 'guest@fisherel.com',
        room_id: room.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        price_at_booking: totalPrice,
        status: 'Pending'
    });
    room.status = 'Occupied';
    mockInvoices.push({
        id: 4000 + bookingId,
        booking_id: bookingId,
        guest_id: 1,
        guest_name: 'VIP Guest',
        guest_email: 'guest@fisherel.com',
        subtotal: totalPrice,
        tax: totalPrice * 0.12,
        total_amount: totalPrice * 1.12,
        payment_status: 'Unpaid',
        roomCharges: [{ charge_description: "Fisher El Stay Room Booking Fee", amount: totalPrice }]
    });
    refreshRoomAvailability();
    renderGuestBookings();
    showToast('Booking Confirmed', `Room ${room.room_number} has been reserved for ${nights} night(s).`);
}

function renderGuestBookings() {
    const tbody = document.getElementById('guestBookingsTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (mockBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#94a3b8;">No current stays booked yet.</td></tr>';
        return;
    }
    mockBookings.forEach(booking => {
        const room = mockRooms.find(r => r.id === booking.room_id) || { room_number: 'n/a', style: 'Unknown' };
        let statusClass = 'badge-available';
        if (booking.status === 'Cancelled') statusClass = 'badge-dirty';
        if (booking.status === 'Completed') statusClass = 'badge-maintenance';
        tbody.innerHTML += `
            <tr>
                <td>#FE-${booking.id}</td>
                <td>Room ${room.room_number}</td>
                <td>${room.style}</td>
                <td>${booking.check_in_date}</td>
                <td>${booking.check_out_date}</td>
                <td style="font-weight:600;color:#fde68a;">${formatCurrency(booking.price_at_booking)}</td>
                <td><span class="status-pill ${statusClass}">${booking.status}</span></td>
                <td><button class="btn-luxury" style="padding:6px 12px;font-size:0.8rem;" onclick="showToast('Booking Detail','Please use the main app for full receipt views.')"><i class="fa-solid fa-info"></i> Details</button></td>
            </tr>
        `;
    });
}

// Receptionist functions
function renderReceptionBookings() {
    const tbody = document.getElementById('receptionBookingsTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (mockBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No active guest reservations.</td></tr>';
        return;
    }
    mockBookings.forEach(booking => {
        const room = mockRooms.find(r => r.id === booking.room_id) || { room_number: 'n/a' };
        let actionButton = `<button class="btn-secondary" disabled>Waiting</button>`;
        if (booking.status === 'Pending') {
            actionButton = `<button class="btn-luxury" onclick="updateBookingStatus(${booking.id}, 'Confirmed')">Confirm</button>`;
        }
        tbody.innerHTML += `
            <tr>
                <td>#${booking.id}</td>
                <td>${booking.guest_name}</td>
                <td>Room ${room.room_number}</td>
                <td>${booking.status}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    });
}

// Receptionist Rooms
function renderReceptionRooms() {
    const tbody = document.getElementById('receptionRoomsTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    mockRooms.forEach(room => {
        let badge = room.status;
        let action = `<button class="btn-secondary" disabled>Locked</button>`;
        if (room.status === 'Available') action = `<button class="btn-luxury" onclick="updateRoomStatusDirect(${room.id}, 'Occupied')">Set Occupied</button>`;
        if (room.status === 'Dirty' || room.status === 'Maintenance') action = `<button class="btn-secondary" onclick="updateRoomStatusDirect(${room.id}, 'Available')">Reset Available</button>`;
        tbody.innerHTML += `
            <tr>
                <td>${room.room_number}</td>
                <td>${room.style}</td>
                <td>${badge}</td>
                <td>${action}</td>
            </tr>
        `;
    });
}

function updateBookingStatus(bookingId, newStatus) {
    const booking = mockBookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = newStatus;
        showToast('Reservation Updated', `Booking #${bookingId} is now ${newStatus}.`);
        renderReceptionBookings();
    }
}

function updateRoomStatusDirect(roomId, newStatus) {
    const room = mockRooms.find(r => r.id === roomId);
    if (!room) return;
    room.status = newStatus;
    showToast('Room Status Updated', `Room ${room.room_number} is now ${newStatus}.`);
    renderReceptionRooms();
}

// Housekeeper functions
function renderHousekeeperCleaning() {
    const tbody = document.getElementById('housekeeperCleaningTable');
    if (!tbody) return;
    const dirtyRooms = mockRooms.filter(r => r.status === 'Dirty' || r.status === 'Maintenance');
    tbody.innerHTML = '';
    if (dirtyRooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">All rooms are clean and ready.</td></tr>';
        return;
    }
    dirtyRooms.forEach(room => {
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

function renderHousekeepingLogs() {
    const tbody = document.getElementById('housekeepingLogsTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (mockHousekeepingLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No housekeeping logs yet.</td></tr>';
        return;
    }
    mockHousekeepingLogs.forEach(log => {
        tbody.innerHTML += `
            <tr>
                <td>${log.room_number}</td>
                <td>${log.housekeeper_name}</td>
                <td>${log.task_description}</td>
                <td>${log.status}</td>
                <td>${log.timestamp}</td>
            </tr>
        `;
    });
}

function markRoomClean(roomId) {
    const room = mockRooms.find(r => r.id === roomId);
    if (!room) return;
    room.status = 'Available';
    mockHousekeepingLogs.unshift({
        id: mockHousekeepingLogs.length + 501,
        room_id: room.id,
        room_number: room.room_number,
        housekeeper_name: 'Fisher El Housekeeper',
        task_description: 'Room refreshed and linens replaced',
        status: 'Cleaned',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });
    showToast('Room Cleared', `Room ${room.room_number} is now ready for guests.`);
    renderHousekeeperCleaning();
    renderHousekeepingLogs();
}

// Manager functions
function calculateManagerAnalytics() {
    const revenue = mockInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const occupied = mockRooms.filter(r => r.status === 'Occupied').length;
    const total = mockRooms.length;
    const occupancy = total > 0 ? (occupied / total) * 100 : 0;
    document.getElementById('statRevenue')?.textContent = formatCurrency(revenue);
    document.getElementById('statOccupancy')?.textContent = `${occupancy.toFixed(1)}%`;
    document.getElementById('statInvoices')?.textContent = `${mockInvoices.filter(i => i.payment_status !== 'Paid').length} Pending`;
}

function renderManagerInvoices() {
    const tbody = document.getElementById('managerInvoicesTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (mockInvoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No invoices available.</td></tr>';
        return;
    }
    mockInvoices.forEach(invoice => {
        tbody.innerHTML += `
            <tr>
                <td>#${invoice.id}</td>
                <td>${invoice.guest_name}</td>
                <td>${formatCurrency(invoice.total_amount)}</td>
                <td>${invoice.payment_status}</td>
                <td><button class="btn-secondary" onclick="showToast('Invoice Detail', 'Open the full invoice in the main app for settlement.')">Review</button></td>
            </tr>
        `;
    });
}

function initGuestDashboard() {
    refreshRoomAvailability();
    renderGuestBookings();
}

function initReceptionistDashboard() {
    renderReceptionBookings();
    renderReceptionRooms();
}

function initHousekeeperDashboard() {
    renderHousekeeperCleaning();
    renderHousekeepingLogs();
}

function initManagerDashboard() {
    calculateManagerAnalytics();
    renderManagerInvoices();
}
