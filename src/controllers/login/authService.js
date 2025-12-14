import { getToken, getIsAuthed, getUser, clearAuth } from '../../utils/storage';

const authService = {
  checkIfAuthorized() {
    try {
      const token = getToken();
      const isAuthed = getIsAuthed();

      // Check if both token and isAuthed exist and are valid
      if (token && isAuthed === 'true') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking authorization:', error);
      return false;
    }
  },

  getUser() {
    try {
      return getUser();
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  logout() {
    try {
      clearAuth();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
};

export default authService;