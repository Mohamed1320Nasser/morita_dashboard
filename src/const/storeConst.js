export const getStoreId = () => {
    if (typeof sessionStorage === 'undefined') {
        // Handle the case where sessionStorage is not available, e.g., on the server-side.
        return null;
    }

    const store = JSON.parse(sessionStorage.getItem('store'));
    return store?.id || null;
};