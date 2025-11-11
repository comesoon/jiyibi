const TOKEN_KEY = 'jiyibi_token';
const USER_KEY = 'jiyibi_user';

export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export function removeUser() {
    localStorage.removeItem(USER_KEY);
}

export function login(token, user) {
    saveToken(token);
    saveUser(user);
}

export function logout() {
    removeToken();
    removeUser();
}

export function isAuthenticated() {
    const token = getToken();
    // Here you might want to add token expiration check
    return !!token;
}
