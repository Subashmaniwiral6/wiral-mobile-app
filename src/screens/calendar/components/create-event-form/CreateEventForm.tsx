import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';
import { CloseIcon } from '@/svg-icons';

interface CreateEventFormProps {
  onSave: (event: {
    title: string;
    startTime: Date;
    endTime: Date;
    color: string;
    link?: string;
    withWhom?: string;
  }) => void;
  onCancel: () => void;
}

const COLOR_OPTIONS = [
  '#4285F4', // Blue
  '#34A853', // Green
  '#FBBC04', // Yellow
  '#EA4335', // Red
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#00BCD4', // Cyan
  '#E91E63', // Pink
];

export const CreateEventForm = ({ onSave, onCancel }: CreateEventFormProps) => {
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [link, setLink] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // Use refs to track time components separately to avoid infinite loops
  const startTimeRef = useRef({ hours: new Date().getHours(), minutes: new Date().getMinutes() });
  const endTimeRef = useRef({ 
    hours: new Date(Date.now() + 60 * 60 * 1000).getHours(), 
    minutes: new Date(Date.now() + 60 * 60 * 1000).getMinutes() 
  });

  // Helper function to combine date with time
  const combineDateAndTime = (date: Date, hours: number, minutes: number): Date => {
    const combined = new Date(date);
    combined.setHours(hours);
    combined.setMinutes(minutes);
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  // Update times when selected date changes
  useEffect(() => {
    const newStartTime = combineDateAndTime(
      selectedDate, 
      startTimeRef.current.hours, 
      startTimeRef.current.minutes
    );
    let newEndTime = combineDateAndTime(
      selectedDate, 
      endTimeRef.current.hours, 
      endTimeRef.current.minutes
    );
    
    // If end time is before start time on the same date, adjust it
    if (newEndTime <= newStartTime) {
      newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);
      endTimeRef.current = { 
        hours: newEndTime.getHours(), 
        minutes: newEndTime.getMinutes() 
      };
    }
    setStartTime(newStartTime);
    setEndTime(newEndTime);
  }, [selectedDate]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }
    // Ensure both times are on the selected date
    const finalStartTime = combineDateAndTime(
      selectedDate, 
      startTimeRef.current.hours, 
      startTimeRef.current.minutes
    );
    const finalEndTime = combineDateAndTime(
      selectedDate, 
      endTimeRef.current.hours, 
      endTimeRef.current.minutes
    );
    
    // Ensure end time is after start time
    if (finalEndTime <= finalStartTime) {
      const adjustedEndTime = new Date(finalStartTime.getTime() + 60 * 60 * 1000);
      onSave({
        title: title.trim(),
        startTime: finalStartTime,
        endTime: adjustedEndTime,
        color: selectedColor,
        link: link.trim() || undefined,
      });
    } else {
      onSave({
        title: title.trim(),
        startTime: finalStartTime,
        endTime: finalEndTime,
        color: selectedColor,
        link: link.trim() || undefined,
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDateChange = (event: any, selectedDateValue?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event && event.type === 'dismissed') {
        return;
      }
    }
    
    if (selectedDateValue) {
      setSelectedDate(selectedDateValue);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      if (event && event.type === 'dismissed') {
        return;
      }
    }
    
    if (selectedTime) {
      // Update the ref with new time components
      startTimeRef.current = {
        hours: selectedTime.getHours(),
        minutes: selectedTime.getMinutes(),
      };
      
      const newStartTime = combineDateAndTime(
        selectedDate, 
        startTimeRef.current.hours, 
        startTimeRef.current.minutes
      );
      setStartTime(newStartTime);
      
      // Auto-update end time if it's before or equal to start time
      const currentEndTime = combineDateAndTime(
        selectedDate, 
        endTimeRef.current.hours, 
        endTimeRef.current.minutes
      );
      if (currentEndTime <= newStartTime) {
        const adjustedEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);
        endTimeRef.current = {
          hours: adjustedEndTime.getHours(),
          minutes: adjustedEndTime.getMinutes(),
        };
        setEndTime(adjustedEndTime);
      }
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
      if (event && event.type === 'dismissed') {
        return;
      }
    }
    
    if (selectedTime) {
      const newEndTime = combineDateAndTime(
        selectedDate, 
        selectedTime.getHours(), 
        selectedTime.getMinutes()
      );
      const currentStartTime = combineDateAndTime(
        selectedDate, 
        startTimeRef.current.hours, 
        startTimeRef.current.minutes
      );
      
      // Ensure end time is after start time
      if (newEndTime > currentStartTime) {
        endTimeRef.current = {
          hours: selectedTime.getHours(),
          minutes: selectedTime.getMinutes(),
        };
        setEndTime(newEndTime);
      } else {
        // If end time is before start time, set it to 1 hour after start time
        const adjustedEndTime = new Date(currentStartTime.getTime() + 60 * 60 * 1000);
        endTimeRef.current = {
          hours: adjustedEndTime.getHours(),
          minutes: adjustedEndTime.getMinutes(),
        };
        setEndTime(adjustedEndTime);
      }
    }
  };

  return (
    <View style={tailwind.style('flex-1')}>
      {/* Header with Close Button */}
      <View style={tailwind.style('flex-row justify-between items-center px-4 pt-2 pb-4')}>
        <Text
          style={tailwind.style(
            'text-[20px] font-inter-medium-24 tracking-[0.32px] text-gray-950',
          )}>
          Create Event
        </Text>
        <Pressable onPress={onCancel} style={tailwind.style('p-2')}>
          <Icon size={24} icon={<CloseIcon />} />
        </Pressable>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style('px-4 pb-6')}>
        {/* Title Field */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-base font-inter-420-20 text-gray-950 mb-2')}>
            Title
          </Text>
          <TextInput
            style={tailwind.style(
              'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px]',
              'py-2 px-3 rounded-xl text-gray-950 bg-blackA-A4 h-10',
            )}
            placeholder="Event title"
            placeholderTextColor={tailwind.color('text-gray-500')}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Date Field */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-base font-inter-420-20 text-gray-950 mb-2')}>
            Date
          </Text>
          <Pressable
            onPress={() => {
              if (Platform.OS === 'ios') {
                setShowDatePicker(!showDatePicker);
              } else {
                setShowDatePicker(true);
              }
            }}
            style={tailwind.style(
              'py-2 px-3 rounded-xl bg-blackA-A4 h-10 justify-center',
            )}>
            <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
              {formatDate(selectedDate)}
            </Text>
          </Pressable>
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={tailwind.style('mt-3')}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                textColor={tailwind.color('text-gray-950')}
                locale="en_US"
                minimumDate={new Date()}
              />
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={tailwind.style('mt-2 py-2 items-center')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-blue-600')}>
                  Done
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Start Time Field */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-base font-inter-420-20 text-gray-950 mb-2')}>
            Start Time
          </Text>
          <Pressable
            onPress={() => {
              if (Platform.OS === 'ios') {
                setShowStartPicker(!showStartPicker);
              } else {
                setShowStartPicker(true);
              }
            }}
            style={tailwind.style(
              'py-2 px-3 rounded-xl bg-blackA-A4 h-10 justify-center',
            )}>
            <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
              {formatTime(startTime)}
            </Text>
          </Pressable>
          {showStartPicker && Platform.OS === 'ios' && (
            <View style={tailwind.style('mt-3')}>
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={handleStartTimeChange}
                textColor={tailwind.color('text-gray-950')}
                locale="en_US"
                minuteInterval={1}
                is24Hour={false}
              />
              <Pressable
                onPress={() => setShowStartPicker(false)}
                style={tailwind.style('mt-2 py-2 items-center')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-blue-600')}>
                  Done
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* End Time Field */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-base font-inter-420-20 text-gray-950 mb-2')}>
            End Time
          </Text>
          <Pressable
            onPress={() => {
              if (Platform.OS === 'ios') {
                setShowEndPicker(!showEndPicker);
              } else {
                setShowEndPicker(true);
              }
            }}
            style={tailwind.style(
              'py-2 px-3 rounded-xl bg-blackA-A4 h-10 justify-center',
            )}>
            <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
              {formatTime(endTime)}
            </Text>
          </Pressable>
          {showEndPicker && Platform.OS === 'ios' && (
            <View style={tailwind.style('mt-3')}>
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={handleEndTimeChange}
                textColor={tailwind.color('text-gray-950')}
                locale="en_US"
                minuteInterval={1}
                is24Hour={false}
              />
              <Pressable
                onPress={() => setShowEndPicker(false)}
                style={tailwind.style('mt-2 py-2 items-center')}>
                <Text style={tailwind.style('text-base font-inter-medium-24 text-blue-600')}>
                  Done
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Link Field */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-base font-inter-420-20 text-gray-950 mb-2')}>
            Link (Optional)
          </Text>
          <TextInput
            style={tailwind.style(
              'text-base font-inter-normal-20 tracking-[0.24px] leading-[20px]',
              'py-2 px-3 rounded-xl text-gray-950 bg-blackA-A4 h-10',
            )}
            placeholder="https://..."
            placeholderTextColor={tailwind.color('text-gray-500')}
            value={link}
            onChangeText={setLink}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

      {/* Color Picker Field */}
      <View style={tailwind.style('mb-8')}>
        <Text style={tailwind.style('text-base font-inter-420-20 text-gray-950 mb-3')}>
          Color
        </Text>
        <View style={tailwind.style('flex-row flex-wrap gap-3')}>
          {COLOR_OPTIONS.map(color => (
            <Pressable
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                tailwind.style('w-12 h-12 rounded-full'),
                {
                  backgroundColor: color,
                  borderWidth: selectedColor === color ? 3 : 0,
                  borderColor: tailwind.color('text-gray-950'),
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={tailwind.style('flex-row gap-3')}>
        <Pressable
          onPress={onCancel}
          style={tailwind.style(
            'flex-1 py-3 px-4 rounded-xl bg-blackA-A4 items-center',
          )}>
          <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={!title.trim()}
          style={[
            tailwind.style('flex-1 py-3 px-4 rounded-xl items-center'),
            {
              backgroundColor: title.trim() ? selectedColor : tailwind.color('bg-gray-400'),
            },
          ]}>
          <Text
            style={tailwind.style(
              'text-base font-inter-medium-24',
              title.trim() ? 'text-white' : 'text-gray-600',
            )}>
            Save
          </Text>
        </Pressable>
      </View>
      </BottomSheetScrollView>

      {/* Android DateTimePickers - rendered outside scroll view to avoid conflicts */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
      {showStartPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
          is24Hour={false}
        />
      )}
      {showEndPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
          is24Hour={false}
        />
      )}
    </View>
  );
};

