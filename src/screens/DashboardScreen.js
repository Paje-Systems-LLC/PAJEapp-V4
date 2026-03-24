import { useState, useEffect, useContext, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, RefreshControl, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import GaugeChart, { getPAMClass, getPAMMessage } from '../components/hdsys/GaugeChart';

// HDsys-V5 Nano Banana Dark Theme
const C = {
    bg:          '#0A1325',
    card:        '#162136',
    border:      '#1E293B',
    textPrimary: '#E2E8F0',
    textSecond:  '#94A3B8',
    gold:        '#D4AF37',
    blue:        '#1E3A8A',
    accent:      '#A5C9EB',
};

const PERIODS = ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'];
const PERIOD_DAYS = { Semanal: 7, Mensal: 30, Trimestral: 90, Semestral: 180, Anual: 365 };


export default function DashboardScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const displayName = user?.firstName || user?.name || user?.username || 'Paciente';
    const isFocused = useIsFocused();

    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [allData, setAllData]         = useState([]);
    const [period, setPeriod]           = useState('Semanal');

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/api/history/');
            const results = res.data.results || res.data;
            setAllData(Array.isArray(results) ? results : []);
        } catch {
            setAllData([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { if (isFocused) { setLoading(true); fetchData(); } }, [isFocused]);

    // Filter data by selected period
    const filteredData = allData.filter(item => {
        const days = PERIOD_DAYS[period];
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const dt = new Date(item.patient_datetime || item.created_at);
        return dt >= cutoff;
    });

    const displayData = filteredData.length > 0 ? filteredData : allData;

    // Helpers
    const medianOf = (arr) => {
        if (!arr.length) return null;
        const s = [...arr].sort((a, b) => a - b);
        const m = Math.floor(s.length / 2);
        return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    };

    // Compute indicator stats from displayed data
    const latest   = displayData[0];
    // Cards PAS/PAD: sempre da medição mais recente
    const pamVal   = latest ? Number(latest.patient_pam) : null;
    const pasVals  = displayData.map(i => Number(i.patient_pas)).filter(Boolean);
    const padVals  = displayData.map(i => Number(i.patient_pad)).filter(Boolean);
    const pasMin   = pasVals.length ? Math.min(...pasVals) : '--';
    const pasMax   = pasVals.length ? Math.max(...pasVals) : '--';
    const padMin   = padVals.length ? Math.min(...padVals) : '--';
    const padMax   = padVals.length ? Math.max(...padVals) : '--';

    // Gauge: última medição (período padrão) ou mediana do período selecionado
    const pamVals    = displayData.map(i => Number(i.patient_pam)).filter(Boolean);
    const gaugeVal   = filteredData.length > 1 ? medianOf(pamVals) : pamVal;

    const pamClass   = getPAMClass(pamVal);
    const pamMessage = getPAMMessage(pamVal);


    const ListHeader = () => (
        <>
            {/* ── 1. Cabeçalho ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Projeto HDsys</Text>
                    <Text style={styles.headerSub}>Boas vindas, {displayName}!</Text>
                    <Text style={styles.headerCaption}>Monitoramento da Pressão Arterial Média - PAM</Text>
                </View>
                <TouchableOpacity
                    style={styles.gearBtn}
                    onPress={() => navigation.navigate('Configuration')}
                >
                    <Ionicons name="settings-outline" size={22} color={C.textSecond} />
                </TouchableOpacity>
            </View>

            {/* ══ Container A: Última Medição — cards + classificação SBC 2025 ══ */}
            <View style={styles.containerA}>

                {/* Badge topo do container */}
                <View style={styles.containerABadge}>
                    <Ionicons name="time-outline" size={12} color="#fff" />
                    <Text style={styles.containerABadgeText}>  ÚLTIMA MEDIÇÃO</Text>
                </View>

                {/* Cards indicadores: PAS | PAM | PAD */}
                <View style={styles.indicatorRow}>
                    <View style={[styles.indCard, styles.indCardSide]}>
                        <Text style={styles.indLabel}>PAS</Text>
                        <Text style={styles.indValue}>{latest?.patient_pas ?? '--'}</Text>
                        <Text style={styles.indUnit}>mmHg</Text>
                        <Text style={styles.indRange}>↓{pasMin}  ↑{pasMax}</Text>
                    </View>

                    <View style={[styles.indCard, styles.indCardCenter]}>
                        <Text style={[styles.indLabel, { color: C.accent }]}>PAM Atual</Text>
                        <Text style={[styles.indValue, { fontSize: 32, color: pamClass.color }]}>
                            {pamVal ? Math.round(pamVal) : '--'}
                        </Text>
                        <Text style={styles.indUnit}>mmHg</Text>
                        {latest && (
                            <Text style={styles.indReading}>{latest.patient_pas} x {latest.patient_pad}</Text>
                        )}
                    </View>

                    <View style={[styles.indCard, styles.indCardSide]}>
                        <Text style={styles.indLabel}>PAD</Text>
                        <Text style={styles.indValue}>{latest?.patient_pad ?? '--'}</Text>
                        <Text style={styles.indUnit}>mmHg</Text>
                        <Text style={styles.indRange}>↓{padMin}  ↑{padMax}</Text>
                    </View>
                </View>

                {/* Classificação SBC 2025 */}
                {latest && (
                    <View style={styles.classRow}>
                        <Text style={styles.lastMeasEmoji}>{pamClass.emoji}</Text>
                        <View style={styles.lastMeasInfo}>
                            <Text style={[styles.lastMeasLabel, { color: pamClass.color }]}>{pamClass.label}</Text>
                            <Text style={styles.lastMeasMessage}>{pamMessage}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* ══ Container B: Gauge + Seletor de Período ══ */}
            <View style={styles.periodGaugeContainer}>
                <View style={styles.periodGaugeHeader}>
                    <Ionicons name="analytics-outline" size={14} color={C.textSecond} />
                    <Text style={styles.periodGaugeTitle}>  Análise por Período — PAM Mediana</Text>
                </View>
                <View style={styles.gaugeWrap}>
                    <GaugeChart value={gaugeVal} size={300} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
                    {PERIODS.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* ══ Container C: Navegação + Registrar ══ */}
            <View style={styles.containerC}>
                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Variacao')}>
                        <Ionicons name="stats-chart-outline" size={15} color="#94A3B8" />
                        <Text style={styles.navBtnText}>Variação</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('Analytics')}>
                        <Ionicons name="analytics-outline" size={15} color="#94A3B8" />
                        <Text style={styles.navBtnText}>Analytics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('History')}>
                        <Ionicons name="list-outline" size={15} color="#94A3B8" />
                        <Text style={styles.navBtnText}>Histórico</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.registerBtn}
                    onPress={() => navigation.navigate('AddMeasurement')}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.registerBtnText}>Registrar nova mensuração</Text>
                </TouchableOpacity>
            </View>

        </>
    );

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={C.gold} />
                    <Text style={styles.loadingText}>Sincronizando com HDsys...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.gold} />}
                >
                    <ListHeader />
                </ScrollView>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: C.textSecond, fontSize: 14 },

    /* Header */
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: C.textPrimary, letterSpacing: 0.5 },
    headerSub:   { fontSize: 14, color: C.accent, marginTop: 2 },
    headerCaption: { fontSize: 11, color: C.textSecond, marginTop: 3 },
    gearBtn: { padding: 6, marginTop: 4 },

    /* ── Container A ── */
    containerA: {
        backgroundColor: C.card, borderRadius: 14,
        borderWidth: 1, borderColor: C.border,
        marginHorizontal: 16, marginTop: 16,
        overflow: 'hidden',
    },
    containerABadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 6,
        backgroundColor: '#0D1B30',
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    containerABadgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff', letterSpacing: 1.2 },

    /* Indicator cards */
    indicatorRow: {
        flexDirection: 'row', marginHorizontal: 12, marginTop: 12,
        gap: 8,
    },
    indCard: {
        flex: 1, backgroundColor: C.card, borderRadius: 10,
        borderWidth: 1, borderColor: C.border,
        alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4,
    },
    indCardSide: {},
    indCardCenter: { borderColor: C.accent, flex: 1.2 },
    indLabel: { fontSize: 11, color: C.textSecond, textTransform: 'uppercase', letterSpacing: 1 },
    indValue: { fontSize: 24, fontWeight: 'bold', color: C.textPrimary, marginTop: 4 },
    indUnit:  { fontSize: 10, color: C.textSecond },
    indRange: { fontSize: 10, color: C.textSecond, marginTop: 4 },
    indReading: { fontSize: 10, color: C.accent, marginTop: 4 },

    /* ── Container A: Gauge + Período ── */
    periodGaugeContainer: {
        backgroundColor: C.card, borderRadius: 14,
        borderWidth: 1, borderColor: C.border,
        marginHorizontal: 16, marginTop: 16,
        paddingBottom: 16, overflow: 'hidden',
    },
    periodGaugeHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: C.border,
        backgroundColor: '#0D1B30',
    },
    periodGaugeTitle: { fontSize: 11, color: C.textSecond, letterSpacing: 0.5, textTransform: 'uppercase' },
    gaugeWrap: { alignItems: 'center', paddingTop: 16 },
    periodScroll: { marginHorizontal: 12, marginTop: 12 },
    periodBtn: {
        paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
        borderRadius: 20, borderWidth: 1, borderColor: C.border,
        backgroundColor: '#0D1B30',
    },
    periodBtnActive: { backgroundColor: C.blue, borderColor: C.blue },
    periodText: { fontSize: 12, color: C.textSecond, fontWeight: '600' },
    periodTextActive: { color: '#fff' },

    /* Classificação (dentro do Container A) */
    classRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
        borderTopWidth: 1, borderTopColor: C.border, marginTop: 10,
    },
    lastMeasEmoji: { fontSize: 30, marginRight: 12 },
    lastMeasInfo: { flex: 1 },
    lastMeasLabel: { fontSize: 15, fontWeight: 'bold' },
    lastMeasMessage: { fontSize: 11, color: C.textSecond, marginTop: 3, lineHeight: 16 },
    lastMeasPAM: { alignItems: 'flex-end' },
    lastMeasPAMValue: { fontSize: 28, fontWeight: 'bold' },
    lastMeasPAMUnit: { fontSize: 10, color: C.textSecond },
    lastMeasDetails: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 14, paddingBottom: 8,
        borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8,
    },
    lastMeasDetailText: { fontSize: 12, color: C.textPrimary, fontWeight: '600' },
    lastMeasDetailDate: { fontSize: 11, color: C.textSecond },
    lastMeasRef: {
        fontSize: 10, color: C.textSecond, textAlign: 'center',
        paddingBottom: 10, letterSpacing: 0.3,
    },

    /* ── Container C: Navegação + Registrar ── */
    containerC: {
        backgroundColor: C.card, borderRadius: 14,
        borderWidth: 1, borderColor: C.border,
        marginHorizontal: 16, marginTop: 14,
        paddingBottom: 14, overflow: 'hidden',
    },
    navRow: {
        flexDirection: 'row', marginHorizontal: 12, marginTop: 12, gap: 8,
    },
    navBtn: {
        flex: 1, backgroundColor: '#0D1B30', paddingVertical: 10,
        borderRadius: 8, alignItems: 'center', gap: 4,
        borderWidth: 1, borderColor: C.border,
    },
    navBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    registerBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#1A237E', borderRadius: 10,
        marginHorizontal: 12, marginTop: 12,
        paddingVertical: 14, gap: 8,
    },
    registerBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.3 },

    /* History header */
    histHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginHorizontal: 16, marginTop: 20, marginBottom: 8,
    },
    histTitle: { fontSize: 16, fontWeight: 'bold', color: C.textPrimary },
    addBtn: {},

    /* History item */
    histCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.card, borderRadius: 10,
        borderWidth: 1, borderColor: C.border,
        marginHorizontal: 16, marginBottom: 8,
        padding: 12,
    },
    histIconWrap: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#1E293B',
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    histBody: { flex: 1 },
    histReading: { fontSize: 13, fontWeight: 'bold', color: C.textPrimary },
    histDateTime: { fontSize: 11, color: C.textSecond, marginTop: 2 },
    pamPill: {
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8, borderWidth: 1,
    },
    pamPillText: { fontSize: 13, fontWeight: 'bold' },

    /* Empty */
    emptyWrap: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: C.textPrimary, fontSize: 15, marginTop: 12 },
    emptySub:  { color: C.textSecond, fontSize: 12, marginTop: 4 },

    /* FAB */
    fab: {
        position: 'absolute', right: 20, bottom: 24,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: C.blue,
        justifyContent: 'center', alignItems: 'center',
        elevation: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 5,
    },
});
