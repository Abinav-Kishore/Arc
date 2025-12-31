import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../lib/theme";
import { useStudent } from "../lib/student-context";
import { usePermissions } from "../lib/permissions-context";
import { supabase } from "../lib/supabase";

// LeetCode fields for permission checking
const LEETCODE_FIELDS = ['LEETCODE_ID', 'LC_TOTAL_PROBLEMS', 'LC_EASY', 'LC_MEDIUM', 'LC_HARD', 'LC_RATING', 'LC_BADGES', 'LC_MAX_RATING'];

export default function LeetCodePage() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const { studentData, setStudentData } = useStudent();
  const { isFieldEditable, hasAnyEditableField } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    id: '',
    totalSolved: '',
    easy: '',
    medium: '',
    hard: '',
    rating: '',
    badges: '',
    maxRating: ''
  });

  const canEdit = hasAnyEditableField(LEETCODE_FIELDS);

  useEffect(() => {
    if (studentData) {
      setStats({
        id: studentData.LEETCODE_ID || '',
        totalSolved: studentData.LC_TOTAL_PROBLEMS?.toString() || '',
        easy: studentData.LC_EASY?.toString() || '',
        medium: studentData.LC_MEDIUM?.toString() || '',
        hard: studentData.LC_HARD?.toString() || '',
        rating: studentData.LC_RATING?.toString() || '',
        badges: studentData.LC_BADGES?.toString() || '',
        maxRating: studentData.LC_MAX_RATING?.toString() || ''
      });
    }
  }, [studentData]);

  const saveStats = useCallback(async () => {
    try {
      setSaving(true);
      const updates = {};
      
      // Only include editable fields
      if (isFieldEditable('LEETCODE_ID')) updates.LEETCODE_ID = stats.id || null;
      if (isFieldEditable('LC_TOTAL_PROBLEMS')) updates.LC_TOTAL_PROBLEMS = stats.totalSolved ? parseInt(stats.totalSolved) : null;
      if (isFieldEditable('LC_EASY')) updates.LC_EASY = stats.easy ? parseInt(stats.easy) : null;
      if (isFieldEditable('LC_MEDIUM')) updates.LC_MEDIUM = stats.medium ? parseInt(stats.medium) : null;
      if (isFieldEditable('LC_HARD')) updates.LC_HARD = stats.hard ? parseInt(stats.hard) : null;
      if (isFieldEditable('LC_RATING')) updates.LC_RATING = stats.rating ? parseInt(stats.rating) : null;
      if (isFieldEditable('LC_BADGES')) updates.LC_BADGES = stats.badges ? parseInt(stats.badges) : null;
      if (isFieldEditable('LC_MAX_RATING')) updates.LC_MAX_RATING = stats.maxRating ? parseInt(stats.maxRating) : null;

      const { data, error } = await supabase
        .from('Students')
        .update(updates)
        .eq('OFFICIAL_MAIL', studentData.OFFICIAL_MAIL || studentData.email || studentData.EMAIL)
        .select()
        .single();

      if (error) throw error;
      
      setStudentData(data);
      setIsEditing(false);
      Alert.alert('Success', 'LeetCode stats saved');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }, [stats, studentData, setStudentData, isFieldEditable]);

  const updateField = (field, value) => {
    setStats(prev => ({ ...prev, [field]: value }));
  };

  const StatCard = ({ label, value, color, field, dbField }) => {
    const fieldEditable = isFieldEditable(dbField);
    const showAsEditable = isEditing && fieldEditable;
    
    return (
      <View style={[cardStyles.card, { backgroundColor: theme.surface }]}>
        <View style={cardStyles.labelRow}>
          <Text style={[cardStyles.label, { color: theme.textSecondary }]}>{label}</Text>
          {!fieldEditable && <Text style={cardStyles.lock}>🔒</Text>}
        </View>
        {showAsEditable ? (
          <TextInput
            style={[cardStyles.input, { color: theme.text, borderColor: theme.border }]}
            value={value}
            onChangeText={(text) => updateField(field, text)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
          />
        ) : (
          <Text style={[cardStyles.value, { color }]}>{value || '-'}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>LeetCode</Text>
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
          <Text style={styles.logoText}>▶️</Text>
        </View>
        <Text style={[styles.platformName, { color: theme.text }]}>LeetCode</Text>
        <Text style={[styles.platformSub, { color: theme.textSecondary }]}>Track your coding progress</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Account Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
        <View style={[styles.idCard, { backgroundColor: theme.surface }]}>
          <View style={styles.idLabelRow}>
            <Text style={[styles.idLabel, { color: theme.textSecondary }]}>LeetCode ID</Text>
            {!isFieldEditable('LEETCODE_ID') && <Text style={styles.lockIcon}>🔒</Text>}
          </View>
          {isEditing && isFieldEditable('LEETCODE_ID') ? (
            <TextInput
              style={[styles.idInput, { color: theme.text, borderColor: theme.border }]}
              value={stats.id}
              onChangeText={(text) => updateField('id', text)}
              placeholder="username"
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={[styles.idValue, { color: theme.text }]}>{stats.id || '-'}</Text>
          )}
        </View>

        {/* Problems Solved Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Problems Solved</Text>
        
        <View style={[styles.totalCard, { backgroundColor: theme.surface }]}>
          <View style={styles.idLabelRow}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Problems Solved</Text>
            {!isFieldEditable('LC_TOTAL_PROBLEMS') && <Text style={styles.lockIcon}>🔒</Text>}
          </View>
          {isEditing && isFieldEditable('LC_TOTAL_PROBLEMS') ? (
            <TextInput
              style={[styles.totalInput, { color: theme.text }]}
              value={stats.totalSolved}
              onChangeText={(text) => updateField('totalSolved', text)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={[styles.totalValue, { color: theme.primary }]}>{stats.totalSolved || '-'}</Text>
          )}
        </View>

        <View style={styles.difficultyRow}>
          <StatCard label="Easy" value={stats.easy} color="#22c55e" field="easy" dbField="LC_EASY" />
          <StatCard label="Medium" value={stats.medium} color="#f59e0b" field="medium" dbField="LC_MEDIUM" />
          <StatCard label="Hard" value={stats.hard} color="#ef4444" field="hard" dbField="LC_HARD" />
        </View>

        {/* Contest Stats Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contest Stats</Text>
        
        <View style={styles.statsRow}>
          <StatCard label="Rating" value={stats.rating} color={theme.primary} field="rating" dbField="LC_RATING" />
          <StatCard label="Max Rating" value={stats.maxRating} color={theme.secondary} field="maxRating" dbField="LC_MAX_RATING" />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Badges" value={stats.badges} color="#8b5cf6" field="badges" dbField="LC_BADGES" />
        </View>
      </ScrollView>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 12,
    fontWeight: '600'
  },
  lock: {
    fontSize: 10
  },
  value: {
    fontSize: 24,
    fontWeight: '700'
  },
  input: {
    fontSize: 20,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  }
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, marginTop: -2 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  editBtn: { fontSize: 14, fontWeight: '600' },

  logoSection: { alignItems: 'center', marginTop: -30, marginBottom: 20 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  logoText: { fontSize: 40 },
  platformName: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  platformSub: { fontSize: 14, marginTop: 4 },

  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 14 },

  idCard: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  idLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  idLabel: { fontSize: 13, fontWeight: '600' },
  lockIcon: { fontSize: 12 },
  idValue: { fontSize: 16, fontWeight: '700' },
  idInput: { fontSize: 16, fontWeight: '700', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },

  totalCard: { borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  totalLabel: { fontSize: 13, fontWeight: '600' },
  totalValue: { fontSize: 32, fontWeight: '800' },
  totalInput: { fontSize: 28, fontWeight: '800', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },

  difficultyRow: { flexDirection: 'row', marginBottom: 24 },
  statsRow: { flexDirection: 'row', marginBottom: 12 }
});
