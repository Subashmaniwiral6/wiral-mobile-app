import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { StatusBar, View, ScrollView, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';

import { tailwind } from '@/theme';
import { TAB_BAR_HEIGHT } from '@/constants';
import { CalendarHeader } from './components/calendar-header';
// import { CreateEventModal } from './components/create-event-modal';
import { EventDetailsModal } from './components/event-details-modal/EventDetailsModal';
import { CalendarService } from '@/store/calendar/calendarService';
import { transformAppointmentToCalendarEvent } from '@/store/calendar/calendarUtils';
import type { CalendarEvent } from '@/types/Calendar';

// Configure locale
LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'en';

interface CalendarScreenProps {}

type CalendarViewType = 'month' | 'week' | 'day';

interface CalendarTab {
  id: CalendarViewType;
  label: string;
}

const CALENDAR_TABS: CalendarTab[] = [
  // { id: 'month', label: 'Month' },
  // { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
];

type AgendaEventsByDate = Record<string, CalendarEvent[]>;
type MarkedDates = Record<
  string,
  { dots?: { color: string }[]; selected?: boolean; selectedColor?: string }
>;

interface CalendarViewProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  viewType: CalendarViewType;
  events: AgendaEventsByDate;
  markedDates: MarkedDates;
  isAgendaMode: boolean;
  onEventPress?: (event: CalendarEvent) => void;
  calendarListRef?: React.RefObject<CalendarList>;
}

