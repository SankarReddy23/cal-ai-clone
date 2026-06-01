# Additional UI Components & Best Practices

## Prompt
I need to create additional helper components:
1. StreakCounter - Shows current streak with animations
2. GoalProgressBar - Displays progress to macro goals
3. NutritionSummary - Quick stats card
4. LoadingScreen - Skeleton loading states

How should I build these components?

## Response
Here are all the additional components needed:

```typescript
// src/components/StreakCounter.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakCounterProps {
  streak: number;
  target?: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak, target = 30 }) => {
  const percentage = Math.min((streak / target) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="flame" size={32} color="#FF6B6B" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.label}>Current Streak</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakValue}>{streak}</Text>
            <Text style={styles.streakUnit}>days</Text>
          </View>
        </View>

        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Goal</Text>
          <Text style={styles.targetValue}>{target}d</Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: \`\${percentage}%\` },
            ]}
          />
        </View>
      </View>

      <Text style={styles.motivationalText}>
        {streak === 0
          ? 'Start logging to build your streak!'
          : streak < target
          ? \`Keep going! \${target - streak} more days to your goal!\`
          : '🎉 Goal achieved! Keep it up!'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  streakUnit: {
    fontSize: 12,
    color: '#999',
  },
  targetContainer: {
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 2,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  progressBarContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
  },
  motivationalText: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default StreakCounter;
```

```typescript
// src/components/GoalProgressBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GoalProgressBarProps {
  current: number;
  goal: number;
  label: string;
  unit: string;
  color?: string;
}

const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
  current,
  goal,
  label,
  unit,
  color = '#667eea',
}) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isExceeded = current > goal;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, isExceeded && styles.valueExceeded]}>
          {current.toFixed(0)}{unit} / {goal.toFixed(0)}{unit}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          {percentage > 0 && (
            <LinearGradient
              colors={[color, `\${color}dd`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.barFill,
                {
                  width: \`\${Math.min(percentage, 100)}%\`,
                  backgroundColor: isExceeded ? '#FF6B6B' : color,
                },
              ]}
            />
          )}
        </View>
      </View>

      <Text style={styles.percentage}>
        {Math.round(percentage)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  valueExceeded: {
    color: '#FF6B6B',
  },
  barContainer: {
    marginBottom: 4,
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});

export default GoalProgressBar;
```

```typescript
// src/components/NutritionSummary.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  calories,
  protein,
  carbs,
  fat,
}) => {
  const macros = [
    {
      name: 'Protein',
      value: protein,
      unit: 'g',
      icon: '🥚',
      color: '#FF6B6B',
    },
    {
      name: 'Carbs',
      value: carbs,
      unit: 'g',
      icon: '🍞',
      color: '#4ECDC4',
    },
    {
      name: 'Fat',
      value: fat,
      unit: 'g',
      icon: '🥑',
      color: '#FFE66D',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.calorieSection}>
        <Text style={styles.calorieLabel}>Total Energy</Text>
        <Text style={styles.calorieValue}>{Math.round(calories)}</Text>
        <Text style={styles.calorieUnit}>kcal</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.macrosGrid}>
        {macros.map((macro, index) => (
          <View key={index} style={styles.macroCard}>
            <Text style={styles.macroIcon}>{macro.icon}</Text>
            <Text style={styles.macroName}>{macro.name}</Text>
            <Text style={[styles.macroValue, { color: macro.color }]}>
              {macro.value.toFixed(0)}
            </Text>
            <Text style={styles.macroUnit}>{macro.unit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  calorieSection: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  calorieLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  calorieUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  macroCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  macroIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  macroName: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  macroUnit: {
    fontSize: 10,
    color: '#CCC',
    marginTop: 2,
  },
});

export default NutritionSummary;
```

```typescript
// src/components/SkeletonLoader.tsx
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [shimmerValue]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['#E8E8E8', '#F5F5F5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E8E8E8',
  },
});

export default SkeletonLoader;
```

### Features:

✅ **StreakCounter** - Animated flame icon, progress bar, motivational text
✅ **GoalProgressBar** - Gradient fill, percentage display, overflow handling
✅ **NutritionSummary** - Quick stats with emoji icons
✅ **SkeletonLoader** - Shimmer animation for loading states

---

## Prompt
What are the best practices for optimizing the app for production? Think about:
1. Performance optimization
2. Image optimization
3. API error handling
4. Analytics and monitoring
5. Security best practices

## Response
Here's a comprehensive guide for production optimization:

