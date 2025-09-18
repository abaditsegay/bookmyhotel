// User API service functions
// This file contains functions for user profile management API calls

import TokenManager from '../utils/tokenManager';
import { API_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  userId: string,
  updates: UpdateProfileRequest,
  token: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update profile' 
    };
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (
  userId: string,
  passwordData: ChangePasswordRequest,
  token: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Password change error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to change password' 
    };
  }
};

/**
 * Get user profile information
 */
export const getUserProfile = async (
  userId: string,
  token: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Profile fetch error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch profile' 
    };
  }
};
