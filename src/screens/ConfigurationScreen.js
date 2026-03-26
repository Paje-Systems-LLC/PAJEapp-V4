import { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const MenuItem = ({ icon, label, sublabel, onPress, T, S, color }) => (
    <TouchableOpacity style={S.menuItem} onPress={onPress} activeOpacity={0.75}>
        <View style={[S.menuIcon, { backgroundColor: (color || T.action.primary) + '22' }]}>
            <Ionicons name={icon} size={T.is60 ? 24 : 22} color={color || T.action.primary} />
        </View>
        <View style={S.menuBody}>
            <Text style={[S.menuLabel, color && { color }]}>{label}</Text>
            {sublabel ? <Text style={S.menuSub}>{sublabel}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={T.text.secondary} />
    </TouchableOpacity>
);

export default function ConfigurationScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const { T, setMode, setScale } = useTheme();
    const S = makeStyles(T);

    const displayName = user?.firstName || user?.name || user?.username || 'Paciente';
    const displayEmail = user?.email || user?.username || '';

    const handleLogout = () => {
        Alert.alert(
            'Sair (Logout)',
            'Deseja encerrar a sessão?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair',     style: 'destructive', onPress: logout },
            ]
        );
    };

    return (
        <SafeAreaView style={S.root} edges={['top']}>
            {/* Header */}
            <View style={S.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={S.backBtn}>
                    <Ionicons name="arrow-back" size={T.is60 ? 24 : 22} color={T.text.primary} />
                </TouchableOpacity>
                <Text style={S.headerTitle}>Configuração</Text>
                <View style={{ width: 38 }} />
            </View>

            {/* Avatar / Perfil resumido */}
            <View style={S.profileCard}>
                <View style={S.avatar}>
                    <Text style={S.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={S.profileName}>{displayName}</Text>
                    <Text style={S.profileEmail}>{displayEmail}</Text>
                </View>
            </View>

            {/* Conta */}
            <View style={S.card}>
                <Text style={S.sectionLabel}>CONTA</Text>
                <MenuItem
                    icon="person-outline"
                    label="Editar Informações da Conta"
                    sublabel="Nome, e-mail, telefone"
                    onPress={() => navigation.navigate('Profile')}
                    T={T} S={S}
                />
                <MenuItem
                    icon="body-outline"
                    label="Perfil Biométrico"
                    sublabel="Peso, altura, sexo, histórico clínico"
                    onPress={() => navigation.navigate('Profile')}
                    T={T} S={S}
                />
                <MenuItem
                    icon="shield-checkmark-outline"
                    label="SSO Premium / Associados"
                    sublabel="Acesso avançado PAJE club"
                    onPress={() => navigation.navigate('Store')}
                    color={T.text.gold}
                    T={T} S={S}
                />
            </View>

            {/* Aparência */}
            <View style={S.card}>
                <Text style={S.sectionLabel}>APARÊNCIA</Text>

                <View style={S.toggleItem}>
                    <View style={[S.menuIcon, { backgroundColor: T.action.primary + '22' }]}>
                        <Ionicons
                            name={T.isDark ? 'moon-outline' : 'sunny-outline'}
                            size={T.is60 ? 24 : 22}
                            color={T.action.primary}
                        />
                    </View>
                    <View style={S.menuBody}>
                        <Text style={S.menuLabel}>{T.isDark ? 'Tema Escuro' : 'Tema Claro'}</Text>
                        <Text style={S.menuSub}>Alterna entre fundo escuro e claro</Text>
                    </View>
                    <Switch
                        value={T.isDark}
                        onValueChange={v => setMode(v ? 'dark' : 'light')}
                        trackColor={{ false: T.border, true: T.action.primary }}
                        thumbColor={T.isDark ? T.text.gold : T.bgSubtle}
                    />
                </View>

                <View style={S.toggleItem}>
                    <View style={[S.menuIcon, { backgroundColor: T.text.gold + '22' }]}>
                        <Ionicons name="text-outline" size={T.is60 ? 24 : 22} color={T.text.gold} />
                    </View>
                    <View style={S.menuBody}>
                        <Text style={S.menuLabel}>Modo Acessibilidade 60+</Text>
                        <Text style={S.menuSub}>Fonte maior, botões ampliados, alto contraste</Text>
                    </View>
                    <Switch
                        value={T.is60}
                        onValueChange={v => setScale(v ? 'a60' : 'normal')}
                        trackColor={{ false: T.border, true: T.text.gold }}
                        thumbColor={T.is60 ? T.text.gold : T.bgSubtle}
                    />
                </View>
            </View>

            {/* Sistema */}
            <View style={S.card}>
                <Text style={S.sectionLabel}>SISTEMA</Text>
                <MenuItem
                    icon="arrow-back-circle-outline"
                    label="Voltar ao Dashboard"
                    onPress={() => navigation.navigate('Dashboard')}
                    T={T} S={S}
                />
                <MenuItem
                    icon="log-out-outline"
                    label="Sair (Logout)"
                    sublabel="Encerrar sessão atual"
                    onPress={handleLogout}
                    color={T.text.error}
                    T={T} S={S}
                />
            </View>

            <Text style={S.footer}>HDsys V5  ·  PAJE SYSTEMS  ·  LaMPS</Text>
        </SafeAreaView>
    );
}

const makeStyles = (T) => StyleSheet.create({
    root: { flex: 1, backgroundColor: T.bg },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: T.spacing.md, paddingVertical: T.spacing.sm + 6,
        borderBottomWidth: 1, borderBottomColor: T.border,
    },
    backBtn: {
        padding: 6, backgroundColor: T.surface,
        borderRadius: T.radius.md, borderWidth: 1, borderColor: T.border,
    },
    headerTitle: { fontSize: T.font.lg, fontWeight: 'bold', color: T.text.primary },

    profileCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: T.surface, margin: T.spacing.md,
        borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.border,
        padding: T.spacing.md, gap: T.spacing.sm + 6,
    },
    avatar: {
        width: T.touch.icon, height: T.touch.icon,
        borderRadius: T.touch.icon / 2,
        backgroundColor: T.action.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText:   { fontSize: T.font.xl, fontWeight: 'bold', color: '#fff' },
    profileName:  { fontSize: T.font.md, fontWeight: 'bold', color: T.text.primary },
    profileEmail: { fontSize: T.font.sm, color: T.text.secondary, marginTop: 2 },

    card: {
        backgroundColor: T.surface, borderRadius: T.radius.lg,
        borderWidth: 1, borderColor: T.border,
        marginHorizontal: T.spacing.md, marginBottom: T.spacing.md, overflow: 'hidden',
    },
    sectionLabel: {
        fontSize: T.font.xs, fontWeight: '700', color: T.text.secondary,
        letterSpacing: 1.5,
        paddingHorizontal: T.spacing.md, paddingTop: T.spacing.sm + 4, paddingBottom: 4,
    },

    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: T.spacing.md, paddingVertical: T.spacing.sm + 6,
        borderTopWidth: 1, borderTopColor: T.border,
        minHeight: T.touch.min,
    },
    toggleItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: T.spacing.md, paddingVertical: T.spacing.sm + 4,
        borderTopWidth: 1, borderTopColor: T.border,
        minHeight: T.touch.min,
    },
    menuIcon: {
        width: T.touch.icon - 6, height: T.touch.icon - 6,
        borderRadius: T.radius.md,
        justifyContent: 'center', alignItems: 'center', marginRight: T.spacing.sm + 4,
    },
    menuBody:  { flex: 1 },
    menuLabel: { fontSize: T.font.base, fontWeight: '600', color: T.text.primary },
    menuSub:   { fontSize: T.font.xs + 1, color: T.text.secondary, marginTop: 2 },

    footer: {
        textAlign: 'center', color: T.text.secondary,
        fontSize: T.font.xs + 1, marginTop: T.spacing.sm,
    },
});
