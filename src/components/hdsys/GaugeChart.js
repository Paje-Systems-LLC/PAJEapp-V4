import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle, Text as SvgText, Line } from 'react-native-svg';

// ── SBC 2025 — Diretriz Brasileira de Hipertensão Arterial ──
// Faixas baseadas em PAM = (PAS + 2×PAD) / 3
// Distribuição homogênea: cada zona ocupa 22.5° (180° / 8 zonas)

const CX = 150;
const CY = 150;
const R  = 110;
const SW = 28;

// Cores: tons FRIOS (azul/índigo) para hipotensão ← VERDE normal → tons QUENTES (amarelo/laranja/vermelho) para hipertensão
export const ZONES = [
    { min: 0,   max: 70,  color: '#1A237E', label: 'Hipotensão Grave',    emoji: '🚨', pas: '< 90',    pad: '< 60'    },
    { min: 70,  max: 80,  color: '#0288D1', label: 'Hipotensão Relativa', emoji: '⚠️', pas: '90–99',   pad: '60–69'   },
    { min: 80,  max: 93,  color: '#00C853', label: 'PA Normal',           emoji: '✅', pas: '100–119', pad: '70–79'   },
    { min: 93,  max: 107, color: '#8BC34A', label: 'Pré-Hipertensão',     emoji: '⚡', pas: '120–139', pad: '80–89'   },
    { min: 107, max: 120, color: '#FDD835', label: 'HAS Estágio 1',       emoji: '😕', pas: '140–159', pad: '90–99'   },
    { min: 120, max: 133, color: '#EF6C00', label: 'HAS Estágio 2',       emoji: '😰', pas: '160–179', pad: '100–109' },
    { min: 133, max: 140, color: '#D32F2F', label: 'HAS Estágio 3',       emoji: '🆘', pas: '≥ 180',   pad: '≥ 110'   },
    { min: 140, max: 300, color: '#4A0000', label: 'Crise Hipertensiva',  emoji: '💀', pas: '≥ 180',   pad: '≥ 120'   },
];

// Breakpoints: PAM value → porcentagem do arco (0.0 a 1.0)
// Distribuição logarítmica: arco ∝ ln(amplitude da zona) — zonas com tamanhos diferentes,
// cobrindo o gauge inteiro. Amplitudes: [70, 10, 13, 14, 13, 13, 7, 160]
const BREAKPOINTS = [
    { pam:   0, pct: 0.0000 },
    { pam:  70, pct: 0.1778 },  // ln(70)  = 4.25  → 17.8%
    { pam:  80, pct: 0.2742 },  // ln(10)  = 2.30  →  9.6%
    { pam:  93, pct: 0.3814 },  // ln(13)  = 2.56  → 10.7%
    { pam: 107, pct: 0.4918 },  // ln(14)  = 2.64  → 11.0%
    { pam: 120, pct: 0.5991 },  // ln(13)  = 2.56  → 10.7%
    { pam: 133, pct: 0.7063 },  // ln(13)  = 2.56  → 10.7%
    { pam: 140, pct: 0.7877 },  // ln(7)   = 1.95  →  8.1%
    { pam: 300, pct: 1.0000 },  // ln(160) = 5.08  → 21.2%
];

const toRad = (deg) => (deg * Math.PI) / 180;

// Mapeamento piecewise linear — cada zona ocupa 22.5° independente da amplitude real
const valueToAngle = (val) => {
    const clamped = Math.min(Math.max(val ?? 0, 0), 300);
    for (let i = 0; i < BREAKPOINTS.length - 1; i++) {
        const lo = BREAKPOINTS[i];
        const hi = BREAKPOINTS[i + 1];
        if (clamped >= lo.pam && clamped <= hi.pam) {
            const t = (clamped - lo.pam) / (hi.pam - lo.pam);
            const pct = lo.pct + t * (hi.pct - lo.pct);
            return -180 + pct * 180;
        }
    }
    return 0;
};

const arcPath = (startAngle, endAngle) => {
    const s = toRad(startAngle);
    const e = toRad(endAngle);
    const x1 = CX + R * Math.cos(s);
    const y1 = CY + R * Math.sin(s);
    const x2 = CX + R * Math.cos(e);
    const y2 = CY + R * Math.sin(e);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
};

// ── Helpers exportados ──

