import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Linking, Platform } from 'react-native';
// We assume react-native-webview will be installed. 
// If not, the user needs to run the installation command.
import { WebView } from 'react-native-webview';
import { colors, spacing } from '../theme';

// TODO: Replace with your actual Wix Store URL
const WIX_STORE_URL = 'https://www.paje.club/pricing-plans/plans-pricing';

export default function StoreScreen({ navigation }) {
    const [loading, setLoading] = useState(true);

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: WIX_STORE_URL }}
                style={styles.webview}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                startInLoadingState={true}
                renderLoading={() => (
                    <ActivityIndicator
                        color={colors.primary}
                        size="large"
                        style={styles.loading}
                    />
                )}
            />

            {/* Fallback Header/Control */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    webview: {
        flex: 1,
        marginTop: 40, // Avoid status bar overlap
    },
    loading: {
        position: 'absolute',
        top: '50%',
        left: '50%',
    },
    header: {
        height: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        paddingHorizontal: spacing.m,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        elevation: 5,
        paddingTop: Platform.OS === 'ios' ? 20 : 0,
    },
    backButton: {
        padding: spacing.s,
    },
    backText: {
        color: colors.textLight, // Assuming textLight exists or white
        color: '#fff',
        fontWeight: 'bold',
    }
});
