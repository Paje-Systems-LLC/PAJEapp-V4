import { useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, StatusBar, Image, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

// ── Assets ──
const IMG = {
    hero:    require('../../assets/Foto_Principal_PAJEclub.png'),
    logo:    require('../../assets/paje-headdress.png'),
    hdsys:   require('../../assets/hdsys.png'),
    gravsys: require('../../assets/gravsys.png'),
    pedsys:  require('../../assets/pedsys.png'),
};

// ── Paleta ──
const C = {
    bg:          '#0A1325',
    card:        '#162136',
    border:      '#1E293B',
    textPrimary: '#E2E8F0',
    textSecond:  '#94A3B8',
    gold:        '#D4AF37',
    blue:        '#1E3A8A',
};

const MODULES = [
    {
        key:         'hdsys_free',
        name:        'Projeto HDsys',
        tag:         'FREE',
        tagBg:       'rgba(34,197,94,0.18)',
        tagBorder:   'rgba(34,197,94,0.45)',
        tagColor:    '#22C55E',
        borderColor: '#22C55E',
        description: 'Monitoramento da Pressão Arterial com classificação SBC 2025.',
        image:       IMG.hdsys,
        available:   true,
        screen:      'Dashboard',
    },
    {
        key:         'hdsys',
        name:        'HDsys',
        tag:         'ASSOCIADO',
        tagBg:       'rgba(212,175,55,0.18)',
        tagBorder:   'rgba(212,175,55,0.45)',
        tagColor:    '#D4AF37',
        borderColor: '#D4AF37',
        description: 'Monitoramento avançado com relatórios clínicos, IA preditiva e acompanhamento médico.',
        image:       IMG.hdsys,
        available:   true,
        screen:      'HDsysPremiumPreview',
    },
    {
        key:         'gravsys',
        name:        'GRAVsys',
        tag:         'ASSOCIADO',
        tagBg:       'rgba(236,72,153,0.18)',
        tagBorder:   'rgba(236,72,153,0.45)',
        tagColor:    '#EC4899',
        borderColor: '#EC4899',
        description: 'Saúde na gestação. Monitoramento pré-natal, alertas e acompanhamento obstétrico.',
        image:       IMG.gravsys,
        available:   true,
        screen:      'GRAVsysPreview',
    },
    {
        key:         'pedsys',
        name:        'PEDsys',
        tag:         'ASSOCIADO',
        tagBg:       'rgba(96,165,250,0.18)',
        tagBorder:   'rgba(96,165,250,0.45)',
        tagColor:    '#60A5FA',
        borderColor: '#60A5FA',
        description: 'Saúde pediátrica. Curvas de crescimento, vacinação e acompanhamento infantil.',
        image:       IMG.pedsys,
        available:   true,
        screen:      'PEDsysPreview',
    },
];

export default function PAJEClubHomeScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const displayName = user?.firstName || user?.username || 'Bem-vindo';

    const handleModule = (mod) => {
        if (!mod.available || !mod.screen) return;
        if (mod.screen === 'Dashboard') {
            // Dashboard está na aba LaMPS
            navigation.navigate('LaMPS');
        } else {
            navigation.navigate(mod.screen);
        }
    };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#0A1325" />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>


                {/* ── Hero — foto com overlay escuro ── */}
                <ImageBackground
                    source={IMG.hero}
                    style={styles.hero}
                    imageStyle={styles.heroImage}
                    resizeMode="cover"
                >
                    {/* Overlay gradiente */}
                    <View style={styles.heroOverlay} />

                    {/* Conteúdo sobre a foto */}
                    <View style={styles.heroContent}>
                        <Image source={IMG.logo} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.appName}>PAJE club</Text>
                        <Text style={styles.tagline}>
                            Um clube de saúde integrando pacientes a{'\n'}profissionais de saúde, com inteligência.
                        </Text>
                        <View style={styles.greetPill}>
                            <Ionicons name="person-circle-outline" size={14} color={C.textSecond} />
                            <Text style={styles.greetText}>  {displayName}</Text>
                        </View>
                    </View>
                </ImageBackground>

                {/* ── Label seção ── */}
                <View style={styles.sectionRow}>
                    <View style={styles.sectionLine} />
                    <Text style={styles.sectionLabel}>MÓDULOS DE SAÚDE</Text>
                    <View style={styles.sectionLine} />
                </View>

                {/* ── 4 Módulos ── */}
                {MODULES.map((mod) => (
                    <TouchableOpacity
                        key={mod.key}
                        style={[styles.moduleCard, { borderLeftColor: mod.borderColor }]}
                        onPress={() => handleModule(mod)}
                        activeOpacity={mod.available ? 0.78 : 0.92}
                    >
                        {/* Conteúdo esquerdo */}
                        <View style={styles.moduleLeft}>
                            {/* Nome + Tag */}
                            <View style={styles.moduleNameRow}>
                                <Text style={[
                                    styles.moduleName,
                                    { color: mod.available ? C.textPrimary : C.textSecond },
                                ]}>
                                    {mod.name}
                                </Text>
                                <View style={[styles.tag, { backgroundColor: mod.tagBg, borderColor: mod.tagBorder }]}>
                                    <Text style={[styles.tagText, { color: mod.tagColor }]}>{mod.tag}</Text>
                                </View>
                            </View>

                            {/* Descrição */}
                            <Text style={styles.moduleDesc} numberOfLines={2}>
                                {mod.description}
                            </Text>

                            {/* Ação */}
                            {mod.available ? (
                                <View style={styles.actionRow}>
                                    <Text style={[styles.actionText, { color: mod.borderColor }]}>Acessar</Text>
                                    <Ionicons name="chevron-forward" size={13} color={mod.borderColor} />
                                </View>
                            ) : (
                                <Text style={styles.comingSoon}>Em breve · Associação necessária</Text>
                            )}
                        </View>

                        {/* Imagem direita com overlay colorido */}
                        <View style={[styles.moduleImageWrap, { borderColor: mod.borderColor + '40' }]}>
                            <Image source={mod.image} style={styles.moduleImage} resizeMode="cover" />
                            {/* Tint overlay da cor do sistema */}
                            <View style={[styles.moduleImageTint, { backgroundColor: mod.borderColor + '22' }]} />
                            {/* Cadeado se bloqueado */}
                            {!mod.available && (
                                <View style={styles.lockOverlay}>
                                    <Ionicons name="lock-closed" size={18} color="rgba(255,255,255,0.6)" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* ── Rodapé ── */}
                <View style={styles.footer}>
                    <Image source={IMG.logo} style={styles.footerLogo} resizeMode="contain" />
                    <Text style={styles.footerText}>PAJE Systems LLC  ·  Powered by HDsys.cloud</Text>
                </View>

            </ScrollView>

            {/* ── FAB Carteirinha ── */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Carteirinha')}
                activeOpacity={0.85}
            >
                <Ionicons name="person" size={20} color="#fff" />
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.bg },
    scroll: { paddingBottom: 80 },

    /* ── Hero ── */
    hero: {
        height: 220,
        width: '100%',
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    heroImage: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10,19,37,0.68)',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    heroContent: {
        alignItems: 'center',
        paddingBottom: 28,
        paddingHorizontal: 20,
    },
    logo: {
        width: 60, height: 60, marginBottom: 8,
    },
    appName: {
        fontSize: 32, fontWeight: 'bold', color: '#FFFFFF',
        letterSpacing: 2,
        textShadowColor: 'rgba(212,175,55,0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    tagline: {
        fontSize: 13, color: 'rgba(226,232,240,0.85)',
        textAlign: 'center', lineHeight: 20,
        marginTop: 8, marginBottom: 14,
    },
    greetPill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(22,33,54,0.80)',
        borderRadius: 20, borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 12, paddingVertical: 5,
    },
    greetText: { fontSize: 12, color: C.textSecond },

    /* ── FAB Carteirinha ── */
    fab: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: C.gold,
        justifyContent: 'center', alignItems: 'center',
        elevation: 6,
        shadowColor: C.gold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },

    /* ── Seção ── */
    sectionRow: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginTop: 22, marginBottom: 14,
    },
    sectionLine: { flex: 1, height: 1, backgroundColor: C.border },
    sectionLabel: {
        fontSize: 10, fontWeight: 'bold', color: C.textSecond,
        letterSpacing: 1.5, marginHorizontal: 10,
    },

    /* ── Cards de módulo ── */
    moduleCard: {
        flexDirection: 'row',
        backgroundColor: C.card,
        borderRadius: 14, borderWidth: 1,
        borderColor: C.border, borderLeftWidth: 4,
        marginHorizontal: 16, marginBottom: 12,
        overflow: 'hidden', height: 112,
    },

    /* Lado esquerdo */
    moduleLeft: {
        flex: 1, padding: 14, justifyContent: 'space-between',
    },
    moduleNameRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6,
    },
    moduleName: {
        fontSize: 16, fontWeight: 'bold', letterSpacing: 0.3,
    },
    tag: {
        borderRadius: 4, borderWidth: 1,
        paddingHorizontal: 6, paddingVertical: 2,
    },
    tagText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.8 },
    moduleDesc: {
        fontSize: 11, color: C.textSecond, lineHeight: 17, flex: 1,
    },
    actionRow: {
        flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 2,
    },
    actionText: { fontSize: 12, fontWeight: '700' },
    comingSoon: {
        fontSize: 10, color: C.textSecond,
        fontStyle: 'italic', marginTop: 6,
    },

    /* Lado direito — imagem */
    moduleImageWrap: {
        width: 100,
        height: 112,
        borderLeftWidth: 1,
        overflow: 'hidden',
    },
    moduleImage: {
        width: 100,
        height: 112,
    },
    moduleImageTint: {
        ...StyleSheet.absoluteFillObject,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10,19,37,0.55)',
        justifyContent: 'center', alignItems: 'center',
    },

    /* ── Rodapé ── */
    footer: {
        alignItems: 'center', marginTop: 20, paddingBottom: 4,
    },
    footerLogo: { width: 32, height: 32, opacity: 0.35, marginBottom: 6 },
    footerText: { fontSize: 10, color: C.border, letterSpacing: 0.3 },
});
