/**
 * BookNest: Core Enterprise In-Memory Database Matrix Simulation Engine
 * Simulates a relational database schema across 19 distinct functional tables.
 */

// --------------------------------------------------------
// IN-MEMORY DATA STORAGE STRUCTURE (RELATIONAL ENGINES SCHEMAS)
// --------------------------------------------------------
let DB = {
    Roles: [
        { id: 1, name: 'Manager', description: 'Full System Domain Admin Control Access' },
        { id: 2, name: 'Receptionist', description: 'Front-Desk Guest Registry Processing Operations' },
        { id: 3, name: 'Housekeeping', description: 'Environmental Facilities Maintenance Crew Team' },
        { id: 4, name: 'Maintenance', description: 'Structural Plant Hardware Maintenance Engineering Tasks' }
    ],
    Users: [
        { username: 'admin', roleId: 1, empId: 1001 },
        { username: 'frontdesk', roleId: 2, empId: 1002 },
        { username: 'cleaner1', roleId: 3, empId: 1003 },
        { username: 'engineer1', roleId: 4, empId: 1004 }
    ],
    RoomTypes: [
        { id: 'STD', name: 'Standard Economy', price: 90, amenities: 'Wi-Fi, TV, AC' },
        { id: 'DLX', name: 'Deluxe Executive', price: 160, amenities: 'Wi-Fi, Smart TV, MiniBar, OceanView' },
        { id: 'SUI', name: 'Elite Signature Suite', price: 350, amenities: 'Jacuzzi, Living Room, Kitchenette, Butler Service' }
    ],
    Rooms: [],
    Guests: [],
    Bookings: [],
    Checkins: [],
    Checkouts: [],
    Payments: [],
    ServiceRequests: [],
    Employees: [],
    Attendance: [],
    HousekeepingLog: [],
    MaintenanceLog: [],
    Inventory: [],
    Salaries: [],
    Feedback: []
};

// Current Session State Tracking Configuration
let currentRole = "Manager"; 
let currentUser = "Corporate Superuser (Simulated)";

// --------------------------------------------------------
// DATA INSTANTIATION GENERATOR PIPELINE (INITIAL BASESEED DATA)
// --------------------------------------------------------
function seedDatabasePipeline() {
    // 1. Generation of Base Hotel Physical Assets
    const types = ['STD', 'DLX', 'SUI'];
    for(let i = 101; i <= 112; i++) {
        let typeId = types[i % 3];
        DB.Rooms.push({
            roomNumber: i,
            roomTypeId: typeId,
            occupancyStatus: 'Available', // Available, Occupied
            cleaningStatus: (i % 4 === 0) ? 'Dirty' : 'Clean', // Clean, In Progress, Dirty
            maintenanceStatus: (i === 107) ? 'Under Maintenance' : 'Operational' // Operational, Under Maintenance
        });
    }

    // 2. Initial Base Inventory Seeds
    DB.Inventory = [
        { item: 'Egyptian Towels Suite Pack', category: 'Room Supplies', qty: 140, minAlert: 30 },
        { item: 'EcoScent Floor Disinfectant Liquid', category: 'Cleaning Supplies', qty: 12, minAlert: 15 },
        { item: 'Signature King Sheets Linens', category: 'Linen Management', qty: 85, minAlert: 20 },
        { item: 'Premium Espresso Roasted Beans Bags', category: 'Restaurant Inventory', qty: 45, minAlert: 10 }
    ];

    // 3. Corporate Human Capital Records Setup
    DB.Employees = [
        { id: 1001, name: 'Sadikul Hossain', role: 'Manager', salary: 5500, contact: 's.jenkins@booknest.com', schedule: 'Mon-Fri Regular Shift' },
        { id: 1002, name: 'Rayhana Akter ', role: 'Receptionist', salary: 3200, contact: 'm.chang@booknest.com', schedule: 'Day Rotation A' },
        { id: 1003, name: 'Tawhid Shahrihar', role: 'Housekeeping', salary: 2200, contact: 'r.uddin@booknest.com', schedule: 'Morning Clean Grid' },
        { id: 1004, name: 'The OG Prosenjit DADA', role: 'Maintenance', salary: 3600, contact: 'd.miller@booknest.com', schedule: '24/7 On-Call Support' }
    ];

    // Simulate Employee Punch-clock Machine logs
    DB.Employees.forEach(emp => {
        DB.Attendance.push({ empId: emp.id, date: '2026-06-30', status: 'Checked In via Biometrics' });
        DB.Salaries.push({ empId: emp.id, amountPaid: emp.salary, payrollCycle: 'June 2026', status: 'Disbursed' });
    });

    // 4. Initial Guest & Reservation Core Simulation Seed Records
    DB.Guests.push({ uuid: 'G-9801', name: 'Alice Robertson', identityDoc: 'NID-88273615', logHistory: 'System account initiated.' });
    DB.Bookings.push({
        bookingId: 'BK-4001', guestId: 'G-9801', roomNumber: 102, status: 'Active Occupancy', advancePaid: 100
    });
    // Set matching room status constraints
    let seededRoom = DB.Rooms.find(r => r.roomNumber === 102);
    if(seededRoom) seededRoom.occupancyStatus = 'Occupied';
    
    DB.Payments.push({ transactionId: 'TXN-00918', bookingId: 'BK-4001', amount: 100, mechanism: 'Credit/Debit Card', date: '2026-06-29' });
    DB.Checkins.push({ checkinId: 'CI-101', bookingId: 'BK-4001', timestamp: '2026-06-29 14:15' });

    // 5. Customer Feedback Records
    DB.Feedback.push({ guestName: 'Alice Robertson', score: '5 Stars', notes: 'Fantastic integration layout, clean response times.' });
    DB.Feedback.push({ guestName: 'Thomas Shelby', score: '4 Stars', notes: 'Prompt room service turnaround.' });

    // 6. Open Engineering Defect Log Tickets
    DB.MaintenanceLog.push({ id: 501, roomNumber: 107, issueText: 'Central AC system blower producing erratic fan speed loops.', status: 'Pending Assignment' });
}

