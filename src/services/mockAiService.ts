// src/services/mockAiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Food {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: 'high' | 'medium' | 'low';
}

interface AIResponse {
  foods: Food[];
  total_calories: number;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
}

// Mock food database with realistic nutritional data
const FOOD_DATABASE: Record<string, Food> = {
  // Breakfast items
  'scrambled eggs': {
    id: '1',
    name: 'Scrambled Eggs',
    quantity: '2 eggs (100g)',
    calories: 155,
    protein: 13,
    carbs: 1,
    fat: 11,
    confidence: 'high',
  },
  pancakes: {
    id: '2',
    name: 'Pancakes',
    quantity: '2 medium (150g)',
    calories: 350,
    protein: 8,
    carbs: 45,
    fat: 15,
    confidence: 'high',
  },
  oatmeal: {
    id: '3',
    name: 'Oatmeal',
    quantity: '1 cup cooked (150g)',
    calories: 150,
    protein: 5,
    carbs: 27,
    fat: 3,
    confidence: 'high',
  },
  toast: {
    id: '4',
    name: 'Whole Wheat Toast',
    quantity: '2 slices (50g)',
    calories: 130,
    protein: 4,
    carbs: 24,
    fat: 1,
    confidence: 'high',
  },
  butter: {
    id: '5',
    name: 'Butter',
    quantity: '1 tbsp (15g)',
    calories: 102,
    protein: 0,
    carbs: 0,
    fat: 11,
    confidence: 'high',
  },

  // Lunch items
  chicken: {
    id: '6',
    name: 'Grilled Chicken Breast',
    quantity: '150g',
    calories: 250,
    protein: 53,
    carbs: 0,
    fat: 3,
    confidence: 'high',
  },
  rice: {
    id: '7',
    name: 'White Rice',
    quantity: '1 cup cooked (150g)',
    calories: 206,
    protein: 4,
    carbs: 45,
    fat: 0,
    confidence: 'high',
  },
  broccoli: {
    id: '8',
    name: 'Broccoli',
    quantity: '1 cup (91g)',
    calories: 31,
    protein: 3,
    carbs: 6,
    fat: 0,
    confidence: 'high',
  },
  salmon: {
    id: '9',
    name: 'Salmon Fillet',
    quantity: '150g',
    calories: 280,
    protein: 25,
    carbs: 0,
    fat: 20,
    confidence: 'high',
  },
  pasta: {
    id: '10',
    name: 'Cooked Pasta',
    quantity: '1 cup (140g)',
    calories: 220,
    protein: 8,
    carbs: 43,
    fat: 1,
    confidence: 'high',
  },

  // Dinner items
  burger: {
    id: '11',
    name: 'Cheeseburger',
    quantity: '1 burger (215g)',
    calories: 540,
    protein: 30,
    carbs: 40,
    fat: 28,
    confidence: 'high',
  },
  pizza: {
    id: '12',
    name: 'Pizza Slice',
    quantity: '1 slice (100g)',
    calories: 250,
    protein: 12,
    carbs: 30,
    fat: 10,
    confidence: 'high',
  },
  steak: {
    id: '13',
    name: 'Grilled Steak',
    quantity: '150g',
    calories: 330,
    protein: 45,
    carbs: 0,
    fat: 16,
    confidence: 'high',
  },

  // Snacks
  apple: {
    id: '14',
    name: 'Apple',
    quantity: '1 medium (182g)',
    calories: 95,
    protein: 0,
    carbs: 25,
    fat: 0,
    confidence: 'high',
  },
  banana: {
    id: '15',
    name: 'Banana',
    quantity: '1 medium (118g)',
    calories: 105,
    protein: 1,
    carbs: 27,
    fat: 0,
    confidence: 'high',
  },
  almonds: {
    id: '16',
    name: 'Almonds',
    quantity: '1 oz (28g)',
    calories: 161,
    protein: 6,
    carbs: 6,
    fat: 14,
    confidence: 'high',
  },
  yogurt: {
    id: '17',
    name: 'Greek Yogurt',
    quantity: '1 cup (227g)',
    calories: 220,
    protein: 20,
    carbs: 9,
    fat: 5,
    confidence: 'high',
  },
  milk: {
    id: '18',
    name: 'Whole Milk',
    quantity: '1 cup (240ml)',
    calories: 150,
    protein: 8,
    carbs: 12,
    fat: 8,
    confidence: 'high',
  },
};

