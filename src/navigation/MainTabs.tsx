import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from '../types';
import { DashboardStack } from './DashboardStack';
import { OrdersStack } from './OrdersStack';
import { CreateStack } from './CreateStack';
import { InvoicesStack } from './InvoicesStack';
import { SettingsStack } from './SettingsStack';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'DashboardTab') iconName = 'home';
          else if (route.name === 'OrdersTab') iconName = 'file-document';
          else if (route.name === 'CreateTab') iconName = 'plus-circle';
          else if (route.name === 'InvoicesTab') iconName = 'receipt';
          else if (route.name === 'SettingsTab') iconName = 'cog';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStack} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="OrdersTab" component={OrdersStack} options={{ title: 'Orders' }} />
      <Tab.Screen name="CreateTab" component={CreateStack} options={{ title: 'Create' }} />
      <Tab.Screen name="InvoicesTab" component={InvoicesStack} options={{ title: 'Invoices' }} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}
