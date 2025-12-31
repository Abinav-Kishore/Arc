import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useStudent } from '../lib/student-context';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

const { width, height } = Dimensions.get('window');

const ALLOWED_DOMAINS = ['@citchennai.net']; // Organization email domains

const validateOrgEmail = (email) => {
  return ALLOWED_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
};

// Decorative elements component
const DecorativeElements = () => (
  <>
    {/* Stars */}
    <Text style={[styles.star, { top: 60, left: 30 }]}>✦</Text>
    <Text style={[styles.star, { top: 80, right: 40 }]}>✦</Text>
    <Text style={[styles.star, { top: 150, left: 50 }]}>+</Text>
    <Text style={[styles.star, { top: 120, right: 60 }]}>+</Text>
    <Text style={[styles.star, { top: 200, right: 30 }]}>✦</Text>
    <Text style={[styles.star, { top: 180, left: 25 }]}>+</Text>
    
    {/* Clouds */}
    <View style={[styles.cloud, { top: 100, right: -20 }]}>
      <View style={styles.cloudCircle} />
      <View style={[styles.cloudCircle, { left: 15, top: 5 }]} />
      <View style={[styles.cloudCircle, { left: 30, top: 0 }]} />
    </View>
    <View style={[styles.cloud, { top: 160, left: -30 }]}>
      <View style={styles.cloudCircle} />
      <View style={[styles.cloudCircle, { left: 15, top: 5 }]} />
      <View style={[styles.cloudCircle, { left: 30, top: 0 }]} />
    </View>
    <View style={[styles.cloud, { top: 220, right: 20 }]}>
      <View style={[styles.cloudCircle, { width: 20, height: 20 }]} />
      <View style={[styles.cloudCircle, { left: 12, top: 3, width: 20, height: 20 }]} />
    </View>
  </>
);

export default function LoginPage() {
  const router = useRouter();
  const { setStudentData } = useStudent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const fetchStudentDetails = async (userEmail) => {
    try {
      const { data, error } = await supabase
        .from('Students')
        .select('*')
        .eq('EMAIL', userEmail)
        .single();

      if (error) {
        console.log('Student record not found, creating one...');
        // Optionally create a new student record if it doesn't exist
        const { data: newStudent, error: insertError } = await supabase
          .from('Students')
          .insert([{ EMAIL: userEmail }])
          .select()
          .single();

        if (insertError) throw insertError;
        setStudentData(newStudent);
      } else {
        setStudentData(data);
      }
    } catch (e) {
      console.error('Error fetching student details:', e.message);
      // Continue anyway - student data will be empty but login succeeds
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateOrgEmail(email)) {
      Alert.alert('Error', `Please use an organization email (${ALLOWED_DOMAINS.join(', ')})`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        Alert.alert('Login Error', error.message);
      } else if (data.user) {
        // Save user session
        if (AsyncStorage) {
          await AsyncStorage.setItem('@arc_user', JSON.stringify(data.user));
        }

        // Fetch student details
        await fetchStudentDetails(email);

        router.replace('/student');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateOrgEmail(email)) {
      Alert.alert('Error', `Please use an organization email (${ALLOWED_DOMAINS.join(', ')})`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        Alert.alert('Sign Up Error', error.message);
      } else if (data.user) {
        Alert.alert('Success', 'Account created! Please log in.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Orange gradient background section */}
      <View style={styles.orangeSection}>
        <DecorativeElements />
        
        {/* Logo/Brand area */}
        <View style={styles.brandContainer}>
          <Text style={styles.logo}>ARC</Text>
          <Text style={styles.tagline}>Automated Reporting Central</Text>
        </View>
      </View>

      {/* White card section */}
      <View style={styles.whiteSection}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Log in'}</Text>
          <Text style={styles.subtitle}>
            {isSignUp 
              ? 'Sign up with your organization email' 
              : 'By logging in, you agree to our Terms of Use.'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>Use your @citchennai.net email</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isSignUp ? handleSignUp : handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Connect'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setEmail('');
              setPassword('');
            }}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            For more information, please see <Text style={styles.footerLink}>Privacy policy</Text>.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f97316'
  },
  orangeSection: {
    height: height * 0.4,
    backgroundColor: '#f97316',
    position: 'relative',
    overflow: 'hidden'
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40
  },
  logo: {
    fontSize: 64,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontWeight: '500'
  },
  star: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '300'
  },
  cloud: {
    position: 'absolute',
    flexDirection: 'row'
  },
  cloudCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    position: 'absolute'
  },
  whiteSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingTop: 32,
    paddingHorizontal: 24
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 28,
    lineHeight: 20
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff'
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6
  },
  button: {
    backgroundColor: '#f97316',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#f97316',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600'
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center'
  },
  toggleText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '500'
  },
  footer: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 24,
    lineHeight: 18
  },
  footerLink: {
    color: '#1f2937',
    fontWeight: '600'
  }
});
