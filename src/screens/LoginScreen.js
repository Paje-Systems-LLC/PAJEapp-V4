import { useState, useContext } from 'react';
import {
    View, Text, StyleSheet, Alert, KeyboardAvoidingView,
    Platform, ScrollView, TouchableOpacity, Image, Linking, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const { T } = useTheme();
    const S = makeStyles(T);

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
            style={S.root}
        >
            <ScrollView
                contentContainerStyle={S.scroll}
                keyboardShouldPersistTaps="handled"
            >
                <View style={S.card}>

                    {/* Header — logos */}
                    <View style={S.cardHeader}>
                        <Image
                            source={require('../../assets/paje-headdress.png')}
                            style={S.headdress}
                            resizeMode="contain"
                        />
                        <Image
                            source={require('../../assets/paje_systems_light_text.png')}
                            style={S.logoText}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={S.formArea}>

                        {/* Email / Usuário */}
                        <View style={S.fieldWrap}>
                            <Text style={S.label}>Email / Usuário</Text>
                            <View style={S.inputRow}>
                                <Ionicons name="person" size={T.is60 ? 20 : 18} color={T.text.secondary} style={S.inputIcon} />
                                <TextInput
                                    style={S.textInput}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="usuario@email.com"
                                    placeholderTextColor={T.text.disabled}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {/* Senha */}
                        <View style={S.fieldWrap}>
                            <Text style={S.label}>Senha</Text>
                            <View style={S.inputRow}>
                                <Ionicons name="lock-closed" size={T.is60 ? 20 : 18} color={T.text.secondary} style={S.inputIcon} />
                                <TextInput
                                    style={[S.textInput, { flex: 1 }]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={T.text.disabled}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={S.eyeBtn}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={T.is60 ? 20 : 18}
                                        color={T.text.secondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Botão principal */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            style={[S.btnPrimary, loading && { opacity: 0.6 }]}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="log-in" size={T.is60 ? 20 : 18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={S.btnPrimaryText}>
                                {loading ? 'Autenticando...' : 'Acesso ao PAJE club'}
                            </Text>
                        </TouchableOpacity>

                        {/* Link Registro */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Register')}
                            style={S.linkRow}
                        >
                            <Text style={S.linkText}>
                                Ainda não tem conta?{' '}
                                <Text style={S.linkBold}>Criar Grátis</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Divisor */}
                        <View style={S.divider}>
                            <View style={S.dividerLine} />
                            <Text style={S.dividerLabel}>Acesso Alternativo</Text>
                            <View style={S.dividerLine} />
                        </View>

                        {/* SSO Premium */}
                        <TouchableOpacity
                            onPress={handleSSOPremium}
                            style={S.btnSso}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="shield-checkmark" size={T.is60 ? 20 : 18} color={T.text.gold} style={{ marginRight: 8 }} />
                            <Text style={S.btnSsoText}>SSO Premium / Associados PAJE club</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const makeStyles = (T) => StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: T.bg,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: T.spacing.md,
        paddingVertical: T.spacing.xl,
    },
    card: {
        width: '100%',
        maxWidth: 448,
        backgroundColor: T.surface,
        borderRadius: T.radius.lg,
        borderWidth: 1,
        borderColor: T.border,
        overflow: 'hidden',
        shadowColor: T.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: T.isDark ? 0.4 : 0.12,
        shadowRadius: 20,
        elevation: 12,
    },

    cardHeader: {
        backgroundColor: T.bgSubtle,
        borderBottomWidth: 1,
        borderBottomColor: T.border,
        paddingVertical: T.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headdress: {
        width: T.is60 ? 96 : 80,
        height: T.is60 ? 96 : 80,
        marginBottom: T.spacing.sm,
    },
    logoText: {
        width: 160,
        height: 24,
        opacity: 0.9,
    },

    formArea: {
        padding: T.spacing.xl,
    },
    fieldWrap: {
        marginBottom: T.spacing.lg,
    },
    label: {
        fontSize: T.font.sm,
        fontWeight: '500',
        color: T.text.primary,
        marginBottom: T.spacing.xs + 2,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: T.bg,
        borderWidth: 1,
        borderColor: T.border,
        borderRadius: T.radius.md,
        paddingHorizontal: T.spacing.sm + 4,
        height: T.touch.btn,
    },
    inputIcon: {
        marginRight: T.spacing.sm + 2,
    },
    textInput: {
        flex: 1,
        color: T.text.primary,
        fontSize: T.font.base,
        height: '100%',
    },
    eyeBtn: {
        paddingLeft: T.spacing.sm,
    },

    btnPrimary: {
        backgroundColor: T.action.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: T.touch.btn,
        borderRadius: T.radius.md,
        marginTop: T.spacing.sm,
    },
    btnPrimaryText: {
        color: T.action.primaryText,
        fontSize: T.font.base,
        fontWeight: 'bold',
    },

    linkRow: {
        marginTop: T.spacing.md,
        alignItems: 'center',
        minHeight: T.touch.min,
        justifyContent: 'center',
    },
    linkText: {
        fontSize: T.font.sm,
        color: T.text.link,
    },
    linkBold: {
        fontWeight: '600',
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: T.spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: T.border,
    },
    dividerLabel: {
        marginHorizontal: T.spacing.sm + 4,
        fontSize: T.font.xs,
        color: T.text.secondary,
        textTransform: 'uppercase',
        fontWeight: '500',
    },

    btnSso: {
        backgroundColor: T.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: T.touch.btn,
        borderRadius: T.radius.md,
        borderWidth: 1,
        borderColor: T.border,
    },
    btnSsoText: {
        color: T.text.primary,
        fontSize: T.font.base,
        fontWeight: 'bold',
    },
});
