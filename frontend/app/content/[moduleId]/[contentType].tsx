import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Content {
  content_type: string;
  title: string;
  glossary_terms?: Array<{
    term: string;
    definition: string;
    example?: string;
  }>;
  theory_content?: string;
  exercises?: Array<{
    problem: string;
    options: Array<{
      option_text: string;
      is_correct: boolean;
    }>;
    difficulty: string;
    explanation: string;
  }>;
  quiz_questions?: Array<{
    question: string;
    options: Array<{
      option_text: string;
      is_correct: boolean;
    }>;
    explanation: string;
  }>;
}

export default function ContentDetail() {
  const router = useRouter();
  const { moduleId, contentType, contentTitle, moduleName } = useLocalSearchParams();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [showResults, setShowResults] = useState(false);

  const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/modules/${moduleId}/content/${contentType}`);
      if (response.ok) {
        const contentData = await response.json();
        setContent(contentData);
      } else {
        console.error('Content not found');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!content?.quiz_questions) return 0;
    
    let correct = 0;
    content.quiz_questions.forEach((question, index) => {
      const selectedOption = selectedAnswers[index];
      if (selectedOption !== undefined && question.options[selectedOption]?.is_correct) {
        correct++;
      }
    });
    
    return Math.round((correct / content.quiz_questions.length) * 100);
  };

  const renderGlossary = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name="book" size={24} color="#4CAF50" />
        <Text style={styles.sectionTitle}>Glosario de términos</Text>
      </View>
      
      {content?.glossary_terms?.map((term, index) => (
        <View key={index} style={styles.glossaryCard}>
          <Text style={styles.glossaryTerm}>{term.term}</Text>
          <Text style={styles.glossaryDefinition}>{term.definition}</Text>
          {term.example && (
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleLabel}>Ejemplo:</Text>
              <Text style={styles.exampleText}>{term.example}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderTheory = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name="school" size={24} color="#2196F3" />
        <Text style={styles.sectionTitle}>Teoría explicativa</Text>
      </View>
      
      <View style={styles.theoryCard}>
        <Text style={styles.theoryContent}>
          {content?.theory_content?.split('\n').map((line, index) => {
            // Handle different markdown-like formatting
            if (line.startsWith('# ')) {
              return <Text key={index} style={styles.theoryTitle}>{line.substring(2)}</Text>;
            } else if (line.startsWith('## ')) {
              return <Text key={index} style={styles.theorySubtitle}>{line.substring(3)}</Text>;
            } else if (line.startsWith('### ')) {
              return <Text key={index} style={styles.theorySubheading}>{line.substring(4)}</Text>;
            } else if (line.startsWith('- ')) {
              return <Text key={index} style={styles.theoryBullet}>• {line.substring(2)}</Text>;
            } else if (line.startsWith('**') && line.endsWith('**')) {
              return <Text key={index} style={styles.theoryBold}>{line.slice(2, -2)}</Text>;
            } else if (line.trim() === '') {
              return <Text key={index} style={styles.theoryParagraphBreak}>{'\n'}</Text>;
            } else {
              return <Text key={index} style={styles.theoryParagraph}>{line}</Text>;
            }
          })}
        </Text>
      </View>
    </View>
  );

  const renderExercises = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Ionicons 
          name={contentType === 'learning_exercises' ? 'bulb' : 'fitness'} 
          size={24} 
          color={contentType === 'learning_exercises' ? '#FF9500' : '#9C27B0'} 
        />
        <Text style={styles.sectionTitle}>
          {contentType === 'learning_exercises' ? 'Ejercicios de aprendizaje' : 'Ejercicios de práctica'}
        </Text>
      </View>
      
      {content?.exercises?.map((exercise, index) => (
        <View key={index} style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseNumber}>Ejercicio {index + 1}</Text>
            <View style={[styles.difficultyBadge, 
              exercise.difficulty === 'easy' ? styles.easyBadge :
              exercise.difficulty === 'medium' ? styles.mediumBadge : styles.hardBadge
            ]}>
              <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
            </View>
          </View>
          
          <Text style={styles.exerciseProblem}>{exercise.problem}</Text>
          
          <View style={styles.optionsContainer}>
            {exercise.options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={[
                  styles.optionButton,
                  selectedAnswers[index] === optionIndex && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelect(index, optionIndex)}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswers[index] === optionIndex && styles.selectedOptionText
                ]}>
                  {String.fromCharCode(65 + optionIndex)}. {option.option_text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedAnswers[index] !== undefined && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explicación:</Text>
              <Text style={styles.explanationText}>{exercise.explanation}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderQuiz = () => (
    <View style={styles.contentSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name="trophy" size={24} color="#F44336" />
        <Text style={styles.sectionTitle}>Quiz de evaluación</Text>
      </View>
      
      {showResults && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>Resultados del Quiz</Text>
          <Text style={styles.resultsScore}>{calculateScore()}%</Text>
          <Text style={styles.resultsMessage}>
            {calculateScore() >= 80 ? '¡Excelente trabajo!' : 
             calculateScore() >= 60 ? '¡Buen trabajo!' : 
             'Sigue practicando'}
          </Text>
        </View>
      )}
      
      {content?.quiz_questions?.map((question, index) => (
        <View key={index} style={styles.quizCard}>
          <Text style={styles.questionNumber}>Pregunta {index + 1}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={[
                  styles.optionButton,
                  selectedAnswers[index] === optionIndex && styles.selectedOption,
                  showResults && option.is_correct && styles.correctOption,
                  showResults && selectedAnswers[index] === optionIndex && !option.is_correct && styles.incorrectOption
                ]}
                onPress={() => !showResults && handleAnswerSelect(index, optionIndex)}
                disabled={showResults}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswers[index] === optionIndex && styles.selectedOptionText,
                  showResults && option.is_correct && styles.correctOptionText
                ]}>
                  {String.fromCharCode(65 + optionIndex)}. {option.option_text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {showResults && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explicación:</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </View>
      ))}
      
      {!showResults && Object.keys(selectedAnswers).length === content?.quiz_questions?.length && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuiz}>
          <Text style={styles.submitButtonText}>Enviar Quiz</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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

  if (!content) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <Text style={styles.errorTitle}>Contenido no encontrado</Text>
          <Text style={styles.errorText}>El contenido solicitado no está disponible.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
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
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{contentTitle}</Text>
            <Text style={styles.headerSubtitle}>{moduleName}</Text>
          </View>
        </View>

        {/* Content */}
        {contentType === 'glossary' && renderGlossary()}
        {contentType === 'theory' && renderTheory()}
        {(contentType === 'learning_exercises' || contentType === 'practice_exercises') && renderExercises()}
        {contentType === 'quiz' && renderQuiz()}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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
  headerBackButton: {
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
  contentSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  // Glossary styles
  glossaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  glossaryTerm: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  glossaryDefinition: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 12,
  },
  exampleContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
  },
  // Theory styles
  theoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  theoryContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  theoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 16,
  },
  theorySubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 10,
    marginTop: 16,
  },
  theorySubheading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 12,
  },
  theoryBullet: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
    marginLeft: 16,
  },
  theoryBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  theoryParagraph: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  theoryParagraphBreak: {
    fontSize: 16,
    marginBottom: 8,
  },
  // Exercise styles
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  easyBadge: {
    backgroundColor: '#E8F5E8',
  },
  mediumBadge: {
    backgroundColor: '#FFF3E0',
  },
  hardBadge: {
    backgroundColor: '#FFEBEE',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  exerciseProblem: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16,
    lineHeight: 24,
  },
  // Quiz styles
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#e0e4e7',
    borderRadius: 8,
    padding: 12,
  },
  selectedOption: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f9ff',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  incorrectOption: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 14,
    color: '#444',
  },
  selectedOptionText: {
    color: '#6366f1',
    fontWeight: '500',
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  explanationContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  resultsScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  resultsMessage: {
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});