import { t } from './i18n.js';

const modal = document.getElementById('confirmation-modal');
const modalMessage = document.getElementById('modal-message');
const confirmBtn = document.getElementById('modal-confirm-btn');
const cancelBtn = document.getElementById('modal-cancel-btn');
const modalTitle = document.getElementById('modal-title');

let resolvePromise;

function showModal(message) {
    // Update text content with translations
    modalTitle.textContent = t('confirm_title');
    confirmBtn.textContent = t('confirm_button');
    cancelBtn.textContent = t('cancel_button');
    modalMessage.textContent = message;
    
    modal.classList.remove('hidden');
}

function hideModal() {
    modal.classList.add('hidden');
}

function handleConfirm() {
    hideModal();
    if (resolvePromise) {
        resolvePromise(true);
    }
}

function handleCancel() {
    hideModal();
    if (resolvePromise) {
        resolvePromise(false);
    }
}

// Add event listeners once
confirmBtn.addEventListener('click', handleConfirm);
cancelBtn.addEventListener('click', handleCancel);

export function customConfirm(message) {
    showModal(message);
    return new Promise((resolve) => {
        resolvePromise = resolve;
    });
}
