import { useState, useContext } from 'react';
import {
    View, Text, StyleSheet, Alert, KeyboardAvoidingView,
    Platform, ScrollView, TouchableOpacity, Image, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import ConsentModal from '../components/ConsentModal';

// HDsys-V5 Design System — Nano Banana Dark Theme
const C = {
    pageBg:      '#0A1325',
    cardBg:      '#162136',
    cardBorder:  '#1E293B',
    headerBg:    '#0A1325',
    label:       '#CBD5E1',
    inputBg:     '#0A1325',
    inputBorder: '#1E293B',
    inputText:   '#E2E8F0',
    placeholder: '#475569',
    gold:        '#D4AF37',
    btnPrimary:  '#1E3A8A',
    ssoText:     '#CBD5E1',
    dividerText: '#64748B',
    linkText:    '#60A5FA',
    errorText:   '#F87171',
};

// Field fora do componente principal para evitar re-mount a cada keystroke
const Field = ({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, secure, showPw, togglePw }) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputRow}>
            <TextInput
                style={[styles.textInput, secure && { flex: 1 }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={C.placeholder}
                keyboardType={keyboardType || 'default'}
                autoCapitalize={autoCapitalize || 'none'}
                secureTextEntry={secure && !showPw}
            />
            {secure && (
                <TouchableOpacity onPress={togglePw} style={styles.eyeBtn}>
                    <Ionicons name={showPw ? 'eye-off' : 'eye'} size={18} color={C.dividerText} />
                </TouchableOpacity>
            )}
        </View>
    </View>
);

export default function RegisterScreen({ navigation }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [loading, setLoading]           = useState(false);
    const [showConsent, setShowConsent]   = useState(false);

    const { register } = useContext(AuthContext);

    const handleRegister = () => {
        if (!email || !password || !firstName || !lastName) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios (*).');
            return;
        }
        if (password !== password2) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }
        // Abre modal de consentimento antes de criar conta
        setShowConsent(true);
    };

    const handleConsentAccept = async (consentData) => {
        setShowConsent(false);
        setLoading(true);
        try {
            const res = await register(email, password, firstName, lastName, phone, consentData);
            if (res.success) {
                Alert.alert(
                    'Conta criada!',
                    'Cadastro realizado com sucesso. Faça login para continuar.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('Falha no Cadastro', res.error || 'Erro desconhecido ao cadastrar.');
            }
        } catch (error) {
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua internet.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConsentModal
            visible={showConsent}
            onAccept={handleConsentAccept}
            onCancel={() => setShowConsent(false)}
        />
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

                    {/* Header */}
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
                        <Text style={styles.headerSub}>Criar conta — HDsys</Text>
                    </View>

                    {/* Formulário */}
                    <View style={styles.formArea}>

                        <Field label="Nome *" value={firstName} onChangeText={setFirstName}
                            placeholder="Seu nome" autoCapitalize="words" />
                        <Field label="Sobrenome *" value={lastName} onChangeText={setLastName}
                            placeholder="Seu sobrenome" autoCapitalize="words" />
                        <Field label="E-mail *" value={email} onChangeText={setEmail}
                            placeholder="usuario@email.com" keyboardType="email-address" />
                        <Field label="Telefone" value={phone} onChangeText={setPhone}
                            placeholder="(00) 00000-0000" keyboardType="phone-pad" />
                        <Field label="Senha *" value={password} onChangeText={setPassword}
                            placeholder="••••••••" secure showPw={showPassword}
                            togglePw={() => setShowPassword(!showPassword)} />
                        <Field label="Confirmar Senha *" value={password2} onChangeText={setPassword2}
                            placeholder="••••••••" secure showPw={showPassword2}
                            togglePw={() => setShowPassword2(!showPassword2)} />

                        {/* Botão principal */}
                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            style={styles.btnPrimary}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.btnPrimaryText}>
                                {loading ? 'Registrando...' : 'Criar Conta Grátis'}
                            </Text>
                        </TouchableOpacity>

                        {/* Link login */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.linkRow}
                        >
                            <Text style={styles.linkText}>
                                Já tem uma conta?{' '}
                                <Text style={styles.linkBold}>Fazer Login</Text>
                            </Text>
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
        paddingVertical: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headdress: {
        width: 64,
        height: 64,
        marginBottom: 10,
    },
    logoText: {
        width: 140,
        height: 20,
        opacity: 0.9,
        marginBottom: 8,
    },
    headerSub: {
        fontSize: 13,
        color: C.dividerText,
        marginTop: 4,
    },

    /* Formulário */
    formArea: {
        padding: 32,
    },
    fieldWrap: {
        marginBottom: 18,
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
    textInput: {
        flex: 1,
        color: C.inputText,
        fontSize: 15,
        height: '100%',
    },
    eyeBtn: {
        paddingLeft: 8,
    },

    /* Checkboxes */
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: C.inputBorder,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: C.inputBg,
    },
    checkboxOn: {
        backgroundColor: C.btnPrimary,
        borderColor: C.btnPrimary,
    },
    checkLabel: {
        fontSize: 13,
        color: C.label,
        flex: 1,
    },
    checkLink: {
        color: C.gold,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    /* Botão principal */
    btnPrimary: {
        backgroundColor: C.btnPrimary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 12,
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },

    /* Link */
    linkRow: {
        marginTop: 18,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 13,
        color: C.linkText,
    },
    linkBold: {
        fontWeight: '600',
    },
});
