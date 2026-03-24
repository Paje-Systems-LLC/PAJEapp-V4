/**
 * ConsentModal — PAJE SYSTEMS LLC
 * UX: cards compactos expansíveis + aceite único
 * LGPD Art. 11 | GDPR | HIPAA
 */
import { useState } from 'react';
import {
    Modal, View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Switch, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const C = {
    bg:       '#0A1325',
    card:     '#162136',
    border:   '#1E293B',
    label:    '#CBD5E1',
    gold:     '#D4AF37',
    blue:     '#1E3A8A',
    blueLight:'#60A5FA',
    dim:      '#64748B',
    danger:   '#F87171',
    success:  '#34D399',
};

const DOCS = [
    {
        key: 'privacy_policy',
        icon: 'shield-checkmark-outline',
        title: 'Política de Privacidade',
        summary: 'Como coletamos e protegemos seus dados (LGPD)',
        required: true,
        full: 'Seus dados são coletados com base nos princípios de finalidade, necessidade e transparência (LGPD 13.709/2018). Utilizados para operação dos sistemas, monitoramento de saúde e pesquisa científica com anonimização. Armazenados com criptografia e controle de acesso. Você pode solicitar acesso, correção ou exclusão a qualquer momento.',
    },
    {
        key: 'terms_of_use',
        icon: 'document-text-outline',
        title: 'Termos de Uso',
        summary: 'Regras de utilização dos sistemas PAJE',
        required: true,
        full: 'Os sistemas têm finalidade educacional, científica e de apoio à decisão — não substituem avaliação médica profissional. O acesso é via conta única (SSO). O usuário compromete-se a fornecer informações verídicas e usar a plataforma de forma ética. A PAJE SYSTEMS LLC não se responsabiliza por decisões tomadas com base nos dados apresentados.',
    },
    {
        key: 'tcud',
        icon: 'analytics-outline',
        title: 'TCUD — Uso de Dados',
        summary: 'Autorização para uso em pesquisa e IA',
        required: true,
        full: 'Autorizo o uso dos meus dados clínicos e de uso (sinais vitais, histórico de medições) para pesquisa científica, desenvolvimento tecnológico e treinamento de modelos de inteligência artificial, sempre com supervisão humana. Dados poderão ser compartilhados anonimizados com instituições de pesquisa e parceiros tecnológicos.',
    },
    {
        key: 'tcle',
        icon: 'people-outline',
        title: 'TCLE — Responsável Legal',
        summary: 'Apenas se você gerencia dados de menor de 18 anos',
        required: false,
        full: 'Na condição de responsável legal, autorizo a participação do menor sob minha responsabilidade nesta plataforma para coleta e análise de dados de saúde com finalidade científica e tecnológica. A participação é voluntária e pode ser interrompida a qualquer momento. Os dados serão protegidos conforme LGPD.',
    },
];

export default function ConsentModal({ visible, onAccept, onCancel }) {
    const [expanded, setExpanded]   = useState(null);
    const [hasMinor, setHasMinor]   = useState(false);
    const [accepted, setAccepted]   = useState(false);

    const toggle = (key) => setExpanded(prev => prev === key ? null : key);

    const handleAccept = () => {
        if (!accepted) return;
        onAccept({
            privacy_policy: true,
            terms_of_use:   true,
            tcud:           true,
            tcle:           hasMinor ? true : undefined,
            is_legal_guardian: hasMinor,
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={s.overlay}>
                <View style={s.sheet}>

                    {/* Header */}
                    <View style={s.header}>
                        <Ionicons name="lock-closed" size={20} color={C.gold} />
                        <Text style={s.headerTitle}>Documentos Legais</Text>
                        <Text style={s.headerSub}>Leia o resumo de cada item. Toque em ▸ para detalhes.</Text>
                    </View>

                    <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

                        {DOCS.map(doc => (
                            <View key={doc.key} style={s.docCard}>
                                {/* Card header */}
                                <TouchableOpacity
                                    style={s.docRow}
                                    onPress={() => toggle(doc.key)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name={doc.icon} size={20} color={C.gold} style={s.docIcon} />
                                    <View style={s.docInfo}>
                                        <Text style={s.docTitle}>
                                            {doc.title}
                                            {doc.required
                                                ? <Text style={s.required}> *</Text>
                                                : <Text style={s.optional}> (opcional)</Text>
                                            }
                                        </Text>
                                        <Text style={s.docSummary}>{doc.summary}</Text>
                                    </View>
                                    <Ionicons
                                        name={expanded === doc.key ? 'chevron-up' : 'chevron-down'}
                                        size={16}
                                        color={C.dim}
                                    />
                                </TouchableOpacity>

                                {/* Expandable detail */}
                                {expanded === doc.key && (
                                    <View style={s.docDetail}>
                                        <Text style={s.docDetailText}>{doc.full}</Text>
                                    </View>
                                )}
                            </View>
                        ))}

                        {/* Toggle responsável legal */}
                        <View style={s.minorRow}>
                            <View style={s.minorInfo}>
                                <Ionicons name="person-add-outline" size={16} color={C.blueLight} />
                                <Text style={s.minorLabel}>  Gerencio dados de menor de 18 anos</Text>
                            </View>
                            <Switch
                                value={hasMinor}
                                onValueChange={setHasMinor}
                                trackColor={{ false: C.border, true: C.blue }}
                                thumbColor={hasMinor ? C.gold : C.dim}
                            />
                        </View>

                        {/* Aceite único */}
                        <TouchableOpacity
                            style={s.acceptRow}
                            onPress={() => setAccepted(!accepted)}
                            activeOpacity={0.7}
                        >
                            <View style={[s.bigCheck, accepted && s.bigCheckOn]}>
                                {accepted && <Ionicons name="checkmark-sharp" size={16} color="#fff" />}
                            </View>
                            <Text style={s.acceptLabel}>
                                Li e concordo com todos os documentos acima *
                            </Text>
                        </TouchableOpacity>

                        <Text style={s.legalNote}>
                            * Obrigatório. O aceite é registrado com data/hora e IP (LGPD Art. 8º § 5º).
                        </Text>
                    </ScrollView>

                    {/* Actions */}
                    <View style={s.actions}>
                        <TouchableOpacity style={s.btnCancel} onPress={onCancel}>
                            <Text style={s.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.btnConfirm, !accepted && s.btnDisabled]}
                            onPress={handleAccept}
                            disabled={!accepted}
                        >
                            <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={s.btnConfirmText}>Confirmar e Criar Conta</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    sheet:        { backgroundColor: C.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20,
                    maxHeight: '90%', borderTopWidth: 1, borderColor: C.gold },
    header:       { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.border },
    headerTitle:  { fontSize: 16, fontWeight: 'bold', color: C.gold, marginTop: 6 },
    headerSub:    { fontSize: 12, color: C.dim, marginTop: 4, textAlign: 'center' },
    scroll:       { paddingHorizontal: 16, paddingTop: 12 },
    docCard:      { backgroundColor: C.card, borderRadius: 10, marginBottom: 10,
                    borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
    docRow:       { flexDirection: 'row', alignItems: 'center', padding: 14 },
    docIcon:      { marginRight: 12 },
    docInfo:      { flex: 1 },
    docTitle:     { fontSize: 13, fontWeight: '600', color: C.label },
    required:     { color: C.danger },
    optional:     { color: C.dim, fontWeight: '400' },
    docSummary:   { fontSize: 11, color: C.dim, marginTop: 2 },
    docDetail:    { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2 },
    docDetailText:{ fontSize: 12, color: C.label, lineHeight: 18 },
    minorRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: C.card, borderRadius: 10, padding: 14,
                    marginBottom: 10, borderWidth: 1, borderColor: C.border },
    minorInfo:    { flexDirection: 'row', alignItems: 'center', flex: 1 },
    minorLabel:   { fontSize: 13, color: C.blueLight },
    acceptRow:    { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 16 },
    bigCheck:     { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: C.gold,
                    justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 1 },
    bigCheckOn:   { backgroundColor: C.blue, borderColor: C.blue },
    acceptLabel:  { fontSize: 13, color: C.label, flex: 1, lineHeight: 18 },
    legalNote:    { fontSize: 10, color: C.dim, textAlign: 'center', marginBottom: 16 },
    actions:      { flexDirection: 'row', padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: C.border },
    btnCancel:    { flex: 1, paddingVertical: 14, borderRadius: 8, borderWidth: 1,
                    borderColor: C.border, alignItems: 'center' },
    btnCancelText:{ color: C.dim, fontSize: 14 },
    btnConfirm:   { flex: 2, backgroundColor: C.blue, paddingVertical: 14, borderRadius: 8,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    btnDisabled:  { opacity: 0.4 },
    btnConfirmText:{ color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
