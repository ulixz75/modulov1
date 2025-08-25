import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ModuleContent() {
  const router = useRouter();
  const { moduleId, moduleName, topicName, gradeNumber } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    // Check if content is available for this module
    const contentAvailable = parseInt(gradeNumber as string) === 7 && 
                            (topicName as string).includes('Números Enteros') &&
                            (moduleName as string).includes('Definición');
    
    if (!contentAvailable) {
      setLoading(false);
      return;
    }
    
    setLoading(false);
  }, []);

  const contentTypes = [
    {
      type: 'glossary',
      title: 'Glosario',
      description: 'Términos y definiciones importantes',
      icon: 'book' as keyof typeof Ionicons.glyphMap,
      color: '#4CAF50'
    },
    {
      type: 'theory',
      title: 'Teoría',
      description: 'Explicación detallada del tema',
      icon: 'school' as keyof typeof Ionicons.glyphMap,
      color: '#2196F3'
    },
    {
      type: 'learning_exercises',
      title: 'Ejercicios de Aprendizaje',
      description: 'Ejercicios guiados paso a paso',
      icon: 'bulb' as keyof typeof Ionicons.glyphMap,
      color: '#FF9500'
    },
    {
      type: 'practice_exercises',
      title: 'Ejercicios de Práctica',
      description: 'Practica lo que has aprendido',
      icon: 'fitness' as keyof typeof Ionicons.glyphMap,
      color: '#9C27B0'
    },
    {
      type: 'quiz',
      title: 'Quiz',
      description: 'Evalúa tu conocimiento',
      icon: 'trophy' as keyof typeof Ionicons.glyphMap,
      color: '#F44336'
    }
  ];

  const handleContentPress = (contentType: string, title: string) => {
    const contentAvailable = parseInt(gradeNumber as string) === 7 && 
                            (topicName as string).includes('Números Enteros') &&
                            (moduleName as string).includes('Definición');
    
    if (!contentAvailable) {
      return; // Content not available
    }
    
    router.push(`/content/${moduleId}/${contentType}?contentTitle=${encodeURIComponent(title)}&moduleName=${encodeURIComponent(moduleName as string)}`);
  };

  const isContentAvailable = () => {
    return parseInt(gradeNumber as string) === 7 && 
           (topicName as string).includes('Números Enteros') &&
           (moduleName as string).includes('Definición');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Cargando contenido...</Text>
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
            <Text style={styles.headerTitle}>{moduleName}</Text>
            <Text style={styles.headerSubtitle}>{topicName} - Grado {gradeNumber}</Text>
          </View>
        </View>

        {/* Content Types */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Tipos de contenido</Text>
          
          {contentTypes.map((content, index) => (
            <TouchableOpacity
              key={content.type}
              style={[
                styles.contentCard, 
                { borderLeftColor: content.color },
                !isContentAvailable() && styles.disabledCard
              ]}
              onPress={() => handleContentPress(content.type, content.title)}
              activeOpacity={isContentAvailable() ? 0.7 : 1}
              disabled={!isContentAvailable()}
            >
              <View style={styles.contentCardContent}>
                <View style={[styles.contentIcon, { backgroundColor: content.color }]}>
                  <Ionicons 
                    name={content.icon} 
                    size={24} 
                    color={isContentAvailable() ? "#fff" : "#ccc"} 
                  />
                </View>
                
                <View style={styles.contentInfo}>
                  <Text style={[
                    styles.contentTitle, 
                    !isContentAvailable() && styles.disabledText
                  ]}>
                    {content.title}
                  </Text>
                  <Text style={[
                    styles.contentDescription, 
                    !isContentAvailable() && styles.disabledText
                  ]}>
                    {content.description}
                  </Text>
                </View>
                
                <View style={styles.contentArrow}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={isContentAvailable() ? "#666" : "#ccc"} 
                  />
                </View>
              </View>
              
              {isContentAvailable() && (
                <View style={styles.availableBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.availableBadgeText}>Disponible</Text>
                </View>
              )}
              
              {!isContentAvailable() && (
                <View style={styles.comingSoonBadge}>
                  <Ionicons name="time" size={16} color="#FF9500" />
                  <Text style={styles.comingSoonBadgeText}>Próximamente</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress indicator */}
        {isContentAvailable() && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Ionicons name="stats-chart" size={24} color="#6366f1" />
              <Text style={styles.progressTitle}>Tu progreso</Text>
            </View>
            <Text style={styles.progressDescription}>
              Completa todos los tipos de contenido para dominar este módulo
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
            <Text style={styles.progressText}>0% completado</Text>
          </View>
        )}

        {/* Instructions for unavailable content */}
        {!isContentAvailable() && (
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle" size={24} color="#6366f1" />
            <Text style={styles.instructionsTitle}>Contenido en desarrollo</Text>
            <Text style={styles.instructionsText}>
              Este módulo está siendo preparado con contenido educativo completo. 
              Incluirá glosario, teoría, ejercicios de aprendizaje, ejercicios de práctica y quizzes.
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  contentCard: {
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
  disabledCard: {
    backgroundColor: '#f5f5f5',
  },
  contentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  disabledText: {
    color: '#ccc',
  },
  contentArrow: {
    marginLeft: 12,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 6,
  },
  availableBadgeText: {
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
  progressCard: {
    backgroundColor: '#fff',
    margin: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 12,
  },
  progressDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e4e7',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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