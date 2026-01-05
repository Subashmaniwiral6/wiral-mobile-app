import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';
import { CloseIcon, CaretRight } from '@/svg-icons';
import type { CalendarEvent } from '@/types/Calendar';

interface EventDetailsViewProps {
  event: CalendarEvent;
  onClose: () => void;
}

export const EventDetailsView = ({ event, onClose }: EventDetailsViewProps) => {
  const navigation = useNavigation();

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

  const handleNavigateToConversation = () => {
    if (event.conversationDisplayId) {
      const pushToChatScreen = StackActions.push('ChatScreen', {
        conversationId: event.conversationDisplayId,
        isConversationOpenedExternally: false,
      });
      navigation.dispatch(pushToChatScreen);
      onClose();
    }
  };

  return (
    <View style={[tailwind.style('flex-1'), { backgroundColor: '#121213' }]}>
      {/* Header with Close Button */}
      <View style={tailwind.style('flex-row justify-between items-center px-4 pt-2 pb-4')}>
        <View style={tailwind.style('flex-row items-center gap-3')}>
          <Text
            style={[
              tailwind.style('text-[20px] font-inter-medium-24 tracking-[0.32px]'),
              { color: '#E8E9EB' },
            ]}>
            Booking Details
          </Text>
          {event.conversationDisplayId && (
            <Pressable
              onPress={handleNavigateToConversation}
              style={[
                tailwind.style('px-3 py-1 rounded-lg flex-row items-center gap-1.5'),
                {
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: '#873CF6',
                },
              ]}>
              <Text style={[tailwind.style('text-sm font-inter-medium-24'), { color: '#873CF6' }]}>
                View Chat
              </Text>
              <Icon size={16} icon={<CaretRight stroke="#873CF6" />} />
            </Pressable>
          )}
        </View>
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
            <Text
              style={[
                tailwind.style('text-sm font-inter-420-20 mb-2'),
                { color: 'rgba(255, 255, 255, 0.6)' },
              ]}>
              Name
            </Text>
            <Text style={[tailwind.style('text-base font-inter-normal-20'), { color: '#E8E9EB' }]}>
              {event.contact_person_name}
            </Text>
          </View>
        )}

        {/* Contact Person Phone Number */}
        {event.contact_person_phone_number && (
          <View style={tailwind.style('mb-6')}>
            <Text
              style={[
                tailwind.style('text-sm font-inter-420-20 mb-2'),
                { color: 'rgba(255, 255, 255, 0.6)' },
              ]}>
              Phone
            </Text>
            <Text style={[tailwind.style('text-base font-inter-normal-20'), { color: '#E8E9EB' }]}>
              {event.contact_person_phone_number}
            </Text>
          </View>
        )}

        {/* Date */}
        <View style={tailwind.style('mb-6')}>
          <Text
            style={[
              tailwind.style('text-sm font-inter-420-20 mb-2'),
              { color: 'rgba(255, 255, 255, 0.6)' },
            ]}>
            Date
          </Text>
          <Text style={[tailwind.style('text-base font-inter-normal-20'), { color: '#E8E9EB' }]}>
            {formatDate(event.startTime)}
          </Text>
        </View>

        {/* Time Range */}
        <View style={tailwind.style('mb-6')}>
          <Text
            style={[
              tailwind.style('text-sm font-inter-420-20 mb-2'),
              { color: 'rgba(255, 255, 255, 0.6)' },
            ]}>
            Time
          </Text>
          <Text style={[tailwind.style('text-base font-inter-normal-20'), { color: '#E8E9EB' }]}>
            {formatTime(event.startTime)}
          </Text>
        </View>

        {/* Location */}
        {event.location && (
          <View style={tailwind.style('mb-6')}>
            <Text
              style={[
                tailwind.style('text-sm font-inter-420-20 mb-2'),
                { color: 'rgba(255, 255, 255, 0.6)' },
              ]}>
              Location
            </Text>
            <Text style={[tailwind.style('text-base font-inter-normal-20'), { color: '#E8E9EB' }]}>
              {event.location}
            </Text>
          </View>
        )}

        {/* Meet Link */}
        {event.meetLink && (
          <View style={tailwind.style('mb-6')}>
            <Text
              style={[
                tailwind.style('text-sm font-inter-420-20 mb-2'),
                { color: 'rgba(255, 255, 255, 0.6)' },
              ]}>
              Meet Link
            </Text>
            <Pressable onPress={handleMeetLinkPress}>
              <Text
                style={[tailwind.style('text-base font-inter-normal-20'), { color: '#873CF6' }]}
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
            <Text
              style={[tailwind.style('text-sm font-inter-semibold-20 mb-3'), { color: '#E8E9EB' }]}>
              Customer Details
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
                    <Text
                      style={[
                        tailwind.style('text-xs font-inter-420-20 mb-1'),
                        { color: 'rgba(255, 255, 255, 0.6)' },
                      ]}>
                      {formattedKey}
                    </Text>
                    <Text
                      style={[
                        tailwind.style('text-base font-inter-normal-20'),
                        { color: '#E8E9EB' },
                      ]}>
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
