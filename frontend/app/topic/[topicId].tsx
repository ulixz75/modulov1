import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Module {
  _id: string;
  name: string;
  description: string;
  order: number;
}

export default function TopicModules() {
  const router = useRouter();
  const { topicId, topicName, gradeNumber } = useLocalSearchParams();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/topics/${topicId}/modules`);
      const modulesData = await response.json();
      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModulePress = (moduleId: string, moduleName: string) => {
    router.push(`/module/${moduleId}?moduleName=${encodeURIComponent(moduleName)}&topicName=${encodeURIComponent(topicName as string)}&gradeNumber=${gradeNumber}`);
  };

  const getModuleColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    return colors[index % colors.length];
  };

  const isContentAvailable = (index: number) => {
    // Only first module of first topic of 7th grade has content
    return parseInt(gradeNumber as string) === 7 && 
           (topicName as string).includes('Números Enteros') && 
           index === 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Cargando módulos...</Text>
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
            <Text style={styles.headerTitle}>{topicName}</Text>
            <Text style={styles.headerSubtitle}>Grado {gradeNumber}</Text>
          </View>
        </View>

        {/* Modules List */}
        <View style={styles.modulesContainer}>
          <Text style={styles.sectionTitle}>Módulos de aprendizaje</Text>
          
          {modules.map((module, index) => (
            <TouchableOpacity
              key={module._id}
              style={[styles.moduleCard, { borderLeftColor: getModuleColor(index) }]}
              onPress={() => handleModulePress(module._id, module.name)}
              activeOpacity={0.7}
              disabled={!isContentAvailable(index)}
            >
              <View style={styles.moduleCardContent}>
                <View style={[styles.moduleNumber, { backgroundColor: getModuleColor(index) }]}>
                  <Text style={styles.moduleNumberText}>{module.order}</Text>
                </View>
                
                <View style={styles.moduleInfo}>
                  <Text style={[styles.moduleName, !isContentAvailable(index) && styles.disabledText]}>
                    {module.name}
                  </Text>
                  <Text style={[styles.moduleDescription, !isContentAvailable(index) && styles.disabledText]}>
                    {module.description}
                  </Text>
                </View>
                
                <View style={styles.moduleArrow}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={isContentAvailable(index) ? "#666" : "#ccc"} 
                  />
                </View>
              </View>
              
              {/* Content indicators */}
              <View style={styles.contentIndicators}>
                <View style={styles.contentTypes}>
                  <View style={[styles.contentType, isContentAvailable(index) ? styles.activeContentType : styles.inactiveContentType]}>
                    <Ionicons name="book" size={12} color={isContentAvailable(index) ? "#4CAF50" : "#ccc"} />
                    <Text style={[styles.contentTypeText, isContentAvailable(index) ? styles.activeContentTypeText : styles.inactiveContentTypeText]}>
                      Glosario
                    </Text>
                  </View>
                  <View style={[styles.contentType, isContentAvailable(index) ? styles.activeContentType : styles.inactiveContentType]}>
                    <Ionicons name="school" size={12} color={isContentAvailable(index) ? "#2196F3" : "#ccc"} />
                    <Text style={[styles.contentTypeText, isContentAvailable(index) ? styles.activeContentTypeText : styles.inactiveContentTypeText]}>
                      Teoría
                    </Text>
                  </View>
                  <View style={[styles.contentType, isContentAvailable(index) ? styles.activeContentType : styles.inactiveContentType]}>
                    <Ionicons name="fitness" size={12} color={isContentAvailable(index) ? "#FF9500" : "#ccc"} />
                    <Text style={[styles.contentTypeText, isContentAvailable(index) ? styles.activeContentTypeText : styles.inactiveContentTypeText]}>
                      Ejercicios
                    </Text>
                  </View>
                  <View style={[styles.contentType, isContentAvailable(index) ? styles.activeContentType : styles.inactiveContentType]}>
                    <Ionicons name="trophy" size={12} color={isContentAvailable(index) ? "#9C27B0" : "#ccc"} />
                    <Text style={[styles.contentTypeText, isContentAvailable(index) ? styles.activeContentTypeText : styles.inactiveContentTypeText]}>
                      Quiz
                    </Text>
                  </View>
                </View>
                
                {isContentAvailable(index) && (
                  <View style={styles.completeBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                    <Text style={styles.completeBadgeText}>Completo</Text>
                  </View>
                )}
                
                {!isContentAvailable(index) && (
                  <View style={styles.comingSoonBadge}>
                    <Ionicons name="time" size={14} color="#FF9500" />
                    <Text style={styles.comingSoonBadgeText}>En desarrollo</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color="#6366f1" />
          <Text style={styles.instructionsTitle}>Estructura de aprendizaje</Text>
          <Text style={styles.instructionsText}>
            Cada módulo contiene 5 tipos de contenido: glosario de términos, teoría explicativa, ejercicios de aprendizaje, ejercicios de práctica y quizzes de evaluación.
          </Text>
        </View>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modulesContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  moduleCard: {
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
  moduleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  moduleNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moduleNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  disabledText: {
    color: '#ccc',
  },
  moduleArrow: {
    marginLeft: 12,
  },
  contentIndicators: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  contentType: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeContentType: {
    backgroundColor: '#f0f9ff',
  },
  inactiveContentType: {
    backgroundColor: '#f5f5f5',
  },
  contentTypeText: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
  activeContentTypeText: {
    color: '#666',
  },
  inactiveContentTypeText: {
    color: '#ccc',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  completeBadgeText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  comingSoonBadgeText: {
    fontSize: 10,
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
    fontSize: 16,
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