// --------------------------------------------------------
// APPLICATION LIFECYCLE INITIALIZER & VIEW ROUTING
// --------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    seedDatabasePipeline();
    setupNavigationRoutingListeners();
    populateStaticFormSelectors();
    refreshApplicationSystemViews();
    
    // Set Current Runtime Interface Systems Clock Info UI
    document.getElementById('live-clock').textContent = new Date().toUTCString() + ' | Server Node Safe';
});

function setupNavigationRoutingListeners() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            
            const targetedViewId = item.getAttribute("data-target");
            document.querySelectorAll(".view-panel").forEach(panel => {
                panel.classList.remove("active");
            });
            document.getElementById(targetedViewId).classList.add("active");
            
            // Format title dynamically
            document.getElementById("page-title").textContent = item.textContent;
        });
    });
}

function populateStaticFormSelectors() {
    const typeSelects = ['res-room-type', 'rm-type'];
    typeSelects.forEach(id => {
        const selectElement = document.getElementById(id);
        if(selectElement) {
            selectElement.innerHTML = '';
            DB.RoomTypes.forEach(t => {
                let opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = `${t.name} [Base Tier $${t.price}/Night]`;
                selectElement.appendChild(opt);
            });
        }
    });
    filterAvailableRoomsBySelection();
}

function filterAvailableRoomsBySelection() {
    const targetType = document.getElementById('res-room-type').value;
    const roomDropdown = document.getElementById('res-room-number');
    roomDropdown.innerHTML = '';
    
    // Gather matching safe room array matrices instances
    const matchedRooms = DB.Rooms.filter(r => r.roomTypeId === targetType && r.occupancyStatus === 'Available' && r.maintenanceStatus === 'Operational');
    
    if(matchedRooms.length === 0) {
        let opt = document.createElement('option');
        opt.textContent = "No Vacant Units in Class";
        roomDropdown.appendChild(opt);
    } else {
        matchedRooms.forEach(rm => {
            let opt = document.createElement('option');
            opt.value = rm.roomNumber;
            opt.textContent = `Room Unit ${rm.roomNumber}`;
            roomDropdown.appendChild(opt);
        });
    }
}

