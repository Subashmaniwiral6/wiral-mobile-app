import { BaseFilterOption } from '../FilterBar';

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
  {
    type: 'pipeline',
    options: { all: 'All pipelines' },
    defaultFilter: 'All pipelines',
  },
];
