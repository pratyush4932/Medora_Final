import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { sendOtp } from '../services/auth';

export default function PhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isValid = phone.trim().length === 10;

  const handlePress = async () => {
    if (!isValid || loading) return;
    
    setLoading(true);
    setError(null);
    const fullPhone = `+91${phone}`;

    try {
      await sendOtp(fullPhone);
      navigation.navigate('Otp', { phoneNumber: fullPhone });
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.innerContainer}>
            {/* Logo Section */}
            <View style={styles.logoWrapper}>
              <View style={styles.logoCard}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logo}
                />
              </View>
            </View>

            {/* Header Text */}
            <Text style={styles.title}>Medora for Doctors</Text>
            <Text style={styles.subtitle}>Enter your registered phone number</Text>

            {/* Input Form */}
            <View style={styles.form}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9876543210"
                  placeholderTextColor="#A8B2C1"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text.replace(/[^0-9]/g, ''));
                    if (error) setError(null);
                  }}
                  disabled={loading}
                />
              </View>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.button,
                  isValid && !loading ? styles.buttonActive : styles.buttonInactive,
                ]}
                activeOpacity={isValid && !loading ? 0.8 : 1.0}
                onPress={handlePress}
                disabled={!isValid || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.buttonText,
                      isValid ? styles.buttonTextActive : styles.buttonTextInactive,
                    ]}
                  >
                    Send Access Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer Text */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Secure access <Text style={styles.dot}>·</Text> Medora Health Network
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCard: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A2536',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8E9D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7F8E9D',
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EBF0',
    borderRadius: 16,
    height: 64,
    paddingHorizontal: 20,
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  countryCode: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A2536',
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1A2536',
    height: '100%',
    padding: 0,
  },
  button: {
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#1A2536',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  buttonInactive: {
    backgroundColor: '#DCE2EC',
  },
  buttonActive: {
    backgroundColor: '#1A827F',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextInactive: {
    color: '#FFFFFF',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8E9D',
  },
  dot: {
    fontWeight: '900',
    color: '#A0AEC0',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    paddingLeft: 4,
  },
});
