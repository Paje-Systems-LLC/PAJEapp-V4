import { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen          from '../screens/LoginScreen';
import RegisterScreen       from '../screens/RegisterScreen';
import DashboardScreen      from '../screens/DashboardScreen';
import AddMeasurementScreen from '../screens/AddMeasurementScreen';
import GaugeScreen          from '../screens/GaugeScreen';
import HistoryScreen        from '../screens/HistoryScreen';
import ConfigurationScreen  from '../screens/ConfigurationScreen';
import ProfileScreen        from '../screens/ProfileScreen';
import VariacaoScreen       from '../screens/VariacaoScreen';
import StoreScreen          from '../screens/StoreScreen';
import AboutLampsScreen     from '../screens/AboutLampsScreen';
import AnalyticsScreen      from '../screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { loading, sessionToken } = useContext(AuthContext);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1325' }}>
                <ActivityIndicator size="large" color="#D4AF37" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {sessionToken == null ? (
                <>
                    <Stack.Screen name="Login"    component={LoginScreen}    />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Dashboard"      component={DashboardScreen}      />
                    <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />
                    <Stack.Screen name="Gauge"          component={GaugeScreen}          />
                    <Stack.Screen name="History"        component={HistoryScreen}        />
                    <Stack.Screen name="Configuration"  component={ConfigurationScreen}  />
                    <Stack.Screen name="Profile"        component={ProfileScreen}        />
                    <Stack.Screen name="Store"          component={StoreScreen}          />
                    <Stack.Screen name="AboutLamps"     component={AboutLampsScreen}     />
                    <Stack.Screen name="Analytics"      component={AnalyticsScreen}      />
                    <Stack.Screen name="Variacao"       component={VariacaoScreen}       />
                </>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
