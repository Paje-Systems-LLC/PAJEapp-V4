import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useIsFocused } from '@react-navigation/native';
import api from '../services/api';
import { colors, spacing, typography } from '../theme';
import { calcularPAM } from '../utils/clinicaMath';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.m * 2 - 20;

const CHART_CONFIG_DARK = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 12 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#D4AF37' },
};

const classifyPam = (pam) => {
    const v = Number(pam);
    if (isNaN(v)) return { label: 'N/A', color: '#888' };
    if (v < 64)  return { label: 'Isquemia', color: '#FF4C4C' };
    if (v < 100) return { label: 'Saudável', color: '#D4AF37' };
    if (v < 109) return { label: 'Atenção', color: '#FFEB3B' };
    return { label: 'Crise', color: '#8B0000' };
};

const StatCard = ({ icon, label, value, unit, color }) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={styles.statValue}>{value ?? '--'}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

export default function AnalyticsScreen({ navigation }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/history/');
            const results = response.data.results || response.data;
            setData(Array.isArray(results) ? results : []);
        } catch (e) {
            console.error('AnalyticsScreen: erro ao buscar dados', e);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (isFocused) fetchData(); }, [isFocused]);

    // ── Derived stats ──────────────────────────────────────────────────────────
    const nums = (field) => data.map(d => Number(d[field])).filter(n => !isNaN(n) && n > 0);
    const avg  = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : null;
    const min  = (arr) => arr.length ? Math.min(...arr).toFixed(0) : null;
    const max  = (arr) => arr.length ? Math.max(...arr).toFixed(0) : null;

    const pamValues  = nums('patient_pam');
    const pasValues  = nums('patient_pas');
    const padValues  = nums('patient_pad');
    const hrValues   = nums('patient_heart_rate');

    // ── Chart data: last 10 entries, oldest → newest ──────────────────────────
    const entries = [...data].reverse().slice(-10);
    const labels  = entries.map((_, i) => `${i + 1}`);

    const pamChartData = {
        labels,
        datasets: [{ data: entries.map(d => Number(d.patient_pam) || 0), color: (o = 1) => `rgba(212,175,55,${o})`, strokeWidth: 2 }],
    };

    const bpChartData = {
        labels,
        datasets: [
            { data: entries.map(d => Number(d.patient_pas) || 0), color: (o = 1) => `rgba(28,181,224,${o})`, strokeWidth: 2 },
            { data: entries.map(d => Number(d.patient_pad) || 0), color: (o = 1) => `rgba(255,75,31,${o})`, strokeWidth: 2 },
        ],
        legend: ['PAS', 'PAD'],
    };

    const hrChartData = {
        labels,
        datasets: [{ data: entries.map(d => Number(d.patient_heart_rate) || 0), color: (o = 1) => `rgba(146,196,86,${o})`, strokeWidth: 2 }],
    };

    // ── Risk distribution ─────────────────────────────────────────────────────
    const riskCount = { Isquemia: 0, Saudável: 0, Atenção: 0, Crise: 0 };
    pamValues.forEach(v => { riskCount[classifyPam(v).label]++; });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <LinearGradient
                colors={['#0F2646', '#0a1d3a', '#0F2646']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Análise Clínica</Text>
                <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={22} color="#D4AF37" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                    <Text style={styles.loadingText}>Processando dados clínicos...</Text>
                </View>
            ) : data.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="bar-chart-outline" size={56} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.emptyText}>Nenhum dado disponível para análise.</Text>
                    <Text style={styles.emptySub}>Adicione medições para visualizar os gráficos.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll}>

                    {/* ── Stats Cards ── */}
                    <Text style={styles.sectionTitle}>Resumo Estatístico</Text>
                    <View style={styles.statsRow}>
                        <StatCard icon="speedometer-outline" label="PAM Média" value={avg(pamValues)} unit="mmHg" color="#D4AF37" />
                        <StatCard icon="arrow-up-circle-outline" label="PAS Máx" value={max(pasValues)} unit="mmHg" color="#1CB5E0" />
                        <StatCard icon="arrow-down-circle-outline" label="PAD Mín" value={min(padValues)} unit="mmHg" color="#ff4b1f" />
                        <StatCard icon="pulse-outline" label="FC Média" value={avg(hrValues)} unit="bpm" color="#92C456" />
                    </View>

                    {/* ── PAM Trend ── */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Tendência PAM (mmHg)</Text>
                        <LineChart
                            data={pamChartData}
                            width={CHART_WIDTH}
                            height={180}
                            chartConfig={CHART_CONFIG_DARK}
                            bezier
                            style={styles.chart}
                        />
                    </View>

                    {/* ── BP Trend ── */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Pressão Arterial: PAS vs PAD</Text>
                        <LineChart
                            data={bpChartData}
                            width={CHART_WIDTH}
                            height={180}
                            chartConfig={{ ...CHART_CONFIG_DARK, color: (o = 1) => `rgba(255,255,255,${o})` }}
                            bezier
                            style={styles.chart}
                        />
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: 'rgba(28,181,224,1)' }]} />
                                <Text style={styles.legendLabel}>PAS (Sistólica)</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: 'rgba(255,75,31,1)' }]} />
                                <Text style={styles.legendLabel}>PAD (Diastólica)</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Heart Rate ── */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Frequência Cardíaca (BPM)</Text>
                        <LineChart
                            data={hrChartData}
                            width={CHART_WIDTH}
                            height={160}
                            chartConfig={{ ...CHART_CONFIG_DARK, color: (o = 1) => `rgba(146,196,86,${o})` }}
                            bezier
                            style={styles.chart}
                        />
                    </View>

                    {/* ── Risk Distribution ── */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Distribuição de Risco Clínico</Text>
                        {Object.entries(riskCount).map(([label, count]) => {
                            const pct = pamValues.length ? (count / pamValues.length) * 100 : 0;
                            const color = classifyPam(
                                label === 'Isquemia' ? 50 :
                                label === 'Saudável' ? 80 :
                                label === 'Atenção'  ? 105 : 120
                            ).color;
                            return (
                                <View key={label} style={styles.riskRow}>
                                    <Text style={[styles.riskLabel, { color }]}>{label}</Text>
                                    <View style={styles.riskBarBg}>
                                        <View style={[styles.riskBar, { width: `${pct}%`, backgroundColor: color }]} />
                                    </View>
                                    <Text style={styles.riskCount}>{count}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* ── Min/Max Table ── */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Extremos Registrados</Text>
                        {[
                            { label: 'PAM', min: min(pamValues), max: max(pamValues), avg: avg(pamValues), unit: 'mmHg', color: '#D4AF37' },
                            { label: 'PAS', min: min(pasValues), max: max(pasValues), avg: avg(pasValues), unit: 'mmHg', color: '#1CB5E0' },
                            { label: 'PAD', min: min(padValues), max: max(padValues), avg: avg(padValues), unit: 'mmHg', color: '#ff4b1f' },
                            { label: 'FC',  min: min(hrValues),  max: max(hrValues),  avg: avg(hrValues),  unit: 'bpm',  color: '#92C456' },
                        ].map(row => (
                            <View key={row.label} style={styles.tableRow}>
                                <Text style={[styles.tableLabel, { color: row.color }]}>{row.label}</Text>
                                <Text style={styles.tableCell}>↓ {row.min ?? '--'}</Text>
                                <Text style={styles.tableCell}>⌀ {row.avg ?? '--'}</Text>
                                <Text style={styles.tableCell}>↑ {row.max ?? '--'}</Text>
                                <Text style={styles.tableUnit}>{row.unit}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.disclaimer}>
                        * Dados baseados em {data.length} registro(s). Consulte sempre um profissional de saúde.
                    </Text>

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.primary },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.m, paddingVertical: spacing.m,
    },
    backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 50 },
    refreshButton: { padding: 8, backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 50 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.l },
    loadingText: { marginTop: spacing.s, color: 'rgba(255,255,255,0.6)', fontSize: 14 },
    emptyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: spacing.m, textAlign: 'center' },
    emptySub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6, textAlign: 'center' },
    scroll: { paddingHorizontal: spacing.m, paddingTop: spacing.s },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: spacing.s },
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.m },
    statCard: {
        width: '48%', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
        padding: spacing.m, alignItems: 'center', marginBottom: spacing.s,
        borderTopWidth: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    statValue: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 6 },
    statUnit: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
    chartCard: {
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: spacing.m,
        marginBottom: spacing.m, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    chartTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: spacing.s },
    chart: { borderRadius: 12, marginLeft: -10 },
    legendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4, gap: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    riskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    riskLabel: { width: 70, fontSize: 13, fontWeight: '600' },
    riskBarBg: { flex: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, marginHorizontal: 8 },
    riskBar: { height: 12, borderRadius: 6 },
    riskCount: { color: 'rgba(255,255,255,0.5)', fontSize: 13, width: 24, textAlign: 'right' },
    tableRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    tableLabel: { width: 36, fontWeight: 'bold', fontSize: 13 },
    tableCell: { flex: 1, color: '#fff', fontSize: 13, textAlign: 'center' },
    tableUnit: { color: 'rgba(255,255,255,0.4)', fontSize: 11, width: 36, textAlign: 'right' },
    disclaimer: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginTop: spacing.s },
});
