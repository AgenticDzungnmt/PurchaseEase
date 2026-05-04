import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreateStackParamList } from '../types';
import { CreateOrderScreen } from '../screens/CreateOrderScreen';
import { ScanDocumentScreen } from '../screens/ScanDocumentScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<CreateStackParamList>();

export function CreateStack(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'New Purchase Order' }} />
      <Stack.Screen name="ScanDocument" component={ScanDocumentScreen} options={{ title: 'Scan Document' }} />
    </Stack.Navigator>
  );
}
