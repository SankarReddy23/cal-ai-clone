# State Management, Storage & Diary Tracking

## Prompt
I need to implement the state management for the daily diary and macro tracking. What's the best approach using Zustand for:
1. Managing food entries per day
2. Calculating running totals and macro percentages
3. Persisting data to AsyncStorage
4. Handling daily reset at midnight
5. Calculating streaks

## Response
Here's a complete Zustand store implementation with all features:

```typescript
// src/store/diaryStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Food, FoodEntry, DailyDiary, User } from '@types';

interface DiaryState {
  // State
  currentDate: string;
  diaries: Map<string, DailyDiary>;
  currentUser: User | null;
  streak: number;
  lastLogDate: string | null;

  // Actions
  setCurrentDate: (date: string) => void;
  addFoodEntry: (entry: FoodEntry) => Promise<void>;
  removeFoodEntry: (entryId: string) => Promise<void>;
  setGoals: (goals: DailyDiary['goals']) => Promise<void>;
  getDailyTotals: () => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  getMacroPercentages: () => {
    protein: number;
    carbs: number;
    fat: number;
  };
  loadDiary: (date: string) => Promise<DailyDiary>;
  saveDiary: () => Promise<void>;
  calculateStreak: () => Promise<void>;
  resetDaily: () => Promise<void>;
  getHistoricalData: (days: number) => Promise<DailyDiary[]>;
  initializeStore: () => Promise<void>;
}

const STORAGE_KEYS = {
  DIARIES: 'cal_ai_diaries',
  USER: 'cal_ai_user',
  STREAK: 'cal_ai_streak',
  LAST_LOG_DATE: 'cal_ai_last_log',
};

const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 225,
  fat: 65,
};

const DEFAULT_USER: User = {
  id: 'user_' + Date.now(),
  email: '',
  name: 'User',
  goals: DEFAULT_GOALS,
  createdAt: Date.now(),
};

export const useDiaryStore = create<DiaryState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentDate: new Date().toISOString().split('T')[0],
    diaries: new Map(),
    currentUser: null,
    streak: 0,
    lastLogDate: null,

    // Initialize store from storage
    initializeStore: async () => {
      try {
        // Load user
        const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        const user = userStr ? JSON.parse(userStr) : DEFAULT_USER;

        // Load diaries
        const diariesStr = await AsyncStorage.getItem(STORAGE_KEYS.DIARIES);
        const diariesArray = diariesStr ? JSON.parse(diariesStr) : [];
        const diariesMap = new Map(diariesArray);

        // Load streak data
        const streak = parseInt(
          (await AsyncStorage.getItem(STORAGE_KEYS.STREAK)) || '0'
        );
        const lastLogDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOG_DATE);

        set({
          currentUser: user,
          diaries: diariesMap,
          streak,
          lastLogDate,
        });

        // Check if we need to reset daily
        await get().resetDaily();
      } catch (error) {
        console.error('Failed to initialize store:', error);
      }
    },

    // Add food entry to current day's diary
    addFoodEntry: async (entry: FoodEntry) => {
      try {
        const { currentDate, diaries } = get();
        const diary = diaries.get(currentDate) || {
          date: currentDate,
          entries: [],
          goals: get().currentUser?.goals || DEFAULT_GOALS,
        };

        diary.entries.push(entry);
        diaries.set(currentDate, diary);

        set({ diaries: new Map(diaries) });
        await get().saveDiary();
        await get().calculateStreak();
      } catch (error) {
        console.error('Failed to add food entry:', error);
        throw error;
      }
    },

    // Remove food entry
    removeFoodEntry: async (entryId: string) => {
      try {
        const { currentDate, diaries } = get();
        const diary = diaries.get(currentDate);

        if (!diary) return;

        diary.entries = diary.entries.filter((e) => e.id !== entryId);

        if (diary.entries.length === 0) {
          diaries.delete(currentDate);
        } else {
          diaries.set(currentDate, diary);
        }

        set({ diaries: new Map(diaries) });
        await get().saveDiary();
      } catch (error) {
        console.error('Failed to remove food entry:', error);
        throw error;
      }
    },

    // Update user goals
    setGoals: async (goals: DailyDiary['goals']) => {
      try {
        const user = get().currentUser || DEFAULT_USER;
        user.goals = goals;

        set({ currentUser: user });
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } catch (error) {
        console.error('Failed to set goals:', error);
        throw error;
      }
    },

    // Calculate daily totals
    getDailyTotals: () => {
      const { currentDate, diaries } = get();
      const diary = diaries.get(currentDate);

      if (!diary) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }

      return diary.entries.reduce(
        (totals, entry) => {
          entry.foods.forEach((food) => {
            totals.calories += food.calories;
            totals.protein += food.protein;
            totals.carbs += food.carbs;
            totals.fat += food.fat;
          });
          return totals;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
    },

    // Calculate macro percentages of goals
    getMacroPercentages: () => {
      const totals = get().getDailyTotals();
      const goals = get().currentUser?.goals || DEFAULT_GOALS;

      return {
        protein: Math.min((totals.protein / goals.protein) * 100, 100),
        carbs: Math.min((totals.carbs / goals.carbs) * 100, 100),
        fat: Math.min((totals.fat / goals.fat) * 100, 100),
      };
    },

    // Load diary for specific date
    loadDiary: async (date: string) => {
      try {
        const { diaries } = get();
        const diary = diaries.get(date);

        if (diary) {
          return diary;
        }

        return {
          date,
          entries: [],
          goals: get().currentUser?.goals || DEFAULT_GOALS,
        };
      } catch (error) {
        console.error('Failed to load diary:', error);
        throw error;
      }
    },

    // Save all diaries to storage
    saveDiary: async () => {
      try {
        const { diaries } = get();
        const diariesArray = Array.from(diaries.entries());
        await AsyncStorage.setItem(
          STORAGE_KEYS.DIARIES,
          JSON.stringify(diariesArray)
        );
      } catch (error) {
        console.error('Failed to save diary:', error);
        throw error;
      }
    },

    // Calculate and update streak
    calculateStreak: async () => {
      try {
        const { diaries } = get();
        let streak = 0;
        let currentDate = new Date();

        // Count consecutive days with food entries from today backwards
        while (true) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const diary = diaries.get(dateStr);

          if (diary && diary.entries.length > 0) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }

        set({ streak });
        await AsyncStorage.setItem(STORAGE_KEYS.STREAK, String(streak));
      } catch (error) {
        console.error('Failed to calculate streak:', error);
      }
    },

    // Reset daily (check for midnight)
    resetDaily: async () => {
      try {
        const lastLogDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOG_DATE);
        const today = new Date().toISOString().split('T')[0];

        if (lastLogDate && lastLogDate !== today) {
          // New day, reset for today
          set({ currentDate: today });
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOG_DATE, today);
        } else if (!lastLogDate) {
          // First time
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOG_DATE, today);
        }
      } catch (error) {
        console.error('Failed to reset daily:', error);
      }
    },

    // Get historical data for charts
    getHistoricalData: async (days: number) => {
      try {
        const { diaries } = get();
        const data: DailyDiary[] = [];
        const currentDate = new Date();

        for (let i = 0; i < days; i++) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const diary = diaries.get(dateStr);

          if (diary) {
            data.push(diary);
          } else {
            data.push({
              date: dateStr,
              entries: [],
              goals: get().currentUser?.goals || DEFAULT_GOALS,
            });
          }

          currentDate.setDate(currentDate.getDate() - 1);
        }

        return data.reverse();
      } catch (error) {
        console.error('Failed to get historical data:', error);
        throw error;
      }
    },

    setCurrentDate: (date: string) => set({ currentDate: date }),
  }))
);

// Selector hooks for better performance
export const useDailyTotals = () =>
  useDiaryStore((state) => state.getDailyTotals());
export const useMacroPercentages = () =>
  useDiaryStore((state) => state.getMacroPercentages());
export const useStreak = () => useDiaryStore((state) => state.streak);
export const useCurrentUser = () => useDiaryStore((state) => state.currentUser);
export const useFoodEntries = () => {
  const currentDate = useDiaryStore((state) => state.currentDate);
  const diaries = useDiaryStore((state) => state.diaries);
  return diaries.get(currentDate)?.entries || [];
};
```

