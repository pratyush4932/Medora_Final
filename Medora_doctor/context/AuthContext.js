import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { getDoctorProfile } from '../services/doctor';
import { logout as apiLogout } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scannedPatients, setScannedPatients] = useState([]);

  // Set up unauthorized interceptor callback
  useEffect(() => {
    api.onUnauthorized = () => {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setScannedPatients([]);
    };
  }, []);

  // Check storage for existing token on mount
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        if (storedToken) {
          setToken(storedToken);
          // Fetch real profile details using the stored token
          const profileData = await getDoctorProfile();
          if (profileData && profileData.doctor) {
            setUser(profileData.doctor);
            setIsAuthenticated(true);
          } else {
            await SecureStore.deleteItemAsync('auth_token');
          }
        }
      } catch (e) {
        // Securely handle errors
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (jwtToken, doctorDetails) => {
    setToken(jwtToken);
    setUser(doctorDetails);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      // Ignore API logout failures (e.g. network/expiry)
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setScannedPatients([]);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isLoading, login, logout, setUser, scannedPatients, setScannedPatients }}>
      {children}
    </AuthContext.Provider>
  );
};
