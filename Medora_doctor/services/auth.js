import api from './api';
import * as SecureStore from 'expo-secure-store';

export const sendOtp = async (phone) => {
  try {
    const response = await api.post('/doctor/signin/send-otp', { phone });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (phone, otp) => {
  try {
    const response = await api.post('/doctor/signin/verify-otp', { phone, otp });
    const { token, doctor } = response.data;
    
    // Store token securely
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
    }
    
    return { token, doctor };
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/doctor/signout');
  } catch (error) {
    // Fallback if network or server fails
  } finally {
    await SecureStore.deleteItemAsync('auth_token');
  }
};

export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync('auth_token');
  } catch (e) {
    return null;
  }
};