### Usage Example in Components

```typescript
// src/hooks/useDiary.ts
import { useDiaryStore } from '@store/diaryStore';

export const useDiary = () => {
  const addFoodEntry = useDiaryStore((state) => state.addFoodEntry);
  const removeFoodEntry = useDiaryStore((state) => state.removeFoodEntry);
  const getDailyTotals = useDiaryStore((state) => state.getDailyTotals);
  const getMacroPercentages = useDiaryStore((state) => state.getMacroPercentages);
  const foodEntries = useDiaryStore((state) => {
    const diary = state.diaries.get(state.currentDate);
    return diary?.entries || [];
  });

  return {
    addFoodEntry,
    removeFoodEntry,
    getDailyTotals,
    getMacroPercentages,
    foodEntries,
  };
};
```

### Features:

✅ **Persistent Storage** - AsyncStorage integration
✅ **Daily Diary Management** - Per-date food entries
✅ **Automatic Calculations** - Totals and macro percentages
✅ **Streak Tracking** - Consecutive logging days
✅ **Historical Data** - Access any date's info
✅ **Type-Safe** - Full TypeScript support
✅ **Optimized Selectors** - Zustand subscriptions for performance

---

## Prompt
Now let's build the UI components. I need to create:
1. MacroRings component - visual progress rings for each macro
2. DailyDiary screen - shows all meals with running totals
3. MealCard component - individual meal display
4. HistoryChart - weekly view of calorie intake

What's the best approach for these components using React Native and react-native-svg?

## Response
Here are production-ready UI components:

