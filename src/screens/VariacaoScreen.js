import { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet,
    ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Line, Text as SvgText, G, Circle, Path, Polyline } from 'react-native-svg';
import { useIsFocused } from '@react-navigation/native';
import api from '../services/api';
import { ZONES } from '../components/hdsys/GaugeChart';

const C = {
    bg:         '#0A1325',
    card:       '#162136',
    border:     '#1E293B',
    text:       '#E2E8F0',
    textSecond: '#94A3B8',
    gold:       '#D4AF37',
};

const getPAMZone = (pam) => {
    const v = Number(pam);
    return ZONES.find(z => v >= z.min && v < z.max) ?? ZONES[ZONES.length - 1];
};

const fmtDate = (dtStr) => {
    if (!dtStr) return '';
    const d = new Date(dtStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
           '  ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// ── Tooltip SVG ──
// Renderizado dentro do SVG, sempre na camada mais alta
function SvgTooltip({ x, y, chartW, lines, borderColor }) {
    const TW  = 128;
    const TH  = lines.length * 15 + 14;
    let   tx  = x + 10;
    let   ty  = y - TH - 10;
    if (tx + TW > chartW - 4) tx = x - TW - 10;
    if (ty < 2)               ty = y + 10;

    return (
        <G>
            {/* Sombra */}
            <Rect x={tx + 2} y={ty + 2} width={TW} height={TH} rx={5} fill="#000000" opacity="0.35" />
            {/* Fundo */}
            <Rect x={tx} y={ty} width={TW} height={TH} rx={5} fill="#0D1B30" opacity="0.97" />
            {/* Borda colorida */}
            <Rect x={tx} y={ty} width={TW} height={TH} rx={5} fill="none"
                stroke={borderColor} strokeWidth="1.2" opacity="0.85" />
            {/* Linhas de texto */}
            {lines.map((line, i) => (
                <SvgText
                    key={i}
                    x={tx + 8} y={ty + 13 + i * 15}
                    fontSize="10"
                    fill={line.color || C.text}
                    fontWeight={i === 0 ? 'bold' : 'normal'}
                >{line.text}</SvgText>
            ))}
        </G>
    );
}

// ── Histograma SVG ──
const PAM_MAX   = 300;
const PX_PER_MM = 4;
const CHART_H   = 200;
const PAD_L     = 52;
const PAD_B     = 36;
const PAD_T     = 14;

const ZONE_BOUNDS = [70, 80, 93, 107, 120, 133, 140];
const X_LABELS   = [0, 70, 93, 107, 140, 200, 300];

function PAMHistogram({ data }) {
    const [selected, setSelected] = useState(null);

    if (!data.length) return (
        <View style={styles.emptyChart}>
            <Ionicons name="bar-chart-outline" size={40} color={C.textSecond} />
            <Text style={styles.emptyText}>Sem dados para exibir.</Text>
        </View>
    );

    const freq = new Array(PAM_MAX + 1).fill(0);
    data.forEach(item => {
        const v = Math.round(Number(item.patient_pam));
        if (v >= 0 && v <= PAM_MAX) freq[v]++;
    });

    const maxFreq     = Math.max(...freq, 1);
    const usableH     = CHART_H - PAD_T - PAD_B;
    const chartW      = PAD_L + PAM_MAX * PX_PER_MM + 16;
    const uniqueCount = freq.filter(f => f > 0).length;
    const barWidth    = Math.max(2, Math.min(20, Math.round(260 / Math.max(uniqueCount * 2, 1))));
    const yTicks      = Array.from({ length: maxFreq + 1 }, (_, i) => i);

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Svg width={chartW} height={CHART_H}>

                {/* Eixos */}
                <Line x1={PAD_L} y1={PAD_T + usableH} x2={chartW - 8} y2={PAD_T + usableH}
                    stroke="#2D3F55" strokeWidth="1" />
                <Line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + usableH}
                    stroke="#2D3F55" strokeWidth="1" />

                {/* Grade Y */}
                {yTicks.map(tick => {
                    const y = PAD_T + usableH - (tick / maxFreq) * usableH;
                    return (
                        <G key={`ytick-${tick}`}>
                            <Line x1={PAD_L} y1={y} x2={chartW - 8} y2={y}
                                stroke="#2D3F55" strokeWidth="0.6" opacity="0.8" />
                            <SvgText x={PAD_L - 6} y={y + 4}
                                fontSize="9" fill={C.textSecond} textAnchor="end"
                            >{tick}</SvgText>
                        </G>
                    );
                })}

                {/* Grade X a cada 50 mmHg */}
                {[50, 100, 150, 200, 250, 300].map(pam => (
                    <Line key={`grid-v-${pam}`}
                        x1={PAD_L + pam * PX_PER_MM} y1={PAD_T}
                        x2={PAD_L + pam * PX_PER_MM} y2={PAD_T + usableH}
                        stroke="#2D3F55" strokeWidth="0.6" opacity="0.8" />
                ))}

                {/* Limites de zona */}
                {ZONE_BOUNDS.map(pam => (
                    <Line key={`zone-${pam}`}
                        x1={PAD_L + pam * PX_PER_MM} y1={PAD_T}
                        x2={PAD_L + pam * PX_PER_MM} y2={PAD_T + usableH}
                        stroke={getPAMZone(pam).color} strokeWidth="1.2" opacity="0.7" />
                ))}

                {/* Barras — toque para tooltip */}
                {freq.map((count, pam) => {
                    if (count === 0) return null;
                    const zone  = getPAMZone(pam);
                    const barH  = (count / maxFreq) * usableH;
                    const bx    = PAD_L + pam * PX_PER_MM;
                    const by    = PAD_T + usableH - barH;
                    const isSel = selected?.pam === pam;
                    // Área de toque maior que a barra visual
                    const hitW  = Math.max(barWidth + 6, 10);
                    return (
                        <G key={pam}
                            onPress={() => setSelected(isSel ? null : { pam, count, bx, by, zone })}
                        >
                            {/* Área de toque invisível */}
                            <Rect
                                x={bx - hitW / 2} y={PAD_T}
                                width={hitW} height={usableH}
                                fill="transparent"
                            />
                            {/* Barra visível */}
                            <Rect
                                x={bx - barWidth / 2} y={by}
                                width={barWidth} height={barH}
                                fill={zone.color}
                                opacity={isSel ? 1 : 0.85}
                                rx={1}
                            />
                            {/* Anel de seleção */}
                            {isSel && (
                                <Rect
                                    x={bx - barWidth / 2 - 1} y={by - 1}
                                    width={barWidth + 2} height={barH + 1}
                                    fill="none" stroke="#FFFFFF"
                                    strokeWidth="1" rx={2} opacity="0.6"
                                />
                            )}
                        </G>
                    );
                })}

                {/* Labels eixo X */}
                {X_LABELS.map(pam => {
                    const x = PAD_L + pam * PX_PER_MM;
                    return (
                        <G key={`xlabel-${pam}`}>
                            <Line x1={x} y1={PAD_T + usableH} x2={x} y2={PAD_T + usableH + 4}
                                stroke={C.textSecond} strokeWidth="1" />
                            <SvgText x={x} y={PAD_T + usableH + 14}
                                fontSize="9" fill={C.textSecond} textAnchor="middle"
                            >{pam}</SvgText>
                        </G>
                    );
                })}

                {/* Label eixo Y */}
                <SvgText x={0} y={0} fontSize="10" fill={C.textSecond} textAnchor="middle" fontWeight="bold"
                    transform={`rotate(-90) translate(${-(PAD_T + (CHART_H - PAD_T - PAD_B) / 2)}, 12)`}
                >Nº de verificações</SvgText>

                {/* Tooltip */}
                {selected && (
                    <SvgTooltip
                        x={selected.bx}
                        y={selected.by}
                        chartW={chartW}
                        borderColor={selected.zone.color}
                        lines={[
                            { text: selected.zone.label, color: selected.zone.color },
                            { text: `PAM: ${selected.pam} mmHg` },
                            { text: `Freq: ${selected.count}×` },
                        ]}
                    />
                )}
            </Svg>
        </ScrollView>
    );
}

