import api from './api';

export const getDoctorProfile = async () => {
  try {
    const response = await api.get('/doctor/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};
