import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { useAuth } from '@/hooks/useAuth';

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { key: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
  { key: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
  { key: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { key: 'very_active', label: 'Very Active', description: 'Very hard exercise, physical job' },
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
  'Low-Carb', 'Keto', 'Paleo', 'Halal', 'Kosher'
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

      const tdee = Math.round(bmr * multipliers[activityLevel as keyof typeof multipliers]);
      setDailyCalorieGoal(tdee.toString());

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

  const handleNext = () => {
    if (step === 1) {
      if (!age || !gender || !height || !weight) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      calculateGoals();
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!dailyCalorieGoal || !proteinGoal || !carbsGoal || !fatGoal) {
      Alert.alert('Error', 'Please set your nutrition goals');
      return;
    }

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

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>
        Help us personalize your nutrition goals
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>AGE</Text>
        <TextInput
          style={zaraStyles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter your age"
          placeholderTextColor={ZaraTheme.colors.mediumGray}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>GENDER</Text>
        <View style={styles.genderOptions}>
          {['male', 'female', 'other'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.genderOption,
                gender === option && styles.genderOptionSelected
              ]}
              onPress={() => setGender(option as any)}
            >
              <Text style={[
                styles.genderOptionText,
                gender === option && styles.genderOptionTextSelected
              ]}>
                {option.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>HEIGHT (CM)</Text>
        <TextInput
          style={zaraStyles.input}
          value={height}
          onChangeText={setHeight}
          placeholder="Enter your height in cm"
          placeholderTextColor={ZaraTheme.colors.mediumGray}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>WEIGHT (KG)</Text>
        <TextInput
          style={zaraStyles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter your weight in kg"
          placeholderTextColor={ZaraTheme.colors.mediumGray}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Activity Level</Text>
      <Text style={styles.stepDescription}>
        Select your typical activity level
      </Text>

      {ACTIVITY_LEVELS.map((level) => (
        <TouchableOpacity
          key={level.key}
          style={[
            styles.activityOption,
            activityLevel === level.key && styles.activityOptionSelected
          ]}
          onPress={() => setActivityLevel(level.key)}
        >
          <Text style={[
            styles.activityOptionTitle,
            activityLevel === level.key && styles.activityOptionTitleSelected
          ]}>
            {level.label}
          </Text>
          <Text style={[
            styles.activityOptionDescription,
            activityLevel === level.key && styles.activityOptionDescriptionSelected
          ]}>
            {level.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Nutrition Goals</Text>
      <Text style={styles.stepDescription}>
        Review and adjust your daily nutrition targets
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>DAILY CALORIES</Text>
        <TextInput
          style={zaraStyles.input}
          value={dailyCalorieGoal}
          onChangeText={setDailyCalorieGoal}
          placeholder="Daily calorie goal"
          placeholderTextColor={ZaraTheme.colors.mediumGray}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.macroRow}>
        <View style={styles.macroInput}>
          <Text style={styles.label}>PROTEIN (G)</Text>
          <TextInput
            style={zaraStyles.input}
            value={proteinGoal}
            onChangeText={setProteinGoal}
            placeholder="Protein"
            placeholderTextColor={ZaraTheme.colors.mediumGray}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.macroInput}>
          <Text style={styles.label}>CARBS (G)</Text>
          <TextInput
            style={zaraStyles.input}
            value={carbsGoal}
            onChangeText={setCarbsGoal}
            placeholder="Carbs"
            placeholderTextColor={ZaraTheme.colors.mediumGray}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.macroInput}>
          <Text style={styles.label}>FAT (G)</Text>
          <TextInput
            style={zaraStyles.input}
            value={fatGoal}
            onChangeText={setFatGoal}
            placeholder="Fat"
            placeholderTextColor={ZaraTheme.colors.mediumGray}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>DIETARY RESTRICTIONS</Text>
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
                styles.restrictionChipText,
                dietaryRestrictions.includes(restriction) && styles.restrictionChipTextSelected
              ]}>
                {restriction}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <View style={zaraStyles.container}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
          <Text style={styles.stepIndicator}>Step {step} of 3</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.actions}>
          {step > 1 && (
            <TouchableOpacity 
              style={[zaraStyles.buttonOutline, { marginRight: ZaraTheme.spacing.md }]}
              onPress={() => setStep(step - 1)}
            >
              <Text style={zaraStyles.buttonTextOutline}>BACK</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[zaraStyles.button, { flex: 1 }]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={ZaraTheme.colors.white} />
            ) : (
              <Text style={zaraStyles.buttonText}>
                {step === 3 ? 'COMPLETE' : 'NEXT'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: ZaraTheme.spacing.lg,
  },
  progressBar: {
    height: 2,
    backgroundColor: ZaraTheme.colors.lightGray,
    marginBottom: ZaraTheme.spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ZaraTheme.colors.black,
  },
  stepIndicator: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    paddingBottom: ZaraTheme.spacing.xl,
  },
  stepTitle: {
    ...ZaraTheme.typography.h2,
    marginBottom: ZaraTheme.spacing.sm,
  },
  stepDescription: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
    marginBottom: ZaraTheme.spacing.xl,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  label: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.sm,
    color: ZaraTheme.colors.black,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    paddingVertical: ZaraTheme.spacing.md,
    alignItems: 'center',
    marginHorizontal: ZaraTheme.spacing.xs,
  },
  genderOptionSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  genderOptionText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
  },
  genderOptionTextSelected: {
    color: ZaraTheme.colors.white,
  },
  activityOption: {
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    padding: ZaraTheme.spacing.lg,
    marginBottom: ZaraTheme.spacing.md,
  },
  activityOptionSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  activityOptionTitle: {
    ...ZaraTheme.typography.body,
    marginBottom: ZaraTheme.spacing.xs,
  },
  activityOptionTitleSelected: {
    color: ZaraTheme.colors.white,
  },
  activityOptionDescription: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
  },
  activityOptionDescriptionSelected: {
    color: ZaraTheme.colors.lightGray,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ZaraTheme.spacing.lg,
  },
  macroInput: {
    flex: 1,
    marginHorizontal: ZaraTheme.spacing.xs,
  },
  restrictionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: ZaraTheme.spacing.sm,
  },
  restrictionChip: {
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingVertical: ZaraTheme.spacing.sm,
    marginRight: ZaraTheme.spacing.sm,
    marginBottom: ZaraTheme.spacing.sm,
  },
  restrictionChipSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  restrictionChipText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.black,
  },
  restrictionChipTextSelected: {
    color: ZaraTheme.colors.white,
  },
  actions: {
    flexDirection: 'row',
    paddingTop: ZaraTheme.spacing.lg,
  },
});