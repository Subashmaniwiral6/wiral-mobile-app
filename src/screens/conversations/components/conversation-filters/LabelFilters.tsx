import React, { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';

import { useRefsContext } from '@/context';
import { TickIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import { BottomSheetHeader, Icon } from '@/components-next';
import { selectFilters, setFilters } from '@/store/conversation/conversationFilterSlice';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllLabels } from '@/store/label/labelSelectors';
import { selectBaseUrl } from '@/store/settings/settingsSelectors';

const StatusIcon = ({
  labelIconUrl,
  labelColor,
  baseUrl,
}: {
  labelIconUrl?: string;
  labelColor: string;
  baseUrl: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const shouldUseImage = labelIconUrl && !imageError;
  const imageUri = labelIconUrl
    ? `${baseUrl.replace(/\/$/, '')}/${labelIconUrl.replace(/^\//, '')}`
    : null;

  if (shouldUseImage && imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={tailwind.style('h-4 w-4 rounded-full mr-2')}
        contentFit="cover"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <Animated.View style={tailwind.style('h-4 w-4 rounded-full mr-2', `bg-[${labelColor}]`)} />
  );
};

export const LabelFilters = () => {
  const { filtersModalSheetRef } = useRefsContext();
  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();
  const labels = useAppSelector(selectAllLabels);
  const baseUrl = useAppSelector(selectBaseUrl);
  const hapticSelection = useHaptic();

  const labelOptions = useMemo(() => {
    const availableLabels = labels.filter(label => !label.is_pipeline_tag);
    return [
      { id: 'all', title: 'Status', label: null },
      ...availableLabels.map(label => ({
        id: label.title,
        title: label.title,
        label,
      })),
    ];
  }, [labels]);

  const handleLabelPress = (labelId: string) => {
    hapticSelection?.();
    dispatch(setFilters({ key: 'label', value: labelId }));
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Animated.View style={{ backgroundColor: '#121213' }}>
      <BottomSheetHeader headerText="Status" />
      {/* 2025-12-09 thouseef-hamza: Label filter excludes pipeline tags */}
      <Animated.View style={[tailwind.style('py-1'), { backgroundColor: '#121213' }]}>
        {labelOptions.map((option, index) => (
          <Pressable
            key={option.id}
            onPress={() => handleLabelPress(option.id)}
            style={tailwind.style('flex flex-row items-center')}>
            <Animated.View
              style={[
                tailwind.style('flex-1 flex-row items-center justify-between py-[11px] px-3'),
                index !== labelOptions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                },
              ]}>
              <Animated.View style={tailwind.style('flex-row items-center flex-1')}>
                {option.label && (
                  <StatusIcon
                    labelIconUrl={option.label.labelIconUrl}
                    labelColor={option.label.color}
                    baseUrl={baseUrl}
                  />
                )}
                <Animated.Text
                  style={[
                    tailwind.style(
                      'text-base font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
                    ),
                    { color: '#E8E9EB' },
                  ]}>
                  {option.title}
                </Animated.Text>
              </Animated.View>
              {filters.label === option.id ? <Icon icon={<TickIcon />} size={20} /> : null}
            </Animated.View>
          </Pressable>
        ))}
      </Animated.View>
    </Animated.View>
  );
};
