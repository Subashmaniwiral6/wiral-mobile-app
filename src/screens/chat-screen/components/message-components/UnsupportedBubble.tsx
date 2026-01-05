import React from 'react';
import { View, Text } from 'react-native';
import { tailwind } from '@/theme';
import i18n from '@/i18n';

export const UnsupportedBubble = () => {
  return (
    <View
      style={[
        tailwind.style('px-4 py-3 border border-dashed border-amber-700 rounded-lg'),
        { backgroundColor: '#3A301F' },
      ]}>
      <Text style={[tailwind.style(''), { color: '#E8E9EB' }]}>
        {i18n.t('CONVERSATION.UNSUPPORTED_MESSAGE')}
      </Text>
    </View>
  );
};
