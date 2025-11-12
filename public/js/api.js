import { getStore } from './db.js';
import { showLoader, hideLoader } from './loader.js';
import { showToast } from './toast.js';
import * as store from './store.js';
import { t } from './i18n.js';

// A simplified API that temporarily disables offline support to fix the DB bug.

async function networkRequest(url, options = {}, expectJson = true) {
    showLoader();
    try {
        const headers = { ...options.headers };
        const token = localStorage.getItem('jiyibi_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api' + url, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Network request failed');
        }

        if (!expectJson) {
            return response;
        }

        if (response.status === 204) {
            return;
        }
        
        return response.json();
    } catch (error) {
        showToast(t(error.message), 'error');
        throw error;
    } finally {
        hideLoader();
    }
}

// --- Auth (Network Only) ---
export const login = (email, password) => networkRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), headers: { 'Content-Type': 'application/json' } });
export const register = (email, password, invitationCode) => networkRequest('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, invitationCode }), headers: { 'Content-Type': 'application/json' } });
// --- User Profile ---
export const getUserProfile = () => networkRequest('/users/profile');
export const updateUserProfile = (data) => networkRequest('/users/profile', { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });

// --- Invitation Codes ---
export const getInvitationCodes = () => networkRequest('/invitation-codes');
export const createInvitationCode = (data) => networkRequest('/invitation-codes', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });

// --- Admin ---
export const getAdminUsers = () => networkRequest('/admin/users');
export const updateUserRole = (userId, role) => networkRequest(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }), headers: { 'Content-Type': 'application/json' } });

// --- Export ---
export async function exportTransactions(query) {
    try {
        const response = await networkRequest(`/export?${query}`, {}, false);
        const blob = await response.blob();
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'transactions.xlsx'; // default
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch.length > 1) {
                filename = filenameMatch[1];
            }
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        // The networkRequest function already shows a toast on failure
    }
}

// --- Data Functions (with Caching) ---

export async function getLedgers() {
    let ledgers = store.get('ledgers');
    if (ledgers) {
        return ledgers;
    }
    ledgers = await networkRequest('/ledgers');
    store.set('ledgers', ledgers);
    return ledgers;
}

export async function createLedger(data) {
    const result = await networkRequest('/ledgers', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    store.invalidate('ledgers');
    return result;
}

export async function updateLedger(id, data) {
    const result = await networkRequest(`/ledgers/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    store.invalidate('ledgers');
    return result;
}

export async function deleteLedger(id) {
    await networkRequest(`/ledgers/${id}`, { method: 'DELETE' });
    store.invalidate('ledgers');
}


export async function getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const hasFilters = query.length > 0;

    // If no filters, use the cache.
    if (!hasFilters) {
        let transactions = store.get('transactions');
        if (transactions) {
            return transactions;
        }
    }

    // If there are filters, or the cache is empty, fetch from network.
    const url = query ? `/transactions?${query}` : '/transactions';
    const transactions = await networkRequest(url);

    // Only cache the full, unfiltered list.
    if (!hasFilters) {
        store.set('transactions', transactions);
    }
    
    return transactions;
}

export async function createTransaction(data) {
    const result = await networkRequest('/transactions', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    store.invalidate('transactions');
    return result;
}

export async function updateTransaction(id, data) {
    const result = await networkRequest(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    store.invalidate('transactions');
    return result;
}

export async function deleteTransaction(id) {
    await networkRequest(`/transactions/${id}`, { method: 'DELETE' });
    store.invalidate('transactions');
}


export async function getCategories() {
    let categories = store.get('categories');
    if (categories) {
        return categories;
    }
    categories = await networkRequest('/categories');
    store.set('categories', categories);
    return categories;
}

export async function createCategory(data) {
    const result = await networkRequest('/categories', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    store.invalidate('categories');
    return result;
}


// Get single items - for now, these can still hit the network or a more complex cache
// For simplicity, we'll refetch, but a better implementation would get from the cached list.
export async function getLedger(id) {
    return networkRequest(`/ledgers/${id}`);
}
export async function getTransaction(id) {
    return networkRequest(`/transactions/${id}`);
}