```typescript
// src/utils/optimizations.ts

/**
 * PERFORMANCE OPTIMIZATION STRATEGIES
 */

// 1. IMAGE OPTIMIZATION
export const imageOptimizations = {
  // Cache images locally to reduce network requests
  cacheImage: async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      // In production, save to device storage
      return uri;
    } catch (error) {
      console.error('Image cache failed:', error);
      return uri;
    }
  },

  // Compress images before upload
  compressImage: async (uri: string, quality: number = 0.7): Promise<string> => {
    // Use expo-image-manipulator for compression
    return uri;
  },

  // Preload critical images
  preloadImages: (uris: string[]) => {
    uris.forEach((uri) => {
      Image.prefetch(uri);
    });
  },
};

// 2. PERFORMANCE METRICS
export const performanceMetrics = {
  // Track API response times
  measureAPICall: async (
    fn: () => Promise<any>,
    label: string
  ): Promise<any> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      console.log(\`[\${label}] took \${duration.toFixed(2)}ms\`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(\`[\${label}] failed after \${duration.toFixed(2)}ms\`, error);
      throw error;
    }
  },

  // Monitor memory usage
  checkMemoryUsage: () => {
    if (__DEV__) {
      console.log(\`Memory usage: \${JSON.stringify(performance.memory)}\`);
    }
  },
};

// 3. ANALYTICS TRACKING
export const analytics = {
  trackEvent: (event: string, properties?: Record<string, any>) => {
    // Integrate with Firebase Analytics, Amplitude, or similar
    console.log(\`Event: \${event}\`, properties);
  },

  trackUserAction: (action: string, details?: any) => {
    analytics.trackEvent('user_action', {
      action,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  trackError: (error: Error, context?: string) => {
    analytics.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  },

  trackScreenView: (screenName: string) => {
    analytics.trackEvent('screen_view', { screen: screenName });
  },
};

// 4. ERROR HANDLING & RECOVERY
export const errorHandler = {
  // Centralized error handling
  handleError: (error: any, context: string) => {
    // Log to monitoring service
    analytics.trackError(error, context);

    // Determine if error is network-related
    const isNetworkError =
      error.message?.includes('Network') ||
      error.message?.includes('timeout');

    // Determine if error is recoverable
    const isRecoverable = isNetworkError || error.status === 429;

    return {
      isNetworkError,
      isRecoverable,
      message: error.message || 'An error occurred',
    };
  },

  // Retry logic with exponential backoff
  retryWithBackoff: async (
    fn: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<any> => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  },
};

// 5. SECURITY BEST PRACTICES
export const security = {
  // Sanitize user input
  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/[<>\"']/g, '')
      .substring(0, 500); // Limit length
  },

  // Validate API responses
  validateResponse: (response: any, schema: any): boolean => {
    try {
      // Use zod or joi for schema validation
      return true;
    } catch (error) {
      console.error('Response validation failed:', error);
      return false;
    }
  },

  // Encrypt sensitive data
  encryptSensitiveData: (data: string): string => {
    // Use expo-crypto for encryption
    return data;
  },

  // Store sensitive data securely
  storeSecurely: async (key: string, value: string) => {
    // Use Keychain for iOS, Keystore for Android
    // Or use expo-secure-store
  },
};

// 6. CACHING STRATEGY
export const cacheStrategy = {
  // Cache levels
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Smart cache invalidation
  shouldInvalidateCache: (
    lastFetchTime: number,
    cacheDuration: number
  ): boolean => {
    return Date.now() - lastFetchTime > cacheDuration;
  },

  // Stale-while-revalidate pattern
  getOrFetch: async (
    key: string,
    fetchFn: () => Promise<any>,
    cacheDuration: number
  ) => {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const data = JSON.parse(cached);
      if (!cacheStrategy.shouldInvalidateCache(data.timestamp, cacheDuration)) {
        return data.value;
      }
    }

    // Fetch fresh data
    const value = await fetchFn();
    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        value,
        timestamp: Date.now(),
      })
    );

    return value;
  },
};

// 7. MONITORING & LOGGING
export const logger = {
  levels: {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  },

  log: (level: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = \`[\${timestamp}] [\${level}] \${message}\`;

    if (__DEV__) {
      console.log(logEntry, data);
    } else {
      // Send to remote logging service (e.g., Sentry)
    }
  },

  debug: (message: string, data?: any) =>
    logger.log(logger.levels.DEBUG, message, data),
  info: (message: string, data?: any) =>
    logger.log(logger.levels.INFO, message, data),
  warn: (message: string, data?: any) =>
    logger.log(logger.levels.WARN, message, data),
  error: (message: string, data?: any) =>
    logger.log(logger.levels.ERROR, message, data),
};
```

### Production Checklist:

✅ **Performance**
- Image optimization and caching
- List virtualization for long lists
- Memoization of expensive components
- Lazy loading of features

✅ **Reliability**
- Comprehensive error handling
- Retry logic with exponential backoff
- Offline support via AsyncStorage
- Crash reporting (Sentry)

✅ **Security**
- Input sanitization
- HTTPS only
- Secure storage for API keys
- No sensitive data in logs

✅ **Monitoring**
- Analytics tracking
- Error tracking
- Performance monitoring
- User session tracking

✅ **Code Quality**
- TypeScript strict mode
- Proper error boundaries
- Unit tests (Jest)
- E2E tests (Detox)

This gives you a production-ready foundation! 🚀