// --------------------------------------------------------
// INTERACTIVE SECURITY LAYER CONTROLS (ROLE-BASED ACCESS CONTROLS)
// --------------------------------------------------------
function switchRoleContext(selectedRoleValue) {
    currentRole = selectedRoleValue;
    currentUser = `${selectedRoleValue} Operator Profile`;
    
    document.getElementById('current-user-display').textContent = currentUser;
    document.getElementById('current-role-badge').textContent = currentRole.toUpperCase();
    
    // Evaluate Visibility Structural Modifiers across UI Layout Elements
    const allNavs = document.querySelectorAll('.nav-item');
    allNavs.forEach(nav => {
        // Reset defaults
        nav.style.display = "block";
        
        if (nav.classList.contains('mngr-only') && currentRole !== 'Manager') {
            nav.style.display = "none";
        }
        if (nav.classList.contains('mngr-recp-only') && (currentRole !== 'Manager' && currentRole !== 'Receptionist')) {
            nav.style.display = "none";
        }
        if (nav.classList.contains('mngr-recp-house-only') && (currentRole === 'Maintenance')) {
            nav.style.display = "none";
        }
        if (nav.classList.contains('mngr-recp-maint-only') && (currentRole === 'Housekeeping')) {
            nav.style.display = "none";
        }
    });

    // Auto route to Dashboard if user switched out of an inaccessible screen view panel
    document.querySelector('.nav-item[data-target="dashboard-view"]').click();
    refreshApplicationSystemViews();
}

// --------------------------------------------------------
// CORE DOM RENDERING ENGINE DATABASES AGGREGATIONS
// --------------------------------------------------------
function refreshApplicationSystemViews() {
    // 1. Calculations metrics for KPI Cards Matrix
    const occupiedUnitsCount = DB.Rooms.filter(r => r.occupancyStatus === 'Occupied').length;
    const structuralTotalUnits = DB.Rooms.length;
    const dynamicOccupancyPercentage = structuralTotalUnits > 0 ? Math.round((occupiedUnitsCount / structuralTotalUnits) * 100) : 0;
    
    document.getElementById('dash-occupancy').textContent = `${dynamicOccupancyPercentage}%`;
    
    const operationalGrossRev = DB.Payments.reduce((total, payment) => total + payment.amount, 0);
    document.getElementById('dash-revenue').textContent = `$${operationalGrossRev.toFixed(2)}`;
    
    const dirtyUnitsCount = DB.Rooms.filter(r => r.cleaningStatus === 'Dirty' || r.cleaningStatus === 'In Progress').length;
    document.getElementById('dash-dirty-rooms').textContent = dirtyUnitsCount;
    
    const unassignedFaultsCount = DB.MaintenanceLog.filter(m => m.status !== 'Resolved & Operational').length;
    document.getElementById('dash-maint-faults').textContent = unassignedFaultsCount;

    // 2. Refresh UI Tables Data Arrays Stream
    renderBookingsTable();
    renderGuestsTable();
    renderRoomsTable();
    renderHousekeepingTable();
    renderMaintenanceTable();
    renderEmployeeTable();
    renderInventoryTable();
    renderFeedbackTable();
}

