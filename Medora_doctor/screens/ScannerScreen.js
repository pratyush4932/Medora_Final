import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Zap, QrCode } from 'lucide-react-native';
import { getPatientData } from '../services/qr';
import { useAuth } from '../hooks/useAuth';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setScannedPatients } = useAuth();

  const handleClose = () => {
    navigation.goBack();
  };

  const processQrToken = async (rawToken) => {
    // Extract token if it's a URL
    let token = rawToken;
    if (rawToken.includes('/qr/')) {
      const parts = rawToken.split('/qr/');
      token = parts[parts.length - 1];
    }
    
    setLoading(true);
    try {
      const patientData = await getPatientData(token);
      
      // Map to scanned patients schema
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const age = patientData.ai_summary?.patient_details?.age || '30';
      const gender = patientData.ai_summary?.patient_details?.gender || 'Other';
      
      const newPatient = {
        id: patientData.patient?.id || token,
        name: patientData.patient?.name || 'Unknown Patient',
        age,
        gender,
        time: timeString,
      };

      setScannedPatients((prev) => [newPatient, ...prev]);
      
      // Navigate to PatientSummary screen
      navigation.replace('PatientSummary', { token });
    } catch (err) {
      Alert.alert(
        'QR Code Error',
        err.message || 'This QR token is expired or invalid.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A827F" />
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    processQrToken(data);
  };

  const handleSimulateScan = () => {
    if (scanned || loading) return;
    setScanned(true);
    // Use the sample UUID token from the API documentation
    const sampleToken = 'a98a0e8d-cdb6-455b-9d41-47752e25f82c';
    processQrToken(sampleToken);
  };

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color="#1A2536" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.permissionContent}>
          <View style={styles.lockIconContainer}>
            <QrCode size={64} color="#1A827F" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSubtitle}>
            We need camera permissions to scan patient QR codes and load their medical records instantly.
          </Text>

          <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
            <Text style={styles.grantButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoButton} onPress={handleSimulateScan}>
            <Text style={styles.demoButtonText}>Simulate Scan (Demo Mode)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        key={permission.granted ? 'camera-active' : 'camera-inactive'}
        style={styles.camera}
        facing="back"
        enableTorch={flash}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      {/* Full overlay with transparent scanning cutout */}
      <View style={styles.overlay}>
        {/* Top Control Bar */}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} onPress={handleClose} activeOpacity={0.7}>
              <X size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.iconButton, flash && styles.iconButtonActive]}
              onPress={() => setFlash(!flash)}
              activeOpacity={0.7}
            >
              <Zap size={22} color={flash ? '#1A827F' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Center Cutout Box */}
        <View style={styles.centerContainer}>
          <View style={styles.scanBox}>
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft, styles.cornerHorizontal]} />
            <View style={[styles.corner, styles.topLeft, styles.cornerVertical]} />
            
            <View style={[styles.corner, styles.topRight, styles.cornerHorizontal]} />
            <View style={[styles.corner, styles.topRight, styles.cornerVertical]} />
            
            <View style={[styles.corner, styles.bottomLeft, styles.cornerHorizontal]} />
            <View style={[styles.corner, styles.bottomLeft, styles.cornerVertical]} />
            
            <View style={[styles.corner, styles.bottomRight, styles.cornerHorizontal]} />
            <View style={[styles.corner, styles.bottomRight, styles.cornerVertical]} />
          </View>
          
          <Text style={styles.scanInstruction}>
            Position patient's QR code within the frame
          </Text>
        </View>

        {/* Bottom Bar / Demo Simulation Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.simulateOverlayButton} onPress={handleSimulateScan}>
            <Text style={styles.simulateOverlayButtonText}>Tap to Simulate Successful Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  permissionHeader: {
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A2536',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 15,
    color: '#7F8E9D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  grantButton: {
    backgroundColor: '#1A827F',
    height: 56,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1A827F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoButton: {
    backgroundColor: '#E2E8F0',
    height: 56,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
  },
  safeArea: {
    width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    borderColor: '#3D9B91', // Greenish teal scan boundary corners
    borderWidth: 4,
  },
  cornerHorizontal: {
    width: 24,
    height: 0,
  },
  cornerVertical: {
    width: 0,
    height: 24,
  },
  topLeft: {
    top: -2,
    left: -2,
  },
  topRight: {
    top: -2,
    right: -2,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
  },
  scanInstruction: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 28,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  simulateOverlayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simulateOverlayButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
