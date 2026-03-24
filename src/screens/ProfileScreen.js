import { useState, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const C = {
    bg:          '#0A1325',
    card:        '#162136',
    border:      '#1E293B',
    label:       '#CBD5E1',
    inputBg:     '#0A1325',
    inputText:   '#E2E8F0',
    placeholder: '#475569',
    textSecond:  '#94A3B8',
    gold:        '#D4AF37',
    blue:        '#1E3A8A',
};

const SEXO_OPTIONS    = ['Masculino', 'Feminino'];
const SMOKE_OPTIONS   = ['Não Fumante', 'Ex-Fumante', 'Fumante'];
const BOOL_OPTIONS    = (label) => [`Não ${label}`, label];

const SelectField = ({ label, options, value, onChange }) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.optionRow}>
            {options.map(opt => (
                <TouchableOpacity
                    key={opt}
                    style={[styles.optionBtn, value === opt && styles.optionBtnActive]}
                    onPress={() => onChange(opt)}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>
                        {opt}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const Field = ({ label, value, onChange, placeholder, keyboardType, unit }) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputRow}>
            <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={C.placeholder}
                keyboardType={keyboardType || 'default'}
                autoCapitalize="none"
            />
            {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </View>
    </View>
);

export default function ProfileScreen({ navigation }) {
    const { user } = useContext(AuthContext);

    const [firstName,   setFirstName]   = useState(user?.firstName   || '');
    const [lastName,    setLastName]    = useState(user?.lastName     || '');
    const [phone,       setPhone]       = useState(user?.phone        || '');
    const [weight,      setWeight]      = useState('');
    const [height,      setHeight]      = useState('');
    const [birthDate,   setBirthDate]   = useState('');
    const [sexo,        setSexo]        = useState('Masculino');
    const [smoker,      setSmoker]      = useState('Não Fumante');
    const [diabetic,    setDiabetic]    = useState('Não Diabético');
    const [hypertensive,setHypertensive]= useState('Não Hipertenso');
    const [loading,     setLoading]     = useState(false);

    const handleSave = async () => {
        if (!firstName || !lastName) {
            Alert.alert('Erro', 'Nome e Sobrenome são obrigatórios.');
            return;
        }
        setLoading(true);
        try {
            await api.patch('/account/api/profile/', {
                first_name:   firstName,
                last_name:    lastName,
                phone_number: phone,
                weight:       weight   || undefined,
                height:       height   || undefined,
                birth_date:   birthDate || undefined,
                sex:          sexo === 'Masculino' ? 'M' : 'F',
                smoker:       smoker,
                diabetic:     diabetic.startsWith('Não') ? false : true,
                hypertensive: hypertensive.startsWith('Não') ? false : true,
            });
            Alert.alert('Salvo!', 'Perfil atualizado com sucesso.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar o perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color="#E2E8F0" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Perfil Biométrico</Text>
                    <View style={{ width: 38 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                    {/* Dados pessoais */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Dados Pessoais</Text>
                        <Field label="Nome *"      value={firstName} onChange={setFirstName}   placeholder="Seu nome"      autoCapitalize="words" />
                        <Field label="Sobrenome *" value={lastName}  onChange={setLastName}    placeholder="Seu sobrenome" autoCapitalize="words" />
                        <Field label="Telefone"    value={phone}     onChange={setPhone}       placeholder="(00) 00000-0000" keyboardType="phone-pad" />
                        <Field label="Data de Nascimento" value={birthDate} onChange={setBirthDate} placeholder="DD/MM/AAAA" keyboardType="numeric" />
                    </View>

                    {/* Dados biométricos */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Dados Biométricos</Text>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Field label="Peso" value={weight} onChange={setWeight} placeholder="70" keyboardType="numeric" unit="kg" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Field label="Altura" value={height} onChange={setHeight} placeholder="170" keyboardType="numeric" unit="cm" />
                            </View>
                        </View>
                        <SelectField label="Sexo" options={SEXO_OPTIONS} value={sexo} onChange={setSexo} />
                    </View>

                    {/* Histórico clínico */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Histórico Clínico</Text>
                        <SelectField label="Tabagismo" options={SMOKE_OPTIONS} value={smoker} onChange={setSmoker} />
                        <SelectField label="Diabetes"  options={BOOL_OPTIONS('Diabético')}    value={diabetic}     onChange={setDiabetic}     />
                        <SelectField label="Hipertensão" options={BOOL_OPTIONS('Hipertenso')} value={hypertensive} onChange={setHypertensive} />
                    </View>

                    {/* Salvar */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        style={[styles.saveBtn, loading && { opacity: 0.5 }]}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.saveBtnText}>
                            {loading ? 'Salvando...' : 'Salvar e Acessar Dashboard'}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 32 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 16 },
    row:    { flexDirection: 'row' },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    backBtn:     { padding: 6, backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#E2E8F0' },

    card: {
        backgroundColor: C.card, borderRadius: 12,
        borderWidth: 1, borderColor: C.border,
        padding: 16, marginBottom: 16,
    },
    cardTitle: {
        fontSize: 13, fontWeight: '700', color: C.textSecond,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14,
    },

    fieldWrap: { marginBottom: 16 },
    label:     { fontSize: 13, fontWeight: '500', color: C.label, marginBottom: 6 },

    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border,
        borderRadius: 8, paddingHorizontal: 12, height: 48,
    },
    textInput: { color: C.inputText, fontSize: 15, height: '100%' },
    unit:      { fontSize: 12, color: C.textSecond, marginLeft: 6 },

    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionBtn: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 8, borderWidth: 1, borderColor: C.border,
        backgroundColor: C.inputBg,
    },
    optionBtnActive: { backgroundColor: C.blue, borderColor: C.blue },
    optionText:      { fontSize: 13, color: C.textSecond },
    optionTextActive: { color: '#fff', fontWeight: '600' },

    saveBtn: {
        backgroundColor: C.blue, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 10, marginBottom: 8,
    },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
