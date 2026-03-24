import { useState, useContext } from 'react';
import {
    View, Text, StyleSheet, Alert, KeyboardAvoidingView,
    Platform, ScrollView, TouchableOpacity, Image, Linking, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

// HDsys-V5 Design System — Nano Banana Dark Theme
const C = {
    pageBg:      '#0A1325',
    cardBg:      '#162136',
    cardBorder:  '#1E293B',
    headerBg:    '#0A1325',
    label:       '#CBD5E1',   // slate-300
    inputBg:     '#0A1325',
    inputBorder: '#1E293B',
    inputText:   '#E2E8F0',   // slate-200
    placeholder: '#475569',   // slate-600
    gold:        '#D4AF37',
    btnPrimary:  '#1E3A8A',   // blue-800
    btnPrimaryHover: '#1D4ED8',
    btnSso:      '#0A1325',
    ssoText:     '#CBD5E1',
    dividerText: '#64748B',   // slate-500
    linkText:    '#60A5FA',   // blue-400
    errorBg:     '#FEF2F2',
    errorText:   '#B91C1C',
    errorBorder: '#FECACA',
};

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Aviso', 'Por favor, preencha todos os campos.');
            return;
        }
        setLoading(true);
        try {
            const result = await login(username, password);
            if (!result.success) {
                Alert.alert('Falha no Acesso', result.error || 'Verifique suas credenciais e tente novamente.');
            }
        } catch (error) {
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor HDsys.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSSOPremium = () => {
        Linking.openURL('https://www.paje.club/pricing-plans/plans-pricing').catch(() => {
            Alert.alert('Erro', 'Não foi possível abrir. Verifique sua conexão.');
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.root}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                {/* Card */}
                <View style={styles.card}>

                    {/* Header — logos */}
                    <View style={styles.cardHeader}>
                        <Image
                            source={require('../../assets/paje-headdress.png')}
                            style={styles.headdress}
                            resizeMode="contain"
                        />
                        <Image
                            source={require('../../assets/paje_systems_light_text.png')}
                            style={styles.logoText}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Formulário */}
                    <View style={styles.formArea}>

                        {/* Campo: Email / Usuário */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.label}>Email / Usuário</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="person" size={18} color={C.dividerText} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="usuario@email.com"
                                    placeholderTextColor={C.placeholder}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Campo: Senha */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.label}>Senha</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="lock-closed" size={18} color={C.dividerText} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.textInput, { flex: 1 }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={C.placeholder}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={18}
                                        color={C.dividerText}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* PORTA A — Acesso ao PAJE club */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            style={styles.btnPrimary}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="log-in" size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.btnPrimaryText}>
                                {loading ? 'Autenticando...' : 'Acesso ao PAJE club'}
                            </Text>
                        </TouchableOpacity>

                        {/* Link Registro */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Register')}
                            style={styles.linkRow}
                        >
                            <Text style={styles.linkText}>
                                Ainda não tem conta?{' '}
                                <Text style={styles.linkBold}>Criar Grátis</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Divisor */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerLabel}>Acesso Alternativo</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* PORTA B — SSO Premium */}
                        <TouchableOpacity
                            onPress={handleSSOPremium}
                            style={styles.btnSso}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="shield-checkmark" size={18} color={C.gold} style={{ marginRight: 8 }} />
                            <Text style={styles.btnSsoText}>SSO Premium / Associados PAJE club</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.pageBg,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 32,
    },
    card: {
        width: '100%',
        maxWidth: 448,
        backgroundColor: C.cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: C.cardBorder,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
    },

    /* Header */
    cardHeader: {
        backgroundColor: C.headerBg,
        borderBottomWidth: 1,
        borderBottomColor: C.cardBorder,
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headdress: {
        width: 80,
        height: 80,
        marginBottom: 12,
    },
    logoText: {
        width: 160,
        height: 24,
        opacity: 0.9,
    },

    /* Formulário */
    formArea: {
        padding: 32,
    },
    fieldWrap: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: C.label,
        marginBottom: 6,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.inputBg,
        borderWidth: 1,
        borderColor: C.inputBorder,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        color: C.inputText,
        fontSize: 15,
        height: '100%',
    },
    eyeBtn: {
        paddingLeft: 8,
    },

    /* PORTA A */
    btnPrimary: {
        backgroundColor: C.btnPrimary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 8,
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },

    /* Link */
    linkRow: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 13,
        color: C.linkText,
    },
    linkBold: {
        fontWeight: '600',
    },

    /* Divisor */
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.cardBorder,
    },
    dividerLabel: {
        marginHorizontal: 12,
        fontSize: 11,
        color: C.dividerText,
        textTransform: 'uppercase',
        fontWeight: '500',
    },

    /* PORTA B */
    btnSso: {
        backgroundColor: C.btnSso,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.cardBorder,
    },
    btnSsoText: {
        color: C.ssoText,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
