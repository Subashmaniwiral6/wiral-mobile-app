import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import Animated from 'react-native-reanimated';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';
import { CloseIcon } from '@/svg-icons';
import type { CalendarEvent } from '@/types/Calendar';

interface EventDetailsViewProps {
  event: CalendarEvent;
  onClose: () => void;
}

export const EventDetailsView = ({ event, onClose }: EventDetailsViewProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const handleMeetLinkPress = () => {
    if (event.meetLink) {
      Linking.openURL(event.meetLink).catch(err => {
        console.error('Failed to open meet link:', err);
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
        {/* Title */}
        {/* <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
            Title
          </Text>
          <Text style={tailwind.style('text-base font-inter-medium-24 text-gray-950')}>
            {event.title}
          </Text>
        </View> */}

        {/* Contact Person Name */}
        {event.contact_person_name && (
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
              Person Name
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
              Phone Number
            </Text>
            <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
              {event.contact_person_phone_number}
            </Text>
          </View>
        )}

        {/* Date */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>Date</Text>
          <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
            {formatDate(event.startTime)}
          </Text>
        </View>

        {/* Time Range */}
        <View style={tailwind.style('mb-6')}>
          <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>Time</Text>
          <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </Text>
        </View>

        {/* Location */}
        {event.location && (
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
              Location
            </Text>
            <Text style={tailwind.style('text-base font-inter-normal-20 text-gray-950')}>
              {event.location}
            </Text>
          </View>
        )}

        {/* Meet Link */}
        {event.meetLink && (
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-2')}>
              Meet Link
            </Text>
            <Pressable onPress={handleMeetLinkPress}>
              <Text
                style={tailwind.style('text-base font-inter-normal-20 text-blue-600')}
                numberOfLines={2}
                ellipsizeMode="tail">
                {event.meetLink}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Custom Attributes - Exclude contact_person_name and contact_person_phone_number */}
        {event.customAttributes && Object.keys(event.customAttributes).length > 0 && (
          <View style={tailwind.style('mb-6')}>
            <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-500 mb-3')}>
              Custom Attributes
            </Text>
            {Object.entries(event.customAttributes)
              .filter(
                ([key]) => key !== 'contact_person_name' && key !== 'contact_person_phone_number',
              )
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
      </BottomSheetScrollView>
    </View>
  );
};
