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
import { selectAssignableAgents } from '@/store/assignable-agent/assignableAgentSelectors';

type AgentOption = {
  id: string;
  name: string;
};

export const AgentFilters = () => {
  const { filtersModalSheetRef } = useRefsContext();
  const filters = useAppSelector(selectFilters);
  const dispatch = useAppDispatch();
  const assignableAgents = useAppSelector(selectAssignableAgents);
  const hapticSelection = useHaptic();

  const agentOptions: AgentOption[] = useMemo(() => {
    const agentsMap = new Map<string, string>();
    agentsMap.set('all', 'Agents');

    Object.values(assignableAgents).forEach(agentsList => {
      agentsList.forEach(agent => {
        const agentId = agent?.id;
        if (agentId === undefined || agentId === null) return;
        if (agentsMap.has(agentId.toString())) return;
        agentsMap.set(agentId.toString(), agent.name || 'Unnamed agent');
      });
    });

    return Array.from(agentsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [assignableAgents]);

  const handleAgentPress = (value: AgentOption) => {
    hapticSelection?.();
    dispatch(setFilters({ key: 'assignee_id', value: value.id }));
    setTimeout(() => filtersModalSheetRef.current?.dismiss({ overshootClamping: true }), 1);
  };

  return (
    <Animated.View>
      <BottomSheetHeader headerText="Agents" />
      {/* 2025-12-09 thouseef-hamza: Agent filter list replaces legacy assignee type */}
      <Animated.View style={tailwind.style('py-1')}>
        {agentOptions.map((option, index) => (
          <Pressable
            key={option.id}
            onPress={() => handleAgentPress(option)}
            style={tailwind.style('flex flex-row items-center')}>
            <Animated.View
              style={[
                tailwind.style('flex-1 flex-row justify-between py-[11px] px-3'),
                index !== agentOptions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                },
              ]}>
              <Animated.Text
                style={[
                  tailwind.style(
                    'text-base font-inter-420-20 leading-[21px] tracking-[0.16px] capitalize',
                  ),
                  { color: '#E8E9EB' },
                ]}>
                {option.name}
              </Animated.Text>
              {filters.assignee_id === option.id ? <Icon icon={<TickIcon />} size={20} /> : null}
            </Animated.View>
          </Pressable>
        ))}
      </Animated.View>
    </Animated.View>
  );
};
