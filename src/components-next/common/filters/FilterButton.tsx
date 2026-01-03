import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';

import { CaretBottomSmall } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';
import { Icon } from '../icon';
import { ReactNode } from 'react';

type FilterButtonProps = {
  value: string;
  handleOnPress: () => void;
  icon?: ReactNode;
};

export const FilterButton = (props: FilterButtonProps) => {
  const { value, handleOnPress, icon } = props;
  const { handlers, animatedStyle } = useScaleAnimation();
  const { filtersModalSheetRef } = useRefsContext();

  const hapticSelection = useHaptic();

  const onPress = useCallback(() => {
    hapticSelection?.();
    filtersModalSheetRef.current?.present();
    handleOnPress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[animatedStyle, tailwind.style('flex-1')]}>
      <Pressable
        style={[tailwind.style('px-3 py-[7px] rounded-lg flex flex-row items-center justify-center'), { backgroundColor: '#873CF6' }]}
        onPress={onPress}
        {...handlers}>
        {icon && (
          <Animated.View style={tailwind.style('pr-1.5')}>
            <Icon icon={icon} size={16} />
          </Animated.View>
        )}
        <Animated.Text
          style={[
            tailwind.style(
              'text-sm font-inter-medium-24 leading-[16px] tracking-[0.24px] pr-1 capitalize',
            ),
            { color: '#E8E9EB' },
          ]}>
          {value}
        </Animated.Text>
        <Icon icon={<CaretBottomSmall fill="#FFFFFF" />} size={7.5} />
      </Pressable>
    </Animated.View>
  );
};
