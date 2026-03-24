
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, shadows } from '../theme';

export const Card = ({ children, style }) => {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: spacing.m,
        padding: spacing.m,
        marginBottom: spacing.m,
        ...shadows.small,
    },
});
