import { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const C = {
    bg:         '#0A1325',
    card:       '#162136',
    border:     '#1E293B',
    text:       '#E2E8F0',
    textSecond: '#94A3B8',
    gold:       '#D4AF37',
    blue:       '#1E3A8A',
    error:      '#EF4444',
};

const MenuItem = ({ icon, label, sublabel, onPress, color }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.menuIcon, { backgroundColor: (color || C.blue) + '22' }]}>
            <Ionicons name={icon} size={22} color={color || C.blue} />
        </View>
        <View style={styles.menuBody}>
            <Text style={[styles.menuLabel, color && { color }]}>{label}</Text>
            {sublabel ? <Text style={styles.menuSub}>{sublabel}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.textSecond} />
    </TouchableOpacity>
);

export default function ConfigurationScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const { T, setMode, setScale } = useTheme();
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
        <SafeAreaView style={styles.root} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configuração</Text>
                <View style={{ width: 38 }} />
            </View>

            {/* Avatar / Perfil resumido */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={styles.profileName}>{displayName}</Text>
                    <Text style={styles.profileEmail}>{displayEmail}</Text>
                </View>
            </View>

            {/* Menu */}
            <View style={styles.card}>
                <Text style={styles.sectionLabel}>CONTA</Text>

                <MenuItem
                    icon="person-outline"
                    label="Editar Informações da Conta"
                    sublabel="Nome, e-mail, telefone"
                    onPress={() => navigation.navigate('Profile')}
                />
                <MenuItem
                    icon="body-outline"
                    label="Perfil Biométrico"
                    sublabel="Peso, altura, sexo, histórico clínico"
                    onPress={() => navigation.navigate('Profile')}
                />
                <MenuItem
                    icon="shield-checkmark-outline"
                    label="SSO Premium / Associados"
                    sublabel="Acesso avançado PAJE club"
                    onPress={() => navigation.navigate('Store')}
                    color={C.gold}
                />
            </View>

            {/* Aparência */}
            <View style={styles.card}>
                <Text style={styles.sectionLabel}>APARÊNCIA</Text>

                <View style={styles.toggleItem}>
                    <View style={[styles.menuIcon, { backgroundColor: C.blue + '22' }]}>
                        <Ionicons name={T.isDark ? 'moon-outline' : 'sunny-outline'} size={22} color={C.blue} />
                    </View>
                    <View style={styles.menuBody}>
                        <Text style={styles.menuLabel}>{T.isDark ? 'Tema Escuro' : 'Tema Claro'}</Text>
                        <Text style={styles.menuSub}>Alterna entre fundo escuro e claro</Text>
                    </View>
                    <Switch
                        value={T.isDark}
                        onValueChange={v => setMode(v ? 'dark' : 'light')}
                        trackColor={{ false: '#CBD5E1', true: C.blue }}
                        thumbColor={T.isDark ? C.gold : '#f4f3f4'}
                    />
                </View>

                <View style={styles.toggleItem}>
                    <View style={[styles.menuIcon, { backgroundColor: C.gold + '22' }]}>
                        <Ionicons name="text-outline" size={22} color={C.gold} />
                    </View>
                    <View style={styles.menuBody}>
                        <Text style={styles.menuLabel}>Modo Acessibilidade 60+</Text>
                        <Text style={styles.menuSub}>Fonte maior, botões ampliados, alto contraste</Text>
                    </View>
                    <Switch
                        value={T.is60}
                        onValueChange={v => setScale(v ? 'a60' : 'normal')}
                        trackColor={{ false: '#CBD5E1', true: C.gold }}
                        thumbColor={T.is60 ? C.gold : '#f4f3f4'}
                    />
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionLabel}>SISTEMA</Text>

                <MenuItem
                    icon="arrow-back-circle-outline"
                    label="Voltar ao Dashboard"
                    onPress={() => navigation.navigate('Dashboard')}
                />
                <MenuItem
                    icon="log-out-outline"
                    label="Sair (Logout)"
                    sublabel="Encerrar sessão atual"
                    onPress={handleLogout}
                    color={C.error}
                />
            </View>

            {/* Rodapé */}
            <Text style={styles.footer}>HDsys V5  ·  PAJE SYSTEMS  ·  LaMPS</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    backBtn: { padding: 6, backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: C.text },

    profileCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.card, margin: 16, borderRadius: 12,
        borderWidth: 1, borderColor: C.border, padding: 16, gap: 14,
    },
    avatar: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center',
    },
    avatarText:    { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    profileName:   { fontSize: 16, fontWeight: 'bold', color: C.text },
    profileEmail:  { fontSize: 12, color: C.textSecond, marginTop: 2 },

    card: {
        backgroundColor: C.card, borderRadius: 12,
        borderWidth: 1, borderColor: C.border,
        marginHorizontal: 16, marginBottom: 16, overflow: 'hidden',
    },
    sectionLabel: {
        fontSize: 10, fontWeight: '700', color: C.textSecond,
        letterSpacing: 1.5, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
    },

    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        borderTopWidth: 1, borderTopColor: C.border,
    },
    toggleItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        borderTopWidth: 1, borderTopColor: C.border,
    },
    menuIcon: {
        width: 38, height: 38, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    menuBody:  { flex: 1 },
    menuLabel: { fontSize: 14, fontWeight: '600', color: C.text },
    menuSub:   { fontSize: 11, color: C.textSecond, marginTop: 2 },

    footer: { textAlign: 'center', color: C.textSecond, fontSize: 11, marginTop: 8 },
});
