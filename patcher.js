const fs = require('fs');

function patchAdmin() {
    let content = fs.readFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\admin.html', 'utf8');

    // 1. Add input field
    content = content.replace(
        '<div class="form-group"><label>Email Address</label><input type="email" class="form-input"\r\n                  id="settingsEmail" disabled style="opacity:.5;"></div>',
        '<div class="form-group"><label>Email Address</label><input type="email" class="form-input"\r\n                  id="settingsEmail" disabled style="opacity:.5;"></div>\r\n              <div class="form-group"><label>Mobile Number <span style="color:red">*</span></label><input type="tel" class="form-input" id="settingsPhone" placeholder="+91 XXXXX XXXXX" required></div>'
    );
    // fallback for \n only
    content = content.replace(
        '<div class="form-group"><label>Email Address</label><input type="email" class="form-input"\n                  id="settingsEmail" disabled style="opacity:.5;"></div>',
        '<div class="form-group"><label>Email Address</label><input type="email" class="form-input"\n                  id="settingsEmail" disabled style="opacity:.5;"></div>\n              <div class="form-group"><label>Mobile Number <span style="color:red">*</span></label><input type="tel" class="form-input" id="settingsPhone" placeholder="+91 XXXXX XXXXX" required></div>'
    );

    // 2. Add phone logic to showDashboard
    content = content.replace(
        "document.getElementById('settingsEmail').value = currentUser.email; document.getElementById('settingsWebsite').value",
        "document.getElementById('settingsEmail').value = currentUser.email; document.getElementById('settingsPhone').value = (adminData.settings && adminData.settings.adminPhone) || ''; document.getElementById('settingsWebsite').value"
    );

    // 3. Add phone logic to saveSettings
    content = content.replace(
        "function saveSettings() { const n = document.getElementById('settingsName').value.trim(); if (!n) { toast('Name cannot be empty.', 'error'); return } currentUser.name = n;",
        "function saveSettings() { const n = document.getElementById('settingsName').value.trim(); if (!n) { toast('Name cannot be empty.', 'error'); return } const phone = document.getElementById('settingsPhone').value.trim(); if (!phone) { toast('Admin mobile number is required.', 'error'); return; } currentUser.name = n;"
    );
    content = content.replace(
        "adminData.settings.websiteName = document.getElementById('settingsWebsite').value.trim();",
        "adminData.settings.adminPhone = document.getElementById('settingsPhone').value.trim(); adminData.settings.websiteName = document.getElementById('settingsWebsite').value.trim();"
    );

    fs.writeFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\admin.html', content);
    console.log('patched admin.html');
}