// Meal suggestions based on common meal patterns
const MEAL_SUGGESTIONS: Record<string, Food[]> = {
  breakfast: [
    FOOD_DATABASE['scrambled eggs'],
    FOOD_DATABASE['toast'],
    FOOD_DATABASE['orange juice'],
  ],
  lunch: [FOOD_DATABASE['chicken'], FOOD_DATABASE['rice'], FOOD_DATABASE['broccoli']],
  dinner: [FOOD_DATABASE['salmon'], FOOD_DATABASE['rice']],
  snack: [FOOD_DATABASE['apple'], FOOD_DATABASE['almonds']],
};

export class MockAIService {
  private static instance: MockAIService;

  private constructor() {}

  static getInstance(): MockAIService {
    if (!MockAIService.instance) {
      MockAIService.instance = new MockAIService();
    }
    return MockAIService.instance;
  }

  /**
   * Simulate AI food analysis - returns random meal from database
   * In production, this would call real AI API
   */
  async analyzeFood(imageUri: string): Promise<AIResponse> {
    // Simulate API delay (200-500ms)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 300 + 200)
    );

    // Generate random meal
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    const randomMealType =
      mealTypes[Math.floor(Math.random() * mealTypes.length)];

    // Pick 1-3 random foods from database
    const foodCount = Math.floor(Math.random() * 2) + 1;
    const foodKeys = Object.keys(FOOD_DATABASE);
    const selectedFoods: Food[] = [];

    for (let i = 0; i < foodCount; i++) {
      const randomFood = FOOD_DATABASE[foodKeys[Math.floor(Math.random() * foodKeys.length)]];
      selectedFoods.push({
        ...randomFood,
        id: `${randomFood.id}-${i}`,
      });
    }

    // Calculate totals
    const totalCalories = selectedFoods.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = selectedFoods.reduce((sum, food) => sum + food.protein, 0);
    const totalCarbs = selectedFoods.reduce((sum, food) => sum + food.carbs, 0);
    const totalFat = selectedFoods.reduce((sum, food) => sum + food.fat, 0);

    const notes = [
      'Estimated portion sizes based on typical servings',
      'Demo mode: Using mock AI analysis',
      `Meal type detected: ${randomMealType}`,
    ];

    const response: AIResponse = {
      foods: selectedFoods,
      total_calories: totalCalories,
      notes: notes.join('. '),
      confidence: 'high',
    };

    if (process.env.EXPO_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🤖 Mock AI Analysis Result:', response);
    }

    return response;
  }

  /**
   * Get specific food from database
   */
  getFoodByName(name: string): Food | undefined {
    return FOOD_DATABASE[name.toLowerCase()];
  }

  /**
   * Get all available foods
   */
  getAllFoods(): Food[] {
    return Object.values(FOOD_DATABASE);
  }

  /**
   * Get meal suggestion for time of day
   */
  getMealSuggestion(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Food[] {
    return MEAL_SUGGESTIONS[mealType] || [];
  }

  /**
   * Search foods by keyword
   */
  searchFoods(query: string): Food[] {
    const lowerQuery = query.toLowerCase();
    return Object.values(FOOD_DATABASE).filter(
      (food) =>
        food.name.toLowerCase().includes(lowerQuery) ||
        food.quantity.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get random meal for demo
   */
  getRandomMeal(): AIResponse {
    const foodCount = Math.floor(Math.random() * 2) + 1;
    const foodKeys = Object.keys(FOOD_DATABASE);
    const selectedFoods: Food[] = [];

    for (let i = 0; i < foodCount; i++) {
      const randomFood = FOOD_DATABASE[foodKeys[Math.floor(Math.random() * foodKeys.length)]];
      selectedFoods.push({
        ...randomFood,
        id: `${randomFood.id}-${i}`,
      });
    }

    const totalCalories = selectedFoods.reduce((sum, food) => sum + food.calories, 0);

    return {
      foods: selectedFoods,
      total_calories: totalCalories,
      notes: 'This is a demo meal. In production, use real food image.',
      confidence: 'high',
    };
  }

  /**
   * Simulate getting cached results (for instant demo)
   */
  async getCachedMeal(): Promise<AIResponse> {
    try {
      const cached = await AsyncStorage.getItem('last_meal_analysis');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error getting cached meal:', error);
    }

    return this.getRandomMeal();
  }

  /**
   * Save meal to cache
   */
  async saveMeal(meal: AIResponse): Promise<void> {
    try {
      await AsyncStorage.setItem('last_meal_analysis', JSON.stringify(meal));
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('last_meal_analysis');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const mockAiService = MockAIService.getInstance();
