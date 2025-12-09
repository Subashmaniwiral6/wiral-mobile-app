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

export const PipelineFilters = () => {
  const { filtersModalSheetRef } = useRefsContext();
  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();
  const labels = useAppSelector(selectAllLabels);
  const hapticSelection = useHaptic();

  const pipelineOptions = useMemo(() => {
    const availablePipelines = labels.filter(label => !!label.is_pipeline_tag);
    return [
      { id: 'all', title: 'All pipelines' },
      ...availablePipelines.map(label => ({ id: label.title, title: label.title })),
    ];
  }, [labels]);

  const handlePipelinePress = (pipelineId: string) => {
    hapticSelection?.();
    dispatch(setFilters({ key: 'pipeline', value: pipelineId }));
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Animated.View>
      <BottomSheetHeader headerText="Pipelines" />
      {/* 2025-12-09 thouseef-hamza: Pipeline filter uses labels flagged is_pipeline_tag */}
      <Animated.View style={tailwind.style('py-1 pl-3')}>
        {pipelineOptions.map((option, index) => (
          <Pressable
            key={option.id}
            onPress={() => handlePipelinePress(option.id)}
            style={tailwind.style('flex flex-row items-center')}>
            <Animated.View
              style={tailwind.style(
                'flex-1 ml-3 flex-row justify-between py-[11px] pr-3',
                index !== pipelineOptions.length - 1 ? 'border-b-[1px] border-blackA-A3' : '',
              )}>
              <Animated.Text
                style={tailwind.style(
                  'text-base text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
                )}>
                {option.title}
              </Animated.Text>
              {filters.pipeline === option.id ? <Icon icon={<TickIcon />} size={20} /> : null}
            </Animated.View>
          </Pressable>
        ))}
      </Animated.View>
    </Animated.View>
  );
};
