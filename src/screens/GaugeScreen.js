import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GaugeChart, { getPAMClass, getPAMMessage, ZONES } from '../components/hdsys/GaugeChart';

const C = {
    bg:          '#0A1325',
    card:        '#162136',
    border:      '#1E293B',
    textPrimary: '#E2E8F0',
    textSecond:  '#94A3B8',
    gold:        '#D4AF37',
};

export default function GaugeScreen({ navigation, route }) {
    const pamValue = route.params?.riskScore ?? null;
    const pamClass  = getPAMClass(pamValue);
    const pamMsg    = getPAMMessage(pamValue);

    return (
        <SafeAreaView style={styles.root} edges={['top']}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Projeto HDsys — Classificador PAM</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Gauge */}
                <View style={styles.gaugeCard}>
                    <Text style={styles.gaugeLabel}>Pressão Arterial Média</Text>
                    <GaugeChart value={pamValue} size={300} />
                </View>

                {/* Classificação atual */}
                <View style={[styles.classCard, { borderLeftColor: pamClass.color }]}>
                    <Text style={styles.classEmoji}>{pamClass.emoji}</Text>
                    <View style={styles.classBody}>
                        <Text style={[styles.classLabel, { color: pamClass.color }]}>{pamClass.label}</Text>
                        <Text style={styles.classMsg}>{pamMsg}</Text>
                        {pamClass.pas && pamClass.pas !== '--' && (
                            <Text style={styles.classRef}>
                                SBC 2025  •  PAS {pamClass.pas}  /  PAD {pamClass.pad} mmHg
                            </Text>
                        )}
                    </View>
                </View>

                {/* Tabela de faixas SBC 2025 */}
                <View style={styles.tableCard}>
                    <Text style={styles.tableTitle}>
                        <Ionicons name="list" size={14} color={C.gold} />  Tabela de Classificação — SBC 2025
                    </Text>
                    {ZONES.map((zone, i) => (
                        <View
                            key={i}
                            style={[
                                styles.tableRow,
                                pamValue !== null &&
                                    pamValue >= zone.min && pamValue < zone.max &&
                                    { backgroundColor: zone.color + '22' },
                            ]}
                        >
                            <View style={[styles.tableColorBar, { backgroundColor: zone.color }]} />
                            <View style={styles.tableBody}>
                                <Text style={[styles.tableZone, { color: zone.color }]}>
                                    {zone.emoji}  {zone.label}
                                </Text>
                                <Text style={styles.tableRange}>
                                    PAS {zone.pas}  /  PAD {zone.pad} mmHg
                                </Text>
                            </View>
                            <Text style={[styles.tablePAM, { color: zone.color }]}>
                                {zone.min}–{zone.max === 300 ? '300+' : zone.max}
                            </Text>
                        </View>
                    ))}
                    <Text style={styles.tableSub}>PAM = (PAS + 2 × PAD) / 3</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.bg },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerBtn:   { padding: 6, backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border },
    headerTitle: { fontSize: 15, fontWeight: 'bold', color: C.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: 8 },

    scroll: { padding: 16 },

    gaugeCard: {
        backgroundColor: C.card, borderRadius: 14,
        borderWidth: 1, borderColor: C.border,
        alignItems: 'center', paddingVertical: 20,
        marginBottom: 16,
    },
    gaugeLabel: { fontSize: 12, color: C.textSecond, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },

    classCard: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: C.card, borderRadius: 12,
        borderWidth: 1, borderColor: C.border, borderLeftWidth: 4,
        padding: 16, marginBottom: 16,
    },
    classEmoji: { fontSize: 28, marginRight: 14, marginTop: 2 },
    classBody:  { flex: 1 },
    classLabel: { fontSize: 16, fontWeight: 'bold' },
    classMsg:   { fontSize: 12, color: C.textSecond, marginTop: 4, lineHeight: 18 },
    classRef:   { fontSize: 10, color: C.textSecond, marginTop: 6, letterSpacing: 0.3 },

    tableCard: {
        backgroundColor: C.card, borderRadius: 14,
        borderWidth: 1, borderColor: C.border,
        overflow: 'hidden', marginBottom: 16,
    },
    tableTitle: { fontSize: 13, fontWeight: 'bold', color: C.textPrimary, padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
    tableRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, paddingRight: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    tableColorBar: { width: 4, alignSelf: 'stretch', marginRight: 12 },
    tableBody:     { flex: 1 },
    tableZone:     { fontSize: 13, fontWeight: 'bold' },
    tableRange:    { fontSize: 11, color: C.textSecond, marginTop: 2 },
    tablePAM:      { fontSize: 12, fontWeight: 'bold', minWidth: 55, textAlign: 'right' },
    tableSub:      { fontSize: 10, color: C.textSecond, textAlign: 'center', padding: 10 },
});
