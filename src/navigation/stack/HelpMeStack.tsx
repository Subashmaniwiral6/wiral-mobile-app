import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConversationScreen from '@/screens/conversations/ConversationScreen';

export type HelpMeStackParamList = {
  HelpMeScreen: { isHelpMe: true };
};

const Stack = createNativeStackNavigator<HelpMeStackParamList>();

export const HelpMeStack = () => {
  return (
    <Stack.Navigator initialRouteName="HelpMeScreen">
      <Stack.Screen
        options={{ headerShown: false }}
        name="HelpMeScreen"
        component={ConversationScreen}
        initialParams={{ isHelpMe: true }}
      />
    </Stack.Navigator>
  );
};