function renderBookingsTable() {
    const tbody = document.getElementById('bookings-tbody');
    tbody.innerHTML = '';
    DB.Bookings.forEach(bk => {
        let matchedGuest = DB.Guests.find(g => g.uuid === bk.guestId);
        let guestName = matchedGuest ? matchedGuest.name : 'Unknown Guest Record';
        
        let row = document.createElement('tr');
        let badgeClass = bk.status === 'Active Occupancy' ? 'pill-green' : 'pill-orange';
        
        let checkoutActionBtn = bk.status === 'Active Occupancy' 
            ? `<button class="btn-checkout" style="background:var(--alert-red); color:white; border:none; padding:3px 8px; border-radius:4px; cursor:pointer;" onclick="processCheckoutExecution('${bk.bookingId}')">Check-Out / Invoice</button>` 
            : '-';

        row.innerHTML = `
            <td><strong>${bk.bookingId}</strong></td>
            <td>${guestName}</td>
            <td>Unit ${bk.roomNumber}</td>
            <td><span class="pill ${badgeClass}">${bk.status}</span></td>
            <td>${checkoutActionBtn}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderGuestsTable() {
    const tbody = document.getElementById('guests-tbody');
    tbody.innerHTML = '';
    DB.Guests.forEach(g => {
        let row = document.createElement('tr');
        row.innerHTML = `<td><code>${g.uuid}</code></td><td><strong>${g.name}</strong></td><td>${g.identityDoc}</td><td>${g.logHistory}</td>`;
        tbody.appendChild(row);
    });
}

function renderRoomsTable() {
    const tbody = document.getElementById('rooms-tbody');
    tbody.innerHTML = '';
    DB.Rooms.forEach(rm => {
        let classMeta = DB.RoomTypes.find(t => t.id === rm.roomTypeId);
        let row = document.createElement('tr');
        let statusBadge = rm.occupancyStatus === 'Occupied' ? 'pill-red' : 'pill-green';
        row.innerHTML = `
            <td><strong>Unit ${rm.roomNumber}</strong></td>
            <td>${classMeta ? classMeta.name : rm.roomTypeId}</td>
            <td>$${classMeta ? classMeta.price : 0}/night</td>
            <td><span class="pill ${statusBadge}">${rm.occupancyStatus}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function renderHousekeepingTable() {
    const tbody = document.getElementById('housekeeping-tbody');
    tbody.innerHTML = '';
    DB.Rooms.forEach(rm => {
        let row = document.createElement('tr');
        let cleanPill = rm.cleaningStatus === 'Clean' ? 'pill-green' : (rm.cleaningStatus === 'Dirty' ? 'pill-red' : 'pill-orange');
        
        // Context-driven row control restrictions
        let changeActionSelector = '';
        if(currentRole === 'Manager' || currentRole === 'Housekeeping' || currentRole === 'Receptionist') {
            changeActionSelector = `
                <select onchange="updateRoomCleaningState(${rm.roomNumber}, this.value)" style="padding:2px 5px; font-size:0.8rem;">
                    <option value="">-- Shift Status --</option>
                    <option value="Clean">Clean</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Dirty">Dirty</option>
                </select>
            `;
        } else {
            changeActionSelector = '<span>No Access Permissions</span>';
        }

        row.innerHTML = `
            <td><strong>Room Unit ${rm.roomNumber}</strong></td>
            <td><span class="pill ${cleanPill}">${rm.cleaningStatus}</span></td>
            <td>${changeActionSelector}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderMaintenanceTable() {
    const tbody = document.getElementById('maintenance-tbody');
    tbody.innerHTML = '';
    DB.MaintenanceLog.forEach(ticket => {
        let row = document.createElement('tr');
        let statPill = ticket.status === 'Resolved & Operational' ? 'pill-green' : 'pill-red';
        
        let actionFormButton = '-';
        if((currentRole === 'Manager' || currentRole === 'Maintenance') && ticket.status !== 'Resolved & Operational') {
            actionFormButton = `<button style="background:var(--alert-green); color:white; border:none; padding:3px 6px; border-radius:4px; cursor:pointer;" onclick="resolveMaintenanceTicket(${ticket.id})">Mark Fixed</button>`;
        }

        row.innerHTML = `
            <td>#${ticket.id}</td>
            <td>Unit ${ticket.roomNumber}</td>
            <td><em>"${ticket.issueText}"</em></td>
            <td><span class="pill ${statPill}">${ticket.status}</span></td>
            <td>${actionFormButton}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderEmployeeTable() {
    const tbody = document.getElementById('employee-tbody');
    tbody.innerHTML = '';
    DB.Employees.forEach(emp => {
        let attendanceRecord = DB.Attendance.find(a => a.empId === emp.id);
        let attendanceMsg = attendanceRecord ? attendanceRecord.status : 'No Check-In Captured';
        
        let row = document.createElement('tr');
        row.innerHTML = `
            <td><code>EMP-${emp.id}</code></td>
            <td><strong>${emp.name}</strong></td>
            <td><span class="role-badge" style="background:#475569;">${emp.role}</span></td>
            <td>$${emp.salary}.00 / mo</td>
            <td><small>${attendanceMsg}</small></td>
            <td><button style="background:var(--navy-mid); color:white; border:none; padding:2px 5px; border-radius:4px; cursor:pointer;" onclick="triggerEmployeeClockPunch(${emp.id})">Trigger Biom-Clock</button></td>
        `;
        tbody.appendChild(row);
    });
}

function renderInventoryTable() {
    const tbody = document.getElementById('inventory-tbody');
    tbody.innerHTML = '';
    DB.Inventory.forEach(inv => {
        let row = document.createElement('tr');
        let allocationAlertFlag = inv.qty <= inv.minAlert 
            ? `<span class="pill pill-red">CRITICAL LOW STOCK</span>` 
            : `<span class="pill pill-green">Stable Stock Buffer</span>`;
            
        row.innerHTML = `
            <td><strong>${inv.item}</strong></td>
            <td>${inv.category}</td>
            <td>${inv.qty} units available</td>
            <td>${allocationAlertFlag}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderFeedbackTable() {
    const tbody = document.getElementById('feedback-tbody');
    tbody.innerHTML = '';
    DB.Feedback.forEach(f => {
        let row = document.createElement('tr');
        row.innerHTML = `<td><strong>${f.guestName}</strong></td><td><span style="color:var(--alert-orange); font-weight:bold;">${f.score}</span></td><td><small>"${f.notes}"</small></td>`;
        tbody.appendChild(row);
    });
}

// --------------------------------------------------------
// DATA RECORD TRANSACTION SUBSYSTEM MUTATIONS (FORM SUBMITS)
// --------------------------------------------------------

// Front-Desk Checkout & Invoice Generation Engine Transaction Lifecycle
function processCheckoutExecution(bookingId) {
    if(currentRole !== 'Manager' && currentRole !== 'Receptionist') {
        alert("Security Error: Access Privilege Restricted for Check-Out execution layers.");
        return;
    }
    
    const activeBookingIndex = DB.Bookings.findIndex(b => b.bookingId === bookingId);
    if(activeBookingIndex === -1) return;
    
    const targetedBookingObj = DB.Bookings[activeBookingIndex];
    const targetRoomObj = DB.Rooms.find(r => r.roomNumber === targetedBookingObj.roomNumber);
    const roomTypeObj = DB.RoomTypes.find(t => t.id === targetRoomObj.roomTypeId);
    
    const totalNightsStayCost = roomTypeObj ? roomTypeObj.price : 100;
    const finalBalanceDueInvoice = totalNightsStayCost - targetedBookingObj.advancePaid;
    
    if(confirm(`Generate Invoice Summary for ${bookingId}?\nTotal Stay Base Cost: $${totalNightsStayCost}\nDeposit Subtracted: $${targetedBookingObj.advancePaid}\nOutstanding Settlement Collected: $${finalBalanceDueInvoice}`)) {
        
        // State mutation sequences
        targetedBookingObj.status = 'Archived Out';
        if(targetRoomObj) {
            targetRoomObj.occupancyStatus = 'Available';
            targetRoomObj.cleaningStatus = 'Dirty'; // Forces housekeeping scheduling workflow alert
        }
        
        // Push record instances to tracking logs databases tables
        DB.Checkouts.push({ checkoutId: 'CO-' + Date.now(), bookingId: bookingId, exitTimestamp: new Date().toISOString() });
        DB.Payments.push({ transactionId: 'TXN-' + Math.floor(Math.random() * 100000), bookingId: bookingId, amount: finalBalanceDueInvoice, mechanism: 'Settlement Account', date: '2026-06-30' });
        
        // Generate automatic system feedback
        DB.Feedback.push({ guestName: 'Guest ' + bookingId, score: '5 Stars', notes: `Automated Checkout successful for Unit ${targetedBookingObj.roomNumber}. Saved cleanly.` });

        alert("Check-out invoice processed completely. Room flagged as DIRTY for Housekeeping dispatch.");
        refreshApplicationSystemViews();
    }
}

// Booking Registry Submit Action Handler
document.getElementById('reservation-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if(currentRole !== 'Manager' && currentRole !== 'Receptionist') {
        alert("Security Error: Insufficient operational privileges.");
        return;
    }

    const guestName = document.getElementById('res-guest-name').value;
    const guestIdDoc = document.getElementById('res-guest-id').value;
    const targetRoomNum = parseInt(document.getElementById('res-room-number').value);
    const method = document.getElementById('res-payment-method').value;
    const depositAmount = parseFloat(document.getElementById('res-deposit').value) || 0;

    if(!targetRoomNum) {
        alert("Allocation Fault: Please provision or clean a room asset matching classification specifications.");
        return;
    }

    // Transform tables pipelines keys mapping
    const trackingUuid = 'G-' + (Math.floor(Math.random() * 9000) + 1000);
    const freshBookingReferenceKey = 'BK-' + (Math.floor(Math.random() * 9000) + 1000);

    // Save changes to state array engines
    DB.Guests.push({ uuid: trackingUuid, name: guestName, identityDoc: guestIdDoc, logHistory: `Checked In Room ${targetRoomNum}` });
    DB.Bookings.push({ bookingId: freshBookingReferenceKey, guestId: trackingUuid, roomNumber: targetRoomNum, status: 'Active Occupancy', advancePaid: depositAmount });
    DB.Payments.push({ transactionId: 'TXN-' + Date.now(), bookingId: freshBookingReferenceKey, amount: depositAmount, mechanism: method, date: '2026-06-30' });

    let matchingRoomInstance = DB.Rooms.find(r => r.roomNumber === targetRoomNum);
    if(matchingRoomInstance) matchingRoomInstance.occupancyStatus = 'Occupied';

    alert(`Reservation Form Engine Confirmed successfully!\nBooking Reference Code: ${freshBookingReferenceKey}\nRoom Allocation assigned: ${targetRoomNum}`);
    document.getElementById('reservation-form').reset();
    populateStaticFormSelectors();
    refreshApplicationSystemViews();
});

// Structural Infrastructure Blueprint Additions Handler
document.getElementById('room-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const rmNo = parseInt(document.getElementById('rm-number').value);
    const rmType = document.getElementById('rm-type').value;

    if(DB.Rooms.some(r => r.roomNumber === rmNo)) {
        alert("Validation Collision Fault: Room configuration identity number parameters exist.");
        return;
    }

    DB.Rooms.push({ roomNumber: rmNo, roomTypeId: rmType, occupancyStatus: 'Available', cleaningStatus: 'Clean', maintenanceStatus: 'Operational' });
    alert(`Asset Matrix Instance ${rmNo} linked successfully.`);
    document.getElementById('room-form').reset();
    populateStaticFormSelectors();
    refreshApplicationSystemViews();
});

// Engineering System Maintenance Form Requests Handler
document.getElementById('maint-issue-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const loc = parseInt(document.getElementById('maint-location').value);
    const issue = document.getElementById('maint-desc').value;

    let matchRoom = DB.Rooms.find(r => r.roomNumber === loc);
    if(matchRoom) matchRoom.maintenanceStatus = 'Under Maintenance';

    DB.MaintenanceLog.push({ id: Math.floor(Math.random()*1000)+500, roomNumber: loc, issueText: issue, status: 'Dispatched Ticket Open' });
    alert("Engineering work-order successfully queued into plant tracking schemas.");
    document.getElementById('maint-issue-form').reset();
    refreshApplicationSystemViews();
});

// Onboard Staff Form Submit Handler
document.getElementById('employee-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('emp-name').value;
    const role = document.getElementById('emp-role').value;
    const standardSal = parseFloat(document.getElementById('emp-salary').value) || 2000;
    const uid = Math.floor(Math.random() * 9000) + 1000;

    DB.Employees.push({ id: uid, name: name, role: role, salary: standardSal, contact: `${name.toLowerCase().replace(' ', '')}@booknest.com`, schedule: 'Flex Shift Allocation' });
    alert(`Staff Onboarded Completely under Reference Node identity key: EMP-${uid}`);
    document.getElementById('employee-form').reset();
    refreshApplicationSystemViews();
});

// Logistics Replenishment Submissions Handler
document.getElementById('inventory-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const item = document.getElementById('inv-name').value;
    const cat = document.getElementById('inv-category').value;
    const count = parseInt(document.getElementById('inv-qty').value);

    let matchInv = DB.Inventory.find(i => i.item.toLowerCase() === item.toLowerCase());
    if(matchInv) {
        matchInv.qty += count;
    } else {
        DB.Inventory.push({ item: item, category: cat, qty: count, minAlert: 10 });
    }
    alert("Logistics system stock metrics adjusted safely.");
    document.getElementById('inventory-form').reset();
    refreshApplicationSystemViews();
});

// Inline Quick Update Callback Actions Handler Tasks
function updateRoomCleaningState(roomNo, statusValue) {
    if(!statusValue) return;
    let target = DB.Rooms.find(r => r.roomNumber === roomNo);
    if(target) {
        target.cleaningStatus = statusValue;
        refreshApplicationSystemViews();
    }
}

function resolveMaintenanceTicket(ticketId) {
    let ticket = DB.MaintenanceLog.find(t => t.id === ticketId);
    if(ticket) {
        ticket.status = 'Resolved & Operational';
        let rm = DB.Rooms.find(r => r.roomNumber === ticket.roomNumber);
        if(rm) rm.maintenanceStatus = 'Operational';
        alert(`Ticket ${ticketId} cleared out cleanly.`);
        refreshApplicationSystemViews();
    }
}

function triggerEmployeeClockPunch(empId) {
    DB.Attendance.push({ empId: empId, date: '2026-06-30', status: `Clock-Punch Verified at ${new Date().toLocaleTimeString()}` });
    alert(`Biometric confirmation stamp logged successfully for staff node EMP-${empId}.`);
    refreshApplicationSystemViews();
}

// --------------------------------------------------------
// ENTERPRISE REPORTING ENGINE COMPUTATION TERMINAL ALGORITHMS
// --------------------------------------------------------
function generateReport(reportTypeKey) {
    const outputTerminal = document.getElementById('report-terminal-output');
    let str = `=== BOOKNEST EXECUTIVE MANAGEMENT ENGINE INTELLIGENCE REPORT [${reportTypeKey.toUpperCase()}] ===\n`;
    str += `Timestamp Generated: ${new Date().toISOString()}\n`;
    str += `---------------------------------------------------------------------------------\n`;

    if(reportTypeKey === 'daily') {
        str += `Current Physical Assets Registered Inventory: ${DB.Rooms.length} Rooms Configured.\n`;
        str += `Active Guest Rental Rooms Lease Holds: ${DB.Bookings.filter(b => b.status === 'Active Occupancy').length} occupied units.\n`;
        str += `Housekeeping Backlogs Tracker: ${DB.Rooms.filter(r => r.cleaningStatus === 'Dirty').length} critical rooms awaiting cleanup.\n`;
        str += `Biometric Punch Clock Attendance Active Roll Call: ${DB.Attendance.length} employees checked in today.\n`;
    } 
    else if(reportTypeKey === 'revenue') {
        let paymentsCount = DB.Payments.length;
        let ledgerTotalSum = DB.Payments.reduce((s, p) => s + p.amount, 0);
        str += `Transaction Ledgers Count Processed: ${paymentsCount} unique settlements.\n`;
        str += `Gross Combined Cash Flow Intake Volume: $${ledgerTotalSum.toFixed(2)}\n\n`;
        str += `Breakdown Log History Rows Output:\n`;
        DB.Payments.forEach((p, idx) => {
            str += `  [${idx+1}] ID: ${p.transactionId} -> Ref: ${p.bookingId} | Val: $${p.amount} via [${p.mechanism}]\n`;
        });
    } 
    else if(reportTypeKey === 'inventory') {
        str += `Scanning logistics for supply levels below set minimal alert buffers:\n\n`;
        let riskLinesFound = 0;
        DB.Inventory.forEach(i => {
            if(i.qty <= i.minAlert) {
                str += `  !! DEPLETED WARNING !! Class [${i.category}] - Item: "${i.item}" | Stock: ${i.qty} units left (Min safety rule: ${i.minAlert})\n`;
                riskLinesFound++;
            }
        });
        if(riskLinesFound === 0) str += `  >> All inventory buffers conform within optimal enterprise safe zones. No supply disruptions detected. <<\n`;
    }

    str += `---------------------------------------------------------------------------------\n`;
    str += `=== END OF LINE SYSTEM INTEGRITY DATA PACKET SECURE ===`;
    outputTerminal.textContent = str;
}