export const getPAMClass = (val) => {
    if (val == null || isNaN(val)) return { label: 'Sem dados', color: '#64748B', emoji: '—', pas: '--', pad: '--' };
    const zone = ZONES.find(z => val >= z.min && val < z.max) ?? ZONES[ZONES.length - 1];
    return zone;
};

export const getPAMMessage = (val) => {
    if (val == null || isNaN(val)) return 'Adicione uma medição para ver sua classificação.';
    if (val < 70)  return 'Pressão muito baixa. Procure atendimento imediato.';
    if (val < 80)  return 'Hipotensão relativa. Hidrate-se e descanse.';
    if (val < 93)  return 'Pressão normal. Continue com seus hábitos saudáveis!';
    if (val < 107) return 'Pré-hipertensão (SBC 2025). Monitore com frequência e adote hábitos saudáveis.';
    if (val < 120) return 'Hipertensão Estágio 1. Consulte seu médico.';
    if (val < 133) return 'Hipertensão Estágio 2. Tratamento médico necessário.';
    if (val < 140) return 'Hipertensão Estágio 3. Procure atendimento médico urgente!';
    return 'Crise Hipertensiva. Emergência médica imediata!';
};

// ── Componente ──

export default function GaugeChart({ value, size = 300 }) {
    const needleAngle = valueToAngle(value);
    const pamClass    = getPAMClass(value);

    // Ticks dos limites de zona para referência visual
    const tickAngles = BREAKPOINTS.slice(1, -1).map(bp => valueToAngle(bp.pam));

    return (
        <View style={styles.wrap}>
            <Svg width={size} height={size * 0.6} viewBox="0 0 300 175">

                {/* Trilha de fundo */}
                <Path d={arcPath(-180, 0)} stroke="#1E293B" strokeWidth={SW} fill="none" />

                {/* Zonas coloridas — cada uma ocupa 22.5° */}
                {ZONES.map((zone, i) => {
                    const sa = valueToAngle(zone.min);
                    const ea = valueToAngle(zone.max);
                    if (sa >= ea) return null;
                    return (
                        <Path
                            key={i}
                            d={arcPath(sa, ea)}
                            stroke={zone.color}
                            strokeWidth={SW}
                            fill="none"
                            strokeLinecap="butt"
                        />
                    );
                })}

                {/* Ticks divisores de zona */}
                {tickAngles.map((angle, i) => {
                    const rad = toRad(angle);
                    const inner = R - SW / 2 - 2;
                    const outer = R + SW / 2 + 2;
                    return (
                        <Line
                            key={i}
                            x1={CX + inner * Math.cos(rad)}
                            y1={CY + inner * Math.sin(rad)}
                            x2={CX + outer * Math.cos(rad)}
                            y2={CY + outer * Math.sin(rad)}
                            stroke="#0A1325"
                            strokeWidth="2"
                        />
                    );
                })}

                {/* Ponteiro — offset +90° porque a agulha parte do eixo Y (-90° SVG) */}
                <G transform={`rotate(${needleAngle + 90}, ${CX}, ${CY})`}>
                    <Line
                        x1={CX} y1={CY}
                        x2={CX} y2={CY - R + 18}
                        stroke="#E2E8F0"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </G>

                {/* Pivô central */}
                <Circle cx={CX} cy={CY} r="8" fill="#E2E8F0" />
                <Circle cx={CX} cy={CY} r="4" fill={pamClass.color} />

                {/* Valor PAM */}
                <SvgText x={CX} y={CY - 30} fontSize="32" fontWeight="bold"
                    fill={pamClass.color} textAnchor="middle">
                    {value != null ? Math.round(value) : '--'}
                </SvgText>
                <SvgText x={CX} y={CY - 12} fontSize="12" fill="#94A3B8" textAnchor="middle">
                    mmHg PAM
                </SvgText>

                {/* Labels extremos */}
                <SvgText x="18" y={CY + 20} fontSize="10" fill="#64748B" textAnchor="middle">0</SvgText>
                <SvgText x="282" y={CY + 20} fontSize="10" fill="#64748B" textAnchor="middle">300</SvgText>

            </Svg>

            <Text style={[styles.classLabel, { color: pamClass.color }]}>
                {pamClass.emoji}  {pamClass.label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: 'center' },
    classLabel: { fontSize: 15, fontWeight: 'bold', marginTop: 4, letterSpacing: 0.3 },
});
