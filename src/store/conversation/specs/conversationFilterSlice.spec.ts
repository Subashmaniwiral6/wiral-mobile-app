import conversationFilterReducer, {
  setFilters,
  resetFilters,
  selectFilters,
  defaultFilterState,
} from '../conversationFilterSlice';
import { RootState } from '@/store';

describe('conversationFilter reducer', () => {
  it('should return initial state', () => {
    expect(conversationFilterReducer(undefined, { type: '' })).toEqual({
      filters: defaultFilterState,
    });
  });

  describe('setFilters', () => {
    it('should update filter value for given key', () => {
      const initialState = {
        filters: defaultFilterState,
      };

      const nextState = conversationFilterReducer(
        initialState,
        setFilters({ key: 'label', value: 'urgent' }),
      );

      expect(nextState.filters.label).toBe('urgent');
      expect(nextState.filters.assignee_id).toBe(defaultFilterState.assignee_id);
      expect(nextState.filters.pipeline).toBe(defaultFilterState.pipeline);
      expect(nextState.filters.inbox_id).toBe(defaultFilterState.inbox_id);
    });
  });

  describe('resetFilters', () => {
    it('should reset filters to default state', () => {
      const modifiedState = {
        filters: {
          ...defaultFilterState,
          label: 'urgent',
          assignee_id: '12',
        },
      };

      const nextState = conversationFilterReducer(modifiedState, resetFilters());

      expect(nextState.filters).toEqual(defaultFilterState);
    });
  });

  describe('selectFilters', () => {
    it('should return filters from state', () => {
      const mockState = {
        conversationFilter: {
          filters: defaultFilterState,
        },
      } as RootState;

      expect(selectFilters(mockState)).toEqual(defaultFilterState);
    });
  });
});
