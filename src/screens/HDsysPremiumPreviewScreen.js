import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Text as SvgText, G, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';
import PreCadastroForm from '../components/paje/PreCadastroForm';

const ACCENT = '#D4AF37'; // dourado HDsys Premium
const C = {
    bg: '#0A1325', card: '#162136',
    border: '#1E293B', text: '#E2E8F0', second: '#94A3B8',
};

// ── Gráfico 1: Score de Risco Cardiovascular (gauge semicircular) ──
function RiscoGauge({ score = 28, size = 240 }) {
    // Score 0–100 → baixo/moderado/alto/muito alto
    const CX = size / 2, CY = size * 0.58, R = size * 0.38, SW = size * 0.08;
    const toRad = (d) => (d * Math.PI) / 180;
    const arcPath = (sa, ea) => {
        const s = toRad(sa), e = toRad(ea);
        const x1 = CX + R * Math.cos(s), y1 = CY + R * Math.sin(s);
        const x2 = CX + R * Math.cos(e), y2 = CY + R * Math.sin(e);
        return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
    };

    const zones = [
        { sa: -180, ea: -135, color: '#22C55E', label: 'Baixo'      },
        { sa: -135, ea:  -90, color: '#FDD835', label: 'Moderado'   },
        { sa:  -90, ea:  -45, color: '#EF6C00', label: 'Alto'       },
        { sa:  -45, ea:    0, color: '#D32F2F', label: 'Muito Alto' },
    ];

    // Agulha: score 0–100 → ângulo -180→0
    const needleAngle = -180 + (score / 100) * 180;
    const needleRad   = toRad(needleAngle + 90);
    const needleLen   = R - SW / 2 - 4;

    const riskLabel = score < 25 ? 'Baixo' : score < 50 ? 'Moderado' : score < 75 ? 'Alto' : 'Muito Alto';
    const riskColor = score < 25 ? '#22C55E' : score < 50 ? '#FDD835' : score < 75 ? '#EF6C00' : '#D32F2F';

    return (
        <View style={{ alignItems: 'center' }}>
            <Svg width={size} height={size * 0.66}>
                {/* Trilha */}
                <Path d={arcPath(-180, 0)} stroke="#1E293B" strokeWidth={SW} fill="none" />
                {/* Zonas */}
                {zones.map((z, i) => (
                    <Path key={i} d={arcPath(z.sa, z.ea)} stroke={z.color}
                        strokeWidth={SW} fill="none" strokeLinecap="butt" opacity="0.85" />
                ))}
                {/* Agulha */}
                <G transform={`rotate(${needleAngle + 90}, ${CX}, ${CY})`}>
                    <Line x1={CX} y1={CY} x2={CX} y2={CY - needleLen}
                        stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                </G>
                <Circle cx={CX} cy={CY} r="7" fill="#E2E8F0" />
                <Circle cx={CX} cy={CY} r="3.5" fill={riskColor} />
                {/* Score */}
                <SvgText x={CX} y={CY - 22} fontSize="28" fontWeight="bold"
                    fill="none" stroke="#0A1325" strokeWidth="5" textAnchor="middle">{score}</SvgText>
                <SvgText x={CX} y={CY - 22} fontSize="28" fontWeight="bold"
                    fill={riskColor} textAnchor="middle">{score}</SvgText>
                <SvgText x={CX} y={CY - 6} fontSize="10" fill={C.second} textAnchor="middle">Score de Risco</SvgText>
                {/* Labels extremos */}
                <SvgText x="14" y={CY + 18} fontSize="9" fill={C.second} textAnchor="middle">0</SvgText>
                <SvgText x={size - 14} y={CY + 18} fontSize="9" fill={C.second} textAnchor="middle">100</SvgText>
            </Svg>
            <Text style={[styles.riskLabel, { color: riskColor }]}>{riskLabel}</Text>
        </View>
    );
}

