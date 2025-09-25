import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    return (
        <View style={styles.container}>

            <View style={styles.viewLinha}>
                <View style={styles.linha}></View>
                <View style={styles.linha}></View>
            </View>

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

                <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={() => alert('Botão de login pressionado!')}>
                    {({ pressed }) => (
                        <Text style={[styles.buttonText, pressed && styles.buttonTextPressed]}>
                            Entrar
                        </Text>
                    )}
                </Pressable>

                <Link href="/cadastro" style={styles.cadastroContainer}>
                    <Text style={styles.textCadastro}>
                        Não possui uma conta?{' '}
                        <Text style={styles.linkCadastro}>
                            Cadastre-se Aqui!
                        </Text>
                    </Text>
                </Link>

                <View style={styles.viewLinha}>
                    <View style={styles.linha}></View>
                    <View style={styles.linha}></View>
                </View>

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
        marginTop: 30
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
        padding: 8,
        width: '80%',
        alignSelf: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 20
    },
    buttonPressed: {
        backgroundColor: '#EFB322',
    },
    buttonTextPressed: {
        color: '#0C1D2C',
    },
    viewLinha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
        width: '100%',
        alignSelf: 'center',
    },
    linha: {
        height: 1,
        width: '56%',
        backgroundColor: '#fff',
    },
    cadastroContainer: {
        marginTop: 20,
        marginBottom: 30,
        textAlign: 'center',
    },
    textCadastro: {
        color: '#fff',
        fontSize: 14,
    },
    linkCadastro: {
        color: '#EFB322',
        fontWeight: 'bold',
    }
});