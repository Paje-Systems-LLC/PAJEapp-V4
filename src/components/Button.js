
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, shadows } from '../theme';

export const Button = ({ title, onPress, loading, disabled, style, textStyle, secondary }) => {
    const content = (
        <>
            {loading ? (
                <ActivityIndicator color={secondary ? colors.primary : colors.surface} />
            ) : (
                <Text style={[
                    styles.text,
                    secondary && styles.secondaryText,
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </>
    );

    if (secondary) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[styles.button, styles.secondaryButton, style, disabled && styles.disabled]}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[styles.container, style, disabled && styles.disabled]}
        >
            <LinearGradient
                colors={[colors.primary, colors.primaryLight]} // Gradient from Deep Navy to Lighter Blue
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {content}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: spacing.s,
        overflow: 'hidden',
        ...shadows.medium,
    },
    button: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing.s,
    },
    gradient: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    text: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.surface,
    },
    secondaryText: {
        color: colors.primaryLight,
    },
    disabled: {
        opacity: 0.6,
    },
});
