import React, { useState, useRef, useEffect } from 'react';
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
import { verifyOtp } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

export default function OtpScreen({ route, navigation }) {
  const { phoneNumber } = route.params || {};
  const { login } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Blinking cursor effect
  useEffect(() => {
    let interval;
    if (isFocused) {
      interval = setInterval(() => {
        setCursorVisible((prev) => !prev);
      }, 500);
    } else {
      setCursorVisible(false);
    }
    return () => clearInterval(interval);
  }, [isFocused]);

  const isValid = otp.length === 6;

  const handlePressContainer = () => {
    inputRef.current?.focus();
  };

  const handlePressVerify = async () => {
    if (!isValid || loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const { token, doctor } = await verifyOtp(phoneNumber, otp);
      await login(token, doctor);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to render the custom access code cells
  const renderCodeDigits = () => {
    const digits = [];
    const codeLength = otp.length;

    for (let i = 0; i < 6; i++) {
      const hasDigit = i < codeLength;
      const digitValue = hasDigit ? otp[i] : 'o';
      const isCurrentIndex = i === codeLength;

      // Add a cell for the digit
      digits.push(
        <View key={`digit-${i}`} style={styles.digitCellContainer}>
          {isFocused && isCurrentIndex && cursorVisible && (
            <View style={styles.inlineCursorLeft} />
          )}
          <Text style={[styles.digitText, hasDigit ? styles.digitFilled : styles.digitPlaceholder]}>
            {digitValue}
          </Text>
        </View>
      );

      // Add the middle vertical separator after index 2
      if (i === 2) {
        const isMiddleCursor = codeLength === 3;
        digits.push(
          <View key="middle-separator" style={styles.middleSeparatorContainer}>
            {isFocused && isMiddleCursor && cursorVisible ? (
              <View style={styles.middleCursor} />
            ) : (
              <View style={styles.middleLine} />
            )}
          </View>
        );
      }
    }

    // Add trailing cursor if code is full and focused
    if (isFocused && codeLength === 6 && cursorVisible) {
      digits.push(
        <View key="trailing-cursor" style={styles.trailingCursorContainer}>
          <View style={styles.inlineCursorRight} />
        </View>
      );
    }

    return digits;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar with Back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹ Edit Phone</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {phoneNumber || '+91 8013667144'}
            </Text>

            {/* OTP Form */}
            <View style={styles.form}>
              <Text style={styles.label}>ACCESS CODE</Text>

              {/* Custom Input Display */}
              <TouchableWithoutFeedback onPress={handlePressContainer}>
                <View style={[styles.otpDisplayContainer, isFocused && styles.otpDisplayFocused]}>
                  {renderCodeDigits()}
                </View>
              </TouchableWithoutFeedback>

              {/* Hidden TextInput */}
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/[^0-9]/g, ''));
                  if (error) setError(null);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                caretHidden={true}
                disabled={loading}
              />

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
                onPress={handlePressVerify}
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
                    Verify & Sign In
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
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 80, // added height offset to account for back button push
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
  otpDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  otpDisplayFocused: {
    borderColor: '#CBD5E0',
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  digitCellContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  digitText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    width: 24,
    // Add letterSpacing styling to make it matches the circle placeholders
  },
  digitPlaceholder: {
    color: '#7F8E9D',
    fontSize: 20,
    marginTop: -4, // vertically adjust "o" to match numbers' baseline
  },
  digitFilled: {
    color: '#1A2536',
  },
  middleSeparatorContainer: {
    width: 24,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleLine: {
    width: 2,
    height: 28,
    backgroundColor: '#3D9B91', // teal green cursor line in the screenshot
    opacity: 0.6,
  },
  middleCursor: {
    width: 2,
    height: 28,
    backgroundColor: '#3D9B91',
  },
  inlineCursorLeft: {
    width: 2,
    height: 24,
    backgroundColor: '#3D9B91',
    marginRight: 2,
  },
  inlineCursorRight: {
    width: 2,
    height: 24,
    backgroundColor: '#3D9B91',
    marginLeft: 2,
  },
  trailingCursorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
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
    marginTop: 12,
    textAlign: 'center',
  },
});
