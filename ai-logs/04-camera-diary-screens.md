# Camera Screen & Photo Capture Implementation

## Prompt
I need to implement the camera screen that:
1. Captures or uploads food photos
2. Sends image to Claude AI for analysis
3. Shows loading state during API call
4. Displays results and lets user confirm before saving
5. Handles errors gracefully

How should I structure the camera screen component?

## Response
Here's a complete camera screen implementation:

```typescript
// src/app/app/camera/index.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { aiService } from '@services/aiService';
import { useDiaryStore } from '@store/diaryStore';
import { Food, AIResponse } from '@types';
import MealCard from '@components/MealCard';

interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: AIResponse | null;
  imageUri: string | null;
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    result: null,
    imageUri: null,
  });
  const [selectedMealType, setSelectedMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('lunch');

  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const addFoodEntry = useDiaryStore((state) => state.addFoodEntry);

  // Request camera permission
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need access to your camera to capture food photos
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Capture photo from camera
  const handleCapture = async () => {
    try {
      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        await analyzeImage(photo.uri);
      }
    } catch (error) {
      setAnalysisState({
        ...analysisState,
        error: 'Failed to capture photo. Please try again.',
      });
    }
  };

  // Pick image from library
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      setAnalysisState({
        ...analysisState,
        error: 'Failed to pick image. Please try again.',
      });
    }
  };

  // Send image to AI for analysis
  const analyzeImage = async (imageUri: string) => {
    setAnalysisState({
      isLoading: true,
      error: null,
      result: null,
      imageUri,
    });

    try {
      const result = await aiService.analyzeFood(imageUri);
      setAnalysisState({
        isLoading: false,
        error: null,
        result,
        imageUri,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Analysis failed';
      setAnalysisState({
        isLoading: false,
        error: errorMessage,
        result: null,
        imageUri,
      });
    }
  };

  // Save analyzed meal to diary
  const handleSaveMeal = async () => {
    if (!analysisState.result) return;

    try {
      const entry = {
        id: `entry_${Date.now()}`,
        timestamp: Date.now(),
        mealType: selectedMealType,
        foods: analysisState.result.foods,
      };

      await addFoodEntry(entry);

      Alert.alert(
        'Success',
        `${analysisState.result.foods.length} food item(s) added to ${selectedMealType}`,
        [
          {
            text: 'Continue',
            onPress: () => {
              resetAnalysis();
            },
          },
          {
            text: 'Go to Diary',
            onPress: () => {
              resetAnalysis();
              router.push('/(app)/diary');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    }
  };

  // Reset analysis state
  const resetAnalysis = () => {
    setAnalysisState({
      isLoading: false,
      error: null,
      result: null,
      imageUri: null,
    });
  };

  // Show camera view if no analysis result
  if (!analysisState.result) {
    return (
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Capture Meal</Text>
              <View style={{ width: 40 }} />
            </View>

            {analysisState.isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Analyzing meal...</Text>
              </View>
            )}

            {analysisState.error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color="#fff" />
                <Text style={styles.errorText}>{analysisState.error}</Text>
                <TouchableOpacity onPress={() => resetAnalysis()}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={handlePickImage}
              >
                <Ionicons name="image" size={24} color="#667eea" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
                disabled={analysisState.isLoading}
              >
                {analysisState.isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.captureInner} />
                )}
              </TouchableOpacity>

              <View style={{ width: 40 }} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Show analysis results
  return (
    <ScrollView style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => resetAnalysis()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.resultsTitle}>Meal Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      {analysisState.imageUri && (
        <Image
          source={{ uri: analysisState.imageUri }}
          style={styles.previewImage}
        />
      )}

      <View style={styles.resultsContent}>
        <View style={styles.confidenceSection}>
          <Text style={styles.sectionTitle}>Confidence</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {analysisState.result.confidence.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.mealTypeSelector}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypeButtons}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === type && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setSelectedMealType(type)}
                >
                  <Text
                    style={[
                      styles.mealTypeButtonText,
                      selectedMealType === type &&
                        styles.mealTypeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <View style={styles.foodsList}>
          <Text style={styles.sectionTitle}>
            Foods ({analysisState.result.foods.length})
          </Text>
          {analysisState.result.foods.map((food, index) => (
            <View key={index} style={styles.foodItemResult}>
              <View style={styles.foodItemHeader}>
                <Text style={styles.foodNameResult}>{food.name}</Text>
                <Text style={styles.foodCaloriesResult}>{food.calories}</Text>
              </View>
              <Text style={styles.foodQuantityResult}>{food.quantity}</Text>
              <View style={styles.foodMacrosResult}>
                <Text style={styles.macro}>P: {food.protein.toFixed(1)}g</Text>
                <Text style={styles.macro}>C: {food.carbs.toFixed(1)}g</Text>
                <Text style={styles.macro}>F: {food.fat.toFixed(1)}g</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Calories</Text>
            <Text style={styles.totalValue}>
              {analysisState.result.total_calories}
            </Text>
          </View>
        </View>

        {analysisState.result.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{analysisState.result.notes}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveMeal}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Add to Diary</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.retakeButton}
          onPress={() => resetAnalysis()}
        >
          <Text style={styles.retakeButtonText}>Retake Photo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  previewImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E0E0E0',
  },
  resultsContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  confidenceSection: {
    marginBottom: 20,
  },
  confidenceBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  mealTypeSelector: {
    marginBottom: 20,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  mealTypeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  mealTypeButtonTextActive: {
    color: '#fff',
  },
  foodsList: {
    marginBottom: 20,
  },
  foodItemResult: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  foodItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  foodNameResult: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  foodCaloriesResult: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  foodQuantityResult: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  foodMacrosResult: {
    flexDirection: 'row',
    gap: 12,
  },
  macro: {
    fontSize: 11,
    color: '#666',
  },
  totalsSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retakeButton: {
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
    marginBottom: 32,
  },
  retakeButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Features Implemented:

✅ **Camera Capture** - Take photos directly from app
✅ **Gallery Upload** - Pick existing photos from device
✅ **Real-time Analysis** - Shows loading state during API call
✅ **Results Preview** - Display identified foods with macros
✅ **Meal Type Selection** - Choose breakfast/lunch/dinner/snack
✅ **Confidence Display** - Shows AI confidence level
✅ **Error Handling** - Graceful error messages
✅ **Save to Diary** - Persists meal to store

---

## Prompt
Now let me implement the daily diary screen that shows all meals for the day, running totals, and macro progress. How should I structure it?

## Response
Here's the complete daily diary screen:

```typescript
// src/app/app/diary/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDiaryStore, useDailyTotals, useMacroPercentages, useStreak } from '@store/diaryStore';
import MealCard from '@components/MealCard';
import MacroRings from '@components/MacroRings';
import StreakCounter from '@components/StreakCounter';

