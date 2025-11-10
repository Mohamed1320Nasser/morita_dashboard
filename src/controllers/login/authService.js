
const authService = {
  checkIfAuthorized() {
    try {
      const token = sessionStorage.getItem('token');
      const isAuthed = sessionStorage.getItem('isAuthed');
      
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
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  logout() {
    try {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('isAuthed');
      sessionStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
};

export default authService;