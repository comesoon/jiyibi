const cache = {
    ledgers: null,
    transactions: null,
    categories: null,
};

export function get(key) {
    return cache[key];
}

export function set(key, data) {
    cache[key] = data;
}

export function invalidate(key) {
    if (key) {
        cache[key] = null;
    } else {
        // Invalidate all
        Object.keys(cache).forEach(k => {
            cache[k] = null;
        });
    }
}
