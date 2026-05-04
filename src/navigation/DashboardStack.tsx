import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { EditOrderScreen } from '../screens/EditOrderScreen';
import { CreateOrderScreen } from '../screens/CreateOrderScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStack(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
      <Stack.Screen name="EditOrder" component={EditOrderScreen} options={{ title: 'Edit Order' }} />
      <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'New Purchase Order' }} />
    </Stack.Navigator>
  );
}
