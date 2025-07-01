import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { MinimalCard } from '@/components/MinimalCard';
import { foodLogService, DailyLog } from '@/services/foodLogService';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [weeklyLogs, setWeeklyLogs] = useState<DailyLog[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    loadWeeklyData();
  }, [currentWeek]);

  const loadWeeklyData = async () => {
    setLoading(true);
    try {
      const logs = await foodLogService.getWeeklyLogs(currentWeek);
      setWeeklyLogs(logs);
      
      // Select today if it's in the current week, otherwise select the first day
      const today = new Date();
      const todayLog = logs.find(log => isSameDay(new Date(log.date), today));
      setSelectedDay(todayLog || logs[0]);

      // Create marked dates for calendar
      const marked = {};
      logs.forEach(log => {
        if (log.totalCalories > 0) {
          const progress = Math.min(1, log.totalCalories / (user?.dailyCalorieGoal || 2000));
          let color = ZaraTheme.colors.lightGray;
          
          if (progress >= 0.8) {
            color = ZaraTheme.colors.black;
          } else if (progress >= 0.5) {
            color = ZaraTheme.colors.darkGray;
          } else if (progress > 0) {
            color = ZaraTheme.colors.mediumGray;
          }

          marked[log.date] = {
            marked: true,
            dotColor: color,
            selectedColor: color,
          };
        }
      });
      setMarkedDates(marked);
    } catch (error) {
      console.error('Failed to load weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => 
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const getChartData = () => {
    const calories = weeklyLogs.map(log => log.totalCalories);
    const labels = weeklyLogs.map(log => format(new Date(log.date), 'EEE'));
    
    return {
      labels,
      datasets: [{
        data: calories.length > 0 ? calories : [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
      }]
    };
  };

  const chartConfig = {
    backgroundColor: ZaraTheme.colors.white,
    backgroundGradientFrom: ZaraTheme.colors.white,
    backgroundGradientTo: ZaraTheme.colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 0,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: ZaraTheme.colors.black
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <SafeAreaView style={zaraStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
          </TouchableOpacity>
          
          <Text style={zaraStyles.title}>NUTRITION CALENDAR</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Calendar View */}
          <MinimalCard>
            <Text style={styles.sectionTitle}>MONTHLY OVERVIEW</Text>
            <Calendar
              current={new Date().toISOString().split('T')[0]}
              onDayPress={(day) => {
                const dayLog = weeklyLogs.find(log => log.date === day.dateString);
                if (dayLog) {
                  setSelectedDay(dayLog);
                }
              }}
              markedDates={markedDates}
              theme={{
                backgroundColor: ZaraTheme.colors.white,
                calendarBackground: ZaraTheme.colors.white,
                textSectionTitleColor: ZaraTheme.colors.black,
                selectedDayBackgroundColor: ZaraTheme.colors.black,
                selectedDayTextColor: ZaraTheme.colors.white,
                todayTextColor: ZaraTheme.colors.black,
                dayTextColor: ZaraTheme.colors.black,
                textDisabledColor: ZaraTheme.colors.lightGray,
                dotColor: ZaraTheme.colors.black,
                selectedDotColor: ZaraTheme.colors.white,
                arrowColor: ZaraTheme.colors.black,
                monthTextColor: ZaraTheme.colors.black,
                indicatorColor: ZaraTheme.colors.black,
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '300',
                textMonthFontWeight: '300',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
          </MinimalCard>

          {/* Week Navigation */}
          <View style={styles.weekNavigation}>
            <TouchableOpacity onPress={() => navigateWeek('prev')}>
              <ChevronLeft size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            </TouchableOpacity>
            
            <Text style={styles.weekTitle}>
              {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
            </Text>
            
            <TouchableOpacity onPress={() => navigateWeek('next')}>
              <ChevronRight size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Weekly Chart */}
          <MinimalCard>
            <Text style={styles.sectionTitle}>WEEKLY CALORIE INTAKE</Text>
            {weeklyLogs.length > 0 ? (
              <LineChart
                data={getChartData()}
                width={width - 80}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
                withDots={true}
                withShadow={false}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data available for this week</Text>
              </View>
            )}
          </MinimalCard>

          {/* Day Selector */}
          <View style={styles.daySelector}>
            {weekDays.map((day, index) => {
              const dayLog = weeklyLogs[index];
              const isSelected = selectedDay?.date === dayLog?.date;
              const isToday = isSameDay(day, new Date());
              
              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[
                    styles.dayButton,
                    isSelected && styles.dayButtonSelected,
                    isToday && styles.dayButtonToday,
                  ]}
                  onPress={() => setSelectedDay(dayLog)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    isSelected && styles.dayButtonTextSelected,
                    isToday && styles.dayButtonTextToday,
                  ]}>
                    {format(day, 'EEE')}
                  </Text>
                  <Text style={[
                    styles.dayButtonDate,
                    isSelected && styles.dayButtonDateSelected,
                    isToday && styles.dayButtonDateToday,
                  ]}>
                    {format(day, 'd')}
                  </Text>
                  {dayLog && dayLog.totalCalories > 0 && (
                    <View style={[
                      styles.dayIndicator,
                      isSelected && styles.dayIndicatorSelected,
                    ]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Day Details */}
          {selectedDay && (
            <MinimalCard>
              <Text style={styles.sectionTitle}>
                {format(new Date(selectedDay.date), 'EEEE, MMMM d')}
              </Text>
              
              <View style={styles.dailyStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedDay.totalCalories}</Text>
                  <Text style={styles.statLabel}>CALORIES</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedDay.totalProtein}g</Text>
                  <Text style={styles.statLabel}>PROTEIN</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedDay.totalCarbs}g</Text>
                  <Text style={styles.statLabel}>CARBS</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedDay.totalFat}g</Text>
                  <Text style={styles.statLabel}>FAT</Text>
                </View>
              </View>

              {/* Progress vs Goals */}
              {user && (
                <View style={styles.progressSection}>
                  <Text style={styles.progressTitle}>PROGRESS VS GOALS</Text>
                  
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Calories</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${Math.min((selectedDay.totalCalories / user.dailyCalorieGoal) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {selectedDay.totalCalories} / {user.dailyCalorieGoal}
                    </Text>
                  </View>

                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Protein</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${Math.min((selectedDay.totalProtein / user.proteinGoal) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {selectedDay.totalProtein}g / {user.proteinGoal}g
                    </Text>
                  </View>

                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Carbs</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${Math.min((selectedDay.totalCarbs / user.carbsGoal) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {selectedDay.totalCarbs}g / {user.carbsGoal}g
                    </Text>
                  </View>

                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Fat</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${Math.min((selectedDay.totalFat / user.fatGoal) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {selectedDay.totalFat}g / {user.fatGoal}g
                    </Text>
                  </View>
                </View>
              )}

              {/* Food Entries */}
              {selectedDay.entries.length > 0 && (
                <View style={styles.entriesSection}>
                  <Text style={styles.entriesTitle}>FOOD ENTRIES</Text>
                  {selectedDay.entries.map((entry, index) => (
                    <View key={entry.id} style={styles.entryItem}>
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryName}>{entry.name}</Text>
                        <Text style={styles.entryDetails}>
                          {entry.quantity} • {entry.mealType}
                        </Text>
                      </View>
                      <Text style={styles.entryCalories}>{entry.calories} cal</Text>
                    </View>
                  ))}
                </View>
              )}
            </MinimalCard>
          )}

          {/* Weekly Summary */}
          <MinimalCard>
            <Text style={styles.sectionTitle}>WEEKLY SUMMARY</Text>
            
            <View style={styles.summaryStats}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {Math.round(weeklyLogs.reduce((sum, log) => sum + log.totalCalories, 0) / 7)}
                </Text>
                <Text style={styles.summaryLabel}>AVG CALORIES/DAY</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {weeklyLogs.filter(log => log.totalCalories > 0).length}
                </Text>
                <Text style={styles.summaryLabel}>DAYS LOGGED</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {weeklyLogs.reduce((sum, log) => sum + log.entries.length, 0)}
                </Text>
                <Text style={styles.summaryLabel}>TOTAL ENTRIES</Text>
              </View>
            </View>
          </MinimalCard>
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ZaraTheme.spacing.md,
    paddingTop: ZaraTheme.spacing.lg,
    paddingBottom: ZaraTheme.spacing.md,
  },
  backButton: {
    padding: ZaraTheme.spacing.sm,
    marginRight: ZaraTheme.spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: ZaraTheme.spacing.md,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ZaraTheme.spacing.lg,
    paddingHorizontal: ZaraTheme.spacing.md,
  },
  weekTitle: {
    ...ZaraTheme.typography.h3,
  },
  sectionTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  chart: {
    marginVertical: ZaraTheme.spacing.sm,
    borderRadius: 0,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    ...ZaraTheme.typography.bodySmall,
    color: ZaraTheme.colors.mediumGray,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ZaraTheme.spacing.lg,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: ZaraTheme.spacing.md,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: ZaraTheme.colors.lightGray,
    position: 'relative',
  },
  dayButtonSelected: {
    borderColor: ZaraTheme.colors.black,
    backgroundColor: ZaraTheme.colors.black,
  },
  dayButtonToday: {
    borderColor: ZaraTheme.colors.darkGray,
  },
  dayButtonText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  dayButtonTextSelected: {
    color: ZaraTheme.colors.white,
  },
  dayButtonTextToday: {
    color: ZaraTheme.colors.black,
  },
  dayButtonDate: {
    ...ZaraTheme.typography.body,
    marginTop: ZaraTheme.spacing.xs,
  },
  dayButtonDateSelected: {
    color: ZaraTheme.colors.white,
  },
  dayButtonDateToday: {
    color: ZaraTheme.colors.black,
    fontWeight: '600',
  },
  dayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ZaraTheme.colors.black,
  },
  dayIndicatorSelected: {
    backgroundColor: ZaraTheme.colors.white,
  },
  dailyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: ZaraTheme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
  },
  statLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  progressSection: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  progressTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  progressItem: {
    marginBottom: ZaraTheme.spacing.md,
  },
  progressLabel: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.xs,
    color: ZaraTheme.colors.mediumGray,
  },
  progressBar: {
    height: 4,
    backgroundColor: ZaraTheme.colors.lightGray,
    marginBottom: ZaraTheme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ZaraTheme.colors.black,
  },
  progressText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  entriesSection: {
    marginBottom: ZaraTheme.spacing.lg,
  },
  entriesTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ZaraTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ZaraTheme.colors.lightGray,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    ...ZaraTheme.typography.body,
    marginBottom: ZaraTheme.spacing.xs,
  },
  entryDetails: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
  },
  entryCalories: {
    ...ZaraTheme.typography.body,
    color: ZaraTheme.colors.black,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
  },
  summaryLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    textAlign: 'center',
  },
});