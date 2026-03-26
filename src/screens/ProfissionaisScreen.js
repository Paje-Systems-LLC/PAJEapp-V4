/**
 * ProfissionaisScreen — Diretório de profissionais de saúde credenciados PAJE club.
 * Lê os cards do portal (base de dados). Cada profissional credenciado possui
 * uma página própria no portal, acessível via WebView dentro do app.
 * Comunicação via paje.email (domínio fechado, somente entre contas @paje.email).
 */
import { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const C = {
    bg:     '#0A1325',
    card:   '#162136',
    border: '#1E293B',
    text:   '#E2E8F0',
    second: '#94A3B8',
    blue:   '#3B82F6',
    gold:   '#D4AF37',
    green:  '#22C55E',
};

// ── Dados de demonstração — em produção virão da API do portal PAJE ──
const PROFISSIONAIS_MOCK = [
    {
        id: '001',
        nome:        'Dr. Carlos Mendes',
        especialidade: 'Cardiologia',
        crm:         'CRM-SP 123456',
        email:       'carlos.mendes@paje.email',
        nota:        4.9,
        avaliacoes:  87,
        ativo:       true,
        portalSlug:  'dr-carlos-mendes',
    },
    {
        id: '002',
        nome:        'Dra. Fernanda Rocha',
        especialidade: 'Clínica Geral',
        crm:         'CRM-RJ 654321',
        email:       'fernanda.rocha@paje.email',
        nota:        4.7,
        avaliacoes:  124,
        ativo:       true,
        portalSlug:  'dra-fernanda-rocha',
    },
    {
        id: '003',
        nome:        'Dr. André Lima',
        especialidade: 'Endocrinologia',
        crm:         'CRM-MG 789012',
        email:       'andre.lima@paje.email',
        nota:        4.8,
        avaliacoes:  56,
        ativo:       true,
        portalSlug:  'dr-andre-lima',
    },
    {
        id: '004',
        nome:        'Dra. Patricia Souza',
        especialidade: 'Obstetrícia',
        crm:         'CRM-BA 345678',
        email:       'patricia.souza@paje.email',
        nota:        5.0,
        avaliacoes:  42,
        ativo:       true,
        portalSlug:  'dra-patricia-souza',
    },
    {
        id: '005',
        nome:        'Dr. Rafael Costa',
        especialidade: 'Pediatria',
        crm:         'CRM-PR 901234',
        email:       'rafael.costa@paje.email',
        nota:        4.6,
        avaliacoes:  98,
        ativo:       true,
        portalSlug:  'dr-rafael-costa',
    },
];

const ESPECIALIDADES = ['Todas', 'Cardiologia', 'Clínica Geral', 'Endocrinologia', 'Obstetrícia', 'Pediatria'];

// Portal WordPress — prof.paje.club — VPS-LOCAWEB
const PORTAL_BASE = 'https://prof.paje.club';

function Estrelas({ nota }) {
    const full  = Math.floor(nota);
    const hasHalf = nota - full >= 0.5;
    return (
        <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
            {Array.from({ length: 5 }, (_, i) => (
                <Ionicons
                    key={i}
                    name={i < full ? 'star' : (i === full && hasHalf ? 'star-half' : 'star-outline')}
                    size={11}
                    color="#F59E0B"
                />
            ))}
            <Text style={{ fontSize: 11, color: C.second, marginLeft: 4 }}>{nota.toFixed(1)}</Text>
        </View>
    );
}

function CardProfissional({ prof, onVerPerfil }) {
    const initials = prof.nome
        .split(' ')
        .filter((_, i) => i === 0 || i === 1)
        .map(w => w[0])
        .join('')
        .toUpperCase();

    return (
        <View style={styles.card}>
            {/* Linha topo: avatar + info */}
            <View style={styles.cardTop}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardNome}>{prof.nome}</Text>
                    <Text style={styles.cardEsp}>{prof.especialidade}</Text>
                    <Text style={styles.cardCrm}>{prof.crm}</Text>
                    <Estrelas nota={prof.nota} />
                    <Text style={styles.cardAval}>({prof.avaliacoes} avaliações)</Text>
                </View>
                <View style={[styles.ativoBadge, { backgroundColor: prof.ativo ? C.green + '18' : C.second + '18' }]}>
                    <View style={[styles.ativoDot, { backgroundColor: prof.ativo ? C.green : C.second }]} />
                    <Text style={[styles.ativoText, { color: prof.ativo ? C.green : C.second }]}>
                        {prof.ativo ? 'Ativo' : 'Inativo'}
                    </Text>
                </View>
            </View>

            {/* Email */}
            <View style={styles.emailRow}>
                <Ionicons name="mail-outline" size={13} color={C.blue} />
                <Text style={styles.emailText}>{prof.email}</Text>
            </View>

            {/* Ação */}
            <TouchableOpacity
                style={styles.verPerfilBtn}
                onPress={() => onVerPerfil(prof)}
                activeOpacity={0.78}
            >
                <Ionicons name="person-circle-outline" size={15} color={C.blue} />
                <Text style={styles.verPerfilText}>Ver perfil completo no portal</Text>
                <Ionicons name="chevron-forward" size={13} color={C.blue} />
            </TouchableOpacity>
        </View>
    );
}

