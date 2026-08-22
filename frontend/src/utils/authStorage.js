const TOKEN_KEY = 'hrms_token';

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to retrieve token from storage', e);
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Failed to set token in storage', e);
  }
};

export const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to clear token from storage', e);
  }
};
