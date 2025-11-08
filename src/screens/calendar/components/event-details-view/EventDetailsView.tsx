import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';
import { CloseIcon } from '@/svg-icons';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: string;
  link?: string;
  contact_person_name?: string;
  contact_person_phone_number?: string;
  customAttributes?: Record<string, any>;
}

interface EventDetailsViewProps {
  event: CalendarEvent;
  onClose: () => void;
}

export const EventDetailsView = ({ event, onClose }: EventDetailsViewProps) => {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleLinkPress = () => {
    if (event.link) {
      Linking.openURL(event.link).catch(err => {
        console.error('Failed to open link:', err);
      });
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
          Event Details
        </Text>
        <Pressable onPress={onClose} style={tailwind.style('p-2')}>
          <Icon size={24} icon={<CloseIcon />} />
        </Pressable>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style('px-4 pb-6')}>
        {/* Color Indicator */}
        <View
          style={[
            tailwind.style('h-2 rounded-full mb-6'),
            { backgroundColor: event.color },
          ]}
        />

        {/* Title */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
            Title
          </Text>
          <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
            {event.title}
          </Text>
        </View>

        {/* Date */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
            Date
          </Text>
          <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
            {formatDateTime(event.startTime)}
          </Text>
        </View>

        {/* Time Range */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
            Time
          </Text>
          <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </Text>
        </View>

        {/* Contact Person Name */}
        {event.contact_person_name && (
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
              Contact Person Name
            </Text>
            <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
              {event.contact_person_name}
            </Text>
          </View>
        )}

        {/* Contact Person Phone Number */}
        {event.contact_person_phone_number && (
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
              Contact Person Phone Number
            </Text>
            <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
              {event.contact_person_phone_number}
            </Text>
          </View>
        )}

        {/* Link */}
        {event.link && (
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
              Link
            </Text>
            <Pressable onPress={handleLinkPress}>
              <Text
                style={tailwind.style('text-base font-inter-normal-20 text-blue-600')}
                numberOfLines={2}
                ellipsizeMode="tail">
                {event.link}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Custom Attributes - Exclude contact_person_name and contact_person_phone_number */}
        {event.customAttributes && Object.keys(event.customAttributes).length > 0 && (
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-3')}>
              Additional Information
            </Text>
            {Object.entries(event.customAttributes)
              .filter(([key]) => key !== 'contact_person_name' && key !== 'contact_person_phone_number')
              .map(([key, value]) => {
                // Format key to be more readable (convert snake_case to Title Case)
                const formattedKey = key
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                
                // Handle different value types
                const displayValue = Array.isArray(value) 
                  ? value.join(', ') 
                  : value?.toString() || '';

                return (
                  <View key={key} style={tailwind.style('mb-4')}>
                    <Text style={tailwind.style('text-xs font-inter-420-20 text-gray-500 mb-1')}>
                      {formattedKey}
                    </Text>
                    <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
                      {displayValue}
                    </Text>
                  </View>
                );
              })}
          </View>
        )}

        {/* Color */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
            Color
          </Text>
          <View style={tailwind.style('flex-row items-center gap-3')}>
            <View
              style={[
                tailwind.style('w-8 h-8 rounded-full'),
                { backgroundColor: event.color },
              ]}
            />
            <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
              {event.color}
            </Text>
          </View>
        </View>
      </BottomSheetScrollView>
    </View>
  );
};

