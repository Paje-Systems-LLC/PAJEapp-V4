import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Text as SvgText, G, Rect } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';
import PreCadastroForm from '../components/paje/PreCadastroForm';

const ACCENT = '#60A5FA'; // azul PEDsys
const C = {
    bg: '#0A1325', card: '#162136',
    border: '#1E293B', text: '#E2E8F0', second: '#94A3B8',
};

// ── Gráfico 1: Curva de Crescimento (altura × idade) ──
// Dados OMS simplificados + criança de exemplo
const WHO_P3  = [49.9, 57.4, 62.4, 65.6, 68.0, 72.7, 76.0, 78.7, 81.2, 83.5, 85.6, 87.6, 89.5];
const WHO_P50 = [51.1, 59.8, 65.3, 68.9, 71.5, 76.9, 80.5, 83.3, 85.9, 88.4, 90.7, 92.9, 95.1];
const WHO_P97 = [52.9, 62.4, 68.4, 72.2, 75.1, 81.1, 85.0, 88.0, 90.8, 93.4, 95.9, 98.2, 100.5];
const CHILD   = [51.5, 60.2, 65.8, 69.4, 72.1, 77.5, 81.3, 84.0, null, null, null, null, null];
const MONTHS  = [0, 1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20];

function CrescimentoChart() {
    const { width: sw } = useWindowDimensions();
    const chartW = sw - 64;
    const H = 170, PL = 44, PT = 10, PB = 28, PR = 8;
    const uW = chartW - PL - PR, uH = H - PT - PB;

    const minV = 48, maxV = 102;
    const toX  = (i)   => PL + (i / (MONTHS.length - 1)) * uW;
    const toY  = (val) => PT + uH - ((val - minV) / (maxV - minV)) * uH;

    const linePath = (arr) => arr
        .map((v, i) => v != null ? `${i === 0 || arr[i - 1] == null ? 'M' : 'L'} ${toX(i)},${toY(v)}` : null)
        .filter(Boolean).join(' ');

    const areaP3P97 =
        WHO_P3.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(v)}`).join(' ') +
        ' ' +
        [...WHO_P97].reverse().map((v, i) => `L ${toX(WHO_P97.length - 1 - i)},${toY(v)}`).join(' ') + ' Z';

    const yTicks = [50, 60, 70, 80, 90, 100];

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

            {/* Área P3–P97 (faixa normal) */}
            <Path d={areaP3P97} fill={ACCENT} opacity="0.10" />

            {/* Curvas de referência OMS */}
            <Path d={linePath(WHO_P3)}  fill="none" stroke={ACCENT} strokeWidth="1" opacity="0.3" strokeDasharray="4,3" />
            <Path d={linePath(WHO_P50)} fill="none" stroke={ACCENT} strokeWidth="1.2" opacity="0.5" strokeDasharray="4,3" />
            <Path d={linePath(WHO_P97)} fill="none" stroke={ACCENT} strokeWidth="1" opacity="0.3" strokeDasharray="4,3" />

            {/* Curva da criança */}
            <Path d={linePath(CHILD)} fill="none" stroke={ACCENT} strokeWidth="2.2" />
            {CHILD.map((v, i) => v != null ? (
                <Circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill={ACCENT} opacity="0.95" />
            ) : null)}

            {/* Labels X — meses selecionados */}
            {[0, 2, 4, 6, 8, 10, 12].map(i => (
                <SvgText key={i} x={toX(i)} y={PT + uH + 16}
                    fontSize="8" fill={C.second} textAnchor="middle">{MONTHS[i]}m</SvgText>
            ))}

            <SvgText x={0} y={0} fontSize="9" fill={C.second} textAnchor="middle"
                transform={`rotate(-90) translate(${-(PT + uH / 2)}, 12)`}>cm</SvgText>

            {/* Labels OMS */}
            <SvgText x={chartW - PR - 2} y={toY(WHO_P97[12]) - 4} fontSize="8" fill={ACCENT} opacity="0.6" textAnchor="end">P97</SvgText>
            <SvgText x={chartW - PR - 2} y={toY(WHO_P50[12]) - 4} fontSize="8" fill={ACCENT} opacity="0.6" textAnchor="end">P50</SvgText>
            <SvgText x={chartW - PR - 2} y={toY(WHO_P3[12])  + 12} fontSize="8" fill={ACCENT} opacity="0.6" textAnchor="end">P3</SvgText>
        </Svg>
    );
}

// ── Gráfico 2: Calendário de Vacinação ──
const VACINAS = [
    { nome: 'BCG + Hep B',    meses: 0,  feita: true  },
    { nome: 'Penta + VIP',    meses: 2,  feita: true  },
    { nome: 'Pneumo 10 + MenC', meses: 3, feita: true },
    { nome: 'Penta + VIP',    meses: 4,  feita: true  },
    { nome: 'Pneumo + MenC',  meses: 6,  feita: false },
    { nome: 'Influenza',      meses: 6,  feita: false },
    { nome: 'SCR + Varicela', meses: 12, feita: false },
    { nome: 'DTP + VOP + Hep A', meses: 15, feita: false },
];

function VacinaCalendar() {
    const { width: sw } = useWindowDimensions();
    const chartW = sw - 64;
    const ROW_H = 22, PL = 90, PR = 8, PT = 8;
    const H = VACINAS.length * ROW_H + PT + 20;
    const maxM = 16;
    const toX = (m) => PL + (m / maxM) * (chartW - PL - PR);

    return (
        <Svg width={chartW} height={H}>
            {/* Grade vertical */}
            {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(m => (
                <G key={m}>
                    <Line x1={toX(m)} y1={PT} x2={toX(m)} y2={H - 16} stroke="#2D3F55" strokeWidth="0.5" opacity="0.7" />
                    <SvgText x={toX(m)} y={H - 4} fontSize="8" fill={C.second} textAnchor="middle">{m}m</SvgText>
                </G>
            ))}

            {VACINAS.map((v, i) => {
                const y = PT + i * ROW_H;
                const cx = toX(v.meses);
                return (
                    <G key={i}>
                        {/* Nome */}
                        <SvgText x={PL - 6} y={y + 14} fontSize="8.5"
                            fill={v.feita ? C.text : C.second} textAnchor="end">{v.nome}</SvgText>
                        {/* Marcador */}
                        <Rect x={cx - 7} y={y + 4} width={14} height={14} rx={3}
                            fill={v.feita ? ACCENT : '#1E293B'}
                            stroke={ACCENT} strokeWidth={v.feita ? 0 : 1} opacity={v.feita ? 1 : 0.5} />
                        <SvgText x={cx} y={y + 14} fontSize="8" fill={v.feita ? '#000' : C.second} textAnchor="middle">
                            {v.feita ? '✓' : '○'}
                        </SvgText>
                    </G>
                );
            })}
        </Svg>
    );
}

const FEATURES = [
    { icon: 'trending-up',   text: 'Curvas de crescimento OMS (peso, altura, perímetro cefálico)' },
    { icon: 'medkit',        text: 'Calendário nacional de vacinação com alertas de vencimento' },
    { icon: 'star',          text: 'Marco de desenvolvimento motor, cognitivo e de linguagem' },
    { icon: 'thermometer',   text: 'Registro de febre e episódios de doenças' },
    { icon: 'document-text', text: 'Diário pediátrico e compartilhamento com pediatra' },
    { icon: 'notifications', text: 'Alertas de consultas, vacinas e exames periódicos' },
    { icon: 'people',        text: 'Perfis para múltiplas crianças na mesma conta' },
];

export default function PEDsysPreviewScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PEDsys</Text>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>EM BREVE</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Hero */}
                <View style={styles.heroCard}>
                    <Image source={require('../../assets/pedsys.png')}
                        style={styles.heroImage} resizeMode="contain" />
                    <View style={styles.heroTextWrap}>
                        <Text style={styles.heroTitle}>Saúde Pediátrica</Text>
                        <Text style={styles.heroDesc}>
                            Acompanhe o crescimento, desenvolvimento e saúde do seu filho do nascimento à adolescência.
                            Integrado ao pediatra via PAJE club.
                        </Text>
                    </View>
                </View>

                {/* Gráfico 1 */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="trending-up-outline" size={14} color={ACCENT} />  Curva de Crescimento — Altura
                    </Text>
                    <Text style={styles.cardSub}>Padrão OMS · Criança de exemplo (azul) · Dados ilustrativos</Text>
                    <View style={{ marginTop: 8 }}>
                        <CrescimentoChart />
                    </View>
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendLine, { backgroundColor: ACCENT }]} />
                            <Text style={styles.legendText}>Criança</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendLine, { backgroundColor: ACCENT, opacity: 0.35 }]} />
                            <Text style={styles.legendText}>Faixa OMS (P3–P97)</Text>
                        </View>
                    </View>
                </View>

                {/* Gráfico 2 */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="medical-outline" size={14} color={ACCENT} />  Calendário de Vacinação
                    </Text>
                    <Text style={styles.cardSub}>Vacinas realizadas (azul) e pendentes — dados ilustrativos</Text>
                    <View style={{ marginTop: 8 }}>
                        <VacinaCalendar />
                    </View>
                </View>

                {/* Funcionalidades */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        <Ionicons name="list" size={14} color={ACCENT} />  O que o PEDsys oferece
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
                <PreCadastroForm sistema="PEDsys" accentColor={ACCENT} />

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

    legendRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendLine: { width: 20, height: 3, borderRadius: 2 },
    legendText: { fontSize: 10, color: C.second },

    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    featureIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    featureText: { flex: 1, fontSize: 12, color: C.second, lineHeight: 17 },
});
