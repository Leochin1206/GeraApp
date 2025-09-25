import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Pressable } from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.images}>
                <Image source={require('../assets/images/logoNome.png')} />
                <Image source={require('../assets/images/slogan.png')} />
            </View>

            <View style={styles.form}>
                <View>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu e-mail"
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View>
                    <Text style={styles.label}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        placeholderTextColor="#888"
                        secureTextEntry={true}
                        value={senha}
                        onChangeText={setSenha}
                    />
                </View>

                <Pressable style={styles.button} onPress={() => alert('Botão de login pressionado!')}> 
                    <Text style={styles.buttonText}>Entrar</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        backgroundColor: '#0C1D2C',
        padding: 20,
    },
    form: {
        width: '90%',
        gap: 20,
    },
    images: {
        alignItems: 'center',
        gap: 20,
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 0,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    label: {
        fontSize: 18,
        color: '#FFF',
        marginBottom: 8,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#0C1D2C",
        borderWidth: 1,
        borderColor: '#EFB322',
        padding: 6,
        width: '80%',
        alignSelf: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 20
    }
});