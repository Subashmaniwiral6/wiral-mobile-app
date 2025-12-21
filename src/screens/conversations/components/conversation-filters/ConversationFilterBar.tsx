import React from 'react';
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectAllInboxes } from '@/store/inbox/inboxSelectors';
import { BottomSheetType, setBottomSheetState } from '@/store/conversation/conversationHeaderSlice';
import { selectFilters } from '@/store/conversation/conversationFilterSlice';
import { BaseFilterOption, FilterBar } from '@/components-next';
import { selectAssignableAgents } from '@/store/assignable-agent/assignableAgentSelectors';
import { selectAllLabels } from '@/store/label/labelSelectors';
import i18n from '@/i18n';

export const ConversationFilterOptions: BaseFilterOption[] = [
  {
    type: 'assignee_id',
    options: { all: 'All agents' },
    defaultFilter: 'All agents',
  },
  {
    type: 'label',
    options: { all: 'All labels' },
    defaultFilter: 'All labels',
  },
];

export const ConversationFilterBar = () => {
  const dispatch = useAppDispatch();
  const inboxes = useAppSelector(selectAllInboxes);
  const selectedFilters = useAppSelector(selectFilters);
  const assignableAgents = useAppSelector(selectAssignableAgents);
  const labels = useAppSelector(selectAllLabels);

  const getInboxOptions = (inboxes: { id: number; name: string }[]) => {
    const options: Record<string, string> = {
      '0': i18n.t('FILTER.ALL_INBOXES'),
    };
    inboxes.forEach(inbox => {
      options[inbox.id] = inbox.name;
    });
    return options;
  };

  const agentOptions = useMemo(() => {
    const options: Record<string, string> = { all: 'All agents' };
    const uniqueAgents = new Map<number, string>();
    Object.values(assignableAgents).forEach(agentsList => {
      agentsList.forEach(agent => {
        if (agent?.id !== undefined && !uniqueAgents.has(agent.id)) {
          uniqueAgents.set(agent.id, agent.name || 'Unknown');
        }
      });
    });
    uniqueAgents.forEach((name, id) => {
      options[id.toString()] = name;
    });
    return options;
  }, [assignableAgents]);

  const labelOptions = useMemo(() => {
    const labelMap: Record<string, string> = { all: 'All labels' };

    labels.forEach(label => {
      const isPipelineTag = !!label.is_pipeline_tag;
      const labelTitle = label.title ?? '';
      if (!labelTitle) return;
      // Only include non-pipeline labels
      if (!isPipelineTag) {
        labelMap[labelTitle] = labelTitle;
      }
    });

    return labelMap;
  }, [labels]);

  const dynamicFilterOptions = [
    {
      ...ConversationFilterOptions[0],
      options: agentOptions,
    },
    {
      ...ConversationFilterOptions[1],
      options: labelOptions,
    },
    {
      type: 'inbox_id' as const,
      options: getInboxOptions(inboxes),
      defaultFilter: i18n.t('FILTER.ALL_INBOXES'),
    },
  ];

  const handleFilterButtonPress = (type: string) => {
    dispatch(setBottomSheetState(type as BottomSheetType));
  };

  return (
    <FilterBar
      allFilters={dynamicFilterOptions}
      selectedFilters={selectedFilters}
      onFilterPress={handleFilterButtonPress}
    />
  );
};
