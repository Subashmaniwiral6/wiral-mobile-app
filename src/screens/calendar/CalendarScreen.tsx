import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { StatusBar, View, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView, { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';

import { tailwind } from '@/theme';
import { TAB_BAR_HEIGHT } from '@/constants';
import { CalendarHeader } from './components/calendar-header';
import { CreateEventModal } from './components/create-event-modal';
import { EventDetailsModal } from './components/event-details-modal/EventDetailsModal';

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
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: string;
  link?: string;
  contact_person_name?: string;
  contact_person_phone_number?: string;
  customAttributes?: Record<string, any>; // Dynamic key-value pairs from backend (excluding contact_person_name and contact_person_phone_number)
}

interface CalendarViewProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  viewType: CalendarViewType;
  events: Record<string, any[]>;
  markedDates: Record<string, any>;
  isAgendaMode: boolean;
  onEventPress?: (event: CalendarEvent) => void;
}

// Memoized event item component for Agenda view
const AgendaEventItem = React.memo<{ event: CalendarEvent; onPress?: (event: CalendarEvent) => void }>(
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
    }, [event.startTime.getTime(), event.endTime.getTime()]);

    const itemStyle = useMemo(
      () => [
        tailwind.style('p-3 mb-2 mx-4 rounded-xl'),
        { backgroundColor: event.color + '20', borderLeftWidth: 4, borderLeftColor: event.color },
      ],
      [event.color],
    );

    return (
      <Pressable
        onPress={() => onPress?.(event)}
        style={itemStyle}>
        <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-1')}>
          {event.title}
        </Text>
        <Text style={tailwind.style('text-sm font-inter-normal-20 text-gray-600 mb-1')}>
          {timeString}
        </Text>
        {event.contact_person_name && (
          <Text style={tailwind.style('text-xs font-inter-normal-20 text-gray-500 mb-1')}>
            {event.contact_person_name}
          </Text>
        )}
        {event.contact_person_phone_number && (
          <Text style={tailwind.style('text-xs font-inter-normal-20 text-gray-500')}>
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
      <Text style={tailwind.style('text-center text-gray-500')}>No events</Text>
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
}) => {
  // Use state for agenda items - Agenda component expects state updates
  // Must be at top level (not in conditional)
  const [agendaItemsState, setAgendaItemsState] = useState<Record<string, any[]>>({});

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateString = selectedDate ? formatDateString(selectedDate) : '';
  const currentDateString = formatDateString(new Date());

  // Format events for Agenda component - memoized to prevent recreation
  // Sort events by time (startTime) for each date
  const formattedAgendaItems = useMemo(() => {
    const items: Record<string, any[]> = {};
    Object.keys(events).forEach(dateString => {
      if (events[dateString] && events[dateString].length > 0) {
        // Sort events by startTime for this date
        const sortedEvents = [...events[dateString]].sort((a, b) => {
          return a.startTime.getTime() - b.startTime.getTime();
        });
        
        items[dateString] = sortedEvents.map(event => ({
          id: event.id,
          name: event.title,
          height: 50,
          day: dateString,
          event: event, // Store full event object for rendering
        }));
      }
    });
    return items;
  }, [events]);

  // Update agenda items state when events change (only if in agenda mode)
  useEffect(() => {
    if (isAgendaMode && viewType === 'month') {
      console.log('[Agenda] Updating items state:', Object.keys(formattedAgendaItems).length, 'dates');
      setAgendaItemsState(formattedAgendaItems);
    }
  }, [formattedAgendaItems, isAgendaMode, viewType]);

  if (viewType === 'day') {
    const dayEvents = events[selectedDateString] || [];
    return (
      <View style={tailwind.style('flex-1')}>
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
              selectedColor: tailwind.color('bg-blue-500'),
            },
          }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#171717',
            selectedDayBackgroundColor: tailwind.color('bg-blue-500'),
            selectedDayTextColor: '#ffffff',
            todayTextColor: tailwind.color('text-blue-500'),
            dayTextColor: '#171717',
            textDisabledColor: '#d9d9d9',
            dotColor: tailwind.color('bg-blue-500'),
            selectedDotColor: '#ffffff',
            arrowColor: '#171717',
            monthTextColor: '#171717',
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
            <Text style={tailwind.style('text-center text-gray-500 mt-4')}>No events for this day</Text>
          ) : (
            dayEvents.map(event => (
              <Pressable
                key={event.id}
                onPress={() => onEventPress?.(event)}
                style={[
                  tailwind.style('p-3 mb-3 rounded-xl'),
                  { backgroundColor: event.color + '20', borderLeftWidth: 4, borderLeftColor: event.color },
                ]}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950 mb-1')}>
                  {event.title}
                </Text>
                <Text style={tailwind.style('text-sm font-inter-normal-20 text-gray-600 mb-1')}>
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
                {event.contact_person_name && (
                  <Text style={tailwind.style('text-xs font-inter-normal-20 text-gray-500 mb-1')}>
                    {event.contact_person_name}
                  </Text>
                )}
                {event.contact_person_phone_number && (
                  <Text style={tailwind.style('text-xs font-inter-normal-20 text-gray-500')}>
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

  // Month view - check if agenda mode
  if (isAgendaMode && viewType === 'month') {
    // Memoized callbacks for Agenda component
    // loadItemsForMonth is called when viewing a new month
    // We update the state with items for that month (already sorted by time)
    const handleLoadItemsForMonth = useCallback(
      (month: { dateString: string }) => {
        // Merge new items with existing items
        // Items are already sorted by time in formattedAgendaItems
        setAgendaItemsState(prevItems => {
          // If items for this month already exist, return current state
          const monthKey = month.dateString.substring(0, 7); // YYYY-MM
          const hasItemsForMonth = Object.keys(prevItems).some(
            dateKey => dateKey.substring(0, 7) === monthKey,
          );
          
          if (hasItemsForMonth) {
            return prevItems;
          }
          
          // Otherwise, merge with formatted items (which are already sorted by time)
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

    const renderItem = useCallback((item: any, firstItemInDay?: boolean) => {
      const event = item.event;

      if (!event) return null;

      return <AgendaEventItem event={event} onPress={onEventPress} />;
    }, [onEventPress]);

    const renderEmptyDate = useCallback(() => {
      return <AgendaEmptyDate />;
    }, []);

    const rowHasChanged = useCallback((r1: any, r2: any) => {
      return r1.id !== r2.id;
    }, []);

    // Memoized theme object
    const agendaTheme = useMemo(
      () => ({
        backgroundColor: '#ffffff',
        calendarBackground: '#ffffff',
        textSectionTitleColor: '#171717',
        selectedDayBackgroundColor: tailwind.color('bg-blue-500'),
        selectedDayTextColor: '#ffffff',
        todayTextColor: tailwind.color('text-blue-500'),
        dayTextColor: '#171717',
        textDisabledColor: '#d9d9d9',
        dotColor: tailwind.color('bg-blue-500'),
        selectedDotColor: '#ffffff',
        arrowColor: '#171717',
        monthTextColor: '#171717',
        textDayFontFamily: 'Inter-400-20',
        textMonthFontFamily: 'Inter-500-24',
        textDayHeaderFontFamily: 'Inter-420-20',
        textDayFontSize: 15,
        textMonthFontSize: 17,
        textDayHeaderFontSize: 13,
        agendaDayTextColor: '#171717',
        agendaDayNumColor: '#171717',
        agendaTodayColor: tailwind.color('text-blue-500'),
        agendaKnobColor: '#d9d9d9',
      }),
      [],
    );

    // Use selectedDate if available, otherwise use current date
    const agendaSelectedDate = selectedDateString || currentDateString;

    return (
      <View style={tailwind.style('flex-1')}>
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
      </View>
    );
  }

  // Month view (scrollable calendar - default)
  return (
    <View style={tailwind.style('flex-1')}>
      <CalendarList
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
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#171717',
          selectedDayBackgroundColor: tailwind.color('bg-blue-500'),
          selectedDayTextColor: '#ffffff',
          todayTextColor: tailwind.color('text-blue-500'),
          dayTextColor: '#171717',
          textDisabledColor: '#d9d9d9',
          dotColor: tailwind.color('bg-blue-500'),
          selectedDotColor: '#ffffff',
          arrowColor: '#171717',
          monthTextColor: '#171717',
          textDayFontFamily: 'Inter-400-20',
          textMonthFontFamily: 'Inter-500-24',
          textDayHeaderFontFamily: 'Inter-420-20',
          textDayFontSize: 15,
          textMonthFontSize: 17,
          textDayHeaderFontSize: 13,
        }}
      />
    </View>
  );
};


// Generate dummy events for testing
const generateDummyEvents = (): CalendarEvent[] => {
  const today = new Date();
  const dummyEvents: CalendarEvent[] = [];
  
  // Multiple events today
  const todayDate = new Date(today);
  
  // Event 1 today - Morning
  todayDate.setHours(9, 0, 0, 0);
  dummyEvents.push({
    id: '1',
    title: 'Team Standup',
    startTime: new Date(todayDate),
    endTime: new Date(todayDate.getTime() + 30 * 60 * 1000), // 30 minutes
    color: '#4285F4',
    link: 'https://meet.google.com/abc-defg-hij',
    contact_person_name: 'John Doe',
    contact_person_phone_number: '+1 234-567-8900',
    customAttributes: {
      weight: '150 kg',
    },
  });
  
  // Event 2 today - Mid-morning
  todayDate.setHours(10, 30, 0, 0);
  dummyEvents.push({
    id: '2',
    title: 'Client Call',
    startTime: new Date(todayDate),
    endTime: new Date(todayDate.getTime() + 45 * 60 * 1000), // 45 minutes
    color: '#34A853',
    contact_person_name: 'Sarah Johnson',
    contact_person_phone_number: '+1 234-567-8901',
    customAttributes: {
      contact_person_labels: ['VIP', 'Enterprise'],
    },
  });
  
  // Event 3 today - Afternoon
  todayDate.setHours(14, 0, 0, 0);
  dummyEvents.push({
    id: '3',
    title: 'Design Review',
    startTime: new Date(todayDate),
    endTime: new Date(todayDate.getTime() + 60 * 60 * 1000), // 1 hour
    color: '#FBBC04',
    contact_person_name: 'Mike Wilson',
    customAttributes: {
      weight: '200 kg',
    },
  });
  
  // Event 4 today - Late afternoon
  todayDate.setHours(16, 0, 0, 0);
  dummyEvents.push({
    id: '4',
    title: 'Sprint Planning',
    startTime: new Date(todayDate),
    endTime: new Date(todayDate.getTime() + 90 * 60 * 1000), // 1.5 hours
    color: '#EA4335',
    link: 'https://zoom.us/j/123456789',
    contact_person_phone_number: '+1 234-567-8902',
    customAttributes: {
      contact_person_labels: ['Development'],
    },
  });
  
  // Multiple events tomorrow
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  
  // Event 1 tomorrow - Morning
  tomorrowDate.setHours(9, 30, 0, 0);
  dummyEvents.push({
    id: '5',
    title: 'Client Presentation',
    startTime: new Date(tomorrowDate),
    endTime: new Date(tomorrowDate.getTime() + 90 * 60 * 1000), // 1.5 hours
    color: '#9C27B0',
    link: 'https://teams.microsoft.com/l/meetup-join/...',
    contact_person_name: 'Emily Davis',
    contact_person_phone_number: '+1 234-567-8903',
    customAttributes: {
      contact_person_labels: ['Executive', 'Priority'],
      weight: '175 kg',
    },
  });
  
  // Event 2 tomorrow - Mid-day
  tomorrowDate.setHours(12, 0, 0, 0);
  dummyEvents.push({
    id: '6',
    title: 'Lunch Meeting',
    startTime: new Date(tomorrowDate),
    endTime: new Date(tomorrowDate.getTime() + 60 * 60 * 1000), // 1 hour
    color: '#FF9800',
    contact_person_name: 'Robert Chen',
    contact_person_phone_number: '+1 234-567-8904',
    customAttributes: {
      contact_person_labels: ['Partner'],
    },
  });
  
  // Event 3 tomorrow - Afternoon
  tomorrowDate.setHours(15, 0, 0, 0);
  dummyEvents.push({
    id: '7',
    title: 'Code Review',
    startTime: new Date(tomorrowDate),
    endTime: new Date(tomorrowDate.getTime() + 60 * 60 * 1000), // 1 hour
    color: '#00BCD4',
    contact_person_name: 'Alex Martinez',
    customAttributes: {
      weight: '180 kg',
    },
  });
  
  // Multiple events in 3 days
  const day3Date = new Date(today);
  day3Date.setDate(day3Date.getDate() + 3);
  
  // Event 1 in 3 days - Morning
  day3Date.setHours(8, 0, 0, 0);
  dummyEvents.push({
    id: '8',
    title: 'Project Review',
    startTime: new Date(day3Date),
    endTime: new Date(day3Date.getTime() + 2 * 60 * 60 * 1000), // 2 hours
    color: '#E91E63',
    contact_person_name: 'Lisa Anderson',
    contact_person_phone_number: '+1 234-567-8905',
    customAttributes: {
      contact_person_labels: ['Manager'],
      weight: '160 kg',
    },
  });
  
  // Event 2 in 3 days - Afternoon
  day3Date.setHours(13, 30, 0, 0);
  dummyEvents.push({
    id: '9',
    title: 'Training Session',
    startTime: new Date(day3Date),
    endTime: new Date(day3Date.getTime() + 2 * 60 * 60 * 1000), // 2 hours
    color: '#4285F4',
    link: 'https://meet.google.com/training-session',
    contact_person_phone_number: '+1 234-567-8906',
    customAttributes: {
      contact_person_labels: ['Training', 'Onboarding'],
    },
  });
  
  // Event 3 in 3 days - Evening
  day3Date.setHours(17, 0, 0, 0);
  dummyEvents.push({
    id: '10',
    title: 'Team Building',
    startTime: new Date(day3Date),
    endTime: new Date(day3Date.getTime() + 90 * 60 * 1000), // 1.5 hours
    color: '#34A853',
    contact_person_name: 'David Kim',
    customAttributes: {
      contact_person_labels: ['Team'],
    },
  });
  
  // Multiple events next week
  const nextWeekDate = new Date(today);
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  
  // Event 1 next week - Morning
  nextWeekDate.setHours(10, 0, 0, 0);
  dummyEvents.push({
    id: '11',
    title: 'Workshop Session',
    startTime: new Date(nextWeekDate),
    endTime: new Date(nextWeekDate.getTime() + 3 * 60 * 60 * 1000), // 3 hours
    color: '#FBBC04',
    link: 'https://zoom.us/j/workshop-123',
    contact_person_name: 'Jennifer Lee',
    contact_person_phone_number: '+1 234-567-8907',
    customAttributes: {
      contact_person_labels: ['Training', 'Workshop'],
      weight: '190 kg',
    },
  });
  
  // Event 2 next week - Afternoon
  nextWeekDate.setHours(14, 0, 0, 0);
  dummyEvents.push({
    id: '12',
    title: 'Product Demo',
    startTime: new Date(nextWeekDate),
    endTime: new Date(nextWeekDate.getTime() + 60 * 60 * 1000), // 1 hour
    color: '#EA4335',
    contact_person_name: 'Michael Brown',
    contact_person_phone_number: '+1 234-567-8908',
    customAttributes: {
      contact_person_labels: ['Sales', 'Demo'],
    },
  });
  
  // Event 3 next week - Late afternoon
  nextWeekDate.setHours(16, 30, 0, 0);
  dummyEvents.push({
    id: '13',
    title: 'Budget Review',
    startTime: new Date(nextWeekDate),
    endTime: new Date(nextWeekDate.getTime() + 90 * 60 * 1000), // 1.5 hours
    color: '#9C27B0',
    link: 'https://calendar.google.com/event?eid=budget-review',
    contact_person_name: 'Patricia White',
    contact_person_phone_number: '+1 234-567-8909',
    customAttributes: {
      contact_person_labels: ['Finance', 'Executive'],
      weight: '165 kg',
    },
  });
  
  return dummyEvents;
};

const CalendarScreen: React.FC<CalendarScreenProps> = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(generateDummyEvents());
  const pagerViewRef = useRef<PagerView>(null);
  
  // Always use agenda mode
  const isAgendaMode = true;

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    console.log('[Calendar DEBUG] Date changed:', date);
  }, []);

  const handlePageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
    const newIndex = e.nativeEvent.position;
    setActiveTabIndex(newIndex);
    console.log('[Calendar DEBUG] Tab changed:', CALENDAR_TABS[newIndex].id);
  }, []);

  const handleTabPress = useCallback(
    (index: number) => {
      setActiveTabIndex(index);
      pagerViewRef.current?.setPage(index);
    },
    [],
  );

  const handleAddEvent = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleSaveEvent = useCallback(
    (event: {
      title: string;
      startTime: Date;
      endTime: Date;
      color: string;
      link?: string;
    }) => {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: event.title,
        startTime: new Date(event.startTime), // Ensure it's a Date object
        endTime: new Date(event.endTime), // Ensure it's a Date object
        color: event.color,
        link: event.link,
        // customAttributes will be added from backend API later
      };
      setEvents(prev => {
        const updated = [...prev, newEvent];
        console.log('[Calendar] Event added:', newEvent);
        console.log('[Calendar] Total events:', updated.length);
        return updated;
      });
      setShowCreateModal(false);
    },
    [],
  );

  // Format events for react-native-calendars
  const formattedEvents = useMemo(() => {
    const eventsByDate: Record<string, CalendarEvent[]> = {};
    const markedDates: Record<string, any> = {};

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
          dots: [{ color: event.color }],
        };
      } else {
        // Add multiple dots for multiple events
        markedDates[dateString].dots = [
          ...(markedDates[dateString].dots || []),
          { color: event.color },
        ];
      }
    });

    return { eventsByDate, markedDates };
  }, [events]);

  return (
    <SafeAreaView edges={['top']} style={tailwind.style('flex-1 bg-white')}>
      <StatusBar
        translucent
        backgroundColor={tailwind.color('bg-white')}
        barStyle="dark-content"
      />
      <CalendarHeader onAddEvent={handleAddEvent} />
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
            />
          </View>
        ))}
      </PagerView>
      {showCreateModal && (
        <CreateEventModal onClose={handleCloseModal} onSave={handleSaveEvent} />
      )}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default CalendarScreen;