// Memoized event item component for Agenda view
const AgendaEventItem = React.memo<{
  event: CalendarEvent;
  onPress?: (event: CalendarEvent) => void;
}>(
  ({ event, onPress }) => {
    const timeString = useMemo(() => {
      const startTime = event.startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      const endTime = event.endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      return `${startTime} - ${endTime}`;
    }, [event.startTime, event.endTime]);

    const itemStyle = useMemo(
      () => [
        tailwind.style('p-3 mb-2 mx-4 rounded-xl'),
        { backgroundColor: event.color + '20', borderLeftWidth: 4, borderLeftColor: event.color },
      ],
      [event.color],
    );

    return (
      <Pressable onPress={() => onPress?.(event)} style={itemStyle}>
        <Text style={[tailwind.style('text-base font-inter-medium-24 mb-1'), { color: '#E8E9EB' }]}>
          {event.title}
        </Text>
        <Text style={[tailwind.style('text-sm font-inter-normal-20 mb-1'), { color: '#9CA3AF' }]}>
          {timeString}
        </Text>
        {event.contact_person_name && (
          <Text style={[tailwind.style('text-xs font-inter-normal-20 mb-1'), { color: '#9CA3AF' }]}>
            {event.contact_person_name}
          </Text>
        )}
        {event.contact_person_phone_number && (
          <Text style={[tailwind.style('text-xs font-inter-normal-20'), { color: '#9CA3AF' }]}>
            {event.contact_person_phone_number}
          </Text>
        )}
      </Pressable>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if event properties or onPress change
    return (
      prevProps.event.id === nextProps.event.id &&
      prevProps.event.title === nextProps.event.title &&
      prevProps.event.color === nextProps.event.color &&
      prevProps.event.startTime.getTime() === nextProps.event.startTime.getTime() &&
      prevProps.event.endTime.getTime() === nextProps.event.endTime.getTime() &&
      prevProps.event.contact_person_name === nextProps.event.contact_person_name &&
      prevProps.event.contact_person_phone_number === nextProps.event.contact_person_phone_number &&
      prevProps.onPress === nextProps.onPress
    );
  },
);

AgendaEventItem.displayName = 'AgendaEventItem';

// Memoized empty date component
const AgendaEmptyDate = React.memo(() => {
  return (
    <View style={tailwind.style('flex-1 p-4')}>
      <Text style={[tailwind.style('text-center'), { color: '#9CA3AF' }]}>No events</Text>
    </View>
  );
});

AgendaEmptyDate.displayName = 'AgendaEmptyDate';

const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onDateChange,
  viewType,
  events,
  markedDates,
  isAgendaMode,
  onEventPress,
  calendarListRef,
}) => {
  // Use state for agenda items - Agenda component expects state updates
  // Must be at top level (not in conditional)
  const [agendaItemsState, setAgendaItemsState] = useState<
    Record<
      string,
      { id: number; name: string; height: number; day: string; event: CalendarEvent }[]
    >
  >({});

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateString = selectedDate ? formatDateString(selectedDate) : '';
  const currentDateString = formatDateString(new Date());

  // Format events for Agenda component - memoized to prevent recreation
  // Sort events by time (startTime) for each date
  const formattedAgendaItems = useMemo(() => {
    const items: Record<
      string,
      { id: number; name: string; height: number; day: string; event: CalendarEvent }[]
    > = {};
    Object.keys(events).forEach(dateString => {
      if (events[dateString] && events[dateString].length > 0) {
        const sortedEvents = [...events[dateString]].sort((a, b) => {
          return a.startTime.getTime() - b.startTime.getTime();
        });

        items[dateString] = sortedEvents.map(event => ({
          id: Number(event.id),
          name: event.title,
          height: 50,
          day: dateString,
          event: event,
        }));
      }
    });
    return items;
  }, [events]);

  // Memoized callbacks and theme for Agenda/Calendar usage (defined before returns)
  const handleLoadItemsForMonth = useCallback(
    (month: { dateString: string }) => {
      setAgendaItemsState(prevItems => {
        const monthKey = month.dateString.substring(0, 7); // YYYY-MM
        const hasItemsForMonth = Object.keys(prevItems).some(
          dateKey => dateKey.substring(0, 7) === monthKey,
        );

        if (hasItemsForMonth) {
          return prevItems;
        }

        return { ...prevItems, ...formattedAgendaItems };
      });
    },
    [formattedAgendaItems],
  );

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      onDateChange(new Date(day.dateString));
    },
    [onDateChange],
  );

  const renderItem = useCallback(
    (item: { event?: CalendarEvent }) => {
      const event = item.event;

      if (!event) return null;

      return <AgendaEventItem event={event} onPress={onEventPress} />;
    },
    [onEventPress],
  );

  const renderEmptyDate = useCallback(() => {
    return <AgendaEmptyDate />;
  }, []);

  const rowHasChanged = useCallback(
    (r1: { id?: string | number }, r2: { id?: string | number }) => r1.id !== r2.id,
    [],
  );

  const agendaTheme = useMemo(
    () => ({
      backgroundColor: '#121213',
      calendarBackground: '#121213',
      textSectionTitleColor: '#E8E9EB',
      selectedDayBackgroundColor: 'transparent',
      selectedDayTextColor: '#FFFFFF',
      todayTextColor: '#873CF6',
      dayTextColor: '#E8E9EB',
      textDisabledColor: '#6B7280',
      dotColor: '#873CF6',
      selectedDotColor: '#873CF6',
      arrowColor: '#E8E9EB',
      monthTextColor: '#E8E9EB',
      textDayFontFamily: 'Inter-400-20',
      textMonthFontFamily: 'Inter-500-24',
      textDayHeaderFontFamily: 'Inter-420-20',
      textDayFontSize: 15,
      textMonthFontSize: 17,
      textDayHeaderFontSize: 13,
      agendaDayTextColor: '#E8E9EB',
      agendaDayNumColor: '#E8E9EB',
      agendaTodayColor: '#873CF6',
      agendaKnobColor: '#6B7280',
    }),
    [],
  );

  const agendaSelectedDate = selectedDateString || currentDateString;

  // Update agenda items state when events change (only if in agenda mode)
  useEffect(() => {
    if (isAgendaMode && viewType === 'month') {
      console.log(
        '[Agenda] Updating items state:',
        Object.keys(formattedAgendaItems).length,
        'dates',
      );
      setAgendaItemsState(formattedAgendaItems);
    }
  }, [formattedAgendaItems, isAgendaMode, viewType]);

  if (viewType === 'day') {
    const dayEvents = events[selectedDateString] || [];
    return (
      <View style={[tailwind.style('flex-1'), { backgroundColor: '#121213' }]}>
        <Calendar
          current={selectedDateString}
          onDayPress={(day: { dateString: string }) => {
            onDateChange(new Date(day.dateString));
          }}
          markedDates={{
            ...markedDates,
            [selectedDateString]: {
              ...markedDates[selectedDateString],
              selected: true,
              selectedColor: '#873CF6',
            },
          }}
          theme={{
            backgroundColor: '#121213',
            calendarBackground: '#121213',
            textSectionTitleColor: '#E8E9EB',
            selectedDayBackgroundColor: 'transparent',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#873CF6',
            dayTextColor: '#E8E9EB',
            textDisabledColor: '#6B7280',
            dotColor: '#873CF6',
            selectedDotColor: '#873CF6',
            arrowColor: '#E8E9EB',
            monthTextColor: '#E8E9EB',
            textDayFontFamily: 'Inter-400-20',
            textMonthFontFamily: 'Inter-500-24',
            textDayHeaderFontFamily: 'Inter-420-20',
            textDayFontSize: 15,
            textMonthFontSize: 17,
            textDayHeaderFontSize: 13,
          }}
        />
        <ScrollView
          style={tailwind.style('flex-1 px-4')}
          contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}px] pt-4`)}>
          {dayEvents.length === 0 ? (
            <Text style={[tailwind.style('text-center mt-4'), { color: '#9CA3AF' }]}>
              No events for this day
            </Text>
          ) : (
            dayEvents.map(event => (
              <Pressable
                key={event.id}
                onPress={() => onEventPress?.(event)}
                style={[
                  tailwind.style('p-3 mb-3 rounded-xl'),
                  {
                    backgroundColor: event.color + '20',
                    borderLeftWidth: 4,
                    borderLeftColor: event.color,
                  },
                ]}>
                <Text
                  style={[
                    tailwind.style('text-base font-inter-medium-24 mb-1'),
                    { color: '#E8E9EB' },
                  ]}>
                  {event.title}
                </Text>
                <Text
                  style={[
                    tailwind.style('text-sm font-inter-normal-20 mb-1'),
                    { color: '#9CA3AF' },
                  ]}>
                  {event.startTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {event.endTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
                {/* {event.contact_person_name && (
                  <Text style={tailwind.style('text-xs font-inter-normal-20 text-gray-500 mb-1')}>
                    {event.contact_person_name}
                  </Text>
                )} */}
                {event.contact_person_phone_number && (
                  <Text
                    style={[tailwind.style('text-xs font-inter-normal-20'), { color: '#9CA3AF' }]}>
                    {event.contact_person_phone_number}
                  </Text>
                )}
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // if (viewType === 'week') {
  //   return (
  //     <View style={tailwind.style('flex-1')}>
  //       <Calendar
  //         current={selectedDateString}
  //         onDayPress={(day: { dateString: string }) => {
  //           onDateChange(new Date(day.dateString));
  //         }}
  //         markedDates={markedDates}
  //         hideExtraDays
  //         theme={{
  //           backgroundColor: '#ffffff',
  //           calendarBackground: '#ffffff',
  //           textSectionTitleColor: '#171717',
  //           selectedDayBackgroundColor: tailwind.color('bg-blue-500'),
  //           selectedDayTextColor: '#ffffff',
  //           todayTextColor: tailwind.color('text-blue-500'),
  //           dayTextColor: '#171717',
  //           textDisabledColor: '#d9d9d9',
  //           dotColor: tailwind.color('bg-blue-500'),
  //           selectedDotColor: '#ffffff',
  //           arrowColor: '#171717',
  //           monthTextColor: '#171717',
  //           textDayFontFamily: 'Inter-400-20',
  //           textMonthFontFamily: 'Inter-500-24',
  //           textDayHeaderFontFamily: 'Inter-420-20',
  //           textDayFontSize: 15,
  //           textMonthFontSize: 17,
  //           textDayHeaderFontSize: 13,
  //         }}
  //       />
  //       <ScrollView
  //         style={tailwind.style('flex-1 px-4')}
  //         contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT}px] pt-4`)}>
  //         {Object.entries(events).map(([dateString, dayEvents]) => (
  //           <View key={dateString} style={tailwind.style('mb-4')}>
  //             <Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-700 mb-2')}>
  //               {new Date(dateString).toLocaleDateString('en-US', {
  //                 weekday: 'long',
  //                 month: 'short',
  //                 day: 'numeric',
  //               })}
  //             </Text>
  //             {dayEvents.map(event => (
  //               <View
  //                 key={event.id}
  //                 style={[
  //                   tailwind.style('p-3 mb-2 rounded-xl'),
  //                   { backgroundColor: event.color + '20', borderLeftWidth: 4, borderLeftColor: event.color },
  //                 ]}>
  //                 <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-1')}>
  //                   {event.title}
  //                 </Text>
  //                 <Text style={tailwind.style('text-sm font-inter-normal-20 text-gray-600')}>
  //                   {event.startTime.toLocaleTimeString('en-US', {
  //                     hour: 'numeric',
  //                     minute: '2-digit',
  //                   })}{' '}
  //                   -{' '}
  //                   {event.endTime.toLocaleTimeString('en-US', {
  //                     hour: 'numeric',
  //                     minute: '2-digit',
  //                   })}
  //                 </Text>
  //               </View>
  //             ))}
  //           </View>
  //         ))}
  //       </ScrollView>
  //     </View>
  //   );
  // }

  // Month view (scrollable calendar - default)
  return (
    <View style={[tailwind.style('flex-1'), { backgroundColor: '#121213' }]}>
      <CalendarList
        ref={calendarListRef}
        current={selectedDateString}
        onDayPress={(day: { dateString: string }) => {
          onDateChange(new Date(day.dateString));
        }}
        markedDates={markedDates}
        pastScrollRange={6}
        futureScrollRange={6}
        scrollEnabled
        showScrollIndicator
        theme={{
          backgroundColor: '#121213',
          calendarBackground: '#121213',
          textSectionTitleColor: '#E8E9EB',
          selectedDayBackgroundColor: 'transparent',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#873CF6',
          dayTextColor: '#E8E9EB',
          textDisabledColor: '#6B7280',
          dotColor: '#873CF6',
          selectedDotColor: '#873CF6',
          arrowColor: '#E8E9EB',
          monthTextColor: '#E8E9EB',
          textDayFontFamily: 'Inter-400-20',
          textMonthFontFamily: 'Inter-500-24',
          textDayHeaderFontFamily: 'Inter-420-20',
          textDayFontSize: 15,
          textMonthFontSize: 17,
          textDayHeaderFontSize: 13,
        }}
      />
      {isAgendaMode && viewType === 'month' ? (
        <Agenda
          items={agendaItemsState}
          loadItemsForMonth={handleLoadItemsForMonth}
          selected={agendaSelectedDate}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          pastScrollRange={6}
          futureScrollRange={6}
          renderItem={renderItem}
          renderEmptyDate={renderEmptyDate}
          rowHasChanged={rowHasChanged}
          theme={agendaTheme}
          showClosingKnob={true}
          hideKnob={false}
        />
      ) : null}
    </View>
  );
};

