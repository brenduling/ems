/**
 * Event Management System (EMS) - Antigravity Dashboard Logic
 * Organized into strict modular sections.
 */

// ====================================================
// 1. CONFIGURATION
// ====================================================

const CONFIG = {
    // Default hardcoded values can go here, or be loaded from localStorage
    STORAGE_KEYS: {
        API_KEY: 'ems_jsonbin_api_key',
        BIN_ID: 'ems_jsonbin_bin_id',
        IS_DEMO: 'ems_jsonbin_is_demo',
        LAST_SYNC: 'ems_last_sync_signal',
        ADMIN_PASSWORD: 'ems_admin_password'
    },
    // Seed Database for Demo / Mock mode
    MOCK_DB: {
        events: [
            {
                id: "EVT001",
                name: "Monkey Typing",
                category: "IT Games",
                description: "An intense speed typing competition where participant accuracy and speed are put to the test using custom layouts.",
                venue: "Laboratory A",
                status: "Active",
                logo: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=150&auto=format&fit=crop&q=80",
                multipleSchedules: [
                    { date: "2026-08-01", start: "08:00", end: "10:00" },
                    { date: "2026-08-02", start: "09:00", end: "11:00" }
                ],
                facilitators: ["John", "Mary"],
                advisers: ["Mr. Cruz", "Engr. Santos"],
                createdAt: "2026-07-20T10:00:00Z",
                updatedAt: "2026-07-23T06:00:00Z"
            },
            {
                id: "EVT002",
                name: "Web Design Derby",
                category: "IT Games",
                description: "A fast-paced UI/UX design and frontend coding hackathon using Vanilla CSS and HTML5 structures.",
                venue: "Laboratory B",
                status: "Active",
                logo: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150&auto=format&fit=crop&q=80",
                multipleSchedules: [
                    { date: "2026-08-03", start: "13:00", end: "16:00" }
                ],
                facilitators: ["Mary", "Alex"],
                advisers: ["Mr. Cruz", "Dr. Ramos"],
                createdAt: "2026-07-21T09:00:00Z",
                updatedAt: "2026-07-23T06:10:00Z"
            },
            {
                id: "EVT003",
                name: "Algorithms Challenge",
                category: "IT Games",
                description: "Solve complex programming challenges and algorithms under strict memory and runtime limits.",
                venue: "Laboratory A",
                status: "Completed",
                logo: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=150&auto=format&fit=crop&q=80",
                multipleSchedules: [
                    { date: "2026-07-20", start: "10:00", end: "12:00" }
                ],
                facilitators: ["David"],
                advisers: ["Engr. Santos"],
                createdAt: "2026-07-19T08:00:00Z",
                updatedAt: "2026-07-20T12:00:00Z"
            }
        ],
        participants: [
            {
                id: "PAR001",
                name: "Myke Reyes",
                batch: "Beta",
                course: "BSIT",
                yearLevel: "4",
                profile: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
            },
            {
                id: "PAR002",
                name: "Lovelace Martinez",
                batch: "Alpha",
                course: "BSIT",
                yearLevel: "3",
                profile: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
            },
            {
                id: "PAR003",
                name: "Alan Turing",
                batch: "Beta",
                course: "BSIT",
                yearLevel: "2",
                profile: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80"
            },
            {
                id: "PAR004",
                name: "Grace Hopper",
                batch: "Gamma",
                course: "BSIT",
                yearLevel: "4",
                profile: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
            }
        ],
        registrations: [
            { id: "REG001", eventId: "EVT001", participantId: "PAR001" },
            { id: "REG002", eventId: "EVT002", participantId: "PAR001" },
            { id: "REG003", eventId: "EVT001", participantId: "PAR003" },
            { id: "REG004", eventId: "EVT003", participantId: "PAR002" }
        ],
        batches: [
            { id: "BAT001", name: "Beta", yearLevel: "4", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80" },
            { id: "BAT002", name: "Alpha", yearLevel: "3", logo: "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=150&auto=format&fit=crop&q=80" },
            { id: "BAT003", name: "Gamma", yearLevel: "2", logo: "https://images.unsplash.com/photo-1618005134738-7023f93c9d80?w=150&auto=format&fit=crop&q=80" }
        ],
        facilitators: ["John", "Mary", "Alex", "David", "Sarah"],
        advisers: ["Mr. Cruz", "Engr. Santos", "Dr. Ramos", "Prof. Diaz"]
    }
};

// Application State
const state = {
    activeTab: 'dashboard',
    role: 'client', // 'admin' or 'client' — defaults to client, requires password for admin
    db: {
        events: [],
        participants: [],
        registrations: [],
        batches: [],
        facilitators: [],
        advisers: []
    },
    config: {
        apiKey: '$2a$10$Tro6Ud5UHq2VqKQnp8Kxo.1MFLWorIUvmpahlY7t9jqDPWr0Xg2em',
        binId: '6a615478da38895dfe81c143',
        isDemo: false,
        // isDemo: true
        adminPassword: 'admin123' // Default admin password, changeable in Settings
    }
};

// Form editing states (multiple values trackers)
let editingSchedules = [];
let editingFacilitators = [];
let editingAdvisers = [];
let currentConfirmCallback = null;
let syncPollTimer = null;
let lastRemoteSnapshot = '';

// ====================================================
// 2. API (JSONBin.io Integration)
// ====================================================

const api = {
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Master-Key': state.config.apiKey
        };
    },

    async testConnection(apiKey, binId) {
        ui.showLoading("Testing connection to JSONBin...");
        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': apiKey
                }
            });
            if (!res.ok) throw new Error("Verification failed. Check credentials.");
            const data = await res.json();
            return { success: true, data: data.record };
        } catch (err) {
            console.error(err);
            return { success: false, error: err.message };
        } finally {
            ui.hideLoading();
        }
    },

    async createNewBin(apiKey) {
        ui.showLoading("Provisioning new JSONBin...");
        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey,
                    'X-Bin-Private': 'true',
                    'X-Bin-Name': 'ems_database'
                },
                body: JSON.stringify(CONFIG.MOCK_DB)
            });
            if (!res.ok) throw new Error("Failed to create new bin. Make sure API key is correct.");
            const data = await res.json();
            return { success: true, binId: data.metadata.id };
        } catch (err) {
            console.error(err);
            return { success: false, error: err.message };
        } finally {
            ui.hideLoading();
        }
    },

    async loadDatabase() {
        if (state.config.isDemo) {
            state.db = JSON.parse(localStorage.getItem('ems_local_db')) || JSON.parse(JSON.stringify(CONFIG.MOCK_DB));
            this.ensureSchema();
            lastRemoteSnapshot = JSON.stringify(state.db);
            return;
        }

        ui.showLoading("Syncing database from JSONBin.io...");
        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b/${state.config.binId}/latest`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!res.ok) throw new Error("Failed to load database bin.");
            const payload = await res.json();
            state.db = payload.record;
            this.ensureSchema();
            lastRemoteSnapshot = JSON.stringify(state.db);
        } catch (err) {
            console.error(err);
            ui.showToast("Sync failed. Operating in offline/demo mode.", "danger");
            state.config.isDemo = true;
            state.db = JSON.parse(localStorage.getItem('ems_local_db')) || JSON.parse(JSON.stringify(CONFIG.MOCK_DB));
            this.ensureSchema();
            lastRemoteSnapshot = JSON.stringify(state.db);
        } finally {
            ui.hideLoading();
        }
    },

    async saveDatabase() {
        this.ensureSchema();
        // Backup locally to simulate save persistence even in demo mode
        localStorage.setItem('ems_local_db', JSON.stringify(state.db));
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_SYNC, String(Date.now()));

        if (state.config.isDemo) {
            ui.showToast("Changes saved to local memory", "warning");
            app.router(state.activeTab); // Re-render view
            return;
        }

        ui.showLoading("Syncing database with JSONBin.io...");
        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b/${state.config.binId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(state.db)
            });
            if (!res.ok) throw new Error("Sync failed.");
            lastRemoteSnapshot = JSON.stringify(state.db);
            ui.showToast("Synchronized with cloud server successfully", "success");
            app.router(state.activeTab); // Re-render view
        } catch (err) {
            console.error(err);
            ui.showToast("Cloud sync failed. Operating locally.", "danger");
            app.router(state.activeTab); // Re-render view
        } finally {
            ui.hideLoading();
        }
    },

    async refreshFromServer({ silent = true } = {}) {
        if (state.config.isDemo || !state.config.apiKey || !state.config.binId) return;

        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b/${state.config.binId}/latest`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!res.ok) throw new Error("Failed to refresh database.");

            const payload = await res.json();
            const incomingDb = payload.record || {};
            const incomingSnapshot = JSON.stringify(incomingDb);

            if (incomingSnapshot && incomingSnapshot !== lastRemoteSnapshot) {
                state.db = incomingDb;
                this.ensureSchema();
                lastRemoteSnapshot = JSON.stringify(state.db);
                localStorage.setItem('ems_local_db', JSON.stringify(state.db));
                ui.renderActiveTab();
                ui.showToast("New shared updates loaded.", "success");
            }
        } catch (err) {
            console.error(err);
            if (!silent) {
                ui.showToast("Could not refresh shared updates.", "danger");
            }
        }
    },

    ensureSchema() {
        const required = ["events", "participants", "registrations", "batches", "facilitators", "advisers"];
        if (!state.db || typeof state.db !== 'object') {
            state.db = {};
        }
        required.forEach(key => {
            if (!Array.isArray(state.db[key])) {
                state.db[key] = [];
            }
        });
        // Seed lists of facilitators/advisers dynamically if empty
        if (state.db.facilitators.length === 0) {
            state.db.facilitators = ["John", "Mary", "Alex", "David", "Sarah"];
        }
        if (state.db.advisers.length === 0) {
            state.db.advisers = ["Mr. Cruz", "Engr. Santos", "Dr. Ramos", "Prof. Diaz"];
        }
        state.db.batches.forEach((batch, index) => {
            if (!batch.yearLevel) {
                batch.yearLevel = String(((index % 4) + 1));
            }
        });
        state.db.participants.forEach(participant => {
            const batch = state.db.batches.find(b => b.name.toLowerCase() === String(participant.batch || '').toLowerCase());
            participant.course = "BSIT";
            participant.yearLevel = batch?.yearLevel || participant.yearLevel || "";
        });
    }
};

// ====================================================
// 3. UTILITIES
// ====================================================

