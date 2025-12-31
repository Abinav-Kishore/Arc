import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../lib/theme";
import { useStudent } from "../lib/student-context";
import { usePermissions } from "../lib/permissions-context";
import { supabase } from "../lib/supabase";

const RESUME_FIELDS = ['RESUME_LINK'];

export default function ResumePage() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const { studentData, setStudentData } = useStudent();
  const { isFieldEditable, hasAnyEditableField } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    link: ''
  });

  const canEdit = hasAnyEditableField(RESUME_FIELDS);

  useEffect(() => {
    if (studentData) {
      setStats({
        link: studentData.RESUME_LINK || ''
      });
    }
  }, [studentData]);

  const saveStats = useCallback(async () => {
    try {
      setSaving(true);
      const updates = {};
      if (isFieldEditable('RESUME_LINK')) updates.RESUME_LINK = stats.link || null;

      const { data, error } = await supabase
        .from('Students')
        .update(updates)
        .eq('EMAIL', studentData.EMAIL || studentData.email)
        .select()
        .single();

      if (error) throw error;
      
      setStudentData(data);
      setIsEditing(false);
      Alert.alert('Success', 'Resume link saved');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }, [stats, studentData, setStudentData, isFieldEditable]);

  const updateField = (field, value) => {
    setStats(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>Resume</Text>
          {canEdit ? (
            <TouchableOpacity onPress={isEditing ? saveStats : () => setIsEditing(true)} disabled={saving}>
              <Text style={[styles.editBtn, { color: '#fff' }]}>{saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={[styles.logoCircle, { backgroundColor: theme.secondary }]}>
          <Text style={styles.logoText}>📄</Text>
        </View>
        <Text style={[styles.platformName, { color: theme.text }]}>Resume</Text>
        <Text style={[styles.platformSub, { color: theme.textSecondary }]}>Your CV document</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Document</Text>
        
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Resume Link</Text>
            {!isFieldEditable('RESUME_LINK') && <Text style={styles.lock}>🔒</Text>}
          </View>
          {isEditing && isFieldEditable('RESUME_LINK') ? (
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              value={stats.link}
              onChangeText={(text) => updateField('link', text)}
              placeholder="https://drive.google.com/..."
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={[styles.value, { color: theme.text }]}>{stats.link ? '✓ Linked' : '-'}</Text>
          )}
        </View>
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
  logoText: { fontSize: 40 },
  platformName: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  platformSub: { fontSize: 14, marginTop: 4 },

  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 14 },

  card: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  lock: { fontSize: 12 },
  value: { fontSize: 16, fontWeight: '700' },
  input: { fontSize: 16, fontWeight: '700', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }
});
