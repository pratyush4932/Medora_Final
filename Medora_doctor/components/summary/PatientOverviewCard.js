import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PatientOverviewCard({ patient, aiSummaryDetails }) {
  const age = aiSummaryDetails?.age || patient?.age || 'N/A';
  const gender = aiSummaryDetails?.gender || patient?.gender || 'N/A';
  const bloodGroup = aiSummaryDetails?.blood_group || patient?.blood_group || 'N/A';
  const id = patient?.id || 'N/A';

  const initials = patient?.name
    ? patient.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'P';

  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{patient?.name || 'Unknown Patient'}</Text>
        <Text style={styles.patientId}>ID: {id}</Text>
        
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>AGE</Text>
            <Text style={styles.badgeValue}>{age}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>GENDER</Text>
            <Text style={styles.badgeValue}>{gender}</Text>
          </View>
          <View style={[styles.badge, styles.bloodGroupBadge]}>
            <Text style={styles.badgeLabel}>BLOOD</Text>
            <Text style={styles.badgeValue}>{bloodGroup}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F4F8',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E6FFFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E6FFFA',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B8380',
  },
  detailsContainer: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A2536',
    marginBottom: 2,
  },
  patientId: {
    fontSize: 12,
    color: '#7F8E9D',
    fontWeight: '600',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  bloodGroupBadge: {
    borderColor: '#E6FFFA',
    backgroundColor: '#E6FFFA',
  },
  badgeLabel: {
    fontSize: 9,
    color: '#7F8E9D',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A2536',
  },
});
