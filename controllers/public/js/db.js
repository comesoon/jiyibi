const DB_NAME = 'jiyibi_final_db'; // A completely new name to ensure a fresh start
const DB_VERSION = 1;
let dbPromise = null;

function initDB() {
    // Use a promise to prevent multiple initializations from racing
    if (dbPromise) {
        return dbPromise;
    }

    console.log(`INITDB: Opening database '${DB_NAME}' version ${DB_VERSION}`);
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = e => {
            console.log('INITDB: onupgradeneeded event fired.');
            const db = e.target.result;
            if (!db.objectStoreNames.contains('ledgers')) {
                db.createObjectStore('ledgers', { keyPath: '_id' });
            }
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: '_id' });
            }
            if (!db.objectStoreNames.contains('transactions')) {
                db.createObjectStore('transactions', { keyPath: '_id' });
            }
            console.log('INITDB: Object stores configured.');
        };

        request.onsuccess = e => {
            console.log('INITDB: onsuccess event fired.');
            resolve(e.target.result);
        };

        request.onerror = e => {
            console.error('INITDB: onerror event fired:', e.target.error);
            reject(e.target.error);
        };
    });
    return dbPromise;
}

export async function getStore(storeName, mode) {
    const db = await initDB();
    return db.transaction(storeName, mode).objectStore(storeName);
}