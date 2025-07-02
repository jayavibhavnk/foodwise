import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react-native';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { zaraStyles, ZaraTheme } from '@/styles/zaraTheme';
import { MinimalCard } from '@/components/MinimalCard';
import { foodLogService, DailyLog } from '@/services/foodLogService';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

// Custom Chart Component
const CustomChart = ({ data }: { data: { labels: string[], values: number[] } }) => {
  const maxValue = Math.max(...data.values, 1);
  const chartWidth = width - 80;
  const chartHeight = 200;
  const padding = 40;
  const innerWidth = chartWidth - (padding * 2);
  const innerHeight = chartHeight - (padding * 2);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartWrapper}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>{Math.round(maxValue)}</Text>
          <Text style={styles.axisLabel}>{Math.round(maxValue * 0.5)}</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>
        
        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          <View style={styles.gridLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>
          
          {/* Data bars */}
          <View style={styles.barsContainer}>
            {data.values.map((value, index) => {
              const barHeight = maxValue > 0 ? (value / maxValue) * innerHeight : 0;
              return (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { height: barHeight }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barLabel}>{data.labels[index]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
      
      {/* Chart title */}
      <View style={styles.chartTitleContainer}>
        <TrendingUp size={16} color={ZaraTheme.colors.mediumGray} strokeWidth={1.5} />
        <Text style={styles.chartTitle}>Daily Calorie Intake</Text>
      </View>
    </View>
  );
};

export default function CalendarScreen() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [weeklyLogs, setWeeklyLogs] = useState<DailyLog[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

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
    const values = weeklyLogs.map(log => log.totalCalories);
    const labels = weeklyLogs.map(log => format(new Date(log.date), 'EEE'));
    
    return {
      labels,
      values: values.length > 0 ? values : [0, 0, 0, 0, 0, 0, 0]
    };
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
          {/* Week Navigation */}
          <View style={styles.weekNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateWeek('prev')}
            >
              <ChevronLeft size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            </TouchableOpacity>
            
            <Text style={styles.weekTitle}>
              {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
            </Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateWeek('next')}
            >
              <ChevronRight size={24} color={ZaraTheme.colors.black} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {/* Weekly Chart */}
          <MinimalCard>
            <Text style={styles.sectionTitle}>WEEKLY OVERVIEW</Text>
            {weeklyLogs.length > 0 ? (
              <CustomChart data={getChartData()} />
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
  navButton: {
    padding: ZaraTheme.spacing.sm,
    borderRadius: 8,
    backgroundColor: ZaraTheme.colors.lightGray,
  },
  weekTitle: {
    ...ZaraTheme.typography.h3,
    textAlign: 'center',
  },
  sectionTitle: {
    ...ZaraTheme.typography.caption,
    marginBottom: ZaraTheme.spacing.md,
    color: ZaraTheme.colors.black,
  },
  
  // Custom Chart Styles
  chartContainer: {
    marginVertical: ZaraTheme.spacing.sm,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 200,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingVertical: 20,
  },
  axisLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: ZaraTheme.colors.lightGray,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingTop: 20,
    paddingBottom: 40,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '60%',
  },
  bar: {
    backgroundColor: ZaraTheme.colors.black,
    borderRadius: 2,
    minHeight: 2,
  },
  barLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ZaraTheme.spacing.sm,
  },
  chartTitle: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    marginLeft: ZaraTheme.spacing.xs,
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
    borderRadius: 12,
    backgroundColor: ZaraTheme.colors.lightGray,
    padding: 4,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: ZaraTheme.spacing.md,
    marginHorizontal: 2,
    borderRadius: 8,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  dayButtonSelected: {
    backgroundColor: ZaraTheme.colors.black,
  },
  dayButtonToday: {
    backgroundColor: ZaraTheme.colors.white,
  },
  dayButtonText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    fontSize: 11,
  },
  dayButtonTextSelected: {
    color: ZaraTheme.colors.white,
  },
  dayButtonTextToday: {
    color: ZaraTheme.colors.black,
    fontWeight: '600',
  },
  dayButtonDate: {
    ...ZaraTheme.typography.body,
    marginTop: ZaraTheme.spacing.xs,
    fontWeight: '500',
  },
  dayButtonDateSelected: {
    color: ZaraTheme.colors.white,
  },
  dayButtonDateToday: {
    color: ZaraTheme.colors.black,
    fontWeight: '700',
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
    paddingVertical: ZaraTheme.spacing.md,
    backgroundColor: ZaraTheme.colors.lightGray,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
    fontWeight: '700',
  },
  statLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    fontSize: 10,
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
    height: 6,
    backgroundColor: ZaraTheme.colors.lightGray,
    borderRadius: 3,
    marginBottom: ZaraTheme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ZaraTheme.colors.black,
    borderRadius: 3,
  },
  progressText: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    fontSize: 11,
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
    fontWeight: '500',
  },
  entryDetails: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    fontSize: 11,
  },
  entryCalories: {
    ...ZaraTheme.typography.body,
    color: ZaraTheme.colors.black,
    fontWeight: '600',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: ZaraTheme.spacing.md,
    backgroundColor: ZaraTheme.colors.lightGray,
    borderRadius: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...ZaraTheme.typography.h3,
    marginBottom: ZaraTheme.spacing.xs,
    fontWeight: '700',
  },
  summaryLabel: {
    ...ZaraTheme.typography.caption,
    color: ZaraTheme.colors.mediumGray,
    textAlign: 'center',
    fontSize: 10,
  },
});