const CalendarScreen: React.FC<CalendarScreenProps> = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pagerViewRef = useRef<PagerView>(null);
  const calendarListRef = useRef<CalendarList>(null);

  // Always use agenda mode
  const isAgendaMode = true;

  // Fetch appointments from API
  const fetchAppointments = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);

      // Format dates as ISO strings for API
      const startAt = startDate.toISOString();
      const endAt = endDate.toISOString();

      const response = await CalendarService.getAppointments({
        start_at: startAt,
        end_at: endAt,
      });

      // Transform API response to CalendarEvent format
      const transformedEvents = response.payload.map(transformAppointmentToCalendarEvent);
      setEvents(transformedEvents);
    } catch (err: any) {
      console.error('[Calendar] Error fetching appointments:', err);
      setError(err?.message || 'Failed to load appointments');
      // Keep existing events on error, don't clear them
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate date range for fetching appointments
  // Fetch 3 months before and after the selected date
  const getDateRange = useCallback((centerDate: Date) => {
    const startDate = new Date(centerDate);
    startDate.setMonth(startDate.getMonth() - 3);
    startDate.setDate(1); // Start of month
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(centerDate);
    endDate.setMonth(endDate.getMonth() + 4); // Go to 4 months ahead
    endDate.setDate(0); // Last day of previous month (which is 3 months ahead)
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }, []);

  // Fetch appointments on mount
  useEffect(() => {
    const currentDate = selectedDate || new Date();
    const { startDate, endDate } = getDateRange(currentDate);
    fetchAppointments(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch on mount, not on every date change

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    console.log('[Calendar DEBUG] Date changed:', date);
  }, []);

  const handlePageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
    const newIndex = e.nativeEvent.position;
    console.log('[Calendar DEBUG] Tab changed:', CALENDAR_TABS[newIndex].id);
  }, []);

  // Format events for react-native-calendars
  const formattedEvents = useMemo(() => {
    const eventsByDate: Record<string, CalendarEvent[]> = {};
    const markedDates: Record<string, any> = {};
    const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

    events.forEach(event => {
      const dateString = event.startTime.toISOString().split('T')[0];
      if (!eventsByDate[dateString]) {
        eventsByDate[dateString] = [];
      }
      eventsByDate[dateString].push(event);

      // Mark dates with events
      if (!markedDates[dateString]) {
        markedDates[dateString] = {
          marked: true,
          dots: [{ color: '#873CF6' }],
        };
      } else {
        // Add multiple dots for multiple events
        markedDates[dateString].dots = [
          ...(markedDates[dateString].dots || []),
          { color: '#873CF6' },
        ];
      }
    });

    // Mark selected date
    if (selectedDateString) {
      if (markedDates[selectedDateString]) {
        markedDates[selectedDateString] = {
          ...markedDates[selectedDateString],
          selected: true,
          selectedColor: '#6550B9',
        };
      } else {
        markedDates[selectedDateString] = {
          selected: true,
          selectedColor: '#6550B9',
        };
      }
    }

    return { eventsByDate, markedDates };
  }, [events, selectedDate]);

  // Show loading state on initial load
  if (loading && events.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121213' }}>
        <StatusBar translucent backgroundColor="#121213" barStyle="light-content" />
        {/* <CalendarHeader onAddEvent={handleAddEvent} /> */}
        <View style={tailwind.style('flex-1 items-center justify-center')}>
          <ActivityIndicator size="large" color="#873CF6" />
          <Text style={[tailwind.style('mt-4 text-md font-inter-normal-20'), { color: '#E8E9EB' }]}>
            Loading appointments...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if there's an error and no events
  if (error && events.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121213' }}>
        <StatusBar translucent backgroundColor="#121213" barStyle="light-content" />
        {/* <CalendarHeader onAddEvent={handleAddEvent} /> */}
        <View style={tailwind.style('flex-1 items-center justify-center px-4')}>
          <Text
            style={[tailwind.style('text-base font-inter-medium-24 mb-2'), { color: '#E8E9EB' }]}>
            Error loading appointments
          </Text>
          <Text
            style={tailwind.style('text-sm font-inter-normal-20 text-gray-600 mb-4 text-center')}>
            {error}
          </Text>
          <Pressable
            onPress={() => {
              const currentDate = selectedDate || new Date();
              const { startDate, endDate } = getDateRange(currentDate);
              fetchAppointments(startDate, endDate);
            }}
            style={tailwind.style('bg-blue-500 px-6 py-3 rounded-lg')}>
            <Text style={tailwind.style('text-white font-inter-medium-24')}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121213' }}>
      <StatusBar translucent backgroundColor="#121213" barStyle="light-content" />
      <CalendarHeader />
      {loading && events.length > 0 && (
        <View style={tailwind.style('absolute top-16 right-4 z-10')}>
          <ActivityIndicator size="small" color="#873CF6" />
        </View>
      )}
      <PagerView
        ref={pagerViewRef}
        style={tailwind.style('flex-1')}
        initialPage={0}
        onPageSelected={handlePageSelected}
        scrollEnabled>
        {CALENDAR_TABS.map(tab => (
          <View key={tab.id} style={tailwind.style('flex-1')}>
            <CalendarView
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              viewType={tab.id}
              events={formattedEvents.eventsByDate}
              markedDates={formattedEvents.markedDates}
              isAgendaMode={isAgendaMode}
              onEventPress={setSelectedEvent}
              calendarListRef={calendarListRef}
            />
          </View>
        ))}
      </PagerView>
      {/* {showCreateModal && (
          <CreateEventModal onClose={handleCloseModal} onSave={handleSaveEvent} />
        )} */}
      {selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </SafeAreaView>
  );
};

export default CalendarScreen;