export default function DiaryScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Get store data
  const diaries = useDiaryStore((state) => state.diaries);
  const removeFoodEntry = useDiaryStore((state) => state.removeFoodEntry);
  const setCurrentDate = useDiaryStore((state) => state.setCurrentDate);
  const goals = useDiaryStore((state) => state.currentUser?.goals);
  const streak = useStreak();

  useEffect(() => {
    setCurrentDate(selectedDate);
  }, [selectedDate, setCurrentDate]);

  // Get current diary data
  const diary = diaries.get(selectedDate);
  const totals = useDailyTotals();
  const percentages = useMacroPercentages();

  const entries = diary?.entries || [];
  const calorieRemaining = Math.max(0, (goals?.calories || 2000) - totals.calories);
  const isGoalMet = totals.calories >= (goals?.calories || 2000);

  const handleDelete = (entryId: string) => {
    removeFoodEntry(entryId);
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const today = new Date().toISOString().split('T')[0];
    if (date.toISOString().split('T')[0] <= today) {
      setSelectedDate(date.toISOString().split('T')[0]);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPreviousDay}
          >
            <Ionicons name="chevron-back" size={24} color="#667eea" />
          </TouchableOpacity>

          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>
              {isToday ? 'Today' : new Date(selectedDate).toLocaleDateString()}
            </Text>
            <TouchableOpacity onPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
              <Text style={styles.todayLink}>
                {!isToday && 'Go to today'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNextDay}
            disabled={!isToday}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isToday ? '#CCC' : '#667eea'}
            />
          </TouchableOpacity>
        </View>

        {/* Streak */}
        <StreakCounter streak={streak} />

        {/* Macro Progress Rings */}
        <View style={styles.ringsSection}>
          <MacroRings
            protein={percentages.protein}
            carbs={percentages.carbs}
            fat={percentages.fat}
          />
        </View>

        {/* Calorie Summary */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieLeft}>
            <Text style={styles.calorieLabel}>Consumed</Text>
            <Text style={styles.calorieValue}>{totals.calories}</Text>
          </View>

          <View style={styles.calorieMiddle}>
            <View
              style={[
                styles.calorieBar,
                {
                  width: `${Math.min((totals.calories / (goals?.calories || 2000)) * 100, 100)}%`,
                },
              ]}
            />
          </View>

          <View style={styles.calorieRight}>
            <Text style={styles.calorieLabel}>Remaining</Text>
            <Text style={[
              styles.calorieValue,
              isGoalMet && styles.calorieValueExceeded,
            ]}>
              {isGoalMet ? '+' : ''}{calorieRemaining}
            </Text>
          </View>
        </View>

        {/* Macro Breakdown */}
        <View style={styles.macroBreakdown}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{totals.protein.toFixed(0)}g</Text>
            <Text style={styles.macroGoal}>
              / {goals?.protein.toFixed(0)}g
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{totals.carbs.toFixed(0)}g</Text>
            <Text style={styles.macroGoal}>
              / {goals?.carbs.toFixed(0)}g
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>{totals.fat.toFixed(0)}g</Text>
            <Text style={styles.macroGoal}>
              / {goals?.fat.toFixed(0)}g
            </Text>
          </View>
        </View>

        {/* Meals List */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Meals ({entries.length})</Text>

          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>
                No meals logged yet for today
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the camera button to add a meal
              </Text>
            </View>
          ) : (
            entries.map((entry) => (
              <MealCard
                key={entry.id}
                entry={entry}
                onDelete={() => handleDelete(entry.id)}
              />
            ))
          )}
        </View>

        {/* Add Meal Button (sticky) */}
        <TouchableOpacity
          style={styles.addMealButton}
          onPress={() => router.push('/(app)/camera')}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.addMealButtonText}>Add Meal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dateSection: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  todayLink: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 4,
  },
  ringsSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    paddingVertical: 8,
  },
  calorieCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  calorieLeft: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  calorieValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  calorieValueExceeded: {
    color: '#FF6B6B',
  },
  calorieMiddle: {
    flex: 2,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  calorieBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  calorieRight: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  macroBreakdown: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 12,
    gap: 12,
  },
  macroItem: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  macroGoal: {
    fontSize: 11,
    color: '#CCC',
    marginTop: 2,
  },
  mealsSection: {
    marginTop: 12,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#CCC',
    marginTop: 4,
  },
  addMealButton: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addMealButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Features Implemented:

✅ **Date Navigation** - Switch between days
✅ **Macro Progress Rings** - Visual macro tracking
✅ **Calorie Progress Bar** - Shows consumed vs. goal
✅ **Running Totals** - All macros updated in real-time
✅ **Meal List** - All entries for the day
✅ **Empty State** - Helpful message when no meals
✅ **Streak Display** - Motivation tracker
✅ **Delete Meals** - Remove entries easily
✅ **Quick Add Button** - Easy access to camera
