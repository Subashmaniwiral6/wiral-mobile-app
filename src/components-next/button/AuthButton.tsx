import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Icon } from '../common/icon/Icon';

type AuthButtonProps = {
  text: string;
  icon: React.ReactNode;
  handlePress?: () => void;
  disabled?: boolean;
  variant?: 'outline' | 'filled';
  style?: StyleProp<ViewStyle>;
};

export const AuthButton = ({
  text,
  icon,
  handlePress,
  disabled = false,
  variant = 'outline',
  style,
}: AuthButtonProps) => {
  const getButtonStyles = () => {
    const baseStyles = 'py-[11px] flex-row items-center justify-center rounded-[13px]';
    const disabledStyles = disabled ? 'opacity-50' : '';
    const baseStyle = tailwind.style(baseStyles, disabledStyles);

    if (variant === 'filled') {
      return [baseStyle, { backgroundColor: '#873CF6' }];
    } else {
      return [
        baseStyle,
        {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
      ];
    }
  };

  const getTextStyles = () => {
    const baseStyles = 'ml-2 text-base font-medium';
    const baseStyle = tailwind.style(baseStyles);

    if (variant === 'filled') {
      return [baseStyle, { color: '#FFFFFF' }];
    } else {
      return [baseStyle, { color: '#E8E9EB' }];
    }
  };

  return (
    <Pressable style={[getButtonStyles(), style]} onPress={handlePress} disabled={disabled}>
      <Icon size={16} icon={icon} />
      <Animated.Text style={getTextStyles()}>{text}</Animated.Text>
    </Pressable>
  );
};
