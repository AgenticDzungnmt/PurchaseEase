import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InvoicesStackParamList } from '../types';
import { InvoiceListScreen } from '../screens/InvoiceListScreen';
import { InvoiceDetailScreen } from '../screens/InvoiceDetailScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<InvoicesStackParamList>();

export function InvoicesStack(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: 'Posted Invoices' }} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: 'Invoice Detail' }} />
    </Stack.Navigator>
  );
}