function patchUserHtml() {
    let content = fs.readFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\user.html', 'utf8');

    // 1. Add Modal HTML above <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    if(!content.includes('id="paymentOverlay"')) {
        const modalHtml = `
    <!-- PAYMENT MODAL -->
    <div class="booking-overlay" id="paymentOverlay" onclick="if(event.target===this)closePayment()">
        <div class="success-modal" id="paymentModal">
            <!-- Dynamically injected -->
        </div>
    </div>
    `;
        content = content.replace(
            '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>',
            modalHtml + '\n    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>'
        );
    }

    // 2. Modify `confirmBooking` entirely
    const confirmBookingOrigHead = "function confirmBooking(destId, editId) { const d = destinations.find(x => x.id === destId); if (!d) return; const ci = document.getElementById('bkCheckIn').value; const co = document.getElementById('bkCheckOut').value; const t = parseInt(document.getElementById('bkTravelers').textContent); const phone = document.getElementById('bkPhone').value.trim(); if(!phone) { toast('Please enter mobile number.', 'error'); return; } if(!profile.phone) { profile.phone = phone; savePr(); renderProfile(); }";
    
    // Fallback search index to replace entire body of confirmBooking
    let idx = content.indexOf('function confirmBooking(destId, editId) {');
    if (idx !== -1 && content.indexOf('function showSuccess', idx) !== -1) {
        let endIndex = content.indexOf('function showSuccess', idx);
        let origFuncStr = content.substring(idx, endIndex);
        
        let newFuncStr = `
        function confirmBooking(destId, editId) { 
            const d = destinations.find(x => x.id === destId); if (!d) return; 
            const ci = document.getElementById('bkCheckIn').value; const co = document.getElementById('bkCheckOut').value; 
            const t = parseInt(document.getElementById('bkTravelers').textContent); 
            const phone = document.getElementById('bkPhone').value.trim(); 
            if(!phone) { toast('Please enter mobile number.', 'error'); return; } 
            if(!profile.phone) { profile.phone = phone; savePr(); renderProfile(); } 
            let nights = 1; if (ci && co) nights = Math.max(1, Math.ceil((new Date(co) - new Date(ci)) / 86400000)); 
            const total = d.price * nights * t; 
            
            // Generate Payment info
            let adminStr = localStorage.getItem('travelio_admin');
            let adminDat = adminStr ? JSON.parse(adminStr) : {};
            let adminPhone = (adminDat.settings && adminDat.settings.adminPhone) || 'Not Provided';
            
            const platFee = Math.round(total * 0.10);
            const adminFee = total - platFee;
            
            // Setup Payment values
            window._pendingBooking = { destId, editId, checkIn: ci, checkOut: co, travelers: t, nights, total, phone };
            
            // Build split payout UI
            document.getElementById('paymentModal').innerHTML = \`<div class="booking-header"><h3>Payment Details</h3><button class="booking-close" onclick="closePayment()"><i class="fas fa-times"></i></button></div>
            <div style="padding:15px; text-align:left;">
                <p style="margin-bottom:12px; font-size:14px; color:var(--fg-muted);">Please review the payment breakdown before confirming.</p>
                <div style="background:var(--bg); border:1px solid var(--border); padding:15px; border-radius:10px; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span>Total Amount:</span> <strong>\${fmtR(total)}</strong></div>
                </div>
                <h4 style="font-size:13px; font-weight:600; margin-bottom:10px; padding-bottom:5px; border-bottom:1px solid var(--border);">Payment Routing</h4>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="padding:12px; border-radius:8px; background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.2);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span style="font-weight:600; font-size:13px;">Platform Fee (10%)</span>
                            <span style="font-weight:700; color:var(--danger);">\${fmtR(platFee)}</span>
                        </div>
                        <div style="font-size:11px; color:var(--fg-muted);">Sent to Dev Mobile: <strong>+91 9680958199</strong></div>
                    </div>
                    <div style="padding:12px; border-radius:8px; background:rgba(16, 185, 129, 0.05); border:1px solid rgba(16, 185, 129, 0.2);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span style="font-weight:600; font-size:13px;">Admin Payout (90%)</span>
                            <span style="font-weight:700; color:var(--success);">\${fmtR(adminFee)}</span>
                        </div>
                        <div style="font-size:11px; color:var(--fg-muted);">Sent to Admin Mobile: <strong>\${adminPhone}</strong></div>
                    </div>
                </div>
                <div style="margin-top:20px;">
                    <button class="btn-confirm" onclick="finalizePayment()">Pay & Confirm Booking</button>
                </div>
            </div>\`;
            
            document.getElementById('paymentOverlay').classList.add('active');
        }

        function closePayment() {
            document.getElementById('paymentOverlay').classList.remove('active');
            window._pendingBooking = null;
        }

        function finalizePayment() {
            const pb = window._pendingBooking;
            if(!pb) return;
            const destId = pb.destId; const editId = pb.editId;
            const ci = pb.checkIn; const co = pb.checkOut;
            const t = pb.travelers; const nights = pb.nights; const total = pb.total;
            const d = destinations.find(x => x.id === destId); if (!d) return;

            let booking; if(editId) { 
                booking = bookings.find(b => b.id === editId); if(!booking) return; 
                booking.checkIn = ci; booking.checkOut = co; booking.travelers = t; booking.nights = nights; booking.total = total; 
                toast('Booking updated!', 'success'); 
            } else { 
                booking = { id: genId(), destId, checkIn: ci, checkOut: co, travelers: t, nights, total, timestamp: Date.now() }; 
                bookings.push(booking); gamification.totalBookings++; gamification.totalSpent += total; 
                if (!gamification.visited.includes(destId)) gamification.visited.push(destId); 
                if (d.category === 'Mountain') gamification.mountainBooked = true; 
                if (d.category === 'Beach' || d.category === 'Island') gamification.beachBooked = true; 
                addPoints(50, 'Trip booked'); 
            } 
            saveBk(); 
            closePayment();
            closeBooking(); 
            closeDetail(); 
            if(editId) { 
                const modal = document.getElementById('bInfoOverlay'); if(modal) modal.classList.remove('active'); 
                renderBookings(); 
            } else { 
                showSuccess(booking, d); 
            } 
        }
        
        `;
        
        content = content.replace(origFuncStr, newFuncStr);
    }
    
    fs.writeFileSync('c:\\Users\\Dilkhush\\OneDrive\\Desktop\\demo\\user.html', content);
    console.log('patched user.html');
}

patchAdmin();
patchUserHtml();