// ── Visualizador de perfil via WebView ──
function PerfilWebView({ prof, onClose }) {
    const url = `${PORTAL_BASE}/${prof.portalSlug}`;

    return (
        <View style={StyleSheet.absoluteFill}>
            <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
                <View style={styles.perfilHeader}>
                    <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={22} color={C.text} />
                    </TouchableOpacity>
                    <Text style={styles.perfilHeaderTitle} numberOfLines={1}>{prof.nome}</Text>
                    <View style={[styles.headerBadge, { borderColor: C.blue + '55', backgroundColor: C.blue + '18' }]}>
                        <Text style={[styles.headerBadgeText, { color: C.blue }]}>PORTAL</Text>
                    </View>
                </View>
                <WebView
                    source={{ uri: url }}
                    startInLoadingState
                    renderLoading={() => (
                        <View style={styles.webLoading}>
                            <Text style={{ color: C.second }}>Carregando perfil…</Text>
                        </View>
                    )}
                />
            </SafeAreaView>
        </View>
    );
}

export default function ProfissionaisScreen({ navigation }) {
    const [busca,         setBusca]         = useState('');
    const [filtroEsp,     setFiltroEsp]     = useState('Todas');
    const [perfilAberto,  setPerfilAberto]  = useState(null);

    const profFiltrados = PROFISSIONAIS_MOCK.filter(p => {
        const matchEsp  = filtroEsp === 'Todas' || p.especialidade === filtroEsp;
        const matchBusca = busca.trim() === '' ||
            p.nome.toLowerCase().includes(busca.toLowerCase()) ||
            p.especialidade.toLowerCase().includes(busca.toLowerCase());
        return matchEsp && matchBusca;
    });

    if (perfilAberto) {
        return <PerfilWebView prof={perfilAberto} onClose={() => setPerfilAberto(null)} />;
    }

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profissionais</Text>
                <View style={[styles.headerBadge, { borderColor: C.blue + '55', backgroundColor: C.blue + '18' }]}>
                    <Text style={[styles.headerBadgeText, { color: C.blue }]}>PAJE club</Text>
                </View>
            </View>

            {/* Busca */}
            <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={16} color={C.second} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nome ou especialidade…"
                    placeholderTextColor="#475569"
                    value={busca}
                    onChangeText={setBusca}
                />
                {busca.length > 0 && (
                    <TouchableOpacity onPress={() => setBusca('')}>
                        <Ionicons name="close-circle" size={16} color={C.second} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filtros de especialidade */}
            <FlatList
                data={ESPECIALIDADES}
                keyExtractor={e => e}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtrosList}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filtroChip,
                            filtroEsp === item && { backgroundColor: C.blue + '22', borderColor: C.blue + '66' },
                        ]}
                        onPress={() => setFiltroEsp(item)}
                    >
                        <Text style={[styles.filtroText, filtroEsp === item && { color: C.blue }]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Lista de profissionais */}
            <FlatList
                data={profFiltrados}
                keyExtractor={p => p.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Ionicons name="search-outline" size={36} color={C.second} />
                        <Text style={styles.emptyText}>Nenhum profissional encontrado.</Text>
                    </View>
                }
                ListFooterComponent={
                    <View style={styles.footerNote}>
                        <Ionicons name="information-circle-outline" size={13} color={C.second} />
                        <Text style={styles.footerNoteText}>
                            {'  '}Profissionais credenciados PAJE club.
                            Comunicação exclusiva via @paje.email.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <CardProfissional
                        prof={item}
                        onVerPerfil={setPerfilAberto}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },

    /* Header */
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerBtn:       { padding: 6, backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border },
    headerTitle:     { flex: 1, fontSize: 17, fontWeight: 'bold', color: C.text, marginLeft: 12 },
    headerBadge:     { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
    headerBadgeText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },

    /* Busca */
    searchWrap: {
        flexDirection: 'row', alignItems: 'center',
        margin: 16, marginBottom: 8,
        backgroundColor: C.card, borderRadius: 10,
        borderWidth: 1, borderColor: C.border,
        paddingHorizontal: 12, paddingVertical: 10,
    },
    searchIcon:  { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: C.text },

    /* Filtros */
    filtrosList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
    filtroChip: {
        borderRadius: 20, borderWidth: 1, borderColor: C.border,
        paddingHorizontal: 12, paddingVertical: 6,
        backgroundColor: C.card,
    },
    filtroText: { fontSize: 12, color: C.second, fontWeight: '500' },

    /* Lista */
    listContent: { padding: 16, gap: 12, paddingBottom: 40 },

    /* Card profissional */
    card: {
        backgroundColor: C.card, borderRadius: 14,
        borderWidth: 1, borderColor: C.border,
        borderLeftWidth: 4, borderLeftColor: C.blue,
        padding: 14,
    },
    cardTop:  { flexDirection: 'row', gap: 12, marginBottom: 10 },
    avatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: C.blue + '22',
        borderWidth: 1.5, borderColor: C.blue + '55',
        justifyContent: 'center', alignItems: 'center',
        flexShrink: 0,
    },
    avatarText: { fontSize: 16, fontWeight: 'bold', color: C.blue },
    cardInfo:   { flex: 1 },
    cardNome:   { fontSize: 14, fontWeight: 'bold', color: C.text, marginBottom: 2 },
    cardEsp:    { fontSize: 12, color: C.blue, fontWeight: '600', marginBottom: 2 },
    cardCrm:    { fontSize: 10, color: C.second, marginBottom: 4 },
    cardAval:   { fontSize: 10, color: C.second, marginTop: 2 },

    ativoBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 3, gap: 4, alignSelf: 'flex-start' },
    ativoDot:   { width: 6, height: 6, borderRadius: 3 },
    ativoText:  { fontSize: 9, fontWeight: 'bold' },

    emailRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    emailText: { fontSize: 12, color: C.blue, fontFamily: 'monospace' },

    verPerfilBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: C.blue + '12',
        borderRadius: 8, borderWidth: 1, borderColor: C.blue + '33',
        paddingHorizontal: 12, paddingVertical: 9,
    },
    verPerfilText: { flex: 1, fontSize: 12, fontWeight: '600', color: C.blue },

    /* Perfil WebView */
    perfilHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
        backgroundColor: C.bg,
    },
    perfilHeaderTitle: { flex: 1, fontSize: 15, fontWeight: 'bold', color: C.text, marginLeft: 12 },
    webLoading: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

    /* Empty */
    emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyText: { fontSize: 14, color: C.second },

    /* Footer note */
    footerNote: {
        flexDirection: 'row', alignItems: 'flex-start',
        marginTop: 8, padding: 12,
        backgroundColor: C.card, borderRadius: 10,
        borderWidth: 1, borderColor: C.border,
    },
    footerNoteText: { flex: 1, fontSize: 11, color: C.second, lineHeight: 17 },
});
