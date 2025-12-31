import React, {useEffect, useState, useContext} from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../lib/theme";
import { useStudent } from "../lib/student-context";
import Loader from "./Loader";

const {width} = Dimensions.get('window');

// Uniform icon background color
const ICON_BG = '#e0e7ff';

export default function StudentDashboardPage(){
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useContext(ThemeContext);
  const { studentData } = useStudent();
  const [loading, setLoading] = useState(false);

  const student = studentData || {};

  const ListItem = ({icon, title, subtitle, onPress}) => (
    <TouchableOpacity style={[listStyles.row, {backgroundColor: theme.surface}]} onPress={onPress} activeOpacity={0.7}>
      <View style={[listStyles.iconWrap, {backgroundColor: isDark ? theme.surface : ICON_BG}]}>
        <Text style={listStyles.icon}>{icon}</Text>
      </View>
      <View style={{flex:1}}>
        <Text style={[listStyles.title, {color: theme.text}]}>{title}</Text>
        {subtitle ? <Text style={[listStyles.subtitle, {color: theme.textSecondary}]}>{subtitle}</Text> : null}
      </View>
      <Text style={[listStyles.arrow, {color: theme.textSecondary}]}>›</Text>
    </TouchableOpacity>
  );

  if(loading) return <Loader />;

  const initials = (student.NAME || 'ST').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();

  // Get subtitles from database
  const lcSubtitle = student.LC_TOTAL_PROBLEMS ? `${student.LC_TOTAL_PROBLEMS} problems solved` : '-';
  const srSubtitle = student.SR_PROBLEMS_SOLVED ? `${student.SR_PROBLEMS_SOLVED} problems • Rank: ${student.SR_RANK || '-'}` : '-';
  const cfSubtitle = student.CF_RATING ? `Rating: ${student.CF_RATING}` : '-';
  const ccSubtitle = student.CC_RATING ? `Rating: ${student.CC_RATING}` : '-';
  const ghSubtitle = student.GITHUB_ID || '-';
  const liSubtitle = student.LINKEDIN_URL ? 'View profile' : '-';
  const resumeSubtitle = student.RESUME_LINK ? 'Linked' : '-';

  return (
    <View style={[styles.root, {backgroundColor: theme.background}]}>
      {/* Colored header */}
      <View style={[styles.header, {backgroundColor: theme.primary}]}>
        <View style={styles.headerTop}>
          <View style={styles.backBtn} />
          <TouchableOpacity onPress={toggleTheme}>
            <Text style={styles.menuDots}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.illustration} />
      </View>

      {/* Overlapping white card */}
      <View style={styles.cardWrap}>
        <View style={[styles.card, {backgroundColor: theme.surface}]}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, {backgroundColor: theme.secondary}]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}> 
            <Text style={[styles.name, {color: theme.text}]}>{student.NAME || '-'}</Text>
          </TouchableOpacity>
          <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
            {student.SECTION || student.sec || '-'} • {student.DEPT || '-'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{paddingBottom:40}} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, {color: theme.text}]}>Coding Platforms</Text>

        <ListItem icon="▶️" title="LeetCode" subtitle={lcSubtitle} onPress={() => router.push('/leetcode')} />
        <ListItem icon="🎯" title="Skillrack" subtitle={srSubtitle} onPress={() => router.push('/skillrack')} />
        <ListItem icon="🍴" title="CodeChef" subtitle={ccSubtitle} onPress={() => router.push('/codechef')} />

        <Text style={[styles.sectionTitle, {color: theme.text}]}>Profiles & Documents</Text>

        <ListItem icon="💻" title="GitHub" subtitle={ghSubtitle} onPress={() => router.push('/github')} />
        <ListItem icon="🔗" title="LinkedIn" subtitle={liSubtitle} onPress={() => router.push('/linkedin')} />
        <ListItem icon="📄" title="Resume" subtitle={resumeSubtitle} onPress={() => router.push('/resume')} />
      </ScrollView>
    </View>
  );
}

const listStyles = StyleSheet.create({
  row: {flexDirection:'row', alignItems:'center', padding:14, borderRadius:16, marginBottom:10, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6, elevation:1},
  iconWrap: {width:44, height:44, borderRadius:14, alignItems:'center', justifyContent:'center', marginRight:14},
  icon: {fontSize:20},
  title: {fontWeight:'600', fontSize:15},
  subtitle: {fontSize:12, marginTop:2},
  arrow: {fontSize:24, fontWeight:'300'}
});

const HEADER_HEIGHT = 240;
const CARD_OVERLAP = 80;

const styles = StyleSheet.create({
  root: {flex:1},
  header: {height:HEADER_HEIGHT, borderBottomLeftRadius:36, borderBottomRightRadius:36},
  headerTop: {flexDirection:'row', justifyContent:'space-between', paddingHorizontal:20, paddingTop:50},
  backBtn: {width:36, height:36},
  menuDots: {fontSize:20},
  illustration: {position:'absolute', bottom:30, right:24, width:130, height:110, backgroundColor:'rgba(255,255,255,0.18)', borderRadius:20},

  cardWrap: {marginTop:-CARD_OVERLAP, paddingHorizontal:24},
  card: {borderRadius:24, paddingTop:54, paddingBottom:20, paddingHorizontal:20, alignItems:'center', shadowColor:'#000', shadowOpacity:0.08, shadowRadius:16, elevation:5},
  avatarWrap: {position:'absolute', top:-44},
  avatar: {width:88, height:88, borderRadius:44, alignItems:'center', justifyContent:'center', borderWidth:4, borderColor:'#fff'},
  avatarText: {color:'#fff', fontWeight:'700', fontSize:30},
  name: {fontSize:22, fontWeight:'700', marginTop:10},
  subtitle: {fontSize:14, marginTop:4},

  content: {flex:1, paddingHorizontal:20, paddingTop:16},
  sectionTitle: {fontSize:17, fontWeight:'700', marginTop:22, marginBottom:12}
});