// ── Gráfico 2: Tendência PAM com Predição ──
const PAM_HIST = [
    { d: -30, pam: 105 }, { d: -27, pam: 108 }, { d: -24, pam: 103 },
    { d: -21, pam: 110 }, { d: -18, pam: 106 }, { d: -15, pam: 112 },
    { d: -12, pam: 108 }, { d: -9,  pam: 114 }, { d: -6,  pam: 109 },
    { d: -3,  pam: 116 }, { d:  0,  pam: 113 },
];
// Predição (linha pontilhada)
const PAM_PRED = [
    { d:  0, pam: 113 }, { d:  7, pam: 111 }, { d: 14, pam: 109 },
    { d: 21, pam: 107 }, { d: 28, pam: 105 },
];

function TendenciaChart() {
    const { width: sw } = useWindowDimensions();
    const chartW = sw - 64;
    const H = 160, PL = 44, PT = 10, PB = 28, PR = 8;
    const uW = chartW - PL - PR, uH = H - PT - PB;

    const allD   = [...PAM_HIST.map(d => d.d), ...PAM_PRED.map(d => d.d)];
    const allPAM = [...PAM_HIST.map(d => d.pam), ...PAM_PRED.map(d => d.pam)];
    const minD   = Math.min(...allD), maxD = Math.max(...allD);
    const minP   = Math.min(...allPAM) - 5, maxP = Math.max(...allPAM) + 5;

    const toX = (d)   => PL + ((d - minD) / (maxD - minD)) * uW;
    const toY = (pam) => PT + uH - ((pam - minP) / (maxP - minP)) * uH;

    const histLine = PAM_HIST.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.d)},${toY(p.pam)}`).join(' ');
    const predLine = PAM_PRED.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.d)},${toY(p.pam)}`).join(' ');

    // Área de confiança da predição (±5)
    const confPath =
        PAM_PRED.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.d)},${toY(p.pam + 5)}`).join(' ') +
        ' ' +
        [...PAM_PRED].reverse().map((p, i) => `L ${toX(p.d)},${toY(p.pam - 5)}`).join(' ') + ' Z';

    const yTicks = [100, 105, 110, 115, 120];

    return (
        <Svg width={chartW} height={H}>
            <Line x1={PL} y1={PT} x2={PL} y2={PT + uH} stroke="#2D3F55" strokeWidth="1" />
            <Line x1={PL} y1={PT + uH} x2={chartW - PR} y2={PT + uH} stroke="#2D3F55" strokeWidth="1" />

            {yTicks.map(v => (
                <G key={v}>
                    <Line x1={PL} y1={toY(v)} x2={chartW - PR} y2={toY(v)} stroke="#2D3F55" strokeWidth="0.5" opacity="0.7" />
                    <SvgText x={PL - 4} y={toY(v) + 4} fontSize="8" fill={C.second} textAnchor="end">{v}</SvgText>
                </G>
            ))}

            {/* Linha hoje */}
            <Line x1={toX(0)} y1={PT} x2={toX(0)} y2={PT + uH}
                stroke={ACCENT} strokeWidth="1" opacity="0.5" strokeDasharray="3,3" />
            <SvgText x={toX(0) + 4} y={PT + 12} fontSize="8" fill={ACCENT} opacity="0.7">Hoje</SvgText>

            {/* Área de confiança */}
            <Path d={confPath} fill={ACCENT} opacity="0.10" />

            {/* Histórico */}
            <Path d={histLine} fill="none" stroke={ACCENT} strokeWidth="2" />
            {PAM_HIST.map((p, i) => (
                <Circle key={i} cx={toX(p.d)} cy={toY(p.pam)} r="3" fill={ACCENT} opacity="0.9" />
            ))}

            {/* Predição */}
            <Path d={predLine} fill="none" stroke={ACCENT} strokeWidth="1.8" strokeDasharray="5,4" opacity="0.7" />
            {PAM_PRED.map((p, i) => i > 0 && (
                <Circle key={i} cx={toX(p.d)} cy={toY(p.pam)} r="2.5" fill="none"
                    stroke={ACCENT} strokeWidth="1.5" opacity="0.7" />
            ))}

            {/* Labels X */}
            {[-30, -15, 0, 14, 28].map(d => (
                <SvgText key={d} x={toX(d)} y={PT + uH + 16}
                    fontSize="8" fill={C.second} textAnchor="middle">
                    {d === 0 ? 'Hoje' : `${d > 0 ? '+' : ''}${d}d`}
                </SvgText>
            ))}

            <SvgText x={0} y={0} fontSize="9" fill={C.second} textAnchor="middle"
                transform={`rotate(-90) translate(${-(PT + uH / 2)}, 12)`}>PAM</SvgText>
        </Svg>
    );
}

// ── Tabela Free vs Premium ──
const COMPARATIVO = [
    { feature: 'Registro de medições',    free: true,  prem: true  },
    { feature: 'Gauge SBC 2025',          free: true,  prem: true  },
    { feature: 'Histórico local',         free: true,  prem: true  },
    { feature: 'Variação e tendência',    free: true,  prem: true  },
    { feature: 'Predição por IA',         free: false, prem: true  },
    { feature: 'Score de risco cardio.',  free: false, prem: true  },
    { feature: 'Relatório médico PDF',    free: false, prem: true  },
    { feature: 'Integração com médico',   free: false, prem: true  },
    { feature: 'Múltiplos perfis',        free: false, prem: true  },
    { feature: 'Alertas críticos SMS',    free: false, prem: true  },
];

function ComparativoTable() {
    return (
        <View>
            {/* Cabeçalho */}
            <View style={tabStyles.row}>
                <Text style={[tabStyles.col, tabStyles.header, { flex: 2 }]}>Funcionalidade</Text>
                <Text style={[tabStyles.col, tabStyles.header, { color: C.second }]}>Free</Text>
                <Text style={[tabStyles.col, tabStyles.header, { color: ACCENT }]}>Premium</Text>
            </View>
            {COMPARATIVO.map((item, i) => (
                <View key={i} style={[tabStyles.row, i % 2 === 0 && tabStyles.rowAlt]}>
                    <Text style={[tabStyles.col, { flex: 2, color: C.second }]}>{item.feature}</Text>
                    <Text style={[tabStyles.col, { color: item.free ? '#22C55E' : '#475569' }]}>
                        {item.free ? '✓' : '—'}
                    </Text>
                    <Text style={[tabStyles.col, { color: item.prem ? ACCENT : '#475569' }]}>
                        {item.prem ? '✓' : '—'}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const tabStyles = StyleSheet.create({
    row:    { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
    rowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
    col:    { flex: 1, fontSize: 11, color: C.text, textAlign: 'center' },
    header: { fontWeight: 'bold', fontSize: 11, color: C.text },
});

const FEATURES = [
    { icon: 'analytics',          text: 'Score de risco cardiovascular baseado em IA' },
    { icon: 'trending-up',        text: 'Predição de tendência da PAM para os próximos 30 dias' },
    { icon: 'document-text',      text: 'Relatórios clínicos em PDF para compartilhar com médico' },
    { icon: 'people',             text: 'Múltiplos perfis de pacientes na mesma conta' },
    { icon: 'call',               text: 'Alertas críticos por SMS e push notification' },
    { icon: 'medkit',             text: 'Integração direta com profissionais de saúde' },
    { icon: 'cloud-done',         text: 'Sincronização em nuvem com histórico ilimitado' },
    { icon: 'bar-chart',          text: 'Analytics avançado e comparativo com população' },
];

export default function HDsysPremiumPreviewScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>HDsys  </Text>
                <View style={[styles.headerBadge, { backgroundColor: ACCENT + '22', borderColor: ACCENT + '55' }]}>
                    <Text style={[styles.headerBadgeText, { color: ACCENT }]}>PREMIUM</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Hero */}
                <View style={styles.heroCard}>
                    <Image source={require('../../assets/hdsys.png')}
                        style={styles.heroImage} resizeMode="contain" />
                    <View style={styles.heroTextWrap}>
                        <Text style={styles.heroTitle}>HDsys Premium</Text>
                        <Text style={styles.heroDesc}>
                            A plataforma HDsys evoluída com inteligência artificial, relatórios médicos
                            e integração direta com profissionais de saúde do PAJE club.
                        </Text>
                    </View>
                </View>

                {/* Score de Risco */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="pulse" size={14} color={ACCENT} />  Score de Risco Cardiovascular
                    </Text>
                    <Text style={styles.cardSub}>
                        Calculado por IA com base em histórico de PAM, hábitos e fatores clínicos — dados ilustrativos
                    </Text>
                    <RiscoGauge score={28} size={220} />
                </View>

                {/* Tendência com predição */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="analytics-outline" size={14} color={ACCENT} />  Tendência PAM + Predição IA
                    </Text>
                    <Text style={styles.cardSub}>
                        Histórico (linha sólida) + projeção dos próximos 28 dias (linha pontilhada) — dados ilustrativos
                    </Text>
                    <View style={{ marginTop: 8 }}>
                        <TendenciaChart />
                    </View>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendLine, { backgroundColor: ACCENT }]} />
                            <Text style={styles.legendText}>Histórico real</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendLine, { backgroundColor: ACCENT, opacity: 0.5 }]} />
                            <Text style={styles.legendText}>Predição IA</Text>
                        </View>
                    </View>
                </View>

                {/* Comparativo */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="git-compare-outline" size={14} color={ACCENT} />  Free vs Premium
                    </Text>
                    <View style={{ marginTop: 8 }}>
                        <ComparativoTable />
                    </View>
                </View>

                {/* Funcionalidades */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="star" size={14} color={ACCENT} />  O que o HDsys Premium oferece
                    </Text>
                    {FEATURES.map((f, i) => (
                        <View key={i} style={styles.featureRow}>
                            <View style={[styles.featureIcon, { backgroundColor: ACCENT + '18' }]}>
                                <Ionicons name={f.icon} size={16} color={ACCENT} />
                            </View>
                            <Text style={styles.featureText}>{f.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Pré-cadastro */}
                <PreCadastroForm sistema="HDsys Premium" accentColor={ACCENT} />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 16, paddingBottom: 40 },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerBtn:       { padding: 6, backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border },
    headerTitle:     { flex: 1, fontSize: 17, fontWeight: 'bold', color: C.text, marginLeft: 12 },
    headerBadge:     { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
    headerBadgeText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },

    heroCard: {
        backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
        borderColor: C.border, borderLeftWidth: 4, borderLeftColor: ACCENT,
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 14, padding: 14,
    },
    heroImage:    { width: 80, height: 80, borderRadius: 10, marginRight: 14 },
    heroTextWrap: { flex: 1 },
    heroTitle:    { fontSize: 16, fontWeight: 'bold', color: C.text, marginBottom: 6 },
    heroDesc:     { fontSize: 12, color: C.second, lineHeight: 18 },

    card: {
        backgroundColor: C.card, borderRadius: 12, borderWidth: 1,
        borderColor: C.border, padding: 14, marginBottom: 14,
    },
    cardTitle: { fontSize: 13, fontWeight: 'bold', color: C.text, marginBottom: 4 },
    cardSub:   { fontSize: 10, color: C.second, marginBottom: 4 },

    riskLabel: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },

    legendRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendLine: { width: 20, height: 3, borderRadius: 2 },
    legendText: { fontSize: 10, color: C.second },

    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    featureIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    featureText: { flex: 1, fontSize: 12, color: C.second, lineHeight: 17 },
});
