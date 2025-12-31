import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeContext } from '../lib/theme';
import { useStudent } from '../lib/student-context';
import { usePermissions } from '../lib/permissions-context';
import { supabase } from '../lib/supabase';

// List of all profile fields for permission checking
const ALL_PROFILE_FIELDS = [
  'NAME', 'REGNO', 'DEPT', 'SECTION', 'YEAR', 'GENDER',
  'EMAIL', 'OFFICIAL_MAIL', 'MOBILE_NO', 'ALT_MOBILE_NO', 'CURRENT_ADDRESS', 'PERMANENT_ADDRESS', 'PINCODE', 'STATE',
  '10TH_BOARD_MARKS', '10TH_BOARD_PCT', '10TH_BOARD_YEAR', '12TH_BOARD_MARKS', '12TH_BOARD_PCT', '12TH_BOARD_YEAR', 'DIPLOMA_YEAR', 'DIPLOMA_PCT',
  'GPA_SEM1', 'GPA_SEM2', 'GPA_SEM3', 'GPA_SEM4', 'GPA_SEM5', 'GPA_SEM6', 'GPA_SEM7', 'GPA_SEM8', 'CGPA',
  'AADHAR_NO', 'PAN_NO',
  'FATHER_NAME', 'MOTHER_NAME', 'GUARDIAN_NAME',
  'KNOWN_TECH_STACK', 'INTERNSHIP_COMPANY', 'INTERNSHIP_OFFER_LINK',
  'PLACEMENT_HS', 'WILLING_TO_RELOCATE',
  'COE_NAME', 'COE_INCHARGE_NAME', 'COE_PROJECTS_DONE'
];

