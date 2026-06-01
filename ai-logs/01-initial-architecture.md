# Initial Architecture & Project Planning

## Prompt
I'm building a Cal AI Clone - an AI-powered calorie tracker app. The app needs to:
1. Allow users to take/upload photos of food
2. Use AI to recognize the food and provide calorie/macro breakdown
3. Display a daily food diary with running totals
4. Show macro progress rings (protein/carbs/fat)
5. Include weekly history charts and streak tracking

What should be my tech stack choice, architecture approach, and how should I structure the project?

## Response
For a Cal AI Clone with the features you mentioned, here's a recommended approach:

### Tech Stack Recommendation

**Mobile Framework:**
- React Native (Expo) or Flutter for cross-platform iOS/Android
- Or native (Swift for iOS, Kotlin for Android) for maximum performance

**Backend:**
- Node.js + Express or Python + FastAPI for API
- Firebase or Supabase for real-time database and auth
- PostgreSQL or MongoDB for persistent storage

**AI/ML:**
- Claude API or GPT-4 Vision for food recognition
- Google Cloud Vision API as alternative
- Local ML models (TensorFlow Lite) for offline support

**Data Visualization:**
- React Native Charts (Victory Native) for graphs
- Reanimated for smooth progress ring animations
- D3.js or Recharts (if web)

### Project Architecture

```
cal-ai-clone/
├── mobile/               # React Native/Flutter app
│   ├── src/
│   │   ├── screens/      # Screen components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API calls, AI integration
│   │   ├── utils/        # Helpers, constants
│   │   └── navigation/   # Navigation structure
│   ├── assets/           # Images, icons
│   └── app.json
├── backend/              # Node/Python server
│   ├── routes/           # API endpoints
│   ├── controllers/       # Business logic
│   ├── models/           # Database schemas
│   ├── services/         # AI integration, calculations
│   └── middleware/       # Auth, validation
├── ai-logs/              # Development conversations
└── docs/                 # Documentation
```

### Key Implementation Areas

1. **Photo Recognition Service:**
   - Call Claude Vision API with food image
   - Parse structured response for nutrition data
   - Cache results to reduce API calls

2. **Daily Diary Store:**
   - Timestamp-based food entries
   - Running calorie/macro totals
   - Local storage + cloud sync

3. **Macro Tracking:**
   - Calculate daily goals (customizable)
   - Show progress as visual rings
   - Include percentage completion

4. **History & Analytics:**
   - Weekly aggregation of nutrition data
   - Chart visualization of trends
   - Streak calculation logic

### Authentication Flow
- Email/password or social login
- JWT tokens for API auth
- Local device storage for session persistence

---

## Prompt
Which AI API would be best for food recognition - Claude, GPT-4 Vision, or Google Vision API? What are the trade-offs?

## Response
Great question. Here's the comparison:

### Claude Vision API (Recommended for this project)
**Pros:**
- Excellent at detailed food analysis and macro estimation
- Can provide structured JSON responses directly
- Good context understanding for food combinations
- Reasonable pricing ($0.003 per image for input)
- Strong safety and reliability

**Cons:**
- Slightly higher latency than some alternatives
- API limits based on plan

**Best for:** Accurate macro breakdowns, detailed analysis

### GPT-4 Vision
**Pros:**
- Very fast responses
- Excellent image understanding
- Large user base and community support
- Can handle complex multi-part meals

**Cons:**
- Slightly more expensive per request
- Requires more prompt engineering for consistent output
- Can be over-verbose

**Best for:** Quick recognition, flexibility

### Google Cloud Vision API
**Pros:**
- Very fast and optimized
- Excellent at object detection
- Good for basic food identification
- Cheapest option initially

**Cons:**
- Less detailed nutrition analysis capability
- Doesn't provide macro estimations directly
- Would need secondary API for nutritional data
- Requires more post-processing

**Best for:** Quick food identification only

### Recommendation for Cal AI Clone

**Use Claude Vision API + structured prompt:**

```
You are a nutritionist AI analyzing food photos. Respond ONLY in valid JSON format.
For the food in this image, provide:
{
  "foods": [
    {
      "name": "food name",
      "quantity": "portion size",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "confidence": "high/medium/low"
    }
  ],
  "total_calories": number,
  "notes": "any assumptions or caveats"
}
```

This gives you:
- Consistent structured output (easy to parse)
- Reliable macro estimates
- Good accuracy for Cal AI app quality
- Reasonable cost at scale

---

## Prompt
What's the best way to structure the daily food diary state and ensure real-time updates?

## Response
For the daily food diary, here's the optimal state structure and update pattern:

### State Structure (Redux/Zustand/Context)

```typescript
interface FoodEntry {
  id: string;
  timestamp: number;
  foods: {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    imageUrl?: string;
  }[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface DailyDiary {
  date: string; // YYYY-MM-DD
  entries: FoodEntry[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
```

### Real-time Update Pattern

1. **Optimistic UI Updates:**
   - Update local state immediately
   - Show pending indicator
   - Sync with backend

2. **Auto-Calculate Totals:**
   - Derived state (don't store redundantly)
   - Use selector/computed properties

3. **Persistence Strategy:**
   - AsyncStorage for local cache
   - Firebase Realtime DB for sync
   - Periodic sync on interval

This ensures instant UI feedback while maintaining data consistency.
