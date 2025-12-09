import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { tailwind } from '@/theme';
import { AnimatedNativeView, NativeView } from '@/components-next/native-components';
import { Label } from '@/types';

const LabelText = ({ labelText, labelColor }: { labelText: string; labelColor: string }) => (
  <NativeView style={tailwind.style('flex-row items-center py-[3px]')}>
    <NativeView style={tailwind.style('h-[5px] w-[5px] rounded-full', `bg-[${labelColor}]`)} />
    <Text
      style={tailwind.style(
        'pl-1 text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700',
      )}>
      {labelText}
    </Text>
  </NativeView>
);

export const LabelIndicator = ({ labels, allLabels }: { labels: string[]; allLabels: Label[] }) => {
  // 2025-12-09 thouseef-hamza: Render all applicable labels with wrapping for responsiveness
  const activeLabels = useMemo(
    () => allLabels.filter(label => labels.includes(label.title)),
    [allLabels, labels],
  );

  if (!activeLabels.length) {
    return null;
  }

  return (
    <AnimatedNativeView style={tailwind.style('flex-1')}>
      <NativeView style={tailwind.style('flex-row flex-wrap items-center gap-1')}>
        {activeLabels.map(label => (
          <NativeView key={label.id} style={tailwind.style('flex-row items-center')}>
            <LabelText labelText={label.title} labelColor={label.color} />
          </NativeView>
        ))}
      </NativeView>
    </AnimatedNativeView>
  );
};