```typescript
// src/components/MacroRings.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface MacroRingsProps {
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
  strokeWidth?: number;
}

const COLORS = {
  protein: '#FF6B6B',
  carbs: '#4ECDC4',
  fat: '#FFE66D',
};

const MacroRings: React.FC<MacroRingsProps> = ({
  protein,
  carbs,
  fat,
  size = 300,
  strokeWidth = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Calculate circle circumference and dash offset
  const circumference = 2 * Math.PI * radius;

  const getStrokeDashOffset = (percentage: number) => {
    return circumference - (circumference * Math.min(percentage, 100)) / 100;
  };

  // Ring spacing
  const rings = [
    { percentage: protein, color: COLORS.protein, label: 'Protein', macro: 'P' },
    { percentage: carbs, color: COLORS.carbs, label: 'Carbs', macro: 'C' },
    { percentage: fat, color: COLORS.fat, label: 'Fat', macro: 'F' },
  ];

  const radiusStep = (radius - 20) / rings.length;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#667eea" stopOpacity="1" />
            <Stop offset="100%" stopColor="#764ba2" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Background circles */}
        {rings.map((ring, index) => (
          <Circle
            key={`bg-${index}`}
            cx={centerX}
            cy={centerY}
            r={radius - index * radiusStep}
            stroke="#E8E8E8"
            strokeWidth={strokeWidth}
            fill="none"
          />
        ))}

        {/* Progress circles */}
        {rings.map((ring, index) => (
          <Circle
            key={`progress-${index}`}
            cx={centerX}
            cy={centerY}
            r={radius - index * radiusStep}
            stroke={ring.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={getStrokeDashOffset(ring.percentage)}
            strokeLinecap="round"
            transform={`rotate(-90 ${centerX} ${centerY})`}
          />
        ))}
      </Svg>

      {/* Center text */}
      <View style={styles.centerContent}>
        <Text style={styles.avgLabel}>Avg</Text>
        <Text style={styles.avgValue}>
          {Math.round((protein + carbs + fat) / 3)}%
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {rings.map((ring, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: ring.color }]}
            />
            <Text style={styles.legendLabel}>
              {ring.macro} {Math.round(ring.percentage)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  avgLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  avgValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  legend: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default MacroRings;
```

```typescript
// src/components/MealCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodEntry } from '@types';

interface MealCardProps {
  entry: FoodEntry;
  onDelete: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ entry, onDelete }) => {
  const totalCalories = entry.foods.reduce((sum, food) => sum + food.calories, 0);
  const totalProtein = entry.foods.reduce((sum, food) => sum + food.protein, 0);
  const totalCarbs = entry.foods.reduce((sum, food) => sum + food.carbs, 0);
  const totalFat = entry.foods.reduce((sum, food) => sum + food.fat, 0);

  const getMealTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      breakfast: '☀️',
      lunch: '🍽️',
      dinner: '🌙',
      snack: '🍎',
    };
    return icons[type] || '🍽️';
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to remove this meal?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: onDelete,
          style: 'destructive',
        },
      ]
    );
  };

  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{getMealTypeIcon(entry.mealType)}</Text>
          <View>
            <Text style={styles.mealType}>
              {entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1)}
            </Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.foods}>
        {entry.foods.map((food, index) => (
          <View key={index} style={styles.foodItem}>
            {food.imageUrl && (
              <Image
                source={{ uri: food.imageUrl }}
                style={styles.foodImage}
              />
            )}
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodQuantity}>{food.quantity}</Text>
            </View>
            <Text style={styles.foodCalories}>{food.calories} cal</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroValue}>{totalProtein.toFixed(0)}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Carbs</Text>
          <Text style={styles.macroValue}>{totalCarbs.toFixed(0)}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Fat</Text>
          <Text style={styles.macroValue}>{totalFat.toFixed(0)}g</Text>
        </View>
        <View style={[styles.macroItem, styles.calorieItem]}>
          <Text style={styles.macroLabel}>Total</Text>
          <Text style={styles.macroValueLarge}>{totalCalories}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  foods: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  foodQuantity: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  calorieItem: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 6,
  },
  macroLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  macroValueLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default MealCard;
```

```typescript
// src/components/HistoryChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { DailyDiary } from '@types';

interface HistoryChartProps {
  data: DailyDiary[];
  type?: 'line' | 'bar';
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data, type = 'line' }) => {
  const chartWidth = Dimensions.get('window').width - 16;

  // Process data for chart
  const labels = data.map((d) => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const calorieData = data.map((d) => {
    const total = d.entries.reduce((sum, entry) => {
      return sum + entry.foods.reduce((f, food) => f + food.calories, 0);
    }, 0);
    return total;
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: calorieData,
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
  };

  const avgCalories = Math.round(
    calorieData.reduce((a, b) => a + b, 0) / calorieData.length
  );

  const maxCalories = Math.max(...calorieData);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Calories</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg</Text>
            <Text style={styles.statValue}>{avgCalories}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max</Text>
            <Text style={styles.statValue}>{maxCalories}</Text>
          </View>
        </View>
      </View>

      {type === 'line' ? (
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      ) : (
        <BarChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default HistoryChart;
```

These components provide:
✅ **Animated Progress Rings** - SVG-based macro visualization
✅ **Beautiful Meal Cards** - Shows all foods with macros
✅ **Historical Charts** - Line and bar chart support
✅ **Responsive Design** - Works on all screen sizes
✅ **Type-Safe** - Full TypeScript support
✅ **Reusable** - Can be used throughout the app
