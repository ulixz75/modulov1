import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Topic {
  _id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

interface Grade {
  _id: string;
  grade_number: number;
  grade_name: string;
  description: string;
}

export default function GradeTopics() {
  const router = useRouter();
  const { gradeNumber } = useLocalSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);

  const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchGradeAndTopics();
  }, []);

  const fetchGradeAndTopics = async () => {
    try {
      setLoading(true);
      
      // First, get all grades to find the one we need
      const gradesResponse = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/grades`);
      const grades = await gradesResponse.json();
      const currentGrade = grades.find((g: Grade) => g.grade_number === parseInt(gradeNumber as string));
      
      if (currentGrade) {
        setGrade(currentGrade);
        
        // Then get topics for this grade
        const topicsResponse = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/grades/${currentGrade._id}/topics`);
        const topicsData = await topicsResponse.json();
        setTopics(topicsData);
      }
    } catch (error) {
      console.error('Error fetching grade and topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicPress = (topicId: string, topicName: string) => {
    router.push(`/topic/${topicId}?topicName=${encodeURIComponent(topicName)}&gradeNumber=${gradeNumber}`);
  };

  const getIconName = (iconString: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'calculator': 'calculator',
      'pie-chart': 'pie-chart',
      'function': 'git-branch',
      'triangle': 'triangle',
      'percent': 'stats-chart',
      'book': 'book'
    };
    return iconMap[iconString] || 'book';
  };

  const getTopicColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Cargando temas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{grade?.grade_name}</Text>
            <Text style={styles.headerSubtitle}>{grade?.description}</Text>
          </View>
        </View>

        {/* Topics List */}
        <View style={styles.topicsContainer}>
          <Text style={styles.sectionTitle}>Temas de matemáticas</Text>
          
          {topics.map((topic, index) => (
            <TouchableOpacity
              key={topic._id}
              style={[styles.topicCard, { borderLeftColor: getTopicColor(index) }]}
              onPress={() => handleTopicPress(topic._id, topic.name)}
              activeOpacity={0.7}
            >
              <View style={styles.topicCardContent}>
                <View style={[styles.topicIcon, { backgroundColor: getTopicColor(index) }]}>
                  <Ionicons name={getIconName(topic.icon)} size={24} color="#fff" />
                </View>
                
                <View style={styles.topicInfo}>
                  <Text style={styles.topicName}>{topic.name}</Text>
                  <Text style={styles.topicDescription}>{topic.description}</Text>
                </View>
                
                <View style={styles.topicArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>
              </View>
              
              {/* Status badges */}
              {parseInt(gradeNumber as string) === 7 && index === 0 && (
                <View style={styles.completeBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.completeBadgeText}>Contenido disponible</Text>
                </View>
              )}
              
              {(parseInt(gradeNumber as string) !== 7 || index > 0) && (
                <View style={styles.comingSoonBadge}>
                  <Ionicons name="time" size={16} color="#FF9500" />
                  <Text style={styles.comingSoonBadgeText}>Por completar</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions for incomplete content */}
        {parseInt(gradeNumber as string) !== 7 && (
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle" size={24} color="#6366f1" />
            <Text style={styles.instructionsTitle}>Contenido en desarrollo</Text>
            <Text style={styles.instructionsText}>
              Los temas para este grado están siendo preparados. El contenido completo estará disponible próximamente.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  topicsContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  topicCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  topicArrow: {
    marginLeft: 12,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 6,
  },
  completeBadgeText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 6,
  },
  comingSoonBadgeText: {
    fontSize: 11,
    color: '#FF9500',
    fontWeight: '500',
    marginLeft: 4,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    margin: 24,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
    marginTop: 12,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});