import { RootState } from '@/store';

export const selectHelpMeCount = (state: RootState) => state.helpMe.count;
