import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import PatientOverviewCard from '../components/summary/PatientOverviewCard';
import AiHealthSummaryCard from '../components/summary/AiHealthSummaryCard';
import ClinicalInsightsCard from '../components/summary/ClinicalInsightsCard';
import MedicalTimeline from '../components/timeline/MedicalTimeline';
import SkeletonLoader from '../components/SkeletonLoader';
import { getPatientData } from '../services/qr';
import { cache } from '../utils/cache';

export default function PatientSummaryScreen({ route, navigation }) {
  const { token } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cachedData = cache.get(`patient_summary_${token}`);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      setError(null);
      const res = await getPatientData(token);
      
      cache.set(`patient_summary_${token}`, res, 5 * 60 * 1000);
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to retrieve patient medical records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    
    return () => {
      cache.delete(`patient_summary_${token}`);
    };
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#1A2536" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading records...</Text>
        </View>
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#1A2536" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to Load Records</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); loadData(); }}>
            <Text style={styles.retryText}>Retry Fetch</Text>
            <RefreshCw size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { patient, records = [], ai_summary } = data || {};

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1A2536" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {patient?.name || 'Patient Summary'}
          </Text>
          <Text style={styles.headerSubtitle}>Medora Health Record</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1B8380']}
            tintColor="#1B8380"
          />
        }
      >
        <PatientOverviewCard patient={patient} aiSummaryDetails={ai_summary?.patient_details} />
        <AiHealthSummaryCard aiSummary={ai_summary} />
        <ClinicalInsightsCard aiSummary={ai_summary} />
        <MedicalTimeline records={records} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EBF1F6',
    elevation: 2,
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2536',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#7F8E9D',
    fontWeight: '700',
    marginTop: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A2536',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#7F8E9D',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B8380',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#1B8380',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