const utils = {
    generateId(prefix, list) {
        if (!list || list.length === 0) return `${prefix}001`;
        const numericIds = list
            .map(item => {
                const parts = item.id.substring(prefix.length);
                return parseInt(parts, 10);
            })
            .filter(num => !isNaN(num));
        const max = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        return `${prefix}${String(max + 1).padStart(3, '0')}`;
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    },

    formatYearLevel(yearLevel) {
        const labels = {
            "1": "1st Year",
            "2": "2nd Year",
            "3": "3rd Year",
            "4": "4th Year"
        };
        return labels[String(yearLevel)] || "Unassigned Year";
    },

    getBatchYearLevel(batchName) {
        const batch = state.db.batches.find(b => b.name.toLowerCase() === String(batchName || '').toLowerCase());
        return batch?.yearLevel || "";
    },

    getInitials(name) {
        if (!name) return '??';
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    getNextSchedule(eventObj) {
        if (!eventObj.multipleSchedules || eventObj.multipleSchedules.length === 0) return null;
        const now = new Date();
        const futureSchedules = eventObj.multipleSchedules
            .map(s => ({ ...s, fullDate: new Date(`${s.date}T${s.start}`) }))
            .filter(s => s.fullDate >= now)
            .sort((a, b) => a.fullDate - b.fullDate);
        return futureSchedules.length > 0 ? futureSchedules[0] : eventObj.multipleSchedules[0];
    },

    getSvg(name) {
        const svgMap = {
            plus: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
            trash: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
            pencil: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
            duplicate: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>`,
            archive: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>`,
            restore: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" /></svg>`,
            calendar: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
            map: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
            users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`,
            search: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`,
            tag: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
            empty: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>`,
            link: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>`
        };
        return svgMap[name] || '';
    }
};

// ====================================================
// 4. RENDERING (UI Engine)
// ====================================================

const ui = {
    renderActiveTab() {
        const titleMap = {
            dashboard: 'Dashboard Overview',
            events: 'Events Console',
            participants: 'Participants Directory',
            registrations: 'Event Registrations',
            search: 'Universal Search Hub',
            reports: 'Analytics & Reports',
            settings: 'System Settings'
        };

        // Enforce role-based routing constraints
        const adminTabs = ['settings'];
        if (state.role === 'client') {
            // Hide admin sidebar links
            document.querySelectorAll('#sidebar .nav-item').forEach(item => {
                const tab = item.getAttribute('data-tab');
                if (adminTabs.includes(tab)) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
            });
            // Redirect to dashboard if trying to access admin tabs
            if (adminTabs.includes(state.activeTab)) {
                state.activeTab = 'dashboard';
            }
        } else {
            // Show all tabs
            document.querySelectorAll('#sidebar .nav-item').forEach(item => {
                item.style.display = 'flex';
            });
        }

        // Update profile visual display based on role
        const avatarBlock = document.getElementById('profile-avatar-char');
        const nameBlock = document.getElementById('profile-display-name');
        const roleBlock = document.getElementById('profile-display-role');
        const profileBlock = document.getElementById('profile-block');
        const roleDropdown = document.getElementById('role-selector-dropdown');
        
        // Match dropdown value
        if (roleDropdown) {
            roleDropdown.value = state.role;
        }

        if (state.role === 'client') {
            avatarBlock.textContent = 'CV';
            nameBlock.textContent = 'Client Visitor';
            roleBlock.textContent = 'Guest Attendee';
            profileBlock.style.pointerEvents = 'none'; // Disable Settings page click
        } else {
            avatarBlock.textContent = 'SA';
            nameBlock.textContent = 'System Admin';
            roleBlock.textContent = 'EMS Manager';
            profileBlock.style.pointerEvents = 'auto';
        }

        // Show/hide admin lock button
        const lockBtn = document.getElementById('admin-lock-btn');
        if (lockBtn) {
            lockBtn.style.display = state.role === 'admin' ? 'inline-flex' : 'none';
        }

        // Update nav title
        document.getElementById('page-title').textContent = titleMap[state.activeTab] || 'Dashboard';

        // Update sidebar visual active link
        document.querySelectorAll('#sidebar .nav-item').forEach(item => {
            if (item.getAttribute('data-tab') === state.activeTab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide sidebar menu on mobile after navigation
        document.getElementById('sidebar').classList.remove('open');

        // Toggle Demo Banner
        document.getElementById('demo-banner').style.display = (state.config.isDemo && state.role === 'admin') ? 'block' : 'none';

        // Load specific renderer
        const container = document.getElementById('main-content');
        container.innerHTML = ''; // Clear container

        switch (state.activeTab) {
            case 'dashboard':
                dashboard.render(container);
                break;
            case 'events':
                events.render(container);
                break;
            case 'participants':
                participants.render(container);
                break;
            case 'registrations':
                registrations.render(container);
                break;
            case 'search':
                search.render(container);
                break;
            case 'reports':
                reports.render(container);
                break;
            case 'settings':
                settings.render(container);
                break;
            default:
                dashboard.render(container);
        }
    },

    openModal(modalId) {
        const overlay = document.getElementById(modalId);
        if (overlay) {
            overlay.classList.add('open');
        }
    },

    closeModal(modalId) {
        const overlay = document.getElementById(modalId);
        if (overlay) {
            overlay.classList.remove('open');
        }
    },

    showConfirm(title, message, callback) {
        document.getElementById('confirm-modal-title').textContent = title;
        document.getElementById('confirm-modal-message').textContent = message;
        currentConfirmCallback = callback;
        this.openModal('confirm-modal');
    },

    closeConfirm(confirmed) {
        this.closeModal('confirm-modal');
        if (currentConfirmCallback) {
            currentConfirmCallback(confirmed);
            currentConfirmCallback = null;
        }
    },

    showLoading(text = "Synchronizing...") {
        document.getElementById('loading-text').textContent = text;
        document.getElementById('loading-overlay').classList.add('active');
    },

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    },

    showToast(message, type = "success") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconColorClass = 'success';
        if (type === 'danger') iconColorClass = 'danger';
        if (type === 'warning') iconColorClass = 'warning';

        // Determine icon name
        const iconSvg = type === 'success' ?
            `<svg class="toast-icon success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` :
            (type === 'danger' ?
                `<svg class="toast-icon danger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` :
                `<svg class="toast-icon warning" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`);

        toast.innerHTML = `
            ${iconSvg}
            <span style="font-size: 0.9rem; font-weight: 500;">${utils.escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        // Trigger show slide in
        setTimeout(() => toast.classList.add('show'), 10);

        // Hide and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    renderEmptyState(title, text) {
        return `
            <div class="empty-state">
                ${utils.getSvg('empty')}
                <div class="empty-state-title">${title}</div>
                <p style="font-size: 0.875rem;">${text}</p>
            </div>
        `;
    }
};

// ====================================================
// 5. CRUD OPERATIONS
// ====================================================

const crud = {
    requireAdmin() {
        if (state.role !== 'admin') {
            ui.showToast("Client view is read-only.", "warning");
            return false;
        }
        return true;
    },

    // EVENTS CRUD
    handleEventSubmit(e) {
        e.preventDefault();
        if (!this.requireAdmin()) return;

        const mode = document.getElementById('event-form-mode').value;
        const eventId = document.getElementById('event-id').value;

        // Validate schedule count
        if (editingSchedules.length === 0) {
            ui.showToast("An event must have at least one schedule.", "danger");
            return;
        }

        // Get and validate dates
        const schedules = [];
        const rowElements = document.querySelectorAll('.schedule-row');
        let valid = true;

        rowElements.forEach(row => {
            const dateInput = row.querySelector('.schedule-date');
            const startInput = row.querySelector('.schedule-start');
            const endInput = row.querySelector('.schedule-end');

            if (!dateInput.value || !startInput.value || !endInput.value) {
                valid = false;
                return;
            }

            schedules.push({
                date: dateInput.value,
                start: startInput.value,
                end: endInput.value
            });
        });

        if (!valid) {
            ui.showToast("All schedule inputs must be completely filled.", "danger");
            return;
        }

        const newEvent = {
            id: mode === 'create' ? utils.generateId('EVT', state.db.events) : eventId,
            name: document.getElementById('event-name').value.trim(),
            category: document.getElementById('event-category').value.trim(),
            description: document.getElementById('event-description').value.trim(),
            venue: document.getElementById('event-venue').value.trim(),
            status: document.getElementById('event-status').value,
            logo: document.getElementById('event-logo').value.trim(),
            multipleSchedules: schedules,
            facilitators: [...editingFacilitators],
            advisers: [...editingAdvisers],
            createdAt: mode === 'create' ? new Date().toISOString() : (state.db.events.find(evt => evt.id === eventId)?.createdAt || new Date().toISOString()),
            updatedAt: new Date().toISOString()
        };

        if (mode === 'create') {
            state.db.events.push(newEvent);
            ui.showToast(`Event ${newEvent.name} created successfully!`, "success");
        } else {
            const idx = state.db.events.findIndex(evt => evt.id === eventId);
            if (idx !== -1) {
                state.db.events[idx] = newEvent;
                ui.showToast(`Event ${newEvent.name} updated successfully!`, "success");
            }
        }

        // Append input strings to global pools if they are not already there
        newEvent.facilitators.forEach(f => {
            if (!state.db.facilitators.includes(f)) state.db.facilitators.push(f);
        });
        newEvent.advisers.forEach(a => {
            if (!state.db.advisers.includes(a)) state.db.advisers.push(a);
        });

        ui.closeModal('event-modal');
        api.saveDatabase();
    },

    addScheduleRow(date = '', start = '', end = '') {
        const container = document.getElementById('schedule-rows-container');
        const rowId = 'sched_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const row = document.createElement('div');
        row.className = 'schedule-row';
        row.id = rowId;
        row.innerHTML = `
            <input type="date" class="form-control schedule-date" value="${date}" required>
            <input type="time" class="form-control schedule-start" value="${start}" required>
            <input type="time" class="form-control schedule-end" value="${end}" required>
            <button type="button" class="btn btn-secondary btn-icon-only" onclick="crud.removeScheduleRow('${rowId}')" style="color: var(--danger);">
                ${utils.getSvg('trash')}
            </button>
        `;
        container.appendChild(row);
        editingSchedules.push(rowId);
    },

    removeScheduleRow(rowId) {
        const row = document.getElementById(rowId);
        if (row) {
            row.remove();
            editingSchedules = editingSchedules.filter(id => id !== rowId);
        }
    },

    renderFacilitatorsChips() {
        const container = document.getElementById('event-facilitators-chips');
        container.innerHTML = editingFacilitators.map((f, idx) => `
            <div class="picker-chip">
                <span>${utils.escapeHtml(f)}</span>
                <button type="button" onclick="crud.removeFacilitator(${idx})">&times;</button>
            </div>
        `).join('') || `<span style="font-size: 0.8rem; color: var(--text-muted); padding: 0.25rem;">No facilitators added</span>`;
    },

    addFacilitatorFromInput() {
        const input = document.getElementById('facilitator-input');
        const val = input.value.trim();
        if (val) {
            if (!editingFacilitators.includes(val)) {
                editingFacilitators.push(val);
                this.renderFacilitatorsChips();
            }
            input.value = '';
        }
    },

    removeFacilitator(idx) {
        editingFacilitators.splice(idx, 1);
        this.renderFacilitatorsChips();
    },

    renderAdvisersChips() {
        const container = document.getElementById('event-advisers-chips');
        container.innerHTML = editingAdvisers.map((a, idx) => `
            <div class="picker-chip">
                <span>${utils.escapeHtml(a)}</span>
                <button type="button" onclick="crud.removeAdviser(${idx})">&times;</button>
            </div>
        `).join('') || `<span style="font-size: 0.8rem; color: var(--text-muted); padding: 0.25rem;">No advisers added</span>`;
    },

    addAdviserFromInput() {
        const input = document.getElementById('adviser-input');
        const val = input.value.trim();
        if (val) {
            if (!editingAdvisers.includes(val)) {
                editingAdvisers.push(val);
                this.renderAdvisersChips();
            }
            input.value = '';
        }
    },

    removeAdviser(idx) {
        editingAdvisers.splice(idx, 1);
        this.renderAdvisersChips();
    },

    duplicateEvent(eventId) {
        if (!this.requireAdmin()) return;
        const original = state.db.events.find(evt => evt.id === eventId);
        if (!original) return;

        const newId = utils.generateId('EVT', state.db.events);
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = newId;
        copy.name = `${copy.name} (Copy)`;
        copy.createdAt = new Date().toISOString();
        copy.updatedAt = new Date().toISOString();

        state.db.events.push(copy);
        ui.showToast(`Duplicated into ${copy.name}!`, "success");
        api.saveDatabase();
    },

    archiveRestoreEvent(eventId) {
        if (!this.requireAdmin()) return;
        const eventObj = state.db.events.find(evt => evt.id === eventId);
        if (!eventObj) return;

        if (eventObj.status === 'Active') {
            eventObj.status = 'Inactive';
            ui.showToast(`Archived event ${eventObj.name}.`, "success");
        } else {
            eventObj.status = 'Active';
            ui.showToast(`Restored event ${eventObj.name}!`, "success");
        }
        eventObj.updatedAt = new Date().toISOString();
        api.saveDatabase();
    },

    deleteEvent(eventId) {
        if (!this.requireAdmin()) return;
        const eventObj = state.db.events.find(evt => evt.id === eventId);
        if (!eventObj) return;

        ui.showConfirm(
            "Delete Event",
            `Are you sure you want to permanently delete event "${eventObj.name}"? This will also purge its registrations.`,
            (confirmed) => {
                if (confirmed) {
                    state.db.events = state.db.events.filter(evt => evt.id !== eventId);
                    state.db.registrations = state.db.registrations.filter(reg => reg.eventId !== eventId);
                    ui.showToast(`Event deleted successfully.`, "success");
                    api.saveDatabase();
                }
            }
        );
    },

    // PARTICIPANTS CRUD
    handleParticipantSubmit(e) {
        e.preventDefault();
        if (!this.requireAdmin()) return;

        const mode = document.getElementById('participant-form-mode').value;
        const participantId = document.getElementById('participant-id').value;
        const selectedBatch = document.getElementById('participant-batch').value;
        const selectedEventId = document.getElementById('participant-event')?.value || "";
        const yearLevel = utils.getBatchYearLevel(selectedBatch);

        if (!selectedBatch || !yearLevel) {
            ui.showToast("Choose a batch with an assigned year level.", "danger");
            return;
        }

        if (mode === 'create' && !selectedEventId) {
            ui.showToast("Choose an active event to register this participant.", "danger");
            return;
        }

        const newParticipant = {
            id: mode === 'create' ? utils.generateId('PAR', state.db.participants) : participantId,
            name: document.getElementById('participant-name').value.trim(),
            batch: selectedBatch,
            course: "BSIT",
            yearLevel: yearLevel,
            profile: document.getElementById('participant-profile').value.trim()
        };

        if (mode === 'create') {
            state.db.participants.push(newParticipant);
            const alreadyRegistered = state.db.registrations.some(r => r.eventId === selectedEventId && r.participantId === newParticipant.id);
            if (!alreadyRegistered) {
                state.db.registrations.push({
                    id: utils.generateId('REG', state.db.registrations),
                    eventId: selectedEventId,
                    participantId: newParticipant.id
                });
            }
            const eventObj = state.db.events.find(evt => evt.id === selectedEventId);
            ui.showToast(`${newParticipant.name} added and registered to ${eventObj?.name || 'the selected event'}.`, "success");
        } else {
            const idx = state.db.participants.findIndex(p => p.id === participantId);
            if (idx !== -1) {
                state.db.participants[idx] = newParticipant;
                ui.showToast(`Participant ${newParticipant.name} updated!`, "success");
            }
        }

        ui.closeModal('participant-modal');
        api.saveDatabase();
    },

    deleteParticipant(participantId) {
        if (!this.requireAdmin()) return;
        const pObj = state.db.participants.find(p => p.id === participantId);
        if (!pObj) return;

        ui.showConfirm(
            "Delete Participant",
            `Are you sure you want to delete ${pObj.name}? All registrations for this participant will be purged.`,
            (confirmed) => {
                if (confirmed) {
                    state.db.participants = state.db.participants.filter(p => p.id !== participantId);
                    state.db.registrations = state.db.registrations.filter(reg => reg.participantId !== participantId);
                    ui.showToast("Participant deleted successfully.", "success");
                    api.saveDatabase();
                }
            }
        );
    },

    // BATCH CRUD (Settings layer helper)
    handleBatchSubmit(e) {
        e.preventDefault();
        if (!this.requireAdmin()) return;
        const batchName = document.getElementById('batch-name').value.trim();
        const batchYear = document.getElementById('batch-year').value;
        const batchLogo = document.getElementById('batch-logo').value.trim();

        if (!batchYear) {
            ui.showToast("Assign a year level to this batch.", "danger");
            return;
        }

        // Prevent duplicate batch names
        if (state.db.batches.some(b => b.name.toLowerCase() === batchName.toLowerCase())) {
            ui.showToast(`Batch "${batchName}" already exists!`, "danger");
            return;
        }

        const newBatch = {
            id: utils.generateId('BAT', state.db.batches),
            name: batchName,
            yearLevel: batchYear,
            logo: batchLogo
        };

        state.db.batches.push(newBatch);
        ui.showToast(`Batch ${batchName} added successfully!`, "success");
        e.target.reset();
        ui.closeModal('batch-modal');
        api.saveDatabase();
    },

    deleteBatch(batchId) {
        if (!this.requireAdmin()) return;
        const batchObj = state.db.batches.find(b => b.id === batchId);
        if (!batchObj) return;

        // Check if there are participants assigned to this batch
        const count = state.db.participants.filter(p => p.batch === batchObj.name).length;
        if (count > 0) {
            ui.showToast(`Cannot delete Batch "${batchObj.name}" as it contains ${count} participants. Reassign them first.`, "danger");
            return;
        }

        ui.showConfirm(
            "Delete Batch",
            `Are you sure you want to delete batch "${batchObj.name}"?`,
            (confirmed) => {
                if (confirmed) {
                    state.db.batches = state.db.batches.filter(b => b.id !== batchId);
                    ui.showToast("Batch deleted.", "success");
                    api.saveDatabase();
                }
            }
        );
    },

    // REGISTRATIONS CRUD
    handleRegistrationSubmit(e) {
        e.preventDefault();
        if (!this.requireAdmin()) return;
        const pId = document.getElementById('reg-participant-select').value;
        const eId = document.getElementById('reg-event-select').value;

        if (!pId || !eId) {
            ui.showToast("Please choose both a participant and an event.", "danger");
            return;
        }

        // Prevent duplicate registrations
        const exists = state.db.registrations.some(r => r.eventId === eId && r.participantId === pId);
        if (exists) {
            ui.showToast("Registration failure: Participant is already registered for this event!", "danger");
            return;
        }

        const newReg = {
            id: utils.generateId('REG', state.db.registrations),
            eventId: eId,
            participantId: pId
        };

        state.db.registrations.push(newReg);

        const pObj = state.db.participants.find(p => p.id === pId);
        const eObj = state.db.events.find(evt => evt.id === eId);
        ui.showToast(`Registered ${pObj?.name || 'Participant'} to ${eObj?.name || 'Event'} successfully!`, "success");

        ui.closeModal('registration-modal');
        api.saveDatabase();
    },

    deleteRegistration(regId) {
        if (!this.requireAdmin()) return;
        const regObj = state.db.registrations.find(r => r.id === regId);
        if (!regObj) return;

        const pObj = state.db.participants.find(p => p.id === regObj.participantId);
        const eObj = state.db.events.find(evt => evt.id === regObj.eventId);

        ui.showConfirm(
            "Cancel Registration",
            `Unregister ${pObj?.name || 'Participant'} from event "${eObj?.name || 'Event'}"?`,
            (confirmed) => {
                if (confirmed) {
                    state.db.registrations = state.db.registrations.filter(r => r.id !== regId);
                    ui.showToast("Registration cancelled.", "success");
                    api.saveDatabase();
                }
            }
        );
    }
};

// ====================================================
// 6. SEARCH ENGINE
// ====================================================

const search = {
    render(container) {
        container.innerHTML = `
            <div class="panel-card" style="gap: 1.5rem;">
                <div class="form-group" style="margin-bottom: 0.5rem;">
                    <label style="font-size: 1rem; font-weight: 700; color: var(--text-main);">Type key values to filter events, participants, batch listings, or venues</label>
                    <div class="input-icon-wrapper" style="margin-top: 0.5rem;">
                        ${utils.getSvg('search')}
                        <input type="text" id="universal-search-input" placeholder="Search events, participants, course, batch names (e.g. Monkey, Myke, Beta, Laboratory)..." style="padding: 0.85rem 1rem 0.85rem 2.75rem; font-size: 1rem;">
                    </div>
                </div>
                <div id="universal-search-results">
                    <!-- Loaded dynamically on typing -->
                </div>
            </div>
        `;

        const input = document.getElementById('universal-search-input');

        // Listen to inputs
        input.addEventListener('input', (e) => {
            this.executeSearch(e.target.value.trim());
        });

        // Trigger search if a query was preloaded
        if (app.preloadedSearchQuery) {
            input.value = app.preloadedSearchQuery;
            this.executeSearch(app.preloadedSearchQuery);
            app.preloadedSearchQuery = null; // Clear trigger
        } else {
            this.executeSearch('');
        }
    },

    executeSearch(query) {
        const resultsBox = document.getElementById('universal-search-results');
        if (!query) {
            resultsBox.innerHTML = ui.renderEmptyState("Start typing to search...", "Matches terms across events, schedules, venues, batches, rosters, and participants");
            return;
        }

        const lq = query.toLowerCase();

        // 1. Check for specific literal matching behaviors
        // A. Event queries (e.g. "Monkey") -> matching event profiles, schedules, venue, facilitators, advisers, registered participants
        const eventMatches = state.db.events.filter(e =>
            e.name.toLowerCase().includes(lq) ||
            e.category.toLowerCase().includes(lq) ||
            e.description.toLowerCase().includes(lq)
        );

        // B. Participant queries (e.g. "Myke") -> joined events, complete schedules, venues, facilitators
        const participantMatches = state.db.participants.filter(p => p.name.toLowerCase().includes(lq));

        // C. Batch queries (e.g. "Beta") -> participants grouped by event
        const batchMatches = state.db.batches.filter(b => b.name.toLowerCase().includes(lq));

        // D. Venue queries (e.g. "Laboratory") -> events inside this venue
        const venueMatches = state.db.events.filter(e => e.venue.toLowerCase().includes(lq));

        let html = '<div class="search-results-container">';

        // Rendering case Event matches
        if (eventMatches.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section-header">
                        ${utils.getSvg('calendar')}
                        <span>Event Matches (${eventMatches.length})</span>
                    </div>
                    <div class="events-grid">
            `;
            eventMatches.forEach(evt => {
                const regs = state.db.registrations.filter(r => r.eventId === evt.id);
                const participantNames = regs.map(r => {
                    const p = state.db.participants.find(part => part.id === r.participantId);
                    return p ? p.name : 'Unknown';
                });

                html += `
                    <div class="event-card" style="border-left: 4px solid var(--primary);">
                        <div class="event-card-header">
                            <div class="event-logo-preview">
                                ${evt.logo ? `<img src="${evt.logo}" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : utils.getInitials(evt.name)}
                            </div>
                            <div class="event-meta">
                                <div class="event-title">${utils.escapeHtml(evt.name)}</div>
                                <span class="event-category-tag">${utils.escapeHtml(evt.category)}</span>
                            </div>
                            <span class="badge badge-${evt.status.toLowerCase()}">${evt.status}</span>
                        </div>
                        <p class="event-description">${utils.escapeHtml(evt.description)}</p>
                        
                        <div class="event-details-list">
                            <div class="event-detail-item">
                                ${utils.getSvg('map')}
                                <span>Venue: <strong>${utils.escapeHtml(evt.venue)}</strong></span>
                            </div>
                            <div class="event-detail-item" style="align-items: flex-start; flex-direction: column; gap: 0.25rem;">
                                <div style="display:flex; align-items:center; gap:0.5rem; width:100%;">
                                    ${utils.getSvg('calendar')}
                                    <span>Schedules:</span>
                                </div>
                                <ul style="list-style:none; padding-left:1.5rem; font-size:0.75rem; color:var(--text-muted);">
                                    ${evt.multipleSchedules.map(s => `<li>${utils.formatDate(s.date)} [${s.start} - ${s.end}]</li>`).join('')}
                                </ul>
                            </div>
                        </div>

                        <div class="event-rosters">
                            <div class="roster-group">
                                <span class="roster-label">Facilitators:</span>
                                ${evt.facilitators.map(f => `<span class="roster-chip">${utils.escapeHtml(f)}</span>`).join('') || '<span style="font-size:0.75rem;">None</span>'}
                            </div>
                            <div class="roster-group">
                                <span class="roster-label">Advisers:</span>
                                ${evt.advisers.map(a => `<span class="roster-chip">${utils.escapeHtml(a)}</span>`).join('') || '<span style="font-size:0.75rem;">None</span>'}
                            </div>
                            <div class="roster-group" style="flex-direction: column; align-items: flex-start; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem; width: 100%;">
                                <span class="roster-label" style="width: 100%; font-weight:700;">Participants Joined (${regs.length}):</span>
                                <div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-top:0.25rem; width: 100%;">
                                    ${participantNames.map(name => `<span class="roster-chip" style="background-color: var(--primary-light); border-color: var(--primary);">${utils.escapeHtml(name)}</span>`).join('') || '<span style="font-size:0.75rem;color:var(--text-muted);">No registrants yet</span>'}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        // Rendering case Participant matches
        if (participantMatches.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section-header">
                        ${utils.getSvg('users')}
                        <span>Participant Matches (${participantMatches.length})</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
            `;
            participantMatches.forEach(p => {
                const regs = state.db.registrations.filter(r => r.participantId === p.id);
                const joinedEvents = regs.map(r => state.db.events.find(e => e.id === r.eventId)).filter(Boolean);

                html += `
                    <div class="panel-card" style="border-left: 4px solid var(--success); flex-direction: row; gap: 1.5rem; flex-wrap: wrap;">
                        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; width: 150px;">
                            <div class="participant-avatar" style="width:80px; height:80px; font-size: 2rem;">
                                ${p.profile ? `<img src="${p.profile}" alt="${p.name}">` : utils.getInitials(p.name)}
                            </div>
                            <h4 style="font-weight: 700; font-size:1rem;">${utils.escapeHtml(p.name)}</h4>
                            <span class="roster-chip" style="background-color: var(--success-light); border-color: var(--success);">${p.batch}</span>
                            <span style="font-size: 0.75rem; color:var(--text-muted);">${p.course} - ${utils.formatYearLevel(p.yearLevel)}</span>
                        </div>
                        
                        <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 0.75rem;">
                            <h5 style="font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">Joined Events & Rosters (${joinedEvents.length})</h5>
                            ${joinedEvents.map(evt => `
                                <div style="padding: 0.5rem 0; border-bottom: 1px dashed var(--border-color);">
                                    <div style="font-weight: 600; color: var(--primary);">${utils.escapeHtml(evt.name)} <span style="font-size:0.75rem; color:var(--text-muted);">(${evt.category})</span></div>
                                    <div style="font-size: 0.8rem; margin: 0.25rem 0;">Venue: <strong>${utils.escapeHtml(evt.venue)}</strong></div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                                        Schedules: ${evt.multipleSchedules.map(s => `${s.date} [${s.start}-${s.end}]`).join(', ')}
                                    </div>
                                    <div style="font-size: 0.8rem; margin-top: 0.25rem;">
                                        Facilitators: ${evt.facilitators.map(f => `<span class="roster-chip" style="padding:0.05rem 0.35rem; font-size:0.7rem;">${utils.escapeHtml(f)}</span>`).join(' ')}
                                    </div>
                                </div>
                            `).join('') || '<p style="font-size:0.8rem; color:var(--text-muted);">Not registered in any events.</p>'}
                        </div>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        // Rendering case Batch matches (Beta, Alpha, Gamma)
        if (batchMatches.length > 0) {
            html += `
                <div class="search-section">
                    <div class="search-section-header">
                        ${utils.getSvg('link')}
                        <span>Batch Matching: Grouped by Event</span>
                    </div>
            `;
            batchMatches.forEach(b => {
                // Get participants belonging to this batch
                const batchParticipants = state.db.participants.filter(p => p.batch.toLowerCase() === b.name.toLowerCase());
                if (batchParticipants.length === 0) {
                    html += `<div class="panel-card">${ui.renderEmptyState(`Batch "${b.name}"`, "No participants assigned to this batch yet")}</div>`;
                    return;
                }

                // Group them by event
                // Create map of eventId -> array of participants
                const groupings = {};
                // Unregistered group
                groupings['_unregistered'] = [];

                batchParticipants.forEach(p => {
                    const regs = state.db.registrations.filter(r => r.participantId === p.id);
                    if (regs.length === 0) {
                        groupings['_unregistered'].push(p);
                    } else {
                        regs.forEach(r => {
                            if (!groupings[r.eventId]) groupings[r.eventId] = [];
                            if (!groupings[r.eventId].includes(p)) {
                                groupings[r.eventId].push(p);
                            }
                        });
                    }
                });

                html += `
                    <div class="panel-card" style="gap: 1.25rem;">
                        <div style="display:flex; align-items:center; gap:0.75rem;">
                            <div class="participant-avatar" style="width:40px;height:40px;border-radius:10px;">
                                ${b.logo ? `<img src="${b.logo}" alt="logo" style="width:100%;height:100%;object-fit:cover;">` : utils.getInitials(b.name)}
                            </div>
                            <h4 style="font-weight:800; font-size:1.15rem;">Batch: ${b.name}</h4>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap: 1rem;">
                `;

                Object.keys(groupings).forEach(eId => {
                    if (eId === '_unregistered') return;
                    const evt = state.db.events.find(e => e.id === eId);
                    const pList = groupings[eId];
                    if (!evt) return;

                    html += `
                        <div style="padding: 0.75rem; background-color:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px;">
                            <div style="font-weight: 700; color: var(--primary); margin-bottom: 0.5rem; font-size:0.9rem;">
                                EVENT: ${utils.escapeHtml(evt.name)} <span style="font-size:0.75rem; font-weight:500; color:var(--text-muted);">(${evt.venue})</span>
                            </div>
                            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                                ${pList.map(p => `
                                    <div style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.25rem 0.5rem; background-color:var(--card-bg); border:1px solid var(--border-color); border-radius:6px; font-size:0.8rem;">
                                        <div class="participant-avatar" style="width:20px;height:20px;font-size:0.6rem;">
                                            ${p.profile ? `<img src="${p.profile}" alt="avatar">` : utils.getInitials(p.name)}
                                        </div>
                                        <strong>${utils.escapeHtml(p.name)}</strong>
                                        <span style="color:var(--text-muted);font-size:0.7rem;">(${p.course})</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });

                const unregList = groupings['_unregistered'];
                if (unregList && unregList.length > 0) {
                    html += `
                        <div style="padding: 0.75rem; background-color:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.2); border-radius:8px;">
                            <div style="font-weight: 700; color: var(--danger); margin-bottom: 0.5rem; font-size:0.9rem;">
                                No Event Registered
                            </div>
                            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                                ${unregList.map(p => `
                                    <div style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.25rem 0.5rem; background-color:var(--card-bg); border:1px solid var(--border-color); border-radius:6px; font-size:0.8rem;">
                                        <div class="participant-avatar" style="width:20px;height:20px;font-size:0.6rem;">
                                            ${p.profile ? `<img src="${p.profile}" alt="avatar">` : utils.getInitials(p.name)}
                                        </div>
                                        <strong>${utils.escapeHtml(p.name)}</strong>
                                        <span style="color:var(--text-muted);font-size:0.7rem;">(${p.course})</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                html += `</div></div>`;
            });
            html += `</div>`;
        }

        // Rendering case Venue matches (Laboratory)
        if (venueMatches.length > 0 && !eventMatches.some(e => e.venue.toLowerCase().includes(lq))) {
            html += `
                <div class="search-section">
                    <div class="search-section-header">
                        ${utils.getSvg('map')}
                        <span>Events inside Venue matching "${utils.escapeHtml(query)}"</span>
                    </div>
                    <div class="events-grid">
            `;
            venueMatches.forEach(evt => {
                html += `
                    <div class="event-card" style="border-left: 4px solid var(--warning);">
                        <div class="event-card-header">
                            <div class="event-logo-preview">
                                ${evt.logo ? `<img src="${evt.logo}" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : utils.getInitials(evt.name)}
                            </div>
                            <div class="event-meta">
                                <div class="event-title">${utils.escapeHtml(evt.name)}</div>
                                <span class="event-category-tag">${utils.escapeHtml(evt.category)}</span>
                            </div>
                            <span class="badge badge-${evt.status.toLowerCase()}">${evt.status}</span>
                        </div>
                        <p class="event-description">${utils.escapeHtml(evt.description)}</p>
                        <div class="event-detail-item" style="padding: 0.5rem 0; border-top: 1px solid var(--border-color);">
                            ${utils.getSvg('map')}
                            <span>Venue: <strong>${utils.escapeHtml(evt.venue)}</strong></span>
                        </div>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        if (eventMatches.length === 0 && participantMatches.length === 0 && batchMatches.length === 0 && venueMatches.length === 0) {
            html += ui.renderEmptyState("No results found", `Your query "${utils.escapeHtml(query)}" didn't match any events, participants, batches, or venues.`);
        }

        html += '</div>';
        resultsBox.innerHTML = html;
    }
};

// ====================================================
// 7. REPORTS GENERATOR
// ====================================================

const reports = {
    render(container) {
        // Aggregate Data Calculations
        // A. Participants per Event
        const pPerEvent = state.db.events.map(evt => {
            const count = state.db.registrations.filter(r => r.eventId === evt.id).length;
            return { name: evt.name, count };
        }).sort((a, b) => b.count - a.count);

        // B. Participants per Batch
        const pPerBatch = state.db.batches.map(b => {
            const count = state.db.participants.filter(p => p.batch.toLowerCase() === b.name.toLowerCase()).length;
            return { name: b.name, yearLevel: b.yearLevel, count };
        }).sort((a, b) => b.count - a.count);

        // C. Events per Category
        const eventsPerCategory = {};
        state.db.events.forEach(evt => {
            eventsPerCategory[evt.category] = (eventsPerCategory[evt.category] || 0) + 1;
        });

        // D. Roster lists (Facilitators & Advisers per event)
        const rostersPerEvent = state.db.events.map(evt => ({
            name: evt.name,
            fCount: evt.facilitators.length,
            facilitators: evt.facilitators.join(', '),
            aCount: evt.advisers.length,
            advisers: evt.advisers.join(', ')
        }));

        // E. Daily Schedules
        // Flatten schedules
        const dailyScheduleMap = {};
        state.db.events.forEach(evt => {
            evt.multipleSchedules.forEach(sched => {
                if (!dailyScheduleMap[sched.date]) {
                    dailyScheduleMap[sched.date] = [];
                }
                dailyScheduleMap[sched.date].push({
                    eventName: evt.name,
                    start: sched.start,
                    end: sched.end,
                    venue: evt.venue,
                    status: evt.status
                });
            });
        });
        // Sort dates chronologically
        const sortedDates = Object.keys(dailyScheduleMap).sort((a, b) => new Date(a) - new Date(b));

        // F. Venue Schedules
        const venueScheduleMap = {};
        state.db.events.forEach(evt => {
            if (!venueScheduleMap[evt.venue]) {
                venueScheduleMap[evt.venue] = [];
            }
            evt.multipleSchedules.forEach(sched => {
                venueScheduleMap[evt.venue].push({
                    eventName: evt.name,
                    date: sched.date,
                    start: sched.start,
                    end: sched.end,
                    status: evt.status
                });
            });
        });

        // Render Panel layout grid
        container.innerHTML = `
            <div class="actions-bar">
                <h2 style="font-size: 1.25rem; font-weight:800;">Analytics Dashlets</h2>
                <button class="btn btn-secondary" onclick="window.print()">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Report
                </button>
            </div>

            <div class="reports-grid">
                
                <!-- Participants per Event -->
                <div class="report-table-wrapper">
                    <h3 class="panel-title" style="margin-bottom:1rem;">
                        ${utils.getSvg('users')}
                        Participants Registered per Event
                    </h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th style="text-align:right;">Registrations</th>
                                <th>Fill Visual</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pPerEvent.map(row => {
            const maxReg = Math.max(...pPerEvent.map(r => r.count), 1);
            const pct = (row.count / maxReg) * 100;
            return `
                                    <tr>
                                        <td><strong>${utils.escapeHtml(row.name)}</strong></td>
                                        <td style="text-align:right; font-weight:700;">${row.count}</td>
                                        <td>
                                            <div class="progress-bar-container">
                                                <div class="progress-bar-fill" style="width: ${pct}%;"></div>
                                            </div>
                                        </td>
                                    </tr>
                                `;
        }).join('') || '<tr><td colspan="3">No events found</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <!-- Participants per Batch -->
                <div class="report-table-wrapper">
                    <h3 class="panel-title" style="margin-bottom:1rem;">
                        ${utils.getSvg('link')}
                        Participants per Batch
                    </h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Batch Name</th>
                                <th>Year Level</th>
                                <th style="text-align:right;">Total Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pPerBatch.map(row => `
                                <tr>
                                    <td><strong>${utils.escapeHtml(row.name)}</strong></td>
                                    <td>${utils.formatYearLevel(row.yearLevel)}</td>
                                    <td style="text-align:right; font-weight:700; color: var(--success);">${row.count}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3">No batches found</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <!-- Events per Category -->
                <div class="report-table-wrapper">
                    <h3 class="panel-title" style="margin-bottom:1rem;">
                        ${utils.getSvg('tag')}
                        Events per Category
                    </h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th style="text-align:right;">Events Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(eventsPerCategory).map(cat => `
                                <tr>
                                    <td><strong>${utils.escapeHtml(cat)}</strong></td>
                                    <td style="text-align:right; font-weight:700; color: var(--primary);">${eventsPerCategory[cat]}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="2">No categories found</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <!-- Roster per Event -->
                <div class="report-table-wrapper">
                    <h3 class="panel-title" style="margin-bottom:1rem;">
                        ${utils.getSvg('users')}
                        Event Roster Counts
                    </h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th>Facilitators</th>
                                <th>Advisers</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rostersPerEvent.map(row => `
                                <tr>
                                    <td><strong>${utils.escapeHtml(row.name)}</strong></td>
                                    <td><span class="roster-chip">${row.fCount}</span> <span style="font-size:0.75rem; color:var(--text-muted);">${utils.escapeHtml(row.facilitators)}</span></td>
                                    <td><span class="roster-chip" style="background-color: var(--warning-light); border-color:var(--warning);">${row.aCount}</span> <span style="font-size:0.75rem; color:var(--text-muted);">${utils.escapeHtml(row.advisers)}</span></td>
                                </tr>
                            `).join('') || '<tr><td colspan="3">No rosters found</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <!-- Daily Schedule timeline -->
                <div class="report-table-wrapper" style="grid-column: span 2;">
                    <h3 class="panel-title" style="margin-bottom:1rem;">
                        ${utils.getSvg('calendar')}
                        Daily Timeline Schedule
                    </h3>
                    <div style="display:flex; flex-direction:column; gap:1.25rem;">
                        ${sortedDates.map(dateStr => `
                            <div style="border-left: 3px solid var(--primary); padding-left: 1rem;">
                                <h4 style="font-weight:800; font-size:0.95rem; color: var(--text-main); margin-bottom: 0.5rem;">${utils.formatDate(dateStr)}</h4>
                                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                                    ${dailyScheduleMap[dateStr].sort((a, b) => a.start.localeCompare(b.start)).map(item => `
                                        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.5rem; background-color:rgba(255,255,255,0.01); border-radius:6px; border:1px solid var(--border-color);">
                                            <div>
                                                <strong style="color:var(--primary);">${utils.escapeHtml(item.eventName)}</strong>
                                                <span style="font-size:0.75rem; color:var(--text-muted); margin-left:0.5rem;">[${item.start} - ${item.end}]</span>
                                            </div>
                                            <span style="font-size:0.8rem; color:var(--text-muted);">Venue: <strong>${utils.escapeHtml(item.venue)}</strong></span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('') || '<p style="color:var(--text-muted); font-size:0.85rem;">No schedules created.</p>'}
                    </div>
                </div>

                <!-- Venue allocations -->
                <div class="report-table-wrapper" style="grid-column: span 2;">
                    <h3 class="panel-title" style="margin-bottom:1rem;">
                        ${utils.getSvg('map')}
                        Venue Schedule Allocations
                    </h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1rem;">
                        ${Object.keys(venueScheduleMap).map(venue => `
                            <div class="panel-card" style="padding:1rem; border-color: rgba(255, 255, 255, 0.05);">
                                <h4 style="font-weight:700; font-size:0.95rem; border-bottom: 1px solid var(--border-color); padding-bottom:0.25rem; color:var(--warning);">${utils.escapeHtml(venue)}</h4>
                                <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
                                    ${venueScheduleMap[venue].sort((a, b) => a.date.localeCompare(b.date)).map(sched => `
                                        <li style="font-size:0.8rem; line-height:1.4;">
                                            <strong>${utils.escapeHtml(sched.eventName)}</strong>
                                            <div style="color:var(--text-muted); font-size:0.75rem;">${utils.formatDate(sched.date)} (${sched.start} - ${sched.end})</div>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('') || '<p style="color:var(--text-muted); font-size:0.85rem;">No venues mapped.</p>'}
                    </div>
                </div>

            </div>
        `;
    }
};

// ====================================================
// 8. DASHBOARD
// ====================================================

const dashboard = {
    render(container) {
        const totalEvents = state.db.events.length;
        const totalParticipants = state.db.participants.length;
        const totalRegistrations = state.db.registrations.length;
        const totalBatches = state.db.batches.length;

        // Today's events calculations
        const todayStr = new Date().toISOString().split('T')[0];
        const todayEvents = state.db.events.filter(evt =>
            evt.multipleSchedules.some(sched => sched.date === todayStr)
        );

        // Upcoming events (schedules after or equal to today)
        const upcomingEvents = state.db.events.filter(evt => {
            if (evt.status !== 'Active') return false;
            return evt.multipleSchedules.some(s => s.date >= todayStr);
        });

        // Recent Registrations Feed (last 5)
        const recentRegs = [...state.db.registrations]
            .reverse()
            .slice(0, 5)
            .map(r => {
                const p = state.db.participants.find(part => part.id === r.participantId);
                const evt = state.db.events.find(e => e.id === r.eventId);
                return {
                    id: r.id,
                    participantName: p ? p.name : 'Unknown',
                    eventName: evt ? evt.name : 'Unknown Event',
                    participantInitials: p ? utils.getInitials(p.name) : '??',
                    participantProfile: p ? p.profile : ''
                };
            });

        // Set Main content HTML
        container.innerHTML = `
            <!-- Top Dashboard Stats grid -->
            <div class="dashboard-grid">
                <div class="stats-card">
                    <div class="stats-info">
                        <span class="stats-label">Total Events</span>
                        <span class="stats-val">${totalEvents}</span>
                    </div>
                    <div class="stats-icon-wrapper primary">
                        ${utils.getSvg('calendar')}
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-info">
                        <span class="stats-label">Total Participants</span>
                        <span class="stats-val">${totalParticipants}</span>
                    </div>
                    <div class="stats-icon-wrapper success">
                        ${utils.getSvg('users')}
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-info">
                        <span class="stats-label">Registrations</span>
                        <span class="stats-val">${totalRegistrations}</span>
                    </div>
                    <div class="stats-icon-wrapper danger">
                        ${utils.getSvg('link')}
                    </div>
                </div>

                <div class="stats-card">
                    <div class="stats-info">
                        <span class="stats-label">Total Batches</span>
                        <span class="stats-val">${totalBatches}</span>
                    </div>
                    <div class="stats-icon-wrapper warning">
                        ${utils.getSvg('tag')}
                    </div>
                </div>
            </div>

            <!-- Dashboard Panels splits -->
            <div class="dashboard-panels">
                
                <!-- Left panel: Today & Upcoming -->
                <div style="display:flex; flex-direction:column; gap:1.5rem;">
                    
                    <!-- Today's events list -->
                    <div class="panel-card">
                        <div class="panel-header">
                            <h3 class="panel-title">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="var(--success)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Today's Schedules (${todayEvents.length})
                            </h3>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap: 0.75rem;">
                            ${todayEvents.map(evt => {
            const nextS = utils.getNextSchedule(evt);
            return `
                                    <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1rem; border:1px solid var(--border-color); background-color:rgba(255,255,255,0.01); border-radius:10px;">
                                        <div style="display:flex; align-items:center; gap:0.75rem;">
                                            <div class="event-logo-preview" style="width:36px; height:36px; font-size:1rem; border-radius:8px;">
                                                ${evt.logo ? `<img src="${evt.logo}" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : utils.getInitials(evt.name)}
                                            </div>
                                            <div>
                                                <strong style="font-size:0.9rem;">${utils.escapeHtml(evt.name)}</strong>
                                                <div style="font-size:0.75rem; color:var(--text-muted);">${utils.escapeHtml(evt.venue)}</div>
                                            </div>
                                        </div>
                                        <span class="badge badge-active" style="font-size:0.7rem;">${nextS ? `${nextS.start} - ${nextS.end}` : 'Active'}</span>
                                    </div>
                                `;
        }).join('') || '<p style="color:var(--text-muted); font-size:0.85rem; padding: 0.5rem 0;">No events scheduled for today.</p>'}
                        </div>
                    </div>

                    <!-- Upcoming events cards -->
                    <div class="panel-card">
                        <div class="panel-header">
                            <h3 class="panel-title">
                                ${utils.getSvg('calendar')}
                                Upcoming Events (${upcomingEvents.length})
                            </h3>
                            <button class="panel-action-btn" onclick="app.router('events')">View All</button>
                        </div>
                        
                        <div class="events-grid">
                            ${upcomingEvents.slice(0, 4).map(evt => {
            const nextS = utils.getNextSchedule(evt);
            const regCount = state.db.registrations.filter(r => r.eventId === evt.id).length;
            return `
                                    <div class="event-card" style="padding:1.25rem; gap:0.75rem;">
                                        <div class="event-card-header">
                                            <div class="event-logo-preview" style="width:40px;height:40px;font-size:1.1rem;border-radius:8px;">
                                                ${evt.logo ? `<img src="${evt.logo}" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : utils.getInitials(evt.name)}
                                            </div>
                                            <div class="event-meta">
                                                <div class="event-title" style="font-size:0.95rem;">${utils.escapeHtml(evt.name)}</div>
                                                <span class="event-category-tag" style="font-size:0.7rem;">${utils.escapeHtml(evt.category)}</span>
                                            </div>
                                        </div>
                                        <div class="event-details-list" style="padding: 0.5rem 0; border:none;">
                                            <div class="event-detail-item" style="font-size:0.75rem;">
                                                ${utils.getSvg('map')}
                                                <span>${utils.escapeHtml(evt.venue)}</span>
                                            </div>
                                            <div class="event-detail-item" style="font-size:0.75rem;">
                                                ${utils.getSvg('calendar')}
                                                <span>${nextS ? `${utils.formatDate(nextS.date)} @ ${nextS.start}` : 'No schedule'}</span>
                                            </div>
                                        </div>
                                        <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.75rem; border-top:1px solid var(--border-color); padding-top:0.5rem;">
                                            <span style="color:var(--text-muted);">${regCount} registered</span>
                                            <button class="btn btn-secondary btn-icon-only" style="width:28px;height:28px;border-radius:6px;" onclick="events.openDetails('${evt.id}')">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                `;
        }).join('') || ui.renderEmptyState("No upcoming events", "Create new events in the Events tab to see them listed here.")}
                        </div>
                    </div>

                </div>

                <!-- Right panel: Recent Registrations feed -->
                <div class="panel-card">
                    <div class="panel-header">
                        <h3 class="panel-title">
                            ${utils.getSvg('link')}
                            Recent Registrations
                        </h3>
                        ${state.role === 'admin' ? `<button class="panel-action-btn" onclick="app.router('registrations')">View Log</button>` : ''}
                    </div>

                    <div style="display:flex; flex-direction:column; gap:1.25rem;">
                        ${recentRegs.map(row => `
                            <div style="display:flex; align-items:center; gap:0.75rem;">
                                <div class="participant-avatar" style="width:36px; height:36px; border-radius:50%; border-color:rgba(255,255,255,0.1); font-size:0.85rem;">
                                    ${row.participantProfile ? `<img src="${row.participantProfile}" alt="avatar">` : row.participantInitials}
                                </div>
                                <div style="display:flex; flex-direction:column; gap:0.15rem; flex:1;">
                                    <span style="font-size:0.85rem; font-weight:700;">${utils.escapeHtml(row.participantName)}</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">joined <strong style="color:var(--primary); font-weight:600;">${utils.escapeHtml(row.eventName)}</strong></span>
                                </div>
                            </div>
                        `).join('') || '<p style="color:var(--text-muted); font-size:0.85rem; padding: 0.5rem 0;">No registrations logged yet.</p>'}
                    </div>
                </div>

            </div>
        `;
    }
};

// ====================================================
// 9. EVENTS LAYER
// ====================================================

const events = {
    filters: {
        status: 'All',
        category: 'All',
        sort: 'name'
    },

    render(container) {
        // Collect all distinct categories for filter selector
        const categories = [...new Set(state.db.events.map(e => e.category))];

        container.innerHTML = `
            <!-- Controls bar -->
            <div class="actions-bar">
                <div class="search-filter-group">
                    <div class="input-icon-wrapper">
                        ${utils.getSvg('search')}
                        <input type="text" id="event-search-filter" placeholder="Search events by name, venue...">
                    </div>
                    
                    <select class="filter-select" id="event-status-filter">
                        <option value="All">All Statuses</option>
                        <option value="Active" ${this.filters.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${this.filters.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        <option value="Completed" ${this.filters.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${this.filters.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>

                    <select class="filter-select" id="event-category-filter">
                        <option value="All">All Categories</option>
                        ${categories.map(cat => `<option value="${cat}" ${this.filters.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>

                    <select class="filter-select" id="event-sort-select">
                        <option value="name" ${this.filters.sort === 'name' ? 'selected' : ''}>Sort by Name</option>
                        <option value="date" ${this.filters.sort === 'date' ? 'selected' : ''}>Sort by Date</option>
                        <option value="created" ${this.filters.sort === 'created' ? 'selected' : ''}>Sort by Date Created</option>
                    </select>
                </div>
                ${state.role === 'admin' ? `
                <button class="btn btn-primary" onclick="events.openFormModal('create')">
                    ${utils.getSvg('plus')}
                    Create Event
                </button>
                ` : ''}
            </div>

            <!-- List Grid -->
            <div class="events-grid" id="events-grid-target">
                <!-- Loaded dynamically -->
            </div>
        `;

        // Register handlers
        document.getElementById('event-search-filter').addEventListener('input', () => this.applyFilters());
        document.getElementById('event-status-filter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });
        document.getElementById('event-category-filter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });
        document.getElementById('event-sort-select').addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.applyFilters();
        });

        // Trigger initial draw
        this.applyFilters();
    },

    applyFilters() {
        const query = document.getElementById('event-search-filter').value.toLowerCase();

        let filtered = state.db.events.filter(evt => {
            const matchesQuery = evt.name.toLowerCase().includes(query) || evt.venue.toLowerCase().includes(query);
            const matchesStatus = this.filters.status === 'All' || evt.status === this.filters.status;
            const matchesCategory = this.filters.category === 'All' || evt.category === this.filters.category;
            return matchesQuery && matchesStatus && matchesCategory;
        });

        // Apply Sorting
        if (this.filters.sort === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.filters.sort === 'date') {
            filtered.sort((a, b) => {
                const sA = utils.getNextSchedule(a);
                const sB = utils.getNextSchedule(b);
                if (!sA) return 1;
                if (!sB) return -1;
                return new Date(sA.date) - new Date(sB.date);
            });
        } else if (this.filters.sort === 'created') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const grid = document.getElementById('events-grid-target');
        if (filtered.length === 0) {
            grid.innerHTML = ui.renderEmptyState("No events found", "Try adjusting your search filters or click Create Event to add one");
            return;
        }

        grid.innerHTML = filtered.map(evt => {
            const nextS = utils.getNextSchedule(evt);
            const regCount = state.db.registrations.filter(r => r.eventId === evt.id).length;
            const isArchived = evt.status === 'Inactive';

            return `
                <div class="event-card">
                    <div class="event-card-header">
                        <div class="event-logo-preview">
                            ${evt.logo ? `<img src="${evt.logo}" alt="logo" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : utils.getInitials(evt.name)}
                        </div>
                        <div class="event-meta">
                            <div class="event-title" style="cursor:pointer;" onclick="events.openDetails('${evt.id}')">${utils.escapeHtml(evt.name)}</div>
                            <span class="event-category-tag">${utils.escapeHtml(evt.category)}</span>
                        </div>
                        <span class="badge badge-${evt.status.toLowerCase()}">${evt.status}</span>
                    </div>

                    <p class="event-description">${utils.escapeHtml(evt.description)}</p>

                    <div class="event-details-list">
                        <div class="event-detail-item">
                            ${utils.getSvg('map')}
                            <span>Venue: <strong>${utils.escapeHtml(evt.venue)}</strong></span>
                        </div>
                        <div class="event-detail-item">
                            ${utils.getSvg('calendar')}
                            <span>Schedule: <strong>${nextS ? `${utils.formatDate(nextS.date)} (${nextS.start} - ${nextS.end})` : 'No Schedule Mapped'}</strong></span>
                        </div>
                        <div class="event-detail-item">
                            ${utils.getSvg('users')}
                            <span>Registered Participants: <strong>${regCount}</strong></span>
                        </div>
                    </div>

                    <div class="event-card-actions">
                        ${state.role === 'admin' ? `
                            <button class="btn btn-secondary btn-icon-only" title="Duplicate Event" onclick="crud.duplicateEvent('${evt.id}')">
                                ${utils.getSvg('duplicate')}
                            </button>
                            <button class="btn btn-secondary btn-icon-only" title="${isArchived ? 'Restore Event' : 'Archive Event'}" onclick="crud.archiveRestoreEvent('${evt.id}')">
                                ${isArchived ? utils.getSvg('restore') : utils.getSvg('archive')}
                            </button>
                            <button class="btn btn-secondary btn-icon-only" title="Edit Event" onclick="events.openFormModal('edit', '${evt.id}')">
                                ${utils.getSvg('pencil')}
                            </button>
                            <button class="btn btn-secondary btn-icon-only" title="Delete Event" onclick="crud.deleteEvent('${evt.id}')" style="color:var(--danger);">
                                ${utils.getSvg('trash')}
                            </button>
                        ` : `
                            <button class="btn btn-primary" style="width: 100%; border-radius: 8px; font-size: 0.85rem;" onclick="events.openGuestRegistrationModal('${evt.id}')">
                                ${utils.getSvg('plus')}
                                Join Event
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    openFormModal(mode, eventId = null) {
        document.getElementById('event-form-mode').value = mode;
        document.getElementById('schedule-rows-container').innerHTML = '';
        editingSchedules = [];
        editingFacilitators = [];
        editingAdvisers = [];

        if (mode === 'create') {
            document.getElementById('event-modal-title').textContent = "Create New Event";
            document.getElementById('event-id').value = utils.generateId('EVT', state.db.events);
            document.getElementById('event-name').value = '';
            document.getElementById('event-category').value = '';
            document.getElementById('event-venue').value = '';
            document.getElementById('event-status').value = '';
            document.getElementById('event-logo').value = '';
            document.getElementById('event-description').value = '';

            crud.addScheduleRow();
            crud.renderFacilitatorsChips();
            crud.renderAdvisersChips();
        } else {
            const evt = state.db.events.find(e => e.id === eventId);
            if (!evt) return;

            document.getElementById('event-modal-title').textContent = `Edit Event (${evt.id})`;
            document.getElementById('event-id').value = evt.id;
            document.getElementById('event-name').value = evt.name;
            document.getElementById('event-category').value = evt.category;
            document.getElementById('event-venue').value = evt.venue;
            document.getElementById('event-status').value = evt.status;
            document.getElementById('event-logo').value = evt.logo;
            document.getElementById('event-description').value = evt.description;

            // Load schedules
            evt.multipleSchedules.forEach(s => {
                crud.addScheduleRow(s.date, s.start, s.end);
            });

            // Load rosters
            editingFacilitators = [...evt.facilitators];
            editingAdvisers = [...evt.advisers];
            crud.renderFacilitatorsChips();
            crud.renderAdvisersChips();
        }

        ui.openModal('event-modal');
    },

    openDetails(eventId) {
        const evt = state.db.events.find(e => e.id === eventId);
        if (!evt) return;

        // Update page title
        document.getElementById('page-title').textContent = evt.name;

        const container = document.getElementById('main-content');
        const regs = state.db.registrations.filter(r => r.eventId === evt.id);
        const regParticipants = regs.map(r => state.db.participants.find(p => p.id === r.participantId)).filter(Boolean);

        // Group participants by batch
        const batchGroups = {};
        regParticipants.forEach(p => {
            const batchKey = p.batch || 'Unassigned';
            if (!batchGroups[batchKey]) batchGroups[batchKey] = [];
            batchGroups[batchKey].push(p);
        });

        // Sort batch names alphabetically
        const sortedBatchNames = Object.keys(batchGroups).sort();

        container.innerHTML = `
            <div class="event-detail-container">
                <!-- Back Button -->
                <button class="back-btn" onclick="app.router('events')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                    Back to Events
                </button>

                <!-- Hero Section -->
                <div class="event-detail-hero">
                    <div class="event-detail-logo">
                        ${evt.logo ? `<img src="${evt.logo}" alt="${evt.name}">` : utils.getInitials(evt.name)}
                    </div>
                    <div class="event-detail-info">
                        <span class="event-detail-category">${utils.escapeHtml(evt.category)}</span>
                        <h1 class="event-detail-title">${utils.escapeHtml(evt.name)}</h1>
                        <span class="badge badge-${evt.status.toLowerCase()}" style="align-self:flex-start;">${evt.status}</span>
                        ${evt.description ? `<p class="event-detail-desc">${utils.escapeHtml(evt.description)}</p>` : ''}
                        <div class="event-detail-actions-row">
                            ${state.role === 'admin' ? `
                                <button class="btn btn-primary" onclick="events.openFormModal('edit', '${evt.id}')">
                                    ${utils.getSvg('pencil')} Edit Event
                                </button>
                                <button class="btn btn-secondary" onclick="participants.openFormModal('create')">
                                    ${utils.getSvg('plus')} Register Participant
                                </button>
                                <button class="btn btn-secondary" onclick="crud.deleteEvent('${evt.id}')" style="color:var(--danger); border-color:var(--danger);">
                                    ${utils.getSvg('trash')} Delete
                                </button>
                            ` : `

                        </div>
                    </div>
                </div>

                <!-- Meta Grid -->
                <div class="detail-meta-grid">
                    <!-- Schedules -->
                    <div class="detail-meta-card">
                        <div class="detail-meta-title">
                            ${utils.getSvg('calendar')}
                            Schedules (${evt.multipleSchedules.length})
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.5rem;">
                            ${evt.multipleSchedules.map(s => `
                                <div style="display:flex; align-items:center; justify-content:space-between; padding:0.5rem 0.65rem; background-color:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px;">
                                    <div>
                                        <strong style="font-size:0.9rem;">${utils.formatDate(s.date)}</strong>
                                        <div style="font-size:0.75rem; color:var(--text-muted);">${s.start} — ${s.end}</div>
                                    </div>
                                    <span class="badge badge-active" style="font-size:0.65rem;">${new Date(s.date) >= new Date() ? 'Upcoming' : 'Past'}</span>
                                </div>
                            `).join('') || '<p style="font-size:0.85rem; color:var(--text-muted);">No schedules set.</p>'}
                        </div>
                    </div>

                    <!-- Venue -->
                    <div class="detail-meta-card">
                        <div class="detail-meta-title">
                            ${utils.getSvg('map')}
                            Venue
                        </div>
                        <div style="font-size:1.1rem; font-weight:700;">${utils.escapeHtml(evt.venue)}</div>
                    </div>

                    <!-- Facilitators -->
                    <div class="detail-meta-card">
                        <div class="detail-meta-title">
                            ${utils.getSvg('users')}
                            Facilitators (${evt.facilitators.length})
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
                            ${evt.facilitators.map(f => `<span class="roster-chip">${utils.escapeHtml(f)}</span>`).join('') || '<span style="font-size:0.85rem; color:var(--text-muted);">None assigned</span>'}
                        </div>
                    </div>

                    <!-- Advisers -->
                    <div class="detail-meta-card">
                        <div class="detail-meta-title">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            Advisers (${evt.advisers.length})
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
                            ${evt.advisers.map(a => `<span class="roster-chip" style="background-color:var(--warning-light); border-color:var(--warning);">${utils.escapeHtml(a)}</span>`).join('') || '<span style="font-size:0.85rem; color:var(--text-muted);">None assigned</span>'}
                        </div>
                    </div>
                </div>

                <!-- Registered Students per Batch -->
                <div style="display:flex; flex-direction:column; gap:1rem;">
                    <h2 style="font-size:1.15rem; font-weight:800; display:flex; align-items:center; gap:0.5rem;">
                        ${utils.getSvg('users')}
                        Registered Students (${regParticipants.length})
                    </h2>

                    ${sortedBatchNames.length > 0 ? sortedBatchNames.map(batchName => {
                        const students = batchGroups[batchName];
                        const batchObj = state.db.batches.find(b => b.name.toLowerCase() === batchName.toLowerCase());
                        const yearLevel = batchObj ? utils.formatYearLevel(batchObj.yearLevel) : 'N/A';
                        const batchLogo = batchObj?.logo || '';
                        const batchId = 'batch-detail-' + batchName.replace(/\s+/g, '-').toLowerCase();

                        return `
                            <div class="batch-group-section">
                                <div class="batch-group-header expanded" onclick="events.toggleBatchGroup('${batchId}', this)">
                                    <div class="batch-group-header-left">
                                        <div class="batch-group-avatar">
                                            ${batchLogo ? `<img src="${batchLogo}" alt="${batchName}">` : utils.getInitials(batchName)}
                                        </div>
                                        <div>
                                            <div class="batch-group-name">Batch: ${utils.escapeHtml(batchName)}</div>
                                            <div style="font-size:0.75rem; color:var(--text-muted);">${yearLevel} • BSIT</div>
                                        </div>
                                        <span class="batch-group-badge">${students.length} student${students.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <svg class="batch-group-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                                <div class="batch-group-body open" id="${batchId}">
                                    <div class="batch-group-students">
                                        ${students.map((p, idx) => `
                                            <div class="student-row">
                                                <span style="font-size:0.75rem; color:var(--text-muted); width:28px; text-align:center; font-weight:700;">${idx + 1}</span>
                                                <div class="participant-avatar" style="width:34px;height:34px;font-size:0.8rem;">
                                                    ${p.profile ? `<img src="${p.profile}" alt="${p.name}">` : utils.getInitials(p.name)}
                                                </div>
                                                <div class="student-row-info">
                                                    <span class="student-row-name">${utils.escapeHtml(p.name)}</span>
                                                    <span class="student-row-meta">${p.course} • ${utils.formatYearLevel(p.yearLevel)} • ${p.id}</span>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('') : `
                        <div class="panel-card" style="padding: 2rem;">
                            ${ui.renderEmptyState("No registered students yet", state.role === 'admin' ? "Use 'Register Participant' above to add students to this event." : "No participants have been registered for this event yet.")}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    toggleBatchGroup(batchId, headerEl) {
        const body = document.getElementById(batchId);
        if (!body) return;
        body.classList.toggle('open');
        headerEl.classList.toggle('expanded');
    },

// ====================================================
// 10. PARTICIPANTS LAYER
// =================================================

    render(container) {
        container.innerHTML = `
            <div class="actions-bar">
                <div class="search-filter-group">
                    <div class="input-icon-wrapper">
                        ${utils.getSvg('search')}
                        <input type="text" id="participant-search-input" placeholder="Search participant name, course...">
                    </div>
                    
                    <select class="filter-select" id="participant-batch-filter">
                        <option value="All">All Batches</option>
                        ${state.db.batches.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                    </select>
                </div>
                
                ${state.role === 'admin' ? `<button class="btn btn-primary" onclick="participants.openFormModal('create')">
                    ${utils.getSvg('plus')}
                    Add & Register Participant
                </button>` : ''}
            </div>

            <!-- Table Target -->
            <div class="table-responsive">
                <table class="table" id="participants-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Participant Info</th>
                            <th>Batch</th>
                            <th>Course / Year</th>
                            ${state.role === 'admin' ? '<th style="text-align:right;">Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody id="participants-tbody">
                        <!-- Loaded dynamically -->
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('participant-search-input').addEventListener('input', (e) => {
            this.filters.query = e.target.value;
            this.drawTable();
        });

        document.getElementById('participant-batch-filter').addEventListener('change', (e) => {
            this.filters.batch = e.target.value;
            this.drawTable();
        });

        this.drawTable();
    },

    drawTable() {
        const tbody = document.getElementById('participants-tbody');
        const lq = this.filters.query.toLowerCase();

        const filtered = state.db.participants.filter(p => {
            const matchesQuery = p.name.toLowerCase().includes(lq) || p.course.toLowerCase().includes(lq);
            const matchesBatch = this.filters.batch === 'All' || p.batch === this.filters.batch;
            return matchesQuery && matchesBatch;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${state.role === 'admin' ? '5' : '4'}">
                        ${ui.renderEmptyState("No participants found", "Add participants to manage rosters and registrations")}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(p => `
            <tr>
                <td><strong style="color:var(--text-muted);">${p.id}</strong></td>
                <td>
                    <div class="participant-avatar-row">
                        <div class="participant-avatar">
                            ${p.profile ? `<img src="${p.profile}" alt="avatar">` : utils.getInitials(p.name)}
                        </div>
                        <span style="font-weight:700; cursor:pointer;" onclick="participants.viewProfile('${p.id}')">${utils.escapeHtml(p.name)}</span>
                    </div>
                </td>
                <td><span class="badge badge-completed">${p.batch}</span></td>
                <td>${p.course} (${utils.formatYearLevel(p.yearLevel)})</td>
                ${state.role === 'admin' ? `<td style="text-align:right;">
                    <button class="btn btn-secondary btn-icon-only" onclick="participants.openFormModal('edit', '${p.id}')" title="Edit Profile">
                        ${utils.getSvg('pencil')}
                    </button>
                    <button class="btn btn-secondary btn-icon-only" onclick="crud.deleteParticipant('${p.id}')" title="Delete Profile" style="color:var(--danger); margin-left:0.25rem;">
                        ${utils.getSvg('trash')}
                    </button>
                </td>` : ''}
            </tr>
        `).join('');
    },

    openFormModal(mode, pId = null) {
        document.getElementById('participant-form-mode').value = mode;

        // Load dynamic batches dropdown options
        const dropdown = document.getElementById('participant-batch');
        dropdown.innerHTML = '<option value="">Select batch</option>' +
            state.db.batches.map(b => `<option value="${b.name}">${b.name} - ${utils.formatYearLevel(b.yearLevel)}</option>`).join('');

        const eventDropdown = document.getElementById('participant-event');
        const eventGroup = document.getElementById('participant-event-group');
        eventDropdown.innerHTML = '<option value="">Select active event</option>' +
            state.db.events.filter(e => e.status === 'Active').map(e => `<option value="${e.id}">${e.name} [${e.category}]</option>`).join('');

        dropdown.onchange = () => {
            const yearLevel = utils.getBatchYearLevel(dropdown.value);
            document.getElementById('participant-year').value = yearLevel;
            document.getElementById('participant-year-display').value = yearLevel ? utils.formatYearLevel(yearLevel) : '';
        };

        if (mode === 'create') {
            document.getElementById('participant-modal-title').textContent = "Add & Register Participant";
            document.getElementById('participant-id').value = utils.generateId('PAR', state.db.participants);
            document.getElementById('participant-name').value = '';
            document.getElementById('participant-batch').value = '';
            document.getElementById('participant-course').value = 'BSIT';
            document.getElementById('participant-year').value = '';
            document.getElementById('participant-year-display').value = '';
            document.getElementById('participant-event').value = '';
            document.getElementById('participant-profile').value = '';
            document.getElementById('participant-form-submit-btn').textContent = "Save & Register";
            eventGroup.style.display = 'block';
        } else {
            const p = state.db.participants.find(part => part.id === pId);
            if (!p) return;

            document.getElementById('participant-modal-title').textContent = `Edit Participant (${p.id})`;
            document.getElementById('participant-id').value = p.id;
            document.getElementById('participant-name').value = p.name;
            document.getElementById('participant-batch').value = p.batch;
            document.getElementById('participant-course').value = 'BSIT';
            document.getElementById('participant-year').value = utils.getBatchYearLevel(p.batch) || p.yearLevel || '';
            document.getElementById('participant-year-display').value = utils.formatYearLevel(document.getElementById('participant-year').value);
            document.getElementById('participant-event').value = '';
            document.getElementById('participant-profile').value = p.profile;
            document.getElementById('participant-form-submit-btn').textContent = "Save Participant";
            eventGroup.style.display = 'none';
        }

        ui.openModal('participant-modal');
    },

    viewProfile(pId) {
        const pObj = state.db.participants.find(p => p.id === pId);
        if (pObj) {
            app.preloadedSearchQuery = pObj.name;
            app.router('search');
        }
    }
};

// ====================================================
// 11. REGISTRATIONS LAYER
// ====================================================

const registrations = {
    query: '',

    render(container) {
        container.innerHTML = `
            <div class="actions-bar">
                <div class="search-filter-group">
                    <div class="input-icon-wrapper">
                        ${utils.getSvg('search')}
                        <input type="text" id="reg-search-input" placeholder="Filter by student name or event name...">
                    </div>
                </div>
                
                <span class="badge badge-active">Auto-filled from Add & Register Participant</span>
                ${state.role === 'admin' ? `
                <button class="btn btn-primary" onclick="registrations.openFormModal()">
                    ${utils.getSvg('plus')}
                    Add Registration
                </button>` : ''}
            </div>

            <!-- Table Target -->
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Reg ID</th>
                            <th>Participant Info</th>
                            <th>Event Joined</th>
                            <th>Schedules</th>
                            ${state.role === 'admin' ? '<th style="text-align:right;">Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody id="reg-tbody">
                        <!-- Loaded dynamically -->
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('reg-search-input').addEventListener('input', (e) => {
            this.query = e.target.value.toLowerCase();
            this.drawTable();
        });

        this.drawTable();
    },

    drawTable() {
        const tbody = document.getElementById('reg-tbody');

        const mapped = state.db.registrations.map(r => {
            const p = state.db.participants.find(part => part.id === r.participantId);
            const e = state.db.events.find(evt => evt.id === r.eventId);
            return {
                id: r.id,
                pName: p ? p.name : 'Unknown',
                pCourse: p ? p.course : 'N/A',
                pAvatar: p ? p.profile : '',
                pInitials: p ? utils.getInitials(p.name) : '??',
                eName: e ? e.name : 'Unknown Event',
                eCategory: e ? e.category : '',
                eSchedules: e ? e.multipleSchedules : []
            };
        });

        const filtered = mapped.filter(r =>
            r.pName.toLowerCase().includes(this.query) ||
            r.eName.toLowerCase().includes(this.query)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${state.role === 'admin' ? '5' : '4'}">
                        ${ui.renderEmptyState("No registration logs found", state.role === 'admin' ? "Use Add & Register Participant to create a student record and event registration together" : "No participant registrations are available yet")}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(r => `
            <tr>
                <td><strong style="color:var(--text-muted);">${r.id}</strong></td>
                <td>
                    <div class="participant-avatar-row">
                        <div class="participant-avatar">
                            ${r.pAvatar ? `<img src="${r.pAvatar}" alt="profile">` : r.pInitials}
                        </div>
                        <div>
                            <span style="font-weight:700;">${utils.escapeHtml(r.pName)}</span>
                            <div style="font-size:0.75rem; color:var(--text-muted);">${r.pCourse}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <strong style="color:var(--primary);">${utils.escapeHtml(r.eName)}</strong>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${r.eCategory}</div>
                </td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">
                    ${r.eSchedules.map(s => `${utils.formatDate(s.date)} (${s.start}-${s.end})`).join('<br>')}
                </td>
                ${state.role === 'admin' ? `<td style="text-align:right;">
                    <button class="btn btn-secondary btn-icon-only" style="color:var(--danger);" onclick="crud.deleteRegistration('${r.id}')" title="Cancel Registration">
                        ${utils.getSvg('trash')}
                    </button>
                </td>` : ''}
            </tr>
        `).join('');
    },

    openFormModal() {
        // Load dropdowns
        const pSel = document.getElementById('reg-participant-select');
        const eSel = document.getElementById('reg-event-select');

        // Populate participants selector
        pSel.innerHTML = '<option value="">-- Choose Participant --</option>' +
            state.db.participants.map(p => `<option value="${p.id}">${p.name} (${p.course})</option>`).join('');

        // Populate active events selector
        eSel.innerHTML = '<option value="">-- Choose Event --</option>' +
            state.db.events.filter(e => e.status === 'Active').map(e => `<option value="${e.id}">${e.name} [${e.category}]</option>`).join('');

        ui.openModal('registration-modal');
    }
};

// ====================================================
// SETTINGS (BATCH MANAGEMENT & API SETUP)
// ====================================================

const settings = {
    render(container) {
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:2rem;">
                
                <!-- JSONBin.io Credentials Card -->
                <div class="settings-section">
                    <h3 style="font-size:1.15rem; font-weight:700; border-bottom: 1px solid var(--border-color); padding-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
                        ${utils.getSvg('link')}
                        JSONBin.io Server Credentials
                    </h3>
                    
                    <div style="display:flex; gap:1rem; flex-wrap:wrap; align-items:center;">
                        <span style="font-size:0.9rem; font-weight:600;">Status:</span>
                        ${state.config.isDemo ?
                '<span class="badge badge-inactive">Demo Mode (Offline)</span>' :
                '<span class="badge badge-active">Connected to JSONBin</span>'
            }
                    </div>

                    <form id="settings-credentials-form" onsubmit="settings.saveCredentials(event)" style="display:flex; flex-direction:column; gap:1.25rem;">
                        <div class="form-group">
                            <label for="settings-api-key">JSONBin API Key (Master Key or Access Key)</label>
                            <input type="password" class="form-control" id="settings-api-key" value="${state.config.apiKey}" required placeholder="e.g. $2a$10$...">
                        </div>

                        <div class="form-group">
                            <label for="settings-bin-id">JSONBin Bin ID</label>
                            <input type="text" class="form-control" id="settings-bin-id" value="${state.config.binId}" placeholder="e.g. 64b8a21f...">
                        </div>

                        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                            <button type="submit" class="btn btn-primary">Connect & Save</button>
                            <button type="button" class="btn btn-secondary" onclick="settings.testConnection()">Test Connection</button>
                            <button type="button" class="btn btn-success" onclick="settings.provisionBin()">Create New Bin for Me</button>
                        </div>
                    </form>
                </div>

                <!-- Batches Management -->
                <div class="settings-section">
                    <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
                        <h3 style="font-size:1.15rem; font-weight:700; display:flex; align-items:center; gap:0.5rem;">
                            ${utils.getSvg('tag')}
                            Batch Management Directory
                        </h3>
                        <button class="btn btn-primary btn-icon-only" style="width:30px;height:30px;border-radius:6px;" onclick="settings.openBatchModal()">
                            ${utils.getSvg('plus')}
                        </button>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:1rem;">
                        ${state.db.batches.map(b => `
                            <div class="stats-card" style="padding: 1rem;">
                                <div style="display:flex; align-items:center; gap:0.75rem;">
                                    <div class="participant-avatar" style="width:36px;height:36px;border-radius:8px;">
                                        ${b.logo ? `<img src="${b.logo}" alt="batch">` : utils.getInitials(b.name)}
                                    </div>
                                    <div>
                                        <strong style="font-size:0.95rem;">${utils.escapeHtml(b.name)}</strong>
                                        <div style="font-size:0.75rem; color:var(--text-muted);">${utils.formatYearLevel(b.yearLevel)}</div>
                                    </div>
                                </div>
                                <button class="btn btn-secondary btn-icon-only" style="width:28px;height:28px;color:var(--danger);" onclick="crud.deleteBatch('${b.id}')">
                                    ${utils.getSvg('trash')}
                                </button>
                            </div>
                        `).join('') || '<p style="color:var(--text-muted); font-size:0.85rem;">No batches found. Add a batch using the "+" button.</p>'}
                    </div>
                </div>

                <!-- Database operations -->
                <div class="settings-section" style="border-color: rgba(239, 68, 68, 0.2);">
                    <h3 style="font-size:1.15rem; font-weight:700; color: var(--danger); border-bottom: 1px solid var(--border-color); padding-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
                        ${utils.getSvg('trash')}
                        System Reset & Maintenance
                    </h3>
                    <p style="font-size:0.875rem; color:var(--text-muted);">Resetting the database will overwrite all your events, participants, and registrations with the demo seed records. Action is irreversible.</p>
                    <div>
                        <button class="btn btn-danger" onclick="settings.resetDatabase()">Reset Database to Demo Seed</button>
                    </div>
                </div>

            </div>
        `;
    },

    openBatchModal() {
        document.getElementById('batch-form').reset();
        ui.openModal('batch-modal');
    },

    async saveCredentials(e) {
        e.preventDefault();
        const apiKey = document.getElementById('settings-api-key').value.trim();
        const binId = document.getElementById('settings-bin-id').value.trim();

        if (!apiKey || !binId) {
            ui.showToast("API Key and Bin ID are required.", "danger");
            return;
        }

        // Test credentials first
        const test = await api.testConnection(apiKey, binId);
        if (test.success) {
            state.config.apiKey = apiKey;
            state.config.binId = binId;
            state.config.isDemo = false;

            localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, apiKey);
            localStorage.setItem(CONFIG.STORAGE_KEYS.BIN_ID, binId);
            localStorage.setItem(CONFIG.STORAGE_KEYS.IS_DEMO, 'false');

            state.db = test.data;
            api.ensureSchema();
            lastRemoteSnapshot = JSON.stringify(state.db);
            app.startSharedSync();
            ui.showToast("Settings saved and database connected successfully!", "success");
            ui.renderActiveTab();
        } else {
            ui.showToast(`Connection verification failed: ${test.error}`, "danger");
        }
    },

    async testConnection() {
        const apiKey = document.getElementById('settings-api-key').value.trim();
        const binId = document.getElementById('settings-bin-id').value.trim();

        if (!apiKey || !binId) {
            ui.showToast("Input credentials to test connection.", "danger");
            return;
        }

        const test = await api.testConnection(apiKey, binId);
        if (test.success) {
            ui.showToast("Connection to JSONBin.io verified! Server is responding.", "success");
        } else {
            ui.showToast(`Connection failed: ${test.error}`, "danger");
        }
    },

    async provisionBin() {
        const apiKey = document.getElementById('settings-api-key').value.trim();
        if (!apiKey) {
            ui.showToast("Input your JSONBin API Key in the field first.", "danger");
            return;
        }

        const provision = await api.createNewBin(apiKey);
        if (provision.success) {
            document.getElementById('settings-bin-id').value = provision.binId;
            ui.showToast(`Bin created: ID is ${provision.binId}. Fill the form to connect.`, "success");
        } else {
            ui.showToast(`Failed to provision bin: ${provision.error}`, "danger");
        }
    },

    resetDatabase() {
        ui.showConfirm(
            "Reset Database",
            "This will overwrite all events, participants, and logs with demo seed data. Proceed?",
            async (confirmed) => {
                if (confirmed) {
                    state.db = JSON.parse(JSON.stringify(CONFIG.MOCK_DB));
                    ui.showToast("Database reset. Syncing configuration...", "success");
                    await api.saveDatabase();
                }
            }
        );
    }
};

// ====================================================
// INITIALIZATION & ROUTER (CORE ENTRYPOINT)
// ====================================================

const app = {
    preloadedSearchQuery: null,

    async init() {
        // 1. Setup Navigation Event Listeners
        document.querySelectorAll('#sidebar .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                this.router(tab);
            });
        });

        // 2. Setup Top Search shortcut trigger
        document.getElementById('search-bar-trigger').addEventListener('click', () => {
            this.router('search');
        });

        // 3. Setup Mobile sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // 4. Close mobile sidebar by clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const toggle = document.getElementById('sidebar-toggle');
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !toggle.contains(e.target) && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            }
        });

        // 5. Load JSONBin configuration from localStorage
        const localApiKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
        const localBinId = localStorage.getItem(CONFIG.STORAGE_KEYS.BIN_ID);
        const localIsDemo = localStorage.getItem(CONFIG.STORAGE_KEYS.IS_DEMO);

        state.config.apiKey = localApiKey || state.config.apiKey;
        state.config.binId = localBinId || state.config.binId;
        state.config.isDemo = localIsDemo === null
            ? (!state.config.apiKey || !state.config.binId)
            : localIsDemo !== 'false';

        // 6. Launch clock ticks
        this.startClock();

        // 7. Load database
        await api.loadDatabase();

        // 8. Render active tab
        this.router(state.activeTab);

        // 9. Keep other linked users and browser tabs up to date
        this.startSharedSync();
        window.addEventListener('storage', (event) => {
            if (event.key === CONFIG.STORAGE_KEYS.LAST_SYNC) {
                state.db = JSON.parse(localStorage.getItem('ems_local_db')) || state.db;
                api.ensureSchema();
                lastRemoteSnapshot = JSON.stringify(state.db);
                ui.renderActiveTab();
                ui.showToast("Updates loaded from another open tab.", "success");
            }
        });
    },

    router(tabId) {
        state.activeTab = tabId;
        ui.renderActiveTab();
    },

    handleRoleChange(role) {
        state.role = role;
        // Redirect client from admin tabs
        const adminTabs = ['settings'];
        if (role === 'client' && adminTabs.includes(state.activeTab)) {
            state.activeTab = 'dashboard';
        }
        ui.renderActiveTab();
    },

    startSharedSync() {
        if (syncPollTimer) {
            clearInterval(syncPollTimer);
            syncPollTimer = null;
        }

        if (state.config.isDemo || !state.config.apiKey || !state.config.binId) return;

        syncPollTimer = setInterval(() => {
            api.refreshFromServer({ silent: true });
        }, 10000);
    },

    startClock() {
        const updateClock = () => {
            const dateSpan = document.getElementById('nav-date');
            if (dateSpan) {
                const now = new Date();
                const options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                };
                dateSpan.textContent = now.toLocaleDateString('en-US', options);
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    }
};

// Start the application after DOM content finishes loading
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
