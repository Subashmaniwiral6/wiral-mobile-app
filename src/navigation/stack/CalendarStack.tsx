import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CalendarScreen from '@/screens/calendar/CalendarScreen';

export type CalendarStackParamList = {
  CalendarScreen: undefined;
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export const CalendarStack = () => {
  return (
    <Stack.Navigator initialRouteName="CalendarScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="CalendarScreen"
        component={CalendarScreen}
      />
    </Stack.Navigator>
  );
};

