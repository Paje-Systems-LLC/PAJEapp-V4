/**
 * CarteirinhaScreen — Cartão de associado PAJE club.
 * Layout: imagem do sistema, nome do plano, dados do membro,
 * pontos de participação e QR code de validação.
 */
import { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, StatusBar, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

// Imagem do sistema conforme plano
const PLAN_IMAGE = {
    'hdsys-premium': require('../../assets/hdsys.png'),
    free:            require('../../assets/hdsys.png'),
    gravsys:         require('../../assets/gravsys.png'),
    pedsys:          require('../../assets/pedsys.png'),
};

const PLAN_LABEL = {
    'hdsys-premium': 'HDsys Premium',
    free:            'Projeto HDsys',
    gravsys:         'GRAVsys',
    pedsys:          'PEDsys',
};

const C = {
    bg:      '#0A1325',
    border:  '#1E293B',
    text:    '#1E293B',
    textSub: '#64748B',
    green:   '#22C55E',
    gold:    '#D4AF37',
    white:   '#FFFFFF',
    cardBg:  '#F8FAFC',
};

const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const addDays = (iso, days) => {
    if (!iso) return null;
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return d.toISOString();
};

export default function CarteirinhaScreen({ navigation }) {
    const { user } = useContext(AuthContext);

    const plan      = user?.plan || 'free';
    const planLabel = PLAN_LABEL[plan] || 'Projeto HDsys';
    const planImg   = PLAN_IMAGE[plan] || PLAN_IMAGE.free;
    const planColor = plan === 'hdsys-premium' ? C.gold : C.green;

    // Nome mascarado para privacidade — asteriscos conforme tamanho real
    const nomeReal = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || '';
    const nomeMask = nomeReal ? '*'.repeat(Math.max(nomeReal.length, 12)) : '***************';
    const username = user?.username || 'membro';
    // QR traz identificação única para escaneamento por profissionais e clínicas parceiras
    const qrValue  = `pajeclub://member/${username}`;

    const [joinDate,    setJoinDate]    = useState(user?.dateJoined || null);
    // Pontos: critérios futuros (indicações, pagamentos, compras, etc.)
    // Alimentado via API dedicada — por ora reservado como 0
    const [points,      setPoints]      = useState(0);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            api.get('/account/api/profile/'),
            // TODO: api.get('/api/pontos/') — endpoint futuro de gamificação
        ]).then(([profileRes]) => {
            if (profileRes.status === 'fulfilled') {
                const d = profileRes.value.data;
                if (d.date_joined) setJoinDate(d.date_joined);
                if (d.points != null) setPoints(d.points);
            }
        }).finally(() => setLoadingData(false));
    }, []);

    const validadeIso = addDays(joinDate, 365);

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#E2E8F0" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cartão de associado</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {loadingData ? (
                    <ActivityIndicator size="large" color={planColor} style={{ marginTop: 60 }} />
                ) : (
                    /* ── Cartão ── */
                    <View style={[styles.card, { borderColor: planColor }]}>

                        {/* Imagem do sistema — preenche todo o retângulo */}
                        <View style={styles.systemImgWrap}>
                            <Image source={planImg} style={styles.systemImg} resizeMode="cover" />
                            <View style={styles.systemImgOverlay} />
                            <Text style={styles.systemImgLabel}>
                                Sistema de monitoramento {planLabel}
                            </Text>
                        </View>

                        <View style={styles.cardBody}>

                            {/* Nome do plano */}
                            <View style={[styles.planNameBox, { borderColor: planColor }]}>
                                <Text style={[styles.planNameText, { color: planColor }]}>
                                    {planLabel}
                                </Text>
                            </View>

                            {/* Dados do membro */}
                            <View style={styles.memberData}>
                                <View style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>Nome:</Text>
                                    <Text style={styles.dataValue}>{nomeMask}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>Associado em:</Text>
                                    <Text style={styles.dataValue}>{formatDate(joinDate)}</Text>
                                </View>
                                <View style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>Validade:</Text>
                                    <Text style={styles.dataValue}>{formatDate(validadeIso)}</Text>
                                </View>
                            </View>

                            {/* Pontos + QR Code */}
                            <View style={styles.bottomRow}>
                                <View style={[styles.pointsBox, { borderColor: planColor }]}>
                                    <Text style={[styles.pointsLabel, { color: planColor }]}>Pontos</Text>
                                    <Text style={[styles.pointsValue, { color: planColor }]}>{points}</Text>
                                </View>
                                <View style={styles.qrWrap}>
                                    <QRCode
                                        value={qrValue}
                                        size={80}
                                        color={C.text}
                                        backgroundColor={C.cardBg}
                                    />
                                </View>
                            </View>

                        </View>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 20, paddingBottom: 40, alignItems: 'center' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#1E293B',
    },
    backBtn:     { padding: 6 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#E2E8F0' },

    /* ── Cartão ── */
    card: {
        width: '100%', maxWidth: 340,
        backgroundColor: C.cardBg,
        borderRadius: 18, borderWidth: 2,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },

    /* Imagem do sistema */
    systemImgWrap: {
        height: 200,
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'hidden',
    },
    systemImg: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    systemImgOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10,19,37,0.45)',
    },
    systemImgLabel: {
        fontSize: 13, color: 'rgba(255,255,255,0.85)',
        textAlign: 'center', lineHeight: 18,
        paddingHorizontal: 16, paddingBottom: 14,
        zIndex: 1,
    },

    cardBody: { padding: 20, gap: 16 },

    /* Nome do plano */
    planNameBox: {
        borderWidth: 2, borderRadius: 8,
        paddingVertical: 8, paddingHorizontal: 16,
        alignItems: 'center',
    },
    planNameText: { fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },

    /* Dados */
    memberData: { gap: 6 },
    dataRow:    { flexDirection: 'row', gap: 6 },
    dataLabel:  { fontSize: 13, color: C.textSub, fontWeight: '600', minWidth: 95 },
    dataValue:  { fontSize: 13, color: C.text, flex: 1 },

    /* Bottom: pontos + QR */
    bottomRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginTop: 4,
    },
    pointsBox: {
        borderWidth: 2, borderRadius: 10,
        paddingHorizontal: 20, paddingVertical: 10,
        alignItems: 'center', minWidth: 90,
    },
    pointsLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    pointsValue: { fontSize: 28, fontWeight: 'bold', lineHeight: 34 },

    qrWrap: {
        backgroundColor: C.cardBg,
        borderRadius: 8, padding: 4,
    },
});
