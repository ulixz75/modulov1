import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  const grades = [
    { number: 7, name: '7mo Grado', description: 'Fundamentos de álgebra y geometría', color: '#FF6B6B' },
    { number: 8, name: '8vo Grado', description: 'Álgebra intermedia y funciones', color: '#4ECDC4' },
    { number: 9, name: '9no Grado', description: 'Álgebra avanzada y geometría analítica', color: '#45B7D1' },
    { number: 10, name: '10mo Grado', description: 'Funciones y trigonometría', color: '#96CEB4' },
    { number: 11, name: '11mo Grado', description: 'Precálculo y estadística', color: '#FECA57' },
    { number: 12, name: '12mo Grado', description: 'Cálculo y matemáticas avanzadas', color: '#FF9FF3' }
  ];

  const handleGradePress = (gradeNumber: number) => {
    router.push(`/grade/${gradeNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="calculator" size={32} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>MathEdu</Text>
          <Text style={styles.headerSubtitle}>Aprende matemáticas paso a paso</Text>
        </View>

        {/* Grade Selection */}
        <View style={styles.gradesContainer}>
          <Text style={styles.sectionTitle}>Selecciona tu grado</Text>
          
          {grades.map((grade) => (
            <TouchableOpacity
              key={grade.number}
              style={[styles.gradeCard, { borderLeftColor: grade.color }]}
              onPress={() => handleGradePress(grade.number)}
              activeOpacity={0.7}
            >
              <View style={styles.gradeCardContent}>
                <View style={[styles.gradeNumber, { backgroundColor: grade.color }]}>
                  <Text style={styles.gradeNumberText}>{grade.number}</Text>
                </View>
                
                <View style={styles.gradeInfo}>
                  <Text style={styles.gradeName}>{grade.name}</Text>
                  <Text style={styles.gradeDescription}>{grade.description}</Text>
                </View>
                
                <View style={styles.gradeArrow}>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </View>
              </View>
              
              {grade.number === 7 && (
                <View style={styles.completeBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.completeBadgeText}>Contenido completo</Text>
                </View>
              )}
              
              {grade.number > 7 && (
                <View style={styles.comingSoonBadge}>
                  <Ionicons name="time" size={16} color="#FF9500" />
                  <Text style={styles.comingSoonBadgeText}>En desarrollo</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <View style={styles.featureItem}>
            <Ionicons name="book" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Glosarios detallados</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="school" size={20} color="#2196F3" />
            <Text style={styles.featureText}>Teoría explicativa</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="fitness" size={20} color="#FF9500" />
            <Text style={styles.featureText}>Ejercicios de práctica</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="trophy" size={20} color="#9C27B0" />
            <Text style={styles.featureText}>Quizzes interactivos</Text>
          </View>
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
  header: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  gradesContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  gradeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
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
  gradeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  gradeNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gradeNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  gradeInfo: {
    flex: 1,
  },
  gradeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  gradeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  gradeArrow: {
    marginLeft: 12,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  completeBadgeText: {
    fontSize: 12,
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
    marginBottom: 16,
    borderRadius: 8,
  },
  comingSoonBadgeText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 12,
  },
});