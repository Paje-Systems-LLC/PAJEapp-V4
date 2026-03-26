import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Text as SvgText, G, Rect } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';
import PreCadastroForm from '../components/paje/PreCadastroForm';

const ACCENT = '#EC4899'; // rosa GRAVsys
const C = {
    bg:     '#0A1325', card:   '#162136',
    border: '#1E293B', text:   '#E2E8F0', second: '#94A3B8',
};

// ── Gráfico 1: Progresso Gestacional (anel SVG) ──
function GestacaoRing({ semanas = 16, total = 40, size = 180 }) {
    const cx = size / 2, cy = size / 2, r = size * 0.38;
    const sw = size * 0.09;
    const pct = semanas / total;
    const angle = pct * 360 - 90;
    const rad   = (deg) => (deg * Math.PI) / 180;
    const ex    = cx + r * Math.cos(rad(angle));
    const ey    = cy + r * Math.sin(rad(angle));
    const large = pct > 0.5 ? 1 : 0;
    const arc   = `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;

    // Trimestres: 1º=13sem, 2º=27sem, 3º=40sem
    const tri = semanas <= 13 ? '1º Trimestre' : semanas <= 27 ? '2º Trimestre' : '3º Trimestre';

    return (
        <View style={{ alignItems: 'center' }}>
            <Svg width={size} height={size}>
                {/* Trilha */}
                <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E293B" strokeWidth={sw} />
                {/* Progresso */}
                <Path d={arc} fill="none" stroke={ACCENT} strokeWidth={sw}
                    strokeLinecap="round" />
                {/* Semanas */}
                <SvgText x={cx} y={cy - 10} fontSize={size * 0.18} fontWeight="bold"
                    fill={ACCENT} textAnchor="middle">{semanas}</SvgText>
                <SvgText x={cx} y={cy + 10} fontSize={size * 0.07} fill={C.second} textAnchor="middle">
                    semanas
                </SvgText>
                <SvgText x={cx} y={cy + 26} fontSize={size * 0.065} fill={C.second} textAnchor="middle">
                    de {total}
                </SvgText>
            </Svg>
            <Text style={{ color: ACCENT, fontWeight: 'bold', fontSize: 12, marginTop: 4 }}>{tri}</Text>
        </View>
    );
}

// ── Gráfico 2: Curva de Ganho de Peso ──
const PESO_DEMO = [
    { sem: 0,  peso: 62.0 },
    { sem: 4,  peso: 62.3 },
    { sem: 8,  peso: 63.1 },
    { sem: 12, peso: 64.2 },
    { sem: 16, peso: 65.5 },
    { sem: 20, peso: 67.2 },
    { sem: 24, peso: 69.0 },
    { sem: 28, peso: 71.3 },
];
// Faixa recomendada (ganho de ~11-16kg ao longo de 40 sem)
const PESO_MIN = PESO_DEMO.map(d => ({ sem: d.sem, peso: 62.0 + (d.sem / 40) * 11 }));
const PESO_MAX = PESO_DEMO.map(d => ({ sem: d.sem, peso: 62.0 + (d.sem / 40) * 16 }));

function PesoChart() {
    const { width: sw } = useWindowDimensions();
    const chartW = sw - 64;
    const H = 160, PL = 44, PT = 10, PB = 28, PR = 8;
    const uW = chartW - PL - PR, uH = H - PT - PB;

    const allPeso = [...PESO_DEMO.map(d => d.peso), ...PESO_MAX.map(d => d.peso)];
    const minP = Math.min(...allPeso) - 1;
    const maxP = Math.max(...allPeso) + 1;
    const maxSem = 28;

    const toX = (sem)  => PL + (sem / maxSem) * uW;
    const toY = (peso) => PT + uH - ((peso - minP) / (maxP - minP)) * uH;

    const yTicks = [62, 64, 66, 68, 70, 72].filter(v => v >= minP && v <= maxP);

    const areaMin = PESO_MIN.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d.sem)},${toY(d.peso)}`).join(' ');
    const areaMax = [...PESO_MAX].reverse().map((d, i) => `L ${toX(d.sem)},${toY(d.peso)}`).join(' ');
    const areaPath = areaMin + ' ' + areaMax + ' Z';

    const linha = PESO_DEMO.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d.sem)},${toY(d.peso)}`).join(' ');

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

            {/* Faixa recomendada */}
            <Path d={areaPath} fill={ACCENT} opacity="0.12" />
            <Path d={areaMin} fill="none" stroke={ACCENT} strokeWidth="1" opacity="0.35" strokeDasharray="4,3" />
            <Path d={[...PESO_MAX].reverse().map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d.sem)},${toY(d.peso)}`).join(' ')}
                fill="none" stroke={ACCENT} strokeWidth="1" opacity="0.35" strokeDasharray="4,3" />

            {/* Linha da paciente */}
            <Path d={linha} fill="none" stroke={ACCENT} strokeWidth="2" />
            {PESO_DEMO.map((d, i) => (
                <Circle key={i} cx={toX(d.sem)} cy={toY(d.peso)} r="3.5"
                    fill={ACCENT} opacity="0.9" />
            ))}

            {/* Labels X */}
            {[0, 8, 16, 24, 28].map(s => (
                <SvgText key={s} x={toX(s)} y={PT + uH + 16}
                    fontSize="8" fill={C.second} textAnchor="middle">{s}sem</SvgText>
            ))}

            <SvgText x={0} y={0} fontSize="9" fill={C.second} textAnchor="middle"
                transform={`rotate(-90) translate(${-(PT + uH / 2)}, 12)`}>kg</SvgText>
        </Svg>
    );
}