// ── Série Temporal — gráfico de pontos ──
const SC_H     = 200;
const SC_PAD_L = 52;
const SC_PAD_T = 14;
const SC_PAD_B = 36;
const SC_PT_W  = 18;

const Y_REFS = [70, 80, 93, 107, 120, 133, 140];

function PAMScatter({ data }) {
    const [selected, setSelected] = useState(null);

    if (!data.length) return null;

    const ordered = [...data].reverse();
    const pamVals = ordered.map(d => Number(d.patient_pam) || 0);
    const minPAM  = Math.max(0,   Math.min(...pamVals) - 10);
    const maxPAM  = Math.min(300, Math.max(...pamVals) + 10);
    const usableH = SC_H - SC_PAD_T - SC_PAD_B;
    const chartW  = SC_PAD_L + ordered.length * SC_PT_W + 20;
    const r       = Math.max(3, Math.min(7, Math.round(120 / ordered.length)));

    const toY = (pam) => SC_PAD_T + usableH - ((pam - minPAM) / (maxPAM - minPAM)) * usableH;
    const toX = (i)   => SC_PAD_L + i * SC_PT_W + SC_PT_W / 2;

    const yStep  = (maxPAM - minPAM) / 4;
    const yTicks = Array.from({ length: 5 }, (_, i) => Math.round(minPAM + i * yStep));
    const xStep  = Math.max(1, Math.round(ordered.length / 8));

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Svg width={chartW} height={SC_H}>

                {/* Eixos */}
                <Line x1={SC_PAD_L} y1={SC_PAD_T} x2={SC_PAD_L} y2={SC_PAD_T + usableH}
                    stroke="#2D3F55" strokeWidth="1" />
                <Line x1={SC_PAD_L} y1={SC_PAD_T + usableH} x2={chartW - 8} y2={SC_PAD_T + usableH}
                    stroke="#2D3F55" strokeWidth="1" />

                {/* Grade Y */}
                {yTicks.map(v => {
                    const y = toY(v);
                    return (
                        <G key={`yt-${v}`}>
                            <Line x1={SC_PAD_L} y1={y} x2={chartW - 8} y2={y}
                                stroke="#2D3F55" strokeWidth="0.6" opacity="0.8" />
                            <SvgText x={SC_PAD_L - 6} y={y + 4}
                                fontSize="9" fill={C.textSecond} textAnchor="end"
                            >{v}</SvgText>
                        </G>
                    );
                })}

                {/* Referências de zona */}
                {Y_REFS.filter(v => v >= minPAM && v <= maxPAM).map(v => (
                    <Line key={`ref-${v}`}
                        x1={SC_PAD_L} y1={toY(v)} x2={chartW - 8} y2={toY(v)}
                        stroke={getPAMZone(v).color} strokeWidth="1" opacity="0.5" />
                ))}

                {/* Linha de tendência */}
                {ordered.map((item, i) => {
                    if (i === 0) return null;
                    return (
                        <Line key={`ln-${i}`}
                            x1={toX(i - 1)} y1={toY(Number(ordered[i - 1].patient_pam) || 0)}
                            x2={toX(i)}     y2={toY(Number(item.patient_pam) || 0)}
                            stroke="#2D3F55" strokeWidth="1" opacity="0.9" />
                    );
                })}

                {/* Pontos — toque para tooltip */}
                {ordered.map((item, i) => {
                    const pam  = Number(item.patient_pam) || 0;
                    const zone = getPAMZone(pam);
                    const cx   = toX(i);
                    const cy   = toY(pam);
                    const isSel = selected?.index === i;
                    return (
                        <G key={`pt-${i}`}
                            onPress={() => setSelected(isSel ? null : { index: i, item, cx, cy, pam, zone })}
                        >
                            {/* Área de toque ampliada */}
                            <Circle cx={cx} cy={cy} r={Math.max(r + 4, 10)} fill="transparent" />
                            {/* Anel de seleção */}
                            {isSel && (
                                <Circle cx={cx} cy={cy} r={r + 5}
                                    fill="none" stroke={zone.color} strokeWidth="1.5" opacity="0.7" />
                            )}
                            {/* Ponto visível */}
                            <Circle cx={cx} cy={cy} r={isSel ? r + 1 : r}
                                fill={zone.color} opacity="0.9" />
                        </G>
                    );
                })}

                {/* Labels eixo X */}
                {ordered.map((item, i) => {
                    if (i % xStep !== 0) return null;
                    const d   = new Date(item.patient_datetime || item.created_at);
                    const lbl = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    return (
                        <SvgText key={`xl-${i}`}
                            x={toX(i)} y={SC_PAD_T + usableH + 14}
                            fontSize="8" fill={C.textSecond} textAnchor="middle"
                        >{lbl}</SvgText>
                    );
                })}

                {/* Label eixo Y */}
                <SvgText x={0} y={0} fontSize="10" fill={C.textSecond} textAnchor="middle" fontWeight="bold"
                    transform={`rotate(-90) translate(${-(SC_PAD_T + usableH / 2)}, 12)`}
                >PAM mmHg</SvgText>

                {/* Tooltip */}
                {selected && (() => {
                    const it = selected.item;
                    const fc = it.patient_heart_rate ? `FC: ${it.patient_heart_rate} bpm` : null;
                    const lines = [
                        { text: selected.zone.label, color: selected.zone.color },
                        { text: `PAM: ${Math.round(selected.pam)} mmHg` },
                        { text: `PAS: ${it.patient_pas}  PAD: ${it.patient_pad}` },
                        ...(fc ? [{ text: fc, color: C.textSecond }] : []),
                        { text: fmtDate(it.patient_datetime || it.created_at), color: C.textSecond },
                    ];
                    return (
                        <SvgTooltip
                            x={selected.cx} y={selected.cy}
                            chartW={chartW}
                            borderColor={selected.zone.color}
                            lines={lines}
                        />
                    );
                })()}

            </Svg>
        </ScrollView>
    );
}

