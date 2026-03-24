import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Button } from '../components/Button';
import { colors, spacing, typography, shadows } from '../theme';

export default function AboutLampsScreen({ navigation }) {

    const systems = [
        {
            id: 'hdsys',
            title: 'HDsys',
            subtitle: 'Hipertensão & Diabetes',
            description: 'Sistema de monitoramento de Hipertensão arterial e Diabetes.',
            image: require('../../assets/hdsys.png'),
            color: '#1A365D' // Deep Navy Blue
        },
        {
            id: 'pedsys',
            title: 'PEDsys',
            subtitle: 'Pediatria Integrada',
            description: 'Plataforma para monitoramento do desenvolvimento infantil até os 12 anos de idade.',
            image: require('../../assets/pedsys.png'),
            color: '#3182CE' // Bright Blue
        },
        {
            id: 'gravsys',
            title: 'GRAVsys',
            subtitle: 'Gestantes & Maternidade',
            description: 'Monitoramento contínuo da gravidez com suporte analítico preventivo para a gestante.',
            image: require('../../assets/gravsys.png'),
            color: '#D4AF37' // Matte Gold
        },
        {
            id: 'biosys',
            title: 'BIOsys',
            subtitle: 'Biotecnologia em Saúde',
            description: 'Simulação de processos biotecnológicos para atender a indústria em saúde.',
            image: require('../../assets/biosys.png'),
            color: '#2B6CB0' // Medium Blue
        }
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Voltar</Text>
                    </TouchableOpacity>
                    <Image source={require('../../assets/logo_login.png')} style={styles.logo} />
                    <Text style={styles.mainTitle}>LaMPS</Text>
                    <Text style={styles.lampsSubtitle}>Laboratório Virtual de Medicina de Precisão e Sistemas</Text>

                    <Text style={styles.mainSubtitle}>
                        Um laboratório de pesquisa científica da iniciativa privada, onde o PAJE SYSTEMS, com sua visão de empresa social, disponibiliza para a população ferramentas eletrônicas gratuitamente para apoiar as decisões dos profissionais de saúde.
                    </Text>

                    {/* VSL (Video Sales Letter) Promotion Thumbnail */}
                    <TouchableOpacity
                        style={styles.videoContainer}
                        onPress={() => Alert.alert("Em Breve", "O vídeo oficial da equipe LaMPS está em produção e será disponibilizado na próxima atualização!")}
                    >
                        <Image source={require('../../assets/lamps_promo_video_thumbnail.png')} style={styles.videoThumbnail} resizeMode="cover" />
                        <View style={styles.playIconOverlay}>
                            <Text style={styles.playIconText}>▶</Text>
                        </View>
                        <Text style={styles.videoCaption}>Dê o Play e descubra como o laboratório apoia os profissionais da saúde.</Text>
                    </TouchableOpacity>
                </View>

                {/* Cards Section */}
                <View style={styles.cardsContainer}>
                    {systems.map((sys) => (
                        <View key={sys.id} style={[styles.card, { borderTopColor: sys.color, borderTopWidth: 4 }]}>
                            <Image source={sys.image} style={[styles.projectHeroImage, { borderBottomColor: sys.color, borderBottomWidth: 3 }]} resizeMode="cover" />
                            <View style={styles.cardBody}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardTitleContainer}>
                                        <Text style={styles.cardTitle}>{sys.title}</Text>
                                        <Text style={styles.cardSubtitle}>{sys.subtitle}</Text>
                                    </View>
                                </View>
                                <Text style={styles.cardDescription}>{sys.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Call to Action Section */}
                <View style={styles.ctaContainer}>
                    <Text style={styles.ctaTitle}>Apoie nossos Projetos!</Text>
                    <Text style={styles.ctaText}>
                        Cadastre-se para acompanhar inovações e ferramentas desenvolvidas no laboratório.
                    </Text>

                    <Button
                        title="Seja um associado PAJEclub"
                        onPress={() => navigation.navigate('Register')}
                        style={styles.ctaButton}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        padding: spacing.l,
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.l,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: spacing.xs,
        marginBottom: spacing.s,
    },
    backText: {
        color: colors.primary,
        ...typography.body,
        fontWeight: 'bold',
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        marginBottom: spacing.m,
    },
    mainTitle: {
        ...typography.h1,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    lampsSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.s,
    },
    mainSubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.m,
        marginBottom: spacing.l,
    },
    videoContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.xl,
        position: 'relative',
    },
    videoThumbnail: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: colors.primary,
    },
    playIconOverlay: {
        position: 'absolute',
        top: 75,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(212, 175, 55, 0.8)', // Gold transparent
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    playIconText: {
        color: colors.white,
        fontSize: 24,
        marginLeft: 4, // Center play triangle visually
    },
    videoCaption: {
        ...typography.caption,
        color: '#D4AF37', // Gold 
        marginTop: spacing.s,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    cardsContainer: {
        marginTop: spacing.m,
    },
    card: {
        backgroundColor: colors.surface,
        marginBottom: spacing.l,
        borderRadius: 12,
        overflow: 'hidden',
        ...shadows.medium,
    },
    projectHeroImage: {
        width: '100%',
        height: 160,
        backgroundColor: colors.border,
    },
    cardBody: {
        padding: spacing.m,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    cardTitleContainer: {
        flex: 1,
    },
    cardTitle: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.text,
    },
    cardSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    cardDescription: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    ctaContainer: {
        marginTop: spacing.l,
        padding: spacing.l,
        backgroundColor: colors.primaryLight,
        borderRadius: 16,
        alignItems: 'center',
    },
    ctaTitle: {
        ...typography.h2,
        color: colors.primary,
        marginBottom: spacing.s,
    },
    ctaText: {
        ...typography.body,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.l,
    },
    ctaButton: {
        width: '100%',
    }
});
// Hot Reload Trigger (Images Updated - Gold & Blue)
