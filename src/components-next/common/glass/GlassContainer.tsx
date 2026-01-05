import React, { PropsWithChildren } from 'react';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { BlurView, BlurViewProps } from '@react-native-community/blur';
import Animated from 'react-native-reanimated';

type GlassContainerProps = PropsWithChildren & {
  style?: ViewStyle;
  blurAmount?: number;
  blurType?: BlurViewProps['blurType'];
  borderRadius?: number;
  backgroundColor?: string;
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  blurAmount = 20,
  blurType = 'dark',
  borderRadius = 20,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
}) => {
  const containerStyle: ViewStyle = {
    borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...style,
  };

  if (Platform.OS === 'ios') {
    return (
      <AnimatedBlurView
        blurAmount={blurAmount}
        blurType={blurType}
        style={containerStyle}
        reducedTransparencyFallbackColor={backgroundColor}>
        {children}
      </AnimatedBlurView>
    );
  }

  // Android fallback with semi-transparent background
  return (
    <Animated.View
      style={[
        containerStyle,
        {
          backgroundColor,
        },
      ]}>
      {children}
    </Animated.View>
  );
};
