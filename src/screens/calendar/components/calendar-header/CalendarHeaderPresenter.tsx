import React from 'react';
import { Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon } from '@/components-next/common';
import { AddIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useScaleAnimation } from '@/utils';

type CalendarHeaderPresenterProps = {
  onAddEvent?: () => void;
};

export const CalendarHeaderPresenter = ({ onAddEvent }: CalendarHeaderPresenterProps) => {
  const addIconHandlers = useScaleAnimation();

  return (
    <Animated.View
      style={tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]')}>
      <Animated.View style={tailwind.style('flex-1')} />
      <Animated.View style={tailwind.style('flex-1')}>
        <Text
          style={[
            tailwind.style('text-[17px] font-inter-medium-24 tracking-[0.32px] leading-[17px] text-center'),
            { color: '#E8E9EB' },
          ]}>
          {i18n.t('CALENDAR.HEADER.TITLE') || 'Calendar'}
        </Text>
      </Animated.View>
      <Animated.View style={tailwind.style('flex-1 items-end')}>
        {onAddEvent && (
          <Pressable onPress={onAddEvent}>
            <Animated.View style={addIconHandlers.animatedStyle} {...addIconHandlers.handlers}>
              <Icon size={24} icon={<AddIcon stroke="#E8E9EB" />} />
            </Animated.View>
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
};
