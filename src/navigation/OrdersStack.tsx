import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersStackParamList } from '../types';
import { OrderListScreen } from '../screens/OrderListScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { EditOrderScreen } from '../screens/EditOrderScreen';
import { CreateOrderScreen } from '../screens/CreateOrderScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStack(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: 'Purchase Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Detail' }} />
      <Stack.Screen name="EditOrder" component={EditOrderScreen} options={{ title: 'Edit Order' }} />
      <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'New Purchase Order' }} />
    </Stack.Navigator>
  );
}
