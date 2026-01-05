import React from 'react';
import Animated from 'react-native-reanimated';
import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';

export const BottomSheetBackground: React.FC<BottomSheetBackgroundProps> = ({ style }) => {
  return <Animated.View style={[style, { backgroundColor: '#121213' }]} />;
};
