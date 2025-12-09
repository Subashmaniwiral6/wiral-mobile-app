import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { Icon } from '@/components-next/common';
import { CheckedIcon, UncheckedIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useScaleAnimation } from '@/utils';
import { useHeaderAnimation } from '@/hooks/useHeaderAnimation';

type HeaderState = 'Search' | 'Filter' | 'Select' | 'none';

type ConversationHeaderPresenterProps = {
  currentState: HeaderState;
  isSelectedAll: boolean;
  filtersAppliedCount: number;
  onLeftIconPress: () => void;
  onRightIconPress: () => void;
  onClearFilter: () => void;
};

type LeftSectionProps = {
  currentState: HeaderState;
  isSelectedAll: boolean;
  onLeftIconPress: () => void;
};

type FilterSectionProps = {
  filtersAppliedCount: number;
  onClearFilter: () => void;
  handlers: Record<string, unknown>;
  animatedStyle: ViewStyle | AnimatedStyle<ViewStyle>;
};

type RightSectionProps = {
  currentState: HeaderState;
  filtersAppliedCount: number;
  onRightIconPress: () => void;
};

const HeaderTitle = () => (
  <Animated.View style={tailwind.style('flex-1')}>
    <Text
      style={tailwind.style(
        'text-[17px] font-inter-medium-24 tracking-[0.32px] leading-[17px] text-center text-gray-950',
      )}>
      {i18n.t('CONVERSATION.HEADER.TITLE')}
    </Text>
  </Animated.View>
);

const LeftSection = ({ currentState, isSelectedAll, onLeftIconPress }: LeftSectionProps) => {
  const { entering, exiting } = useHeaderAnimation();

  if (currentState === 'Filter' || currentState === 'Search') return null;
  if (currentState !== 'Select') {
    return (
      <Animated.View style={tailwind.style('flex-1 items-start')}>
        <Pressable hitSlop={16}>
          <Animated.View exiting={exiting} entering={entering} />
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={tailwind.style('flex-1 items-start')}>
      <Pressable onPress={onLeftIconPress} hitSlop={16}>
        <Animated.View exiting={exiting} entering={entering}>
          <Icon
            size={24}
            icon={
              isSelectedAll ? (
                <CheckedIcon />
              ) : (
                <UncheckedIcon stroke={tailwind.color('text-gray-800')} />
              )
            }
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const FilterSection = ({
  filtersAppliedCount,
  onClearFilter,
  handlers,
  animatedStyle,
}: FilterSectionProps) => {
  const { entering, exiting } = useHeaderAnimation();

  return (
    <Animated.View
      style={[tailwind.style('flex-1'), animatedStyle]}
      exiting={exiting}
      entering={entering}>
      <Pressable onPress={onClearFilter} disabled={filtersAppliedCount === 0} {...handlers}>
        <Text
          style={tailwind.style(
            'text-md font-inter-medium-24 leading-[17px] tracking-[0.24px]',
            filtersAppliedCount === 0 ? 'text-gray-700' : 'text-blue-800',
          )}>
          {i18n.t('CONVERSATION.HEADER.CLEAR_FILTER')}
          {filtersAppliedCount > 0 ? ` (${filtersAppliedCount})` : ''}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const RightSection = ({
  currentState,
  filtersAppliedCount,
  onRightIconPress,
}: RightSectionProps) => {
  // 2025-12-09 thouseef-hamza: Filter toggle hidden; preserve layout spacing
  return <Animated.View style={tailwind.style('flex-1 items-end')} />;
};

export const ConversationHeaderPresenter = ({
  currentState,
  isSelectedAll,
  filtersAppliedCount,
  onLeftIconPress,
  onRightIconPress,
  onClearFilter,
}: ConversationHeaderPresenterProps) => {
  const { handlers, animatedStyle } = useScaleAnimation();

  return (
    <Animated.View
      style={[tailwind.style('flex flex-row justify-between items-center px-4 pt-2 pb-[12px]')]}>
      <LeftSection
        currentState={currentState}
        isSelectedAll={isSelectedAll}
        onLeftIconPress={onLeftIconPress}
      />
      {/* 2025-12-09 thouseef-hamza: Clear filter hidden per request */}
      <HeaderTitle />
      <RightSection
        currentState={currentState}
        filtersAppliedCount={filtersAppliedCount}
        onRightIconPress={onRightIconPress}
      />
    </Animated.View>
  );
};
