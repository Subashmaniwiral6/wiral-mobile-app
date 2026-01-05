import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HelpMeState {
  count: number;
}

const initialState: HelpMeState = {
  count: 0,
};

const helpMeSlice = createSlice({
  name: 'helpMe',
  initialState,
  reducers: {
    setHelpMeCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    incrementHelpMeCount: state => {
      state.count += 1;
    },
    decrementHelpMeCount: state => {
      if (state.count > 0) {
        state.count -= 1;
      }
    },
    resetHelpMeCount: state => {
      state.count = 0;
    },
  },
});

export const { setHelpMeCount, incrementHelpMeCount, decrementHelpMeCount, resetHelpMeCount } =
  helpMeSlice.actions;
export default helpMeSlice.reducer;