// ── Gráfico de Área PAS × PAD ──
const AR_H     = 220;
const AR_PAD_L = 52;
const AR_PAD_T = 14;
const AR_PAD_B = 36;
const AR_PT_W  = 18;

function PASPADArea({ data }) {
    const [selected, setSelected] = useState(null);

    if (!data.length) return null;

    const ordered = [...data].reverse();
    const pasVals = ordered.map(d => Number(d.patient_pas) || 0);
    const padVals = ordered.map(d => Number(d.patient_pad) || 0);
    const allVals = [...pasVals, ...padVals];
    const minV    = Math.max(0,   Math.min(...allVals) - 10);
    const maxV    = Math.min(300, Math.max(...allVals) + 10);
    const usableH = AR_H - AR_PAD_T - AR_PAD_B;
    const chartW  = AR_PAD_L + ordered.length * AR_PT_W + 20;
    const baseline = AR_PAD_T + usableH;

    const toY = (v) => AR_PAD_T + usableH - ((v - minV) / (maxV - minV)) * usableH;
    const toX = (i) => AR_PAD_L + i * AR_PT_W + AR_PT_W / 2;

    const yStep  = (maxV - minV) / 4;
    const yTicks = Array.from({ length: 5 }, (_, i) => Math.round(minV + i * yStep));

    const padAreaPath = `M ${toX(0)},${baseline} ` +
        ordered.map((d, i) => `L ${toX(i)},${toY(Number(d.patient_pad) || 0)}`).join(' ') +
        ` L ${toX(ordered.length - 1)},${baseline} Z`;

    const pulseAreaPath =
        ordered.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)},${toY(Number(d.patient_pad) || 0)}`).join(' ') +
        ' ' +
        [...ordered].reverse().map((d, i) => `L ${toX(ordered.length - 1 - i)},${toY(Number(d.patient_pas) || 0)}`).join(' ') +
        ' Z';

    const pasLine = ordered.map((d, i) => `${toX(i)},${toY(Number(d.patient_pas) || 0)}`).join(' ');
    const padLine = ordered.map((d, i) => `${toX(i)},${toY(Number(d.patient_pad) || 0)}`).join(' ');

    const xStep = Math.max(1, Math.round(ordered.length / 8));

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Svg width={chartW} height={AR_H}>

                {/* Eixos */}
                <Line x1={AR_PAD_L} y1={AR_PAD_T} x2={AR_PAD_L} y2={baseline}
                    stroke="#2D3F55" strokeWidth="1" />
                <Line x1={AR_PAD_L} y1={baseline} x2={chartW - 8} y2={baseline}
                    stroke="#2D3F55" strokeWidth="1" />

                {/* Grade Y */}
                {yTicks.map(v => {
                    const y = toY(v);
                    return (
                        <G key={`yt-${v}`}>
                            <Line x1={AR_PAD_L} y1={y} x2={chartW - 8} y2={y}
                                stroke="#2D3F55" strokeWidth="0.6" opacity="0.8" />
                            <SvgText x={AR_PAD_L - 6} y={y + 4}
                                fontSize="9" fill={C.textSecond} textAnchor="end"
                            >{v}</SvgText>
                        </G>
                    );
                })}

                {/* Áreas */}
                <Path d={padAreaPath}   fill="#1565C0" opacity="0.35" />
                <Path d={pulseAreaPath} fill="#D4AF37" opacity="0.30" />

                {/* Linhas */}
                <Polyline points={padLine} fill="none" stroke="#0288D1" strokeWidth="1.8" />
                <Polyline points={pasLine} fill="none" stroke="#EF6C00" strokeWidth="1.8" />

                {/* Pontos de toque invisíveis — entre PAD e PAS */}
                {ordered.map((item, i) => {
                    const pas  = Number(item.patient_pas) || 0;
                    const pad  = Number(item.patient_pad) || 0;
                    const pam  = Number(item.patient_pam) || 0;
                    const zone = getPAMZone(pam);
                    const cx   = toX(i);
                    // Ponto de toque no meio da área de pulso
                    const cy   = (toY(pas) + toY(pad)) / 2;
                    const isSel = selected?.index === i;
                    return (
                        <G key={`hit-${i}`}
                            onPress={() => setSelected(isSel ? null : { index: i, item, cx, cy, pas, pad, pam, zone })}
                        >
                            <Rect
                                x={cx - AR_PT_W / 2} y={AR_PAD_T}
                                width={AR_PT_W} height={usableH}
                                fill="transparent"
                            />
                            {/* Marcadores visuais quando selecionado */}
                            {isSel && (
                                <>
                                    <Circle cx={cx} cy={toY(pas)} r={4}
                                        fill="#EF6C00" opacity="0.9" />
                                    <Circle cx={cx} cy={toY(pad)} r={4}
                                        fill="#0288D1" opacity="0.9" />
                                    <Line
                                        x1={cx} y1={toY(pas)}
                                        x2={cx} y2={toY(pad)}
                                        stroke="#FFFFFF" strokeWidth="1" opacity="0.4"
                                    />
                                </>
                            )}
                        </G>
                    );
                })}

                {/* Labels eixo X */}
                {ordered.map((item, i) => {
                    if (i % xStep !== 0) return null;
                    const d   = new Date(item.patient_datetime || item.created_at);
                    const lbl = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    return (
                        <SvgText key={`xl-${i}`}
                            x={toX(i)} y={baseline + 14}
                            fontSize="8" fill={C.textSecond} textAnchor="middle"
                        >{lbl}</SvgText>
                    );
                })}

                {/* Label eixo Y */}
                <SvgText x={0} y={0} fontSize="10" fill={C.textSecond} textAnchor="middle" fontWeight="bold"
                    transform={`rotate(-90) translate(${-(AR_PAD_T + usableH / 2)}, 12)`}
                >mmHg</SvgText>

                {/* Tooltip */}
                {selected && (() => {
                    const it = selected.item;
                    const pp = selected.pas - selected.pad;
                    const fc = it.patient_heart_rate ? `FC: ${it.patient_heart_rate} bpm` : null;
                    const lines = [
                        { text: selected.zone.label, color: selected.zone.color },
                        { text: `PAS: ${selected.pas} mmHg`, color: '#EF6C00' },
                        { text: `PAD: ${selected.pad} mmHg`, color: '#0288D1' },
                        { text: `PAM: ${Math.round(selected.pam)}  PP: ${pp}` },
                        ...(fc ? [{ text: fc, color: C.textSecond }] : []),
                        { text: fmtDate(it.patient_datetime || it.created_at), color: C.textSecond },
                    ];
                    return (
                        <SvgTooltip
                            x={selected.cx} y={selected.cy}
                            chartW={chartW}
                            borderColor={selected.zone.color}
                            lines={lines}
                        />
                    );
                })()}

            </Svg>
        </ScrollView>
    );
}

// ── Tela ──
export default function VariacaoScreen({ navigation }) {
    const [data, setData]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isFocused                   = useIsFocused();

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/api/history/');
            const results = res.data.results || res.data;
            setData(Array.isArray(results) ? results : []);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { if (isFocused) { setLoading(true); fetchData(); } }, [isFocused]);

    return (
        <SafeAreaView style={styles.root} edges={['top']}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Variação PAM</Text>
                <TouchableOpacity
                    onPress={() => { setRefreshing(true); fetchData(); }}
                    style={styles.headerBtn}
                >
                    <Ionicons name="refresh" size={20} color={C.gold} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={C.gold} />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchData(); }}
                            tintColor={C.gold}
                        />
                    }
                >
                    {/* Histograma */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            <Ionicons name="bar-chart" size={14} color={C.gold} />  Frequência de mensurações × PAM em mmHg
                        </Text>
                        <Text style={styles.cardSub}>{data.length} medições  •  Toque na barra para detalhes</Text>
                        <View style={styles.chartWrap}>
                            <PAMHistogram data={data} />
                            <Text style={styles.xAxisLabel}>mmHg</Text>
                        </View>
                    </View>

                    {/* Série Temporal */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            <Ionicons name="pulse" size={14} color={C.gold} />  Série Temporal — PAM
                        </Text>
                        <Text style={styles.cardSub}>Eixo X: data  •  Eixo Y: PAM mmHg  •  Toque no ponto para detalhes</Text>
                        <View style={styles.chartWrap}>
                            <PAMScatter data={data} />
                        </View>
                        <Text style={styles.xAxisLabel}>Data da mensuração</Text>
                    </View>

                    {/* PAS × PAD Área */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            <Ionicons name="water" size={14} color={C.gold} />  Série Temporal — PAS × PAD
                        </Text>
                        <Text style={styles.cardSub}>Área azul = PAD  •  Área dourada = PAS–PAD  •  Toque na coluna para detalhes</Text>
                        <View style={styles.chartWrap}>
                            <PASPADArea data={data} />
                        </View>
                        <Text style={styles.xAxisLabel}>Data da mensuração</Text>
                    </View>

                    {/* Legenda */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Legenda — SBC 2025</Text>
                        <View style={styles.legend}>
                            {ZONES.map((z, i) => (
                                <View key={i} style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: z.color }]} />
                                    <Text style={styles.legendLabel}>{z.label}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.legendFooter}>
                            Classificação baseada nas diretrizes da Sociedade Brasileira de Cardiologia de 2025.
                        </Text>
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root:     { flex: 1, backgroundColor: C.bg },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: C.textSecond, fontSize: 14 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerBtn:   { padding: 6, backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border },
    headerTitle: { fontSize: 17, fontWeight: 'bold', color: C.text },

    scroll: { padding: 16, paddingBottom: 40 },

    card: {
        backgroundColor: C.card, borderRadius: 12,
        borderWidth: 1, borderColor: C.border,
        padding: 14, marginBottom: 16,
    },
    cardTitle: { fontSize: 13, fontWeight: 'bold', color: C.text, marginBottom: 2 },
    cardSub:   { fontSize: 10, color: C.textSecond, marginBottom: 10 },
    chartWrap: { marginTop: 4 },
    xAxisLabel: { textAlign: 'center', fontSize: 11, fontWeight: 'bold', color: '#94A3B8', marginTop: 4 },

    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' },
    legendColor: { width: 10, height: 10, borderRadius: 2 },
    legendLabel: { fontSize: 11, color: C.text, flex: 1 },

    legendFooter: { fontSize: 9, color: C.textSecond, marginTop: 10, fontStyle: 'italic' },

    emptyChart: { alignItems: 'center', paddingVertical: 30 },
    emptyText:  { color: C.textSecond, fontSize: 13, marginTop: 10 },
});
