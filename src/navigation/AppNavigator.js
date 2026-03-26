import { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen               from '../screens/LoginScreen';
import RegisterScreen            from '../screens/RegisterScreen';
import PAJEClubHomeScreen        from '../screens/PAJEClubHomeScreen';
import CarteirinhaScreen         from '../screens/CarteirinhaScreen';
import GRAVsysPreviewScreen      from '../screens/GRAVsysPreviewScreen';
import PEDsysPreviewScreen       from '../screens/PEDsysPreviewScreen';
import HDsysPremiumPreviewScreen from '../screens/HDsysPremiumPreviewScreen';
import DashboardScreen           from '../screens/DashboardScreen';
import AddMeasurementScreen      from '../screens/AddMeasurementScreen';
import GaugeScreen               from '../screens/GaugeScreen';
import HistoryScreen             from '../screens/HistoryScreen';
import ConfigurationScreen       from '../screens/ConfigurationScreen';
import ProfileScreen             from '../screens/ProfileScreen';
import AboutLampsScreen          from '../screens/AboutLampsScreen';
import AnalyticsScreen           from '../screens/AnalyticsScreen';
import VariacaoScreen            from '../screens/VariacaoScreen';
import ProfissionaisScreen       from '../screens/ProfissionaisScreen';
import StoreScreen               from '../screens/StoreScreen';
import AjudaScreen               from '../screens/AjudaScreen';
import WebmailScreen             from '../screens/WebmailScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const NO_HEADER = { headerShown: false };

const TAB_BAR = {
    tabBarStyle: {
        backgroundColor: '#0A1325',
        borderTopColor: '#1E293B',
        borderTopWidth: 1,
        height: 72,
        paddingBottom: 10,
        paddingTop: 8,
    },
    tabBarActiveTintColor:   '#D4AF37',
    tabBarInactiveTintColor: '#94A3B8',
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    headerShown: false,
};

// ── Stacks individuais ─────────────────────────────────────────

function InicioStack() {
    return (
        <Stack.Navigator screenOptions={NO_HEADER}>
            <Stack.Screen name="PAJEClubHome"        component={PAJEClubHomeScreen}        />
            <Stack.Screen name="Carteirinha"         component={CarteirinhaScreen}         />
            <Stack.Screen name="GRAVsysPreview"      component={GRAVsysPreviewScreen}      />
            <Stack.Screen name="PEDsysPreview"        component={PEDsysPreviewScreen}       />
            <Stack.Screen name="HDsysPremiumPreview"  component={HDsysPremiumPreviewScreen} />
        </Stack.Navigator>
    );
}

function LaMPSStack() {
    return (
        <Stack.Navigator screenOptions={NO_HEADER}>
            <Stack.Screen name="Dashboard"      component={DashboardScreen}      />
            <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />
            <Stack.Screen name="Gauge"          component={GaugeScreen}          />
            <Stack.Screen name="History"        component={HistoryScreen}        />
            <Stack.Screen name="Configuration"  component={ConfigurationScreen}  />
            <Stack.Screen name="Profile"        component={ProfileScreen}        />
            <Stack.Screen name="AboutLamps"     component={AboutLampsScreen}     />
            <Stack.Screen name="Analytics"      component={AnalyticsScreen}      />
            <Stack.Screen name="Variacao"       component={VariacaoScreen}       />
        </Stack.Navigator>
    );
}

function ProfissionaisStack() {
    return (
        <Stack.Navigator screenOptions={NO_HEADER}>
            <Stack.Screen name="Profissionais" component={ProfissionaisScreen} />
        </Stack.Navigator>
    );
}

function LojaStack() {
    return (
        <Stack.Navigator screenOptions={NO_HEADER}>
            <Stack.Screen name="Store" component={StoreScreen} />
        </Stack.Navigator>
    );
}

function AjudaStack() {
    return (
        <Stack.Navigator screenOptions={NO_HEADER}>
            <Stack.Screen name="Ajuda" component={AjudaScreen} />
        </Stack.Navigator>
    );
}

function WebmailStack() {
    return (
        <Stack.Navigator screenOptions={NO_HEADER}>
            <Stack.Screen name="Webmail" component={WebmailScreen} />
        </Stack.Navigator>
    );
}

// ── Tab Navigator ──────────────────────────────────────────────

function MainTabs() {
    return (
        <Tab.Navigator screenOptions={TAB_BAR}>
            <Tab.Screen
                name="Início"
                component={InicioStack}
                options={{
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="home-outline" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="LaMPS"
                component={LaMPSStack}
                options={{
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="school-outline" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Profissionais"
                component={ProfissionaisStack}
                options={{
                    tabBarLabel: 'Profiss.',
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="people-outline" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Loja"
                component={LojaStack}
                options={{
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="bag-outline" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Ajuda"
                component={AjudaStack}
                options={{
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="help-circle-outline" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Webmail"
                component={WebmailStack}
                options={{
                    tabBarIcon: ({ color, size }) =>
                        <Ionicons name="mail-outline" size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

// ── Auth Stack ─────────────────────────────────────────────────

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
        <Stack.Navigator screenOptions={NO_HEADER}>
            {sessionToken == null ? (
                <>
                    <Stack.Screen name="Login"    component={LoginScreen}    />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : (
                <Stack.Screen name="Main" component={MainTabs} />
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