const FEATURES = [
    { icon: 'calendar',          text: 'Cálculo e acompanhamento da idade gestacional' },
    { icon: 'scale-outline',     text: 'Controle de peso com curva recomendada OMS' },
    { icon: 'heart',             text: 'Monitoramento de PA e risco de pré-eclâmpsia' },
    { icon: 'fitness',           text: 'Contador de movimentos fetais' },
    { icon: 'medkit',            text: 'Agenda de consultas pré-natais e exames' },
    { icon: 'notifications',     text: 'Alertas personalizados por trimestre' },
    { icon: 'people',            text: 'Compartilhamento com obstetra via PAJE club' },
];

export default function GRAVsysPreviewScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>GRAVsys</Text>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>EM BREVE</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Hero */}
                <View style={styles.heroCard}>
                    <Image source={require('../../assets/gravsys.png')}
                        style={styles.heroImage} resizeMode="contain" />
                    <View style={styles.heroTextWrap}>
                        <Text style={styles.heroTitle}>Saúde na Gestação</Text>
                        <Text style={styles.heroDesc}>
                            Monitoramento completo da saúde da gestante, do pré-natal ao pós-parto.
                            Conectando mãe, bebê e profissional de saúde em uma plataforma inteligente.
                        </Text>
                    </View>
                </View>

                {/* Gráfico 1 */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="time-outline" size={14} color={ACCENT} />  Progresso Gestacional
                    </Text>
                    <Text style={styles.cardSub}>Acompanhamento semana a semana — exemplo: 16ª semana</Text>
                    <View style={styles.ringRow}>
                        <GestacaoRing semanas={16} />
                        <View style={styles.ringInfo}>
                            {[
                                { label: '1º Trimestre', range: '1 – 13 sem', color: '#94A3B8' },
                                { label: '2º Trimestre', range: '14 – 27 sem', color: ACCENT },
                                { label: '3º Trimestre', range: '28 – 40 sem', color: '#F9A8D4' },
                            ].map(t => (
                                <View key={t.label} style={styles.trimItem}>
                                    <View style={[styles.trimDot, { backgroundColor: t.color }]} />
                                    <View>
                                        <Text style={[styles.trimLabel, { color: t.color }]}>{t.label}</Text>
                                        <Text style={styles.trimRange}>{t.range}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Gráfico 2 */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="trending-up-outline" size={14} color={ACCENT} />  Controle de Peso
                    </Text>
                    <Text style={styles.cardSub}>Ganho de peso vs faixa recomendada — dados ilustrativos</Text>
                    <View style={{ marginTop: 8 }}>
                        <PesoChart />
                    </View>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendLine, { backgroundColor: ACCENT }]} />
                            <Text style={styles.legendText}>Peso da paciente</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendLine, { backgroundColor: ACCENT, opacity: 0.35 }]} />
                            <Text style={styles.legendText}>Faixa recomendada</Text>
                        </View>
                    </View>
                </View>

                {/* Funcionalidades */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="list" size={14} color={ACCENT} />  O que o GRAVsys oferece
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
                <PreCadastroForm sistema="GRAVsys" accentColor={ACCENT} />

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
    headerBtn: { padding: 6, backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border },
    headerTitle: { flex: 1, fontSize: 17, fontWeight: 'bold', color: C.text, marginLeft: 12 },
    headerBadge: {
        backgroundColor: ACCENT + '22', borderRadius: 6, borderWidth: 1,
        borderColor: ACCENT + '55', paddingHorizontal: 8, paddingVertical: 3,
    },
    headerBadgeText: { fontSize: 9, fontWeight: 'bold', color: ACCENT, letterSpacing: 1 },

    heroCard: {
        backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
        borderColor: C.border, borderLeftWidth: 4, borderLeftColor: ACCENT,
        flexDirection: 'row', alignItems: 'center',
        overflow: 'hidden', marginBottom: 14, padding: 14,
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
    cardSub:   { fontSize: 10, color: C.second, marginBottom: 8 },

    ringRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 8 },
    ringInfo: { gap: 12 },
    trimItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    trimDot:  { width: 10, height: 10, borderRadius: 5 },
    trimLabel: { fontSize: 12, fontWeight: 'bold' },
    trimRange: { fontSize: 10, color: C.second },

    legendRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendLine: { width: 20, height: 3, borderRadius: 2 },
    legendText: { fontSize: 10, color: C.second },

    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    featureIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    featureText: { flex: 1, fontSize: 12, color: C.second, lineHeight: 17 },
});
