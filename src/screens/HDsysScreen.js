import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

// O endpoint HDSys Cloud de produção ou ambiente de testes
const HDSYS_URL = 'https://hdsys.cloud/accounts/login/';

export default function HDsysScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    // Para a v1, apenas abrimos o painel. Conexões com JWT AuthToken avançadas em v2.
    const [url, setUrl] = useState(HDSYS_URL);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Métricas de Risco (HDsys)</Text>
                <View style={{ width: 24 }} /> {/* Balance space */}
            </View>

            <View style={styles.webviewContainer}>
                <WebView
                    source={{ uri: url }}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onError={(syntheticEvent) => {
                        setLoading(false);
                        console.error('WebView Error:', syntheticEvent.nativeEvent);
                    }}
                    style={styles.webview}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Conectando ao Backend de Inteligência...</Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 60,
        backgroundColor: colors.surface,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    webviewContainer: {
        flex: 1,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    }
});
