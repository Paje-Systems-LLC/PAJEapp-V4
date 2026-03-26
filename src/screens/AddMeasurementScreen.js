
import { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, Alert, ScrollView,
    Platform, TouchableOpacity, TextInput, KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { insertMeasurement, initDB } from '../services/hdsysFreeDB';
import { syncPendingMeasurements } from '../services/supabaseSync';

// HDsys-V5 Dark Theme
const C = {
    bg:          '#0A1325',
    card:        '#162136',
    border:      '#1E293B',
    label:       '#CBD5E1',
    inputBg:     '#0A1325',
    inputText:   '#E2E8F0',
    placeholder: '#475569',
    gold:        '#D4AF37',
    blue:        '#1E3A8A',
    textSecond:  '#94A3B8',
    success:     '#22C55E',
    error:       '#EF4444',
};

// PAM = (PAS + 2*PAD) / 3  — fórmula HDsys.cloud
const calcPAM = (pas, pad) => (parseFloat(pas) + 2 * parseFloat(pad)) / 3;

const formatDisplay = (date) =>
    `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}  ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;

export default function AddMeasurementScreen({ navigation }) {
    const { user } = useContext(AuthContext);

    useEffect(() => { initDB(); }, []);

    const [pas, setPas]             = useState('');
    const [pad, setPad]             = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [date, setDate]           = useState(new Date());
    const [pickerMode, setPickerMode] = useState('date');
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading]     = useState(false);

    // Live PAM preview
    const pamPreview = (pas && pad && !isNaN(pas) && !isNaN(pad))
        ? calcPAM(pas, pad)
        : null;

    const pamError = pas && pad && parseFloat(pas) <= parseFloat(pad)
        ? 'PAS deve ser maior que PAD'
        : null;

    const onPickerChange = (event, selected) => {
        if (Platform.OS === 'android') {
            if (event.type === 'set') {
                setDate(selected || date);
                if (pickerMode === 'date') {
                    setPickerMode('time');
                    setShowPicker(true);
                } else {
                    setShowPicker(false);
                    setPickerMode('date');
                }
            } else {
                setShowPicker(false);
                setPickerMode('date');
            }
        } else {
            setDate(selected || date);
        }
    };

    const handleSubmit = async () => {
        const pasF = parseFloat(pas);
        const padF = parseFloat(pad);

        if (!pas || !pad) {
            Alert.alert('Erro', 'Preencha a Pressão Sistólica (PAS) e Diastólica (PAD).');
            return;
        }
        if (isNaN(pasF) || isNaN(padF)) {
            Alert.alert('Erro Clínico', 'PAS e PAD devem ser valores numéricos.');
            return;
        }
        if (pasF <= padF) {
            Alert.alert('Erro Clínico', 'A Pressão Sistólica (PAS) deve ser maior que a Diastólica (PAD).');
            return;
        }
        if (pasF < 50 || pasF > 300) {
            Alert.alert('Erro Clínico', 'PAS deve estar entre 50 e 300 mmHg.');
            return;
        }
        if (padF < 20 || padF > 195) {
            Alert.alert('Erro Clínico', 'PAD deve estar entre 20 e 195 mmHg.');
            return;
        }
        if (date > new Date()) {
            Alert.alert('Erro', 'A data da medição não pode ser no futuro.');
            return;
        }

        const pam = calcPAM(pasF, padF);
        const hr  = heartRate ? parseFloat(heartRate) : null;

        setLoading(true);
        try {
            // 1. Salva localmente (offline-first)
            await insertMeasurement({
                pas: pasF, pad: padF, pam,
                heartRate: hr, glycemia: null, weight: null, height: null,
                measuredAt: date.toISOString(),
            });

            // 2. Envia para API Django
            const userId = user?.email || user?.username || '';
            try {
                await api.post('/api/submit/', {
                    patient_datetime:   formatDisplay(date),
                    patient_pas:        pasF.toString(),
                    patient_pad:        padF.toString(),
                    patient_pam:        pam.toString(),
                    patient_heart_rate: heartRate || '',
                    user_id:            userId,
                });
            } catch (apiErr) {
                // Dado seguro no SQLite — loga o erro para diagnóstico
                console.warn('API submit falhou:', apiErr?.response?.status, apiErr?.response?.data || apiErr?.message);
            }

            // 3. Sync Supabase em background
            syncPendingMeasurements(userId).catch(() => {});

            Alert.alert(
                'Registrado!',
                `PAM: ${pam.toFixed(1)} mmHg\nClassificação: ${require('../components/hdsys/GaugeChart').getPAMClass(pam).label}`,
                [
                    { text: 'Ver Dashboard', onPress: () => navigation.replace('Dashboard') },
                    { text: 'Ver Gauge',     onPress: () => navigation.replace('Gauge', { riskScore: pam }) },
                ]
            );
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Falha ao registrar a medição.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.root}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={C.label} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nova Medição</Text>
                </View>

                {/* Card formulário */}
                <View style={styles.card}>

                    {/* Data e Hora */}
                    <View style={styles.fieldWrap}>
                        <Text style={styles.label}>Data e Hora da Medição</Text>
                        <TouchableOpacity
                            style={styles.dateBtn}
                            onPress={() => { setPickerMode('date'); setShowPicker(true); }}
                        >
                            <Ionicons name="calendar-outline" size={18} color={C.textSecond} style={{ marginRight: 8 }} />
                            <Text style={styles.dateBtnText}>{formatDisplay(date)}</Text>
                        </TouchableOpacity>
                        {showPicker && (
                            <DateTimePicker
                                value={date}
                                mode={pickerMode}
                                is24Hour
                                display="default"
                                onChange={onPickerChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>

                    {/* PAS / PAD em linha */}
                    <View style={styles.row}>
                        <View style={[styles.fieldWrap, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>PAS — Sistólica *</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.textInput}
                                    value={pas}
                                    onChangeText={setPas}
                                    placeholder="120"
                                    placeholderTextColor={C.placeholder}
                                    keyboardType="numeric"
                                />
                                <Text style={styles.unit}>mmHg</Text>
                            </View>
                        </View>
                        <View style={[styles.fieldWrap, { flex: 1 }]}>
                            <Text style={styles.label}>PAD — Diastólica *</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.textInput}
                                    value={pad}
                                    onChangeText={setPad}
                                    placeholder="80"
                                    placeholderTextColor={C.placeholder}
                                    keyboardType="numeric"
                                />
                                <Text style={styles.unit}>mmHg</Text>
                            </View>
                        </View>
                    </View>

                    {/* Erro PAS/PAD */}
                    {pamError && (
                        <Text style={styles.errorText}>⚠ {pamError}</Text>
                    )}

                    {/* PAM preview */}
                    {pamPreview && !pamError && (
                        <View style={styles.pamPreview}>
                            <Ionicons name="speedometer-outline" size={16} color={C.gold} />
                            <Text style={styles.pamPreviewText}>
                                PAM calculada: <Text style={{ color: C.gold, fontWeight: 'bold' }}>
                                    {pamPreview.toFixed(1)} mmHg
                                </Text>
                            </Text>
                        </View>
                    )}

                    {/* Frequência Cardíaca */}
                    <View style={styles.fieldWrap}>
                        <Text style={styles.label}>Frequência Cardíaca</Text>
                        <View style={styles.inputRow}>
                            <Ionicons name="pulse" size={16} color={C.textSecond} style={{ marginRight: 8 }} />
                            <TextInput
                                style={[styles.textInput, { flex: 1 }]}
                                value={heartRate}
                                onChangeText={setHeartRate}
                                placeholder="72"
                                placeholderTextColor={C.placeholder}
                                keyboardType="numeric"
                            />
                            <Text style={styles.unit}>bpm</Text>
                        </View>
                    </View>

                    {/* Botão enviar */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading || !!pamError}
                        style={[styles.submitBtn, (loading || !!pamError) && { opacity: 0.5 }]}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.submitBtnText}>
                            {loading ? 'Registrando...' : 'Salvar Medição'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>

                {/* Info faixas */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Referências clínicas</Text>
                    <Text style={styles.infoLine}>PAS: 50–300 mmHg  |  PAD: 20–195 mmHg</Text>
                    <Text style={styles.infoLine}>FC: 30–260 bpm  |  PAM = (PAS + 2×PAD) ÷ 3</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 16, paddingBottom: 40 },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 16, marginBottom: 8,
    },
    backBtn: {
        padding: 8, marginRight: 12,
        backgroundColor: C.card, borderRadius: 8,
        borderWidth: 1, borderColor: C.border,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#E2E8F0' },

    card: {
        backgroundColor: C.card, borderRadius: 12,
        borderWidth: 1, borderColor: C.border, padding: 20,
    },

    row:       { flexDirection: 'row' },
    fieldWrap: { marginBottom: 18 },
    label:     { fontSize: 13, fontWeight: '500', color: C.label, marginBottom: 6 },

    dateBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border,
        borderRadius: 8, paddingHorizontal: 12, height: 48,
    },
    dateBtnText: { color: C.inputText, fontSize: 14 },

    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border,
        borderRadius: 8, paddingHorizontal: 12, height: 48,
    },
    textInput: { flex: 1, color: C.inputText, fontSize: 15, height: '100%' },
    unit:      { fontSize: 12, color: C.textSecond, marginLeft: 6 },

    errorText: { color: C.error, fontSize: 12, marginTop: -10, marginBottom: 10 },

    pamPreview: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(212,175,55,0.08)',
        borderRadius: 8, padding: 10, marginBottom: 14,
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
    },
    pamPreviewText: { fontSize: 13, color: C.label, marginLeft: 8 },

    submitBtn: {
        backgroundColor: C.blue, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 8, marginTop: 8,
    },
    submitBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

    cancelBtn: { marginTop: 14, alignItems: 'center' },
    cancelText: { color: '#60A5FA', fontSize: 13 },

    infoCard: {
        backgroundColor: C.card, borderRadius: 10,
        borderWidth: 1, borderColor: C.border,
        marginTop: 16, padding: 14,
    },
    infoTitle: { fontSize: 12, color: C.textSecond, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
    infoLine:  { fontSize: 12, color: C.textSecond, marginBottom: 2 },
});
