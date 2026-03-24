
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error, style, variant, autoCapitalize }) => {
    const isUnderline = variant === 'underline';
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={[styles.label, isUnderline && styles.labelUnderline]}>{label}</Text>}
            <View style={[styles.inputContainer, isUnderline && styles.inputContainerUnderline, error && styles.inputError]}>
                <TextInput
                    style={[styles.input, isUnderline && styles.inputUnderline]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    placeholderTextColor={isUnderline ? '#aaa' : colors.textSecondary}
                    autoCapitalize={autoCapitalize ?? 'none'}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.m,
        width: '100%',
    },
    label: {
        ...typography.body,
        fontWeight: '600',
        marginBottom: spacing.xs,
        color: colors.text,
    },
    labelUnderline: {
        color: '#333',
        fontWeight: '500',
        fontSize: 13,
        marginBottom: 2,
    },
    inputContainer: {
        backgroundColor: colors.surface,
        borderRadius: spacing.s,
        borderWidth: 1,
        borderColor: colors.border,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: spacing.m,
    },
    inputContainerUnderline: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        height: 44,
        paddingHorizontal: 0,
    },
    input: {
        ...typography.body,
        height: '100%',
    },
    inputUnderline: {
        color: '#000',
        fontSize: 15,
        paddingHorizontal: 4,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorText: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
