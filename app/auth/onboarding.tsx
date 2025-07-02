import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Target, Activity, Utensils } from 'lucide-react-native';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

const ACTIVITY_LEVELS = [
  { 
    key: 'sedentary', 
    label: 'Sedentary', 
    description: 'Little to no exercise',
    icon: '🪑'
  },
  { 
    key: 'light', 
    label: 'Light', 
    description: 'Light exercise 1-3 days/week',
    icon: '🚶'
  },
  { 
    key: 'moderate', 
    label: 'Moderate', 
    description: 'Moderate exercise 3-5 days/week',
    icon: '🏃'
  },
  { 
    key: 'active', 
    label: 'Active', 
    description: 'Hard exercise 6-7 days/week',
    icon: '🏋️'
  },
  { 
    key: 'very_active', 
    label: 'Very Active', 
    description: 'Very hard exercise, physical job',
    icon: '💪'
  },
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
  'Low-Carb', 'Keto', 'Paleo', 'Halal', 'Kosher'
];

const GOALS = [
  { key: 'lose_weight', label: 'Lose Weight', icon: '📉' },
  { key: 'gain_weight', label: 'Gain Weight', icon: '📈' },
  { key: 'maintain_weight', label: 'Maintain Weight', icon: '⚖️' },
  { key: 'build_muscle', label: 'Build Muscle', icon: '💪' },
  { key: 'improve_health', label: 'Improve Health', icon: '❤️' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { completeOnboarding } = useAuth();

  // Form data
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<string>('maintain_weight');
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [carbsGoal, setCarbsGoal] = useState('');
  const [fatGoal, setFatGoal] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  const calculateGoals = () => {
    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const weightNum = parseInt(weight);

    if (ageNum && heightNum && weightNum) {
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr;
      if (gender === 'male') {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
      } else {
        bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
      }

      // Apply activity multiplier
      const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };

      let tdee = Math.round(bmr * multipliers[activityLevel as keyof typeof multipliers]);

      // Adjust based on goal
      switch (goal) {
        case 'lose_weight':
          tdee -= 500; // 500 calorie deficit
          break;
        case 'gain_weight':
          tdee += 500; // 500 calorie surplus
          break;
        case 'build_muscle':
          tdee += 300; // 300 calorie surplus
          break;
      }

      setDailyCalorieGoal(Math.max(1200, tdee).toString());

      // Calculate macro goals (protein: 25%, carbs: 45%, fat: 30%)
      setProteinGoal(Math.round((tdee * 0.25) / 4).toString());
      setCarbsGoal(Math.round((tdee * 0.45) / 4).toString());
      setFatGoal(Math.round((tdee * 0.30) / 9).toString());
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!age || !height || !weight) {
          Alert.alert('Missing Information', 'Please fill in all fields');
          return false;
        }
        if (parseInt(age) < 13 || parseInt(age) > 120) {
          Alert.alert('Invalid Age', 'Please enter a valid age between 13 and 120');
          return false;
        }
        return true;
      case 3:
        if (!dailyCalorieGoal || !proteinGoal || !carbsGoal || !fatGoal) {
          Alert.alert('Missing Goals', 'Please set your nutrition goals');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step === 1) {
      calculateGoals();
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const result = await completeOnboarding({
        age: parseInt(age),
        gender,
        height: parseInt(height),
        weight: parseInt(weight),
        activityLevel: activityLevel as any,
        dailyCalorieGoal: parseInt(dailyCalorieGoal),
        proteinGoal: parseInt(proteinGoal),
        carbsGoal: parseInt(carbsGoal),
        fatGoal: parseInt(fatGoal),
        dietaryRestrictions,
      });

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', result.error || 'Failed to complete onboarding');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
      </View>
      <Text style={styles.stepIndicator}>Step {step} of 4</Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Target size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
        </View>
        <Text style={styles.stepTitle}>Personal Information</Text>
        <Text style={styles.stepDescription}>
          Help us personalize your nutrition goals
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>AGE</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter your age"
          placeholderTextColor={ZaraTheme.colors.mediumGray}
          keyboardType="numeric"
          maxLength={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>GENDER</Text>
        <View style={styles.optionsRow}>
          {['male', 'female', 'other'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                gender === option && styles.optionButtonSelected
              ]}
              onPress={() => setGender(option as any)}
            >
              <Text style={[
                styles.optionText,
                gender === option && styles.optionTextSelected
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.label}>HEIGHT (CM)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="170"
            placeholderTextColor={ZaraTheme.colors.mediumGray}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <View style={styles.inputHalf}>
          <Text style={styles.label}>WEIGHT (KG)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="70"
            placeholderTextColor={ZaraTheme.colors.mediumGray}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>PRIMARY GOAL</Text>
        <View style={styles.goalsGrid}>
          {GOALS.map((goalOption) => (
            <TouchableOpacity
              key={goalOption.key}
              style={[
                styles.goalCard,
                goal === goalOption.key && styles.goalCardSelected
              ]}
              onPress={() => setGoal(goalOption.key)}
            >
              <Text style={styles.goalIcon}>{goalOption.icon}</Text>
              <Text style={[
                styles.goalText,
                goal === goalOption.key && styles.goalTextSelected
              ]}>
                {goalOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Activity size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
        </View>
        <Text style={styles.stepTitle}>Activity Level</Text>
        <Text style={styles.stepDescription}>
          Select your typical activity level to calculate accurate calorie needs
        </Text>
      </View>

      {ACTIVITY_LEVELS.map((level) => (
        <TouchableOpacity
          key={level.key}
          style={[
            styles.activityCard,
            activityLevel === level.key && styles.activityCardSelected
          ]}
          onPress={() => setActivityLevel(level.key)}
        >
          <View style={styles.activityContent}>
            <Text style={styles.activityIcon}>{level.icon}</Text>
            <View style={styles.activityText}>
              <Text style={[
                styles.activityTitle,
                activityLevel === level.key && styles.activityTitleSelected
              ]}>
                {level.label}
              </Text>
              <Text style={[
                styles.activityDescription,
                activityLevel === level.key && styles.activityDescriptionSelected
              ]}>
                {level.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Target size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
        </View>
        <Text style={styles.stepTitle}>Nutrition Goals</Text>
        <Text style={styles.stepDescription}>
          Review and adjust your daily nutrition targets
        </Text>
      </View>

      <View style={styles.goalsSummary}>
        <Text style={styles.goalsSummaryTitle}>Calculated Goals</Text>
        <Text style={styles.goalsSummaryText}>
          Based on your information, we've calculated personalized nutrition goals
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>DAILY CALORIES</Text>
        <TextInput
          style={styles.input}
          value={dailyCalorieGoal}
          onChangeText={setDailyCalorieGoal}
          placeholder="2000"
          placeholderTextColor={ZaraTheme.colors.mediumGray}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.macroRow}>
        <View style={styles.macroInput}>
          <Text style={styles.label}>PROTEIN (G)</Text>
          <TextInput
            style={styles.input}
            value={proteinGoal}
            onChangeText={setProteinGoal}
            placeholder="150"
            placeholderTextColor={ZaraTheme.colors.mediumGray}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.macroInput}>
          <Text style={styles.label}>CARBS (G)</Text>
          <TextInput
            style={styles.input}
            value={carbsGoal}
            onChangeText={setCarbsGoal}
            placeholder="250"
            placeholderTextColor={ZaraTheme.colors.mediumGray}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.macroInput}>
          <Text style={styles.label}>FAT (G)</Text>
          <TextInput
            style={styles.input}
            value={fatGoal}
            onChangeText={setFatGoal}
            placeholder="65"
            placeholderTextColor={ZaraTheme.colors.mediumGray}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Utensils size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
        </View>
        <Text style={styles.stepTitle}>Dietary Preferences</Text>
        <Text style={styles.stepDescription}>
          Select any dietary restrictions or preferences (optional)
        </Text>
      </View>

      <View style={styles.restrictionsGrid}>
        {DIETARY_RESTRICTIONS.map((restriction) => (
          <TouchableOpacity
            key={restriction}
            style={[
              styles.restrictionChip,
              dietaryRestrictions.includes(restriction) && styles.restrictionChipSelected
            ]}
            onPress={() => toggleDietaryRestriction(restriction)}
          >
            <Text style={[
              styles.restrictionText,
              dietaryRestrictions.includes(restriction) && styles.restrictionTextSelected
            ]}>
              {restriction}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.finalNote}>
        <Text style={styles.finalNoteText}>
          You're all set! These preferences will help us provide better recommendations.
          You can always update them later in settings.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {renderProgressBar()}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.actions}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <ChevronLeft size={20} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, { flex: step > 1 ? 1 : undefined }]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {step === 4 ? 'Complete Setup' : 'Continue'}
              </Text>
              {step < 4 && (
                <ChevronRight size={20} color={ZaraTheme.colors.white} strokeWidth={1.5} />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ZaraTheme.colors.white,
  },
  header: {
    paddingHorizontal: ZaraTheme.spacing.lg,
    paddingTop: ZaraTheme.spacing.lg,
    paddingBottom: ZaraTheme.spacing.md,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: ZaraTheme.colors.lightGray,
    marginBottom: ZaraTheme.spacing.sm,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ZaraTheme.colors.black,
    borderRadius: 2,
  },
  stepIndicator: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  content: {
    flex: 1,
    paddingHorizontal: ZaraTheme.spacing.lg,
  },
  stepContent: {
    paddingBottom: ZaraTheme.spacing.xl,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.xl,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ZaraTheme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.md,
  },
  stepTitle: {
    ...ZaraTheme.typography.h2,
    marginBottom: ZaraTheme.spacing.sm,
    textAlign: 'center',
  },
  stepDescription: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: width * 0.8,
  },
  inputGroup: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  label: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.sm,
    color: ZaraTheme.colors.black,
  },
  input: {
    ...ZaraTheme.typography.body,
    borderBottomWidth: 1,
    borderBottomColor: ZaraTheme.colors.lightGray,
    paddingVertical: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ZaraTheme.spacing.lg,
  },
  inputHalf: {
    flex: 1,
    marginHorizontal: ZaraTheme.spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    paddingVertical: ZaraTheme.spacing.md,
    alignItems: 'center',
    marginHorizontal: ZaraTheme.spacing.xs,
    borderRadius: 8,
  },
  optionButtonSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  optionText: {
    ...ZaraTheme.typography.body,
    color: ZaraTheme.colors.black,
  },
  optionTextSelected: {
    color: ZaraTheme.colors.white,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: (width - ZaraTheme.spacing.lg * 2 - ZaraTheme.spacing.sm) / 2,
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    borderRadius: 8,
    padding: ZaraTheme.spacing.md,
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.sm,
  },
  goalCardSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  goalIcon: {
    fontSize: 24,
    marginBottom: ZaraTheme.spacing.xs,
  },
  goalText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
    textAlign: 'center',
  },
  goalTextSelected: {
    color: ZaraTheme.colors.white,
  },
  activityCard: {
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    borderRadius: 8,
    padding: ZaraTheme.spacing.lg,
    marginBottom: ZaraTheme.spacing.md,
  },
  activityCardSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 32,
    marginRight: ZaraTheme.spacing.md,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    ...ZaraTheme.typography.body,
    fontWeight: '500',
    marginBottom: ZaraTheme.spacing.xs,
  },
  activityTitleSelected: {
    color: ZaraTheme.colors.white,
  },
  activityDescription: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
  },
  activityDescriptionSelected: {
    color: ZaraTheme.colors.lightGray,
  },
  goalsSummary: {
    backgroundColor: ZaraTheme.colors.gray,
    padding: ZaraTheme.spacing.lg,
    borderRadius: 8,
    marginBottom: ZaraTheme.spacing.lg,
  },
  goalsSummaryTitle: {
    ...ZaraTheme.typography.body,
    fontWeight: '500',
    marginBottom: ZaraTheme.spacing.xs,
  },
  goalsSummaryText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    lineHeight: 18,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroInput: {
    flex: 1,
    marginHorizontal: ZaraTheme.spacing.xs,
  },
  restrictionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: ZaraTheme.spacing.lg,
  },
  restrictionChip: {
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingVertical: ZaraTheme.spacing.sm,
    marginRight: ZaraTheme.spacing.sm,
    marginBottom: ZaraTheme.spacing.sm,
  },
  restrictionChipSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  restrictionText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
  },
  restrictionTextSelected: {
    color: ZaraTheme.colors.white,
  },
  finalNote: {
    backgroundColor: ZaraTheme.colors.gray,
    padding: ZaraTheme.spacing.lg,
    borderRadius: 8,
  },
  finalNoteText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: ZaraTheme.spacing.lg,
    paddingVertical: ZaraTheme.spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ZaraTheme.spacing.md,
    paddingHorizontal: ZaraTheme.spacing.lg,
    marginRight: ZaraTheme.spacing.md,
  },
  backButtonText: {
    ...ZaraTheme.typography.body,
    color: ZaraTheme.colors.black,
    marginLeft: ZaraTheme.spacing.xs,
  },
  nextButton: {
    backgroundColor: ZaraTheme.colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ZaraTheme.spacing.lg,
    paddingHorizontal: ZaraTheme.spacing.xl,
    borderRadius: 8,
    minWidth: 120,
  },
  nextButtonText: {
    ...ZaraTheme.typography.button,
    color: ZaraTheme.colors.white,
    fontSize: 16,
    marginRight: ZaraTheme.spacing.xs,
  },
});