import api from './api';

export const getPatientData = async (token) => {
  try {
    const response = await api.get(`/qr/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
