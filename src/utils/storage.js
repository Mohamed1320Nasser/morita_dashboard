// Storage utility to check both localStorage and sessionStorage
// This supports the "Remember me" functionality

export const getToken = () => {
    // Check localStorage first (Remember me = true)
    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;

    // Fallback to sessionStorage (Remember me = false)
    const sessionToken = sessionStorage.getItem('token');
    return sessionToken;
};

export const getIsAuthed = () => {
    const localIsAuthed = localStorage.getItem('isAuthed');
    if (localIsAuthed) return localIsAuthed;

    const sessionIsAuthed = sessionStorage.getItem('isAuthed');
    return sessionIsAuthed;
};

export const getUser = () => {
    try {
        const localUser = localStorage.getItem('user');
        if (localUser) return JSON.parse(localUser);

        const sessionUser = sessionStorage.getItem('user');
        if (sessionUser) return JSON.parse(sessionUser);

        return null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

export const clearAuth = () => {
    // Clear both storages on logout
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthed');
    localStorage.removeItem('user');

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('isAuthed');
    sessionStorage.removeItem('user');
};
