import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { LogOut, Clock, Shield, QrCode } from 'lucide-react-native';

import { useAuth } from '../hooks/useAuth';

export default function DashboardScreen({ navigation }) {
  const { user, logout, scannedPatients } = useAuth();

  const handleScanPress = () => {
    navigation.navigate('Scanner');
  };

  const hospitalName = user?.hospital_name || user?.hospital?.name || 'Medora Hospital';
  const doctorName = user?.name || 'Dr. Rameshwar Reddy';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Small Logo Icon */}
            <View style={styles.miniLogoCard}>
              <Image source={require('../assets/logo.png')} style={styles.miniLogo} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.hospitalText}>{hospitalName.toUpperCase()}</Text>
              <Text style={styles.doctorText}>{doctorName}</Text>
            </View>
          </View>
          
          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
            <LogOut size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Scan Patient Card */}
        <TouchableOpacity style={styles.scanCard} onPress={handleScanPress} activeOpacity={0.9}>
          <View style={styles.qrIconContainer}>
            <QrCode size={40} color="#1A827F" />
          </View>
          <Text style={styles.scanTitle}>SCAN PATIENT QR</Text>
          <Text style={styles.scanSubtitle}>Instantly access medical history</Text>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Today's Scans */}
          <View style={[styles.statCard, styles.scansBg]}>
            <View style={styles.statCardInner}>
              <View style={[styles.statIconWrapper, styles.blueIconBg]}>
                <Clock size={20} color="#2B6CB0" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{scannedPatients.length}</Text>
                <Text style={styles.statLabel}>Today's Scans</Text>
              </View>
            </View>
          </View>

          {/* Active Session */}
          <View style={[styles.statCard, styles.sessionBg]}>
            <View style={styles.statCardInner}>
              <View style={[styles.statIconWrapper, styles.greenIconBg]}>
                <Shield size={20} color="#2F855A" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.activeText}>Active</Text>
                <Text style={styles.statLabel}>Session</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Patients */}
        <View style={styles.patientsSection}>
          <Text style={styles.sectionTitle}>Recent Patients</Text>

          {scannedPatients.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No recent scans today</Text>
              <Text style={styles.emptyStateSubtitle}>
                Patient history will appear here after scanning
              </Text>
            </View>
          ) : (
            /* Patient List */
            <View style={styles.patientList}>
              {scannedPatients.map((patient, index) => (
                <View key={`patient-${index}`} style={styles.patientCard}>
                  <View style={styles.patientAvatar}>
                    <Text style={styles.avatarText}>
                      {patient.name ? patient.name.charAt(0) : 'P'}
                    </Text>
                  </View>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.patientMeta}>
                      {patient.age} yrs • {patient.gender} • ID: {patient.id}
                    </Text>
                  </View>
                  <View style={styles.scanTimeContainer}>
                    <Text style={styles.scanTime}>{patient.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniLogoCard: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  miniLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  headerInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  hospitalText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A827F',
    letterSpacing: 1.0,
    marginBottom: 2,
  },
  doctorText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A2536',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCard: {
    backgroundColor: '#1B8380',
    borderRadius: 28,
    paddingVertical: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A827F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
  },
  qrIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2.0,
    marginBottom: 6,
  },
  scanSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 0.48,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  scansBg: {
    backgroundColor: '#F0F6FC',
    borderColor: '#E6EFF9',
  },
  sessionBg: {
    backgroundColor: '#EDF9F1',
    borderColor: '#E1F3E6',
  },
  statCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueIconBg: {
    backgroundColor: '#DBE9F6',
  },
  greenIconBg: {
    backgroundColor: '#D1EAD8',
  },
  statContent: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A2536',
  },
  activeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2F855A',
  },
  statLabel: {
    fontSize: 11,
    color: '#7F8E9D',
    fontWeight: '600',
    marginTop: 1,
  },
  patientsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A2536',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7F8E9D',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 18,
  },
  patientList: {
    width: '100%',
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F4F8',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B8380',
  },
  patientInfo: {
    marginLeft: 14,
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2536',
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: 12,
    color: '#7F8E9D',
    fontWeight: '500',
  },
  scanTimeContainer: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  scanTime: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '600',
  },
});