export default function StudentProfilePage(){
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const { studentData, setStudentData } = useStudent();
  const { isFieldEditable, hasAnyEditableField, loading: permissionsLoading } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // Check if any field is editable (to show/hide Edit button)
  const canEdit = hasAnyEditableField(ALL_PROFILE_FIELDS);

  useEffect(() => {
    if (studentData) {
      setFormData(studentData);
    }
  }, [studentData]);

  const saveProfile = async () => {
    try {
      setSaving(true);
      
      // Only include fields that are editable in the update
      const editableUpdates = {};
      Object.keys(formData).forEach(field => {
        if (isFieldEditable(field)) {
          editableUpdates[field] = formData[field];
        }
      });

      const { data, error } = await supabase
        .from('Students')
        .update(editableUpdates)
        .eq('EMAIL', studentData.EMAIL || studentData.email)
        .select()
        .single();

      if (error) throw error;
      
      setStudentData(data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const EditableField = ({ label, field, keyboardType = 'default' }) => {
    const fieldEditable = isFieldEditable(field);
    const showAsEditable = isEditing && fieldEditable;
    
    return (
      <View style={[styles.detailCard, { backgroundColor: theme.surface }]}>
        <View style={styles.labelRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
          {!fieldEditable && (
            <Text style={[styles.lockIcon, { color: theme.textSecondary }]}>🔒</Text>
          )}
        </View>
        {showAsEditable ? (
          <TextInput
            style={[styles.detailInput, { color: theme.text, borderColor: theme.border }]}
            value={formData[field]?.toString() || ''}
            onChangeText={(text) => updateField(field, text)}
            keyboardType={keyboardType}
            placeholder="-"
            placeholderTextColor={theme.textSecondary}
          />
        ) : (
          <Text style={[styles.detailValue, { color: theme.text }]}>{formData[field] || '-'}</Text>
        )}
      </View>
    );
  };

  const initials = (formData.NAME || 'ST').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>My Profile</Text>
          {canEdit ? (
            <TouchableOpacity onPress={isEditing ? saveProfile : () => setIsEditing(true)} disabled={saving}>
              <Text style={[styles.editBtn, { color: '#fff' }]}>{saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      <View style={styles.logoSection}>
        <View style={[styles.logoCircle, { backgroundColor: theme.secondary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.platformName, { color: theme.text }]}>{formData.NAME || '-'}</Text>
        <Text style={[styles.platformSub, { color: theme.textSecondary }]}>
          {formData.SECTION || formData.sec || '-'} • {formData.DEPT || '-'}
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Details</Text>
        <EditableField label="Full Name" field="NAME" />
        <EditableField label="Registration No" field="REGNO" />
        <EditableField label="Department" field="DEPT" />
        <EditableField label="Section" field="SECTION" />
        <EditableField label="Year" field="YEAR" />
        <EditableField label="Gender" field="GENDER" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Information</Text>
        <EditableField label="Email" field="EMAIL" keyboardType="email-address" />
        <EditableField label="Official Email" field="OFFICIAL_MAIL" keyboardType="email-address" />
        <EditableField label="Mobile No" field="MOBILE_NO" keyboardType="phone-pad" />
        <EditableField label="Alt Mobile No" field="ALT_MOBILE_NO" keyboardType="phone-pad" />
        <EditableField label="Current Address" field="CURRENT_ADDRESS" />
        <EditableField label="Permanent Address" field="PERMANENT_ADDRESS" />
        <EditableField label="Pincode" field="PINCODE" keyboardType="numeric" />
        <EditableField label="State" field="STATE" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Educational Details</Text>
        <EditableField label="10th Board Marks" field="10TH_BOARD_MARKS" keyboardType="decimal-pad" />
        <EditableField label="10th Board %" field="10TH_BOARD_PCT" keyboardType="decimal-pad" />
        <EditableField label="10th Board Year" field="10TH_BOARD_YEAR" keyboardType="numeric" />
        <EditableField label="12th Board Marks" field="12TH_BOARD_MARKS" keyboardType="decimal-pad" />
        <EditableField label="12th Board %" field="12TH_BOARD_PCT" keyboardType="decimal-pad" />
        <EditableField label="12th Board Year" field="12TH_BOARD_YEAR" keyboardType="numeric" />
        <EditableField label="Diploma Year" field="DIPLOMA_YEAR" keyboardType="numeric" />
        <EditableField label="Diploma %" field="DIPLOMA_PCT" keyboardType="decimal-pad" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>GPA / CGPA</Text>
        <EditableField label="GPA Sem 1" field="GPA_SEM1" keyboardType="decimal-pad" />
        <EditableField label="GPA Sem 2" field="GPA_SEM2" keyboardType="decimal-pad" />
        <EditableField label="GPA Sem 3" field="GPA_SEM3" keyboardType="decimal-pad" />
        <EditableField label="GPA Sem 4" field="GPA_SEM4" keyboardType="decimal-pad" />
        <EditableField label="GPA Sem 5" field="GPA_SEM5" keyboardType="decimal-pad" />
        <EditableField label="GPA Sem 6" field="GPA_SEM6" keyboardType="decimal-pad" />
        <EditableField label="GPA Sem 7" field="GPA_SEM7" keyboardType="decimal-pad" />
        <EditableField label="GPA Sem 8" field="GPA_SEM8" keyboardType="decimal-pad" />
        <EditableField label="CGPA" field="CGPA" keyboardType="decimal-pad" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Identification</Text>
        <EditableField label="Aadhar No" field="AADHAR_NO" />
        <EditableField label="PAN No" field="PAN_NO" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Family Details</Text>
        <EditableField label="Father Name" field="FATHER_NAME" />
        <EditableField label="Mother Name" field="MOTHER_NAME" />
        <EditableField label="Guardian Name" field="GUARDIAN_NAME" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Skills & Experience</Text>
        <EditableField label="Known Tech Stack" field="KNOWN_TECH_STACK" />
        <EditableField label="Internship Company" field="INTERNSHIP_COMPANY" />
        <EditableField label="Internship Offer Link" field="INTERNSHIP_OFFER_LINK" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Career Information</Text>
        <EditableField label="Placement / Higher Studies" field="PLACEMENT_HS" />
        <EditableField label="Willing to Relocate" field="WILLING_TO_RELOCATE" />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>COE / Certificates</Text>
        <EditableField label="COE Name" field="COE_NAME" />
        <EditableField label="COE Incharge Name" field="COE_INCHARGE_NAME" />
        <EditableField label="COE Projects Done" field="COE_PROJECTS_DONE" keyboardType="numeric" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: '#fff', marginTop: -2 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  editBtn: { fontSize: 14, fontWeight: '600' },

  logoSection: { alignItems: 'center', marginTop: -30, marginBottom: 20 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 32 },
  platformName: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  platformSub: { fontSize: 14, marginTop: 4 },

  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 14 },

  detailCard: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontSize: 13, fontWeight: '600' },
  lockIcon: { fontSize: 12 },
  detailValue: { fontSize: 16, fontWeight: '700' },
  detailInput: { fontSize: 16, fontWeight: '700', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }
});
