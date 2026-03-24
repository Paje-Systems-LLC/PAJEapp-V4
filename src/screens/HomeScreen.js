import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = () => {
    const { logout, userInfo } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {userInfo?.first_name}!</Text>
            <Button title="Logout" onPress={logout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, marginBottom: 20 },
});

export default HomeScreen;
