/**
 * WebmailScreen — Webmail paje.email via portal.
 * Domínio fechado: apenas contas @paje.email se comunicam entre si.
 */
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

// poste.io — VPS-LOCAWEB 191.252.222.4 — SSL via Certbot
const WEBMAIL_URL = 'https://mail.paje.email';

const C = {
    bg:     '#0A1325',
    card:   '#162136',
    border: '#1E293B',
    text:   '#E2E8F0',
    second: '#94A3B8',
    blue:   '#3B82F6',
};

export default function WebmailScreen() {
    const [error, setError] = useState(false);
    const [key,   setKey]   = useState(0);

    const retry = () => { setError(false); setKey(k => k + 1); };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <View style={styles.header}>
                <Ionicons name="mail-outline" size={20} color={C.blue} />
                <Text style={styles.headerTitle}>paje.email</Text>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>@paje.email</Text>
                </View>
            </View>

            {error ? (
                <View style={styles.errorWrap}>
                    <Ionicons name="cloud-offline-outline" size={48} color={C.second} />
                    <Text style={styles.errorTitle}>Sem conexão</Text>
                    <Text style={styles.errorText}>
                        O webmail paje.email requer internet.{'\n'}
                        Verifique sua conexão e tente novamente.
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={retry}>
                        <Text style={styles.retryText}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <WebView
                    key={key}
                    source={{ uri: WEBMAIL_URL }}
                    style={{ flex: 1 }}
                    startInLoadingState
                    renderLoading={() => (
                        <View style={styles.loading}>
                            <ActivityIndicator size="large" color={C.blue} />
                            <Text style={styles.loadingText}>Abrindo paje.email…</Text>
                        </View>
                    )}
                    onError={() => setError(true)}
                    onHttpError={() => setError(true)}
                    allowsBackForwardNavigationGestures
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },

    header: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerTitle:     { flex: 1, fontSize: 17, fontWeight: 'bold', color: C.text },
    headerBadge:     { backgroundColor: C.blue + '18', borderRadius: 6, borderWidth: 1, borderColor: C.blue + '55', paddingHorizontal: 8, paddingVertical: 3 },
    headerBadgeText: { fontSize: 9, fontWeight: 'bold', color: C.blue, letterSpacing: 0.5 },

    loading:     { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, gap: 12 },
    loadingText: { fontSize: 13, color: C.second },

    errorWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
    errorTitle: { fontSize: 16, fontWeight: 'bold', color: C.text },
    errorText:  { fontSize: 13, color: C.second, textAlign: 'center', lineHeight: 20 },
    retryBtn:   { marginTop: 8, backgroundColor: C.blue + '22', borderRadius: 10, borderWidth: 1, borderColor: C.blue + '55', paddingHorizontal: 24, paddingVertical: 10 },
    retryText:  { fontSize: 13, fontWeight: 'bold', color: C.blue },
});
