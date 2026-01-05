import React from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar, Icon } from '@/components-next';
import { PhoneIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { openNumber } from '@/utils/urlUtils';
import { Contact } from '@/types';

type ConversationActionsHeaderProps = {
  contact: Contact | null;
};

export const ConversationActionsHeader = ({ contact }: ConversationActionsHeaderProps) => {
  if (!contact) {
    return null;
  }

  const { name, thumbnail, phoneNumber } = contact;

  const handleContactPress = () => {
    if (phoneNumber) {
      openNumber({ phoneNumber });
    }
  };

  return (
    <Animated.View style={tailwind.style('items-center pt-6 pb-4')}>
      <Animated.View style={{ width: 140, height: 140 }}>
        <Avatar
          size="4xl"
          name={name || ''}
          src={thumbnail ? { uri: thumbnail } : undefined}
          style={{ width: 120, height: 120 }}
        />
      </Animated.View>
      {name && (
        <Animated.Text
          style={[tailwind.style('text-xl font-inter-medium-24 mt-0'), { color: '#E8E9EB' }]}>
          {name}
        </Animated.Text>
      )}
      {phoneNumber && (
        <Pressable
          onPress={handleContactPress}
          style={tailwind.style('flex-row items-center mt-4 gap-2')}>
          <Icon icon={<PhoneIcon stroke="#873CF6" strokeWidth={2} />} size={20} />
          <Animated.Text
            style={[tailwind.style('text-base font-inter-normal-20'), { color: '#873CF6' }]}>
            {phoneNumber}
          </Animated.Text>
        </Pressable>
      )}
    </Animated.View>
  );
};
