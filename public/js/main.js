import * as Auth from './auth.js';
import * as UI from './ui.js';
import * as API from './api.js';
import * as i18n from './i18n.js';
import * as db from './db.js';
import * as sync from './sync.js';

const app = document.getElementById('app');

const routes = {
    '#login': UI.renderLoginForm,
    '#register': UI.renderRegisterForm,
    '#dashboard': UI.renderDashboard,
    '#ledgers': UI.renderLedgerList,
    '#transactions': UI.renderTransactionList,
    '#categories': UI.renderCategoryList,
    '#new-ledger': UI.renderLedgerForm,
    '#new-transaction': UI.renderTransactionForm,
    '#new-category': UI.renderCategoryForm,
    '#charts': UI.renderChartView,
    '#profile': UI.renderProfilePage,
    '#logout': logout,
    '#edit-ledger': UI.renderLedgerForm,
    '#edit-transaction': UI.renderTransactionForm,
    // Admin Routes
    '#admin/dashboard': UI.renderAdminDashboard,
    '#admin/users': UI.renderUserManagement,
    '#admin/invitations': UI.renderInvitationCodeManagement,
};

async function router() {
    const fullPath = window.location.hash || '#dashboard';
    const [path, queryString] = fullPath.split('?');
    const queryParams = new URLSearchParams(queryString);
    
    const [base, id] = path.split('/');
    // For admin routes like #admin/dashboard, baseRoute should be '#admin/dashboard', not just '#admin'
    const baseRoute = path.startsWith('#admin/') ? path : (id ? base : path);

    // Route Protection
    if (!['#login', '#register'].includes(baseRoute)) {
        if (!Auth.isAuthenticated()) {
            window.location.hash = '#login';
            return;
        }
    }

    // Admin Route Protection
    if (baseRoute.startsWith('#admin')) {
        const user = Auth.getUser();
        if (!user || user.role !== 'isacc') {
            showToast('Forbidden: Admin access required', 'error');
            window.location.hash = '#dashboard';
            return;
        }
    }

    const view = routes[baseRoute] || UI.renderNotFound;

    if (base === '#logout') {
        return view();
    }

    let data = { queryParams }; // Pass query params to the view
    try {
        if (baseRoute === '#dashboard') {
            const allLedgers = await API.getLedgers();
            data.ledgers = allLedgers;

            // Determine selected ledger
            let selectedLedgerId = queryParams.get('ledgerId') || localStorage.getItem('selectedLedgerId');
            // Ensure selectedLedgerId is valid or reset if not found in current ledgers
            if (selectedLedgerId && !allLedgers.some(l => l._id === selectedLedgerId)) {
                selectedLedgerId = null; // Reset if invalid
                localStorage.removeItem('selectedLedgerId');
            }
            data.selectedLedgerId = selectedLedgerId;

            const transactionParams = selectedLedgerId ? { ledgerId: selectedLedgerId } : {};
            data.transactions = await API.getTransactions(transactionParams);
        } else if (baseRoute === '#ledgers') {
            data.ledgers = await API.getLedgers();
        } else if (baseRoute === '#transactions') {
            const allLedgers = await API.getLedgers();
            data.ledgers = allLedgers;

            const selectedLedgerId = localStorage.getItem('selectedLedgerId');
            data.selectedLedgerId = selectedLedgerId;

            const apiParams = Object.fromEntries(queryParams.entries());
            if (selectedLedgerId) {
                apiParams.ledgerId = selectedLedgerId;
            }
            data.transactions = await API.getTransactions(apiParams);
        } else if (baseRoute === '#categories') {
            data.categories = await API.getCategories();
        } else if (baseRoute === '#charts') {
            const allLedgers = await API.getLedgers();
            data.ledgers = allLedgers;

            const selectedLedgerId = localStorage.getItem('selectedLedgerId');
            data.selectedLedgerId = selectedLedgerId;

            const transactionParams = selectedLedgerId ? { ledgerId: selectedLedgerId } : {};
            data.transactions = await API.getTransactions(transactionParams);
            data.categories = await API.getCategories();
        } else if (baseRoute === '#admin/invitations') {
            data.invitationCodes = await API.getInvitationCodes();
        } else if (baseRoute === '#admin/users') {
            data.users = await API.getAdminUsers();
        }
    } catch (error) {
        console.error('Data fetching error:', error);
    }

    view(app, data, id);
    updateUIText();
    focusFirstHeading(app);
}

function focusFirstHeading(container) {
    // Set a timeout to ensure the element is in the DOM and rendered.
    setTimeout(() => {
        const firstHeading = container.querySelector('h2');
        if (firstHeading) {
            firstHeading.focus();
        }
    }, 0);
}

function logout() {
    Auth.logout();
    updateNav();
    window.location.hash = '#login';
    router();
}

function updateNav() {
    const authLinks = document.getElementById('auth-links');
    const userNav = document.getElementById('user-nav');
    const userInfo = document.getElementById('user-info');
    const adminLink = document.getElementById('admin-link');

    if (Auth.isAuthenticated()) {
        authLinks.classList.add('hidden');
        userNav.classList.remove('hidden');
        const user = Auth.getUser();
        if (user) {
            userInfo.textContent = user.nickname || user.email;
            if (user.role === 'isacc') {
                adminLink.classList.remove('hidden');
            } else {
                adminLink.classList.add('hidden');
            }
        }
    } else {
        authLinks.classList.remove('hidden');
        userNav.classList.add('hidden');
        adminLink.classList.add('hidden');
        userInfo.textContent = '';
    }
}

function updateUIText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = i18n.t(key);
    });
}

async function initApp() {
    await i18n.init();
    applyTheme();
    updateNav();
    router();
    registerServiceWorker();
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                // console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
}

function applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'green';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

document.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('hashchange', () => {
    updateNav();
    router();
});