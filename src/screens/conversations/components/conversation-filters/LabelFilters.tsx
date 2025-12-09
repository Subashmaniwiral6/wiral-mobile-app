import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { useRefsContext } from '@/context';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next';
import { selectFilters, setFilters } from '@/store/conversation/conversationFilterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllLabels } from '@/store/label/labelSelectors';

export const LabelFilters = () => {
  const { filtersModalSheetRef } = useRefsContext();
  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();
  const labels = useAppSelector(selectAllLabels);
  const hapticSelection = useHaptic();

  const labelOptions = useMemo(() => {
    const availableLabels = labels.filter(label => !label.is_pipeline_tag);
    return [
      { id: 'all', title: 'All labels' },
      ...availableLabels.map(label => ({ id: label.title, title: label.title })),
    ];
  }, [labels]);

  const handleLabelPress = (labelId: string) => {
    hapticSelection?.();
    dispatch(setFilters({ key: 'label', value: labelId }));
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Animated.View>
      <BottomSheetHeader headerText="Labels" />
      {/* 2025-12-09 thouseef-hamza: Label filter excludes pipeline tags */}
      <Animated.View style={tailwind.style('py-1 pl-3')}>
        {labelOptions.map((option, index) => (
          <Pressable
            key={option.id}
            onPress={() => handleLabelPress(option.id)}
            style={tailwind.style('flex flex-row items-center')}>
            <Animated.View
              style={tailwind.style(
                'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
                index !== labelOptions.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
              )}>
              <Animated.Text
                style={tailwind.style(
                  'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
                )}>
                {option.title}
              </Animated.Text>
              {filters.label === option.id ? <Icon icon={<TickIcon />} size={20} /> : null}
            </Animated.View>
          </Pressable>
        ))}
      </Animated.View>
    </Animated.View>
  );
};
