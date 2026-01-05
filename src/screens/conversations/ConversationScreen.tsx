import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, RefreshControl, StatusBar, View } from 'react-native';
import Animated, {
  LinearTransition,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import {
  BottomSheetModal,
  useBottomSheetSpringConfigs,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';

import {
  ConversationItemContainer,
  ConversationHeader,
  AgentFilters,
  LabelFilters,
  PipelineFilters,
  InboxFilters,
} from './components';

import {
  ActionTabs,
  BottomSheetBackdrop,
  BottomSheetBackground,
  BottomSheetWrapper,
} from '@/components-next';

import { EmptyStateIcon } from '@/svg-icons';
import {
  SCREENS,
  TAB_BAR_HEIGHT,
  LAST_ACTIVE_TIMESTAMP_KEY,
  LAST_ACTIVE_TIMESTAMP_THRESHOLD,
} from '@/constants';
import {
  ConversationListStateProvider,
  useConversationListStateContext,
  useRefsContext,
} from '@/context';

import { tailwind } from '@/theme';
import { Conversation } from '@/types';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectBottomSheetState,
  setBottomSheetState,
} from '@/store/conversation/conversationHeaderSlice';
import { resetActionState } from '@/store/conversation/conversationActionSlice';
import {
  selectConversationsLoading,
  selectIsAllConversationsFetched,
  getFilteredConversations,
} from '@/store/conversation/conversationSelectors';
import {
  selectHelpMeConversationsLoading,
  selectIsAllHelpMeConversationsFetched,
  selectHelpMeConversations,
} from '@/store/help-me/helpMeConversationSelectors';
import {
  selectFilters,
  FilterState,
  defaultFilterState,
} from '@/store/conversation/conversationFilterSlice';
import { ConversationPayload } from '@/store/conversation/conversationTypes';
import { clearAllConversations } from '@/store/conversation/conversationSlice';
import { clearAllContacts } from '@/store/contact/contactSlice';
import { clearAssignableAgents } from '@/store/assignable-agent/assignableAgentSlice';
import { conversationActions } from '@/store/conversation/conversationActions';
import { helpMeConversationActions } from '@/store/help-me/helpMeConversationActions';
import { clearHelpMeConversations } from '@/store/help-me/helpMeConversationSlice';

import i18n from '@/i18n';
import ActionBottomSheet from '@/navigation/tabs/ActionBottomSheet';
import { getCurrentRouteName } from '@/utils/navigationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The screen list thats need to be checked for refreshing the conversations list
const REFRESH_SCREEN_LIST = [SCREENS.CONVERSATION, SCREENS.INBOX, SCREENS.SETTINGS];

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

type FlashListRenderItemType = {
  item: Conversation;
  index: number;
};

const ConversationList = ({ isHelpMe = false }: { isHelpMe?: boolean }) => {
  const { dismissAll } = useBottomSheetModal();
  const dispatch = useAppDispatch();
  const [appState, setAppState] = useState(AppState.currentState);

  // This is used to prevent the infinite scrolling before the list is ready
  const [isFlashListReady, setFlashListReady] = useState(false);
  // This is used for pull to refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  // This is used for pagination
  const [pageNumber, setPageNumber] = useState(1);

  // This is used to store the index of the item that is currently selected
  const { openedRowIndex } = useConversationListStateContext();

  // This is used to check if the conversations are still loading
  const isConversationsLoading = useAppSelector(
    isHelpMe ? selectHelpMeConversationsLoading : selectConversationsLoading,
  );
  // This is used to check if all the conversations are fetched
  const isAllConversationsFetched = useAppSelector(
    isHelpMe ? selectIsAllHelpMeConversationsFetched : selectIsAllConversationsFetched,
  );
  // Get the appropriate conversations based on isHelpMe flag
  const allConversations = useAppSelector(
    isHelpMe
      ? selectHelpMeConversations
      : state => getFilteredConversations(state, filters || defaultFilterState),
  );

  const handleRender = useCallback(({ item, index }: FlashListRenderItemType) => {
    return (
      <ConversationItemContainer
        index={index}
        conversationItem={item}
        openedRowIndex={openedRowIndex as SharedValue<number | null>}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters = useAppSelector(selectFilters);
  const previousFilters = useRef(filters);

  const clearAndFetchConversations = useCallback(
    async (filters?: FilterState) => {
      setPageNumber(1);
      if (isHelpMe) {
        await dispatch(clearHelpMeConversations());
      } else {
        await dispatch(clearAllConversations());
        await dispatch(clearAllContacts());
        await dispatch(clearAssignableAgents());
      }
      fetchConversations(filters || defaultFilterState);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [isHelpMe],
  );

  // Reset last active timestamp when the conversation screen is opened
  useEffect(() => {
    AsyncStorage.removeItem(LAST_ACTIVE_TIMESTAMP_KEY);
  }, []);

  useEffect(() => {
    dismissAll();
    clearAndFetchConversations(filters || defaultFilterState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (previousFilters.current !== filters) {
      previousFilters.current = filters;
      clearAndFetchConversations(filters || defaultFilterState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, clearAndFetchConversations]);

  const ListFooterComponent = () => {
    if (isAllConversationsFetched) return null;
    return (
      <Animated.View
        style={tailwind.style(
          'flex-1 items-center justify-center pt-8',
          `pb-[${TAB_BAR_HEIGHT}px]`,
        )}>
        {isAllConversationsFetched ? null : <ActivityIndicator size="small" />}
      </Animated.View>
    );
  };

  const handleRefresh = useCallback(() => {
    setFlashListReady(false);
    setIsRefreshing(true);
    clearAndFetchConversations(filters || defaultFilterState).finally(() => {
      setIsRefreshing(false);
    });
  }, [clearAndFetchConversations, filters]);

  const checkAppStateAndFetchConversations = useCallback(async () => {
    const lastActiveTimestamp = await AsyncStorage.getItem(LAST_ACTIVE_TIMESTAMP_KEY);
    if (lastActiveTimestamp) {
      const currentTimestamp = Date.now();
      const difference = currentTimestamp - parseInt(lastActiveTimestamp);
      if (difference > LAST_ACTIVE_TIMESTAMP_THRESHOLD) {
        clearAndFetchConversations(filters || defaultFilterState);
      }
    }
  }, [clearAndFetchConversations, filters]);

  // Update conversations when app comes to foreground from background
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const routeName = getCurrentRouteName();
        if (routeName && REFRESH_SCREEN_LIST.includes(routeName)) {
          checkAppStateAndFetchConversations();
        }
      }

      if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        // App is going to background
        const currentTimestamp = Date.now();
        AsyncStorage.setItem(LAST_ACTIVE_TIMESTAMP_KEY, currentTimestamp.toString());
      }

      setAppState(nextAppState);
    });
    return () => {
      appStateListener?.remove();
    };
  }, [appState, checkAppStateAndFetchConversations, clearAndFetchConversations, filters]);

  const fetchConversations = useCallback(
    async (filters: FilterState, page: number = 1) => {
      if (isHelpMe) {
        // For Help Me, use the help me conversation actions with label filter
        dispatch(helpMeConversationActions.fetchHelpMeConversations({ page }));
      } else {
        // For regular conversations, use the normal conversation actions
        // Map UI filters to backend parameters
        const labels = filters?.label && filters.label !== 'all' ? [filters.label] : undefined;
        
        // Only pass inbox_id if it's not "0" (all channels) or undefined
        const inboxId = filters?.inbox_id && filters.inbox_id !== '0' ? parseInt(filters.inbox_id) : undefined;

        const conversationFilters = {
          page,
          status: 'all', // Hardcoded
          sort_by: 'last_activity_at_desc', // Hardcoded
          inbox_id: inboxId,
          labels: labels,
        } as ConversationPayload;

        console.log('conversationFilters', conversationFilters);

        dispatch(conversationActions.fetchConversations(conversationFilters));
      }
    },
    [isHelpMe],
  );

  const onChangePageNumber = () => {
    const nextPageNumber = pageNumber + 1;
    setPageNumber(nextPageNumber);
    if (isHelpMe) {
      dispatch(helpMeConversationActions.fetchHelpMeConversations({ page: nextPageNumber }));
    } else {
      fetchConversations(filters, nextPageNumber);
    }
  };

  const handleOnEndReached = () => {
    const shouldLoadMoreConversations =
      isFlashListReady && !isAllConversationsFetched && !isConversationsLoading;
    if (shouldLoadMoreConversations) {
      onChangePageNumber();
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      openedRowIndex.value = -1;
      if (!isFlashListReady) {
        runOnJS(setFlashListReady)(true);
      }
    },
  });

  const shouldShowEmptyLoader = isConversationsLoading && allConversations.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#121213' }}>
      {shouldShowEmptyLoader ? (
        <Animated.View
          style={[
            tailwind.style('flex-1 items-center justify-center', `pb-[${TAB_BAR_HEIGHT}px]`),
          ]}>
          <ActivityIndicator />
        </Animated.View>
      ) : allConversations.length === 0 ? (
        <Animated.ScrollView
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          style={{ flex: 1 }}
          contentContainerStyle={tailwind.style(
            'flex-1 items-center justify-center',
            `pb-[${TAB_BAR_HEIGHT}px]`,
          )}>
          <EmptyStateIcon />
          <Animated.Text style={tailwind.style('pt-6 text-md  tracking-[0.32px] text-gray-800')}>
            {isHelpMe ? 'No help me conversations yet' : i18n.t('CONVERSATION.EMPTY')}
          </Animated.Text>
        </Animated.ScrollView>
      ) : (
        <AnimatedFlashList
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          layout={LinearTransition.springify().damping(18).stiffness(120)}
          showsVerticalScrollIndicator={false}
          data={allConversations}
          estimatedItemSize={91}
          onScroll={scrollHandler}
          onEndReached={handleOnEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooterComponent}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          renderItem={handleRender}
          contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT - 1}px]`)}
        />
      )}
    </View>
  );
};

const ConversationScreen = () => {
  const route = useRoute();
  const currentBottomSheet = useAppSelector(selectBottomSheetState);
  const dispatch = useAppDispatch();

  // Get the isHelpMe flag from route params, default to false
  const isHelpMe = (route.params as any)?.isHelpMe || false;

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 1.2,
    stiffness: 300,
    damping: 50,
  });

  const { filtersModalSheetRef } = useRefsContext();

  const handleOnDismiss = () => {
    /**
     * Resetting the bottoms sheet state to none with a timeout
     * to avoid flickering of bottom sheet
     */
    dispatch(setBottomSheetState('none'));
    dispatch(resetActionState());
  };

  const filterSnapPoints = useMemo(() => {
    switch (currentBottomSheet) {
      case 'assignee_id':
        return [340];
      case 'label':
        return [340];
      case 'inbox_id':
        return ['70%'];
      default:
        return [250];
    }
  }, [currentBottomSheet]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#121213' }}>
      <StatusBar translucent backgroundColor="#121213" barStyle="light-content" />
      <ConversationListStateProvider>
        <View style={{ flex: 1 }}>
          <ConversationHeader isHelpMe={isHelpMe} />
          <ConversationList isHelpMe={isHelpMe} />
        </View>
        {/* Only show filter bar for regular conversations, not Help Me */}
        {!isHelpMe && (
          <BottomSheetModal
            ref={filtersModalSheetRef}
            backdropComponent={BottomSheetBackdrop}
            backgroundComponent={BottomSheetBackground}
            handleIndicatorStyle={tailwind.style(
              'overflow-hidden bg-blackA-A6 w-8 h-1 rounded-[11px]',
            )}
            handleStyle={tailwind.style('p-0 h-4 pt-[5px]')}
            style={tailwind.style('rounded-[26px] overflow-hidden')}
            animationConfigs={animationConfigs}
            enablePanDownToClose
            snapPoints={filterSnapPoints}
            onDismiss={handleOnDismiss}>
            <BottomSheetWrapper>
              {currentBottomSheet === 'assignee_id' ? <AgentFilters /> : null}
              {currentBottomSheet === 'label' ? <LabelFilters /> : null}
              {currentBottomSheet === 'inbox_id' ? <InboxFilters /> : null}
            </BottomSheetWrapper>
          </BottomSheetModal>
        )}
        <ActionBottomSheet />
        <ActionTabs />
      </ConversationListStateProvider>
    </SafeAreaView>
  );
};

export default ConversationScreen;
