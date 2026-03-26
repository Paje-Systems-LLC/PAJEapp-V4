/**
 * AjudaScreen — FAQ, suporte e Assistente PAJE (IA).
 */
import { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, StatusBar, Linking,
    TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const C = {
    bg:     '#0A1325',
    card:   '#162136',
    border: '#1E293B',
    text:   '#E2E8F0',
    second: '#94A3B8',
    gold:   '#D4AF37',
    blue:   '#3B82F6',
    purple: '#8B5CF6',
};

const FAQ = [
    {
        q: 'O que é o PAJE club?',
        a: 'PAJE — Projetos Acadêmicos Junto às Empresas — é uma empresa com fins lucrativos que opera sob o conceito de Empresa Social: disponibiliza ferramentas gratuitas de utilidade pública enquanto aplica pesquisas científicas do LaMPS em benefício da população.\n\nO PAJE club é o canal de comunicação e aplicação desses serviços, conectando pacientes e profissionais de saúde com inteligência. Mesmo sendo uma empresa privada, acredita que saúde de qualidade deve ser acessível a todos.',
    },
    {
        q: 'O Projeto HDsys é gratuito?',
        a: 'Sim. O Projeto HDsys é oferecido gratuitamente a todos os usuários cadastrados, com monitoramento de pressão arterial e classificação SBC 2025.',
    },
    {
        q: 'Como me tornar associado?',
        a: 'Demonstre interesse nas telas dos módulos (HDsys, GRAVsys ou PEDsys). Quando a associação for liberada, você receberá um convite no seu e-mail cadastrado.',
    },
    {
        q: 'O que é o LaMPS?',
        a: 'LaMPS — Laboratório de Medicina de Precisão e Sistemas — é o ambiente de Pesquisa, Desenvolvimento e Inovação do PAJE. Com foco em Sistemas de Apoio à Decisão Médica, Inteligência Artificial em Saúde e Biotecnologia, o LaMPS fundamenta cientificamente os sistemas desenvolvidos pela PAJE Systems LLC. HDsys, GRAVsys e PEDsys são projetos originados neste laboratório.',
    },
    {
        q: 'Como funciona a comunicação com profissionais?',
        a: 'Profissionais credenciados PAJE club possuem conta @paje.email. As mensagens trocadas acontecem exclusivamente dentro do ambiente paje.email (domínio fechado), garantindo privacidade e segurança.',
    },
    {
        q: 'Meus dados são armazenados localmente?',
        a: 'Sim. As medições são salvas localmente no seu dispositivo (SQLite) e sincronizadas com a nuvem quando há conexão. Seus dados nunca são vendidos a terceiros.',
    },
    {
        q: 'Como acesso meu cartão de membro?',
        a: 'Toque em "Área do Associado" na tela inicial do PAJE club. O cartão virtual com QR code estará disponível após a ativação da sua associação.',
    },
    {
        q: 'Posso usar o app sem internet?',
        a: 'Sim para o Projeto HDsys. Você pode registrar e visualizar medições de pressão arterial offline. As funcionalidades do portal (Associados, perfis de profissionais, Webmail) requerem conexão com a internet.',
    },
];

// ── Componente FAQ item ──────────────────────────────────────────

function FaqItem({ item }) {
    const [open, setOpen] = useState(false);
    return (
        <TouchableOpacity
            style={[styles.faqCard, open && { borderLeftColor: C.gold }]}
            onPress={() => setOpen(o => !o)}
            activeOpacity={0.8}
        >
            <View style={styles.faqRow}>
                <Text style={[styles.faqQ, open && { color: C.text }]}>{item.q}</Text>
                <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={open ? C.gold : C.second}
                />
            </View>
            {open && <Text style={styles.faqA}>{item.a}</Text>}
        </TouchableOpacity>
    );
}

// ── Tela principal ───────────────────────────────────────────────

export default function AjudaScreen() {
    const [pergunta,   setPergunta]   = useState('');
    const [resposta,   setResposta]   = useState('');
    const [loadingIA,  setLoadingIA]  = useState(false);
    const [erroIA,     setErroIA]     = useState('');
    const scrollRef = useRef(null);

    const handlePergunta = async () => {
        const texto = pergunta.trim();
        if (!texto || loadingIA) return;

        setLoadingIA(true);
        setResposta('');
        setErroIA('');

        try {
            const { data } = await api.post('/account/api/ai/ajuda/', { question: texto });
            setResposta(data.answer || '');
            // Rola para a resposta após carregamento
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
        } catch {
            setErroIA('Não foi possível obter resposta. Verifique sua conexão e tente novamente.');
        } finally {
            setLoadingIA(false);
        }
    };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            <View style={styles.header}>
                <Ionicons name="help-circle-outline" size={22} color={C.gold} />
                <Text style={styles.headerTitle}>Ajuda · FAQ</Text>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >

                    <Text style={styles.intro}>
                        Dúvidas frequentes sobre o PAJE club e seus módulos de saúde.
                    </Text>

                    {FAQ.map((item, i) => <FaqItem key={i} item={item} />)}

                    {/* ── Assistente IA ── */}
                    <View style={styles.iaSection}>

                        <View style={styles.iaSectionHeader}>
                            <View style={styles.iaBadge}>
                                <Ionicons name="sparkles" size={14} color={C.purple} />
                                <Text style={styles.iaBadgeText}>IA</Text>
                            </View>
                            <Text style={styles.iaSectionTitle}>Assistente PAJE</Text>
                        </View>

                        <Text style={styles.iaSectionSub}>
                            Não encontrou sua dúvida acima? Pergunte ao assistente — ele conhece o PAJE club, o LaMPS e todos os sistemas de saúde.
                        </Text>

                        {/* Input */}
                        <View style={styles.iaInputRow}>
                            <TextInput
                                style={styles.iaInput}
                                placeholder="Digite sua pergunta…"
                                placeholderTextColor={C.second}
                                value={pergunta}
                                onChangeText={setPergunta}
                                multiline
                                maxLength={400}
                                onSubmitEditing={handlePergunta}
                                editable={!loadingIA}
                            />
                            <TouchableOpacity
                                style={[styles.iaSendBtn, (!pergunta.trim() || loadingIA) && styles.iaSendBtnDisabled]}
                                onPress={handlePergunta}
                                activeOpacity={0.8}
                                disabled={!pergunta.trim() || loadingIA}
                            >
                                {loadingIA
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Ionicons name="arrow-up" size={18} color="#fff" />
                                }
                            </TouchableOpacity>
                        </View>

                        {/* Resposta */}
                        {(resposta !== '' || erroIA !== '') && (
                            <View style={[styles.iaResposta, erroIA ? styles.iaRespostaErro : null]}>
                                {erroIA ? (
                                    <View style={styles.iaErroRow}>
                                        <Ionicons name="alert-circle-outline" size={16} color="#F87171" />
                                        <Text style={styles.iaErroText}>{erroIA}</Text>
                                    </View>
                                ) : (
                                    <>
                                        <View style={styles.iaRespostaHeader}>
                                            <Ionicons name="sparkles" size={13} color={C.purple} />
                                            <Text style={styles.iaRespostaLabel}>Assistente PAJE</Text>
                                        </View>
                                        <Text style={styles.iaRespostaText}>{resposta}</Text>
                                    </>
                                )}
                            </View>
                        )}

                        <Text style={styles.iaDisclaimer}>
                            As respostas são geradas por IA com base nos princípios e sistemas PAJE. Para questões médicas urgentes, procure atendimento presencial.
                        </Text>
                    </View>

                    {/* ── Suporte técnico ── */}
                    <TouchableOpacity
                        style={styles.suporteCard}
                        onPress={() => Linking.openURL('https://hdsys.cloud')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="mail-outline" size={20} color={C.blue} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.suporteTitle}>Suporte técnico</Text>
                            <Text style={styles.suporteText}>
                                Para dúvidas não listadas acima, entre em contato via portal HDsys.cloud.
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={C.blue} />
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>PAJE Systems LLC  ·  Powered by HDsys.cloud</Text>
                        <Text style={styles.footerVersion}>v3.0</Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 16, paddingBottom: 40 },

    header: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerTitle: { fontSize: 17, fontWeight: 'bold', color: C.text },

    intro: { fontSize: 13, color: C.second, lineHeight: 20, marginBottom: 16 },

    faqCard: {
        backgroundColor: C.card, borderRadius: 12,
        borderWidth: 1, borderColor: C.border, borderLeftWidth: 4,
        borderLeftColor: C.border,
        padding: 14, marginBottom: 10,
    },
    faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
    faqQ:   { flex: 1, fontSize: 13, fontWeight: '600', color: C.second, lineHeight: 19 },
    faqA:   { fontSize: 12, color: C.second, lineHeight: 19, marginTop: 10 },

    // ── Seção IA ──
    iaSection: {
        backgroundColor: C.card,
        borderRadius: 14, borderWidth: 1,
        borderColor: C.purple + '44',
        padding: 16,
        marginVertical: 16,
    },
    iaSectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6,
    },
    iaBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: C.purple + '22',
        borderRadius: 6, borderWidth: 1, borderColor: C.purple + '55',
        paddingHorizontal: 7, paddingVertical: 3,
    },
    iaBadgeText:     { fontSize: 9, fontWeight: 'bold', color: C.purple, letterSpacing: 0.8 },
    iaSectionTitle:  { fontSize: 15, fontWeight: 'bold', color: C.text },
    iaSectionSub:    { fontSize: 12, color: C.second, lineHeight: 18, marginBottom: 14 },

    iaInputRow: {
        flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    },
    iaInput: {
        flex: 1,
        backgroundColor: C.bg,
        borderRadius: 12, borderWidth: 1, borderColor: C.border,
        paddingHorizontal: 14, paddingVertical: 10,
        fontSize: 13, color: C.text, lineHeight: 19,
        maxHeight: 100,
    },
    iaSendBtn: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: C.purple,
        justifyContent: 'center', alignItems: 'center',
    },
    iaSendBtnDisabled: { backgroundColor: C.border },

    iaResposta: {
        marginTop: 14,
        backgroundColor: C.bg,
        borderRadius: 12, borderWidth: 1, borderColor: C.purple + '33',
        padding: 14,
    },
    iaRespostaErro: { borderColor: '#F8717133' },
    iaRespostaHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
    },
    iaRespostaLabel: { fontSize: 11, fontWeight: 'bold', color: C.purple, letterSpacing: 0.4 },
    iaRespostaText:  { fontSize: 13, color: C.text, lineHeight: 20 },

    iaErroRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    iaErroText: { flex: 1, fontSize: 12, color: '#F87171', lineHeight: 18 },

    iaDisclaimer: {
        fontSize: 10, color: C.second, lineHeight: 15,
        marginTop: 12, fontStyle: 'italic',
    },

    // ── Suporte ──
    suporteCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        backgroundColor: C.blue + '12', borderRadius: 12,
        borderWidth: 1, borderColor: C.blue + '33',
        padding: 14, marginBottom: 20,
    },
    suporteTitle: { fontSize: 13, fontWeight: 'bold', color: C.text, marginBottom: 4 },
    suporteText:  { fontSize: 12, color: C.second, lineHeight: 17 },

    footer:        { alignItems: 'center', gap: 4 },
    footerText:    { fontSize: 10, color: C.border, letterSpacing: 0.3 },
    footerVersion: { fontSize: 10, color: C.border },
});
