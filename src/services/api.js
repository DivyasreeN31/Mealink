const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get Firebase UID
const getFirebaseUID = () => {
  // Get from localStorage or from current user context
  return localStorage.getItem('firebaseUID');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const firebaseUID = getFirebaseUID();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(firebaseUID && { 'X-Firebase-UID': firebaseUID }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store Firebase UID
    if (userData.firebaseUid) {
      localStorage.setItem('firebaseUID', userData.firebaseUid);
    }
    
    return response;
  },

  // Login user (Firebase handles this, just store UID)
  login: async (firebaseUser) => {
    // Store Firebase UID
    if (firebaseUser.uid) {
      localStorage.setItem('firebaseUID', firebaseUser.uid);
    }
    
    return { user: firebaseUser };
  },

  // Get current user by Firebase UID
  getCurrentUser: async (firebaseUid) => {
    return await apiRequest(`/auth/me/${firebaseUid}`);
  },

  // Update profile
  updateProfile: async (profileData) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('firebaseUID');
  },
};

// Donations API
export const donationsAPI = {
  // Get all donations
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/donations?${queryString}`);
  },

  // Get donation by ID
  getById: async (id) => {
    return await apiRequest(`/donations/${id}`);
  },

  // Create donation
  create: async (donationData) => {
    const formData = new FormData();
    
    // Add image file
    if (donationData.image) {
      formData.append('image', donationData.image);
    }
    
    // Add other fields
    Object.keys(donationData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, donationData[key]);
      }
    });

    const firebaseUID = getFirebaseUID();
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      headers: {
        'X-Firebase-UID': firebaseUID,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Update donation
  update: async (id, updateData) => {
    return await apiRequest(`/donations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Reserve donation
  reserve: async (id) => {
    return await apiRequest(`/donations/${id}/reserve`, {
      method: 'POST',
    });
  },

  // Mark as donated
  markDonated: async (id) => {
    return await apiRequest(`/donations/${id}/donate`, {
      method: 'POST',
    });
  },

  // Delete donation
  delete: async (id) => {
    return await apiRequest(`/donations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersAPI = {
  // Get user's donations
  getDonations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/users/donations?${queryString}`);
  },

  // Get user's reservations
  getReservations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/users/reservations?${queryString}`);
  },

  // Get user statistics
  getStats: async () => {
    return await apiRequest('/users/stats');
  },
};

// Health check
export const healthCheck = async () => {
  return await apiRequest('/health');
};

export default {
  auth: authAPI,
  donations: donationsAPI,
  users: usersAPI,
  health: healthCheck,
}; 