import React from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { tailwind } from '@/theme';
import { CalendarHeaderPresenter } from './CalendarHeaderPresenter';

type CalendarHeaderProps = {
  onAddEvent?: () => void;
};

export const CalendarHeader = ({ onAddEvent }: CalendarHeaderProps) => {
  const headerBorderColor = tailwind.color('text-blackA-A3') as string;

  const headerOpenState = useDerivedValue(() => withSpring(0));

  const headerBorderAnimation = useAnimatedStyle(() => {
    return {
      borderBottomColor: interpolateColor(
        headerOpenState.value,
        [0, 1],
        [headerBorderColor, 'transparent'],
      ),
    };
  }, []);

  return (
    <Animated.View style={[tailwind.style('border-b-[1px]'), headerBorderAnimation]}>
      <CalendarHeaderPresenter onAddEvent={onAddEvent} />
    </Animated.View>
  );
};
