const fs = require('fs');

function restoreAdmin() {
    let content = fs.readFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\admin.html', 'utf8');

    // 1. Remove input field
    content = content.replace(
        '<div class="form-group"><label>Mobile Number <span style="color:red">*</span></label><input type="tel" class="form-input" id="settingsPhone" placeholder="+91 XXXXX XXXXX" required></div>\r\n              ',
        ''
    );
     content = content.replace(
        '<div class="form-group"><label>Mobile Number <span style="color:red">*</span></label><input type="tel" class="form-input" id="settingsPhone" placeholder="+91 XXXXX XXXXX" required></div>\n              ',
        ''
    );
    content = content.replace(
        '<div class="form-group"><label>Mobile Number <span style="color:red">*</span></label><input type="tel" class="form-input" id="settingsPhone" placeholder="+91 XXXXX XXXXX" required></div>',
        ''
    );

    // 2. Remove from showDashboard
    content = content.replace(
        "document.getElementById('settingsEmail').value = currentUser.email; document.getElementById('settingsPhone').value = adminData.settings.adminPhone || '';",
        "document.getElementById('settingsEmail').value = currentUser.email;"
    );

    // 3. Revert saveSettings
    content = content.replace(
        "function saveSettings() { const n = document.getElementById('settingsName').value.trim(); if (!n) { toast('Name cannot be empty.', 'error'); return } const phone = document.getElementById('settingsPhone').value.trim(); if (!phone) { toast('Admin mobile number is required.', 'error'); return; } currentUser.name = n; localStorage.setItem(ADMIN_AUTH, JSON.stringify(currentUser)); const users = getUsers(); const u = users.find(x => x.email === currentUser.email); if (u) { u.name = n; saveUsers(users) } adminData.settings.adminPhone = phone; adminData.settings.adminPhone = document.getElementById('settingsPhone').value.trim(); adminData.settings.websiteName = document.getElementById('settingsWebsite').value.trim();",
        "function saveSettings() { const n = document.getElementById('settingsName').value.trim(); if (!n) { toast('Name cannot be empty.', 'error'); return } currentUser.name = n; localStorage.setItem(ADMIN_AUTH, JSON.stringify(currentUser)); const users = getUsers(); const u = users.find(x => x.email === currentUser.email); if (u) { u.name = n; saveUsers(users) } adminData.settings.websiteName = document.getElementById('settingsWebsite').value.trim();"
    );

    fs.writeFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\admin.html', content);
    console.log('Restored admin.html');
}

function restoreUser() {
    let content = fs.readFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\user.html', 'utf8');

    // Remove the HTML block starting from <!-- PAYMENT MODAL --> to the script tag
    const startIndex = content.indexOf('<!-- PAYMENT MODAL -->');
    if (startIndex !== -1) {
       const endIndex = content.indexOf('<script src="https://unpkg.com/leaflet');
       if(endIndex !== -1) {
           content = content.substring(0, startIndex) + content.substring(endIndex);
       }
    }

    // Replace the modified finalizePayment / confirmBooking area
    const startBk = content.indexOf('function confirmBooking(destId, editId) {');
    const endBk = content.indexOf('function showSuccess(booking, d) {');
    if (startBk !== -1 && endBk !== -1) {
        const replacement = `function confirmBooking(destId, editId) { const d = destinations.find(x => x.id === destId); if (!d) return; const ci = document.getElementById('bkCheckIn').value; const co = document.getElementById('bkCheckOut').value; const t = parseInt(document.getElementById('bkTravelers').textContent); const phone = document.getElementById('bkPhone').value.trim(); if(!phone) { toast('Please enter mobile number.', 'error'); return; } if(!profile.phone) { profile.phone = phone; savePr(); renderProfile(); } let nights = 1; if (ci && co) nights = Math.max(1, Math.ceil((new Date(co) - new Date(ci)) / 86400000)); const total = d.price * nights * t; let booking; if(editId) { booking = bookings.find(b => b.id === editId); if(!booking) return; booking.checkIn = ci; booking.checkOut = co; booking.travelers = t; booking.nights = nights; booking.total = total; toast('Booking updated!', 'success'); } else { booking = { id: genId(), destId, checkIn: ci, checkOut: co, travelers: t, nights, total, timestamp: Date.now() }; bookings.push(booking); gamification.totalBookings++; gamification.totalSpent += total; if (!gamification.visited.includes(destId)) gamification.visited.push(destId); if (d.category === 'Mountain') gamification.mountainBooked = true; if (d.category === 'Beach' || d.category === 'Island') gamification.beachBooked = true; addPoints(50, 'Trip booked'); } saveBk(); closeBooking(); closeDetail(); if(editId) { const modal = document.getElementById('bInfoOverlay'); if(modal) modal.classList.remove('active'); renderBookings(); } else { showSuccess(booking, d); } }\n\n        `;
        content = content.substring(0, startBk) + replacement + content.substring(endBk);
    }

    fs.writeFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\user.html', content);
    console.log('Restored user.html');
}

restoreAdmin();
restoreUser();
