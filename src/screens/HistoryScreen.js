import { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet,
    ActivityIndicator, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

const formatDateTime = (dtStr) => {
    if (!dtStr) return { date: 'N/A', time: '' };
    const d = new Date(dtStr);
    return {
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
};

// ── Tela principal ──
export default function HistoryScreen({ navigation }) {
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

    const renderItem = ({ item }) => {
        const { date, time } = formatDateTime(item.patient_datetime || item.created_at);
        const zone = getPAMZone(item.patient_pam);
        const pam  = Number(item.patient_pam);

        return (
            <View style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: zone.color + '22' }]}>
                    <Ionicons name="heart" size={16} color={zone.color} />
                </View>
                <View style={styles.rowBody}>
                    <Text style={styles.rowPA}>
                        {item.patient_pas} / {item.patient_pad} mmHg
                    </Text>
                    <Text style={styles.rowFC}>
                        {item.patient_heart_rate ? `FC  ${item.patient_heart_rate} bpm   •   ` : ''}
                        {date}  {time}
                    </Text>
                </View>
                <View style={styles.rowRight}>
                    <Text style={[styles.rowPAM, { color: zone.color }]}>
                        {pam ? Math.round(pam) : '--'}
                    </Text>
                    <Text style={styles.rowPAMUnit}>PAM</Text>
                    <View style={[styles.zoneDot, { backgroundColor: zone.color }]} />
                </View>
            </View>
        );
    };

    const ListHeader = () => (
        <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>{data.length} registros — do mais recente</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Histórico</Text>
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
                <FlatList
                    data={data}
                    keyExtractor={(item, idx) => (item.id ? item.id.toString() : idx.toString())}
                    renderItem={renderItem}
                    ListHeaderComponent={<ListHeader />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="heart-outline" size={44} color={C.textSecond} />
                            <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchData(); }}
                            tintColor={C.gold}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root:    { flex: 1, backgroundColor: C.bg },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: C.textSecond, fontSize: 14 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerBtn:   { padding: 6, backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border },
    headerTitle: { fontSize: 17, fontWeight: 'bold', color: C.text },

    card: {
        backgroundColor: C.card, borderRadius: 12,
        borderWidth: 1, borderColor: C.border,
        padding: 14, marginBottom: 12,
    },
    cardTitle: { fontSize: 13, fontWeight: 'bold', color: C.text, marginBottom: 2 },
    cardSub:   { fontSize: 10, color: C.textSecond, marginBottom: 10 },
    chartWrap: { marginTop: 4 },

    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' },
    legendDot:  { width: 10, height: 10, borderRadius: 5 },
    legendLabel: { fontSize: 11, color: C.text, flex: 1 },

    listContent: { padding: 16, paddingBottom: 40 },
    listHeader: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 4 },
    listHeaderText: { fontSize: 12, color: C.textSecond },

    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    rowIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rowBody: { flex: 1 },
    rowPA:   { fontSize: 14, fontWeight: 'bold', color: C.text },
    rowFC:   { fontSize: 11, color: C.textSecond, marginTop: 3 },
    rowRight: { alignItems: 'flex-end', minWidth: 52 },
    rowPAM:   { fontSize: 20, fontWeight: 'bold' },
    rowPAMUnit: { fontSize: 9, color: C.textSecond },
    zoneDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },

    separator: { height: 1, backgroundColor: C.border },
    empty: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: C.textSecond, fontSize: 14, marginTop: 12 },
});
