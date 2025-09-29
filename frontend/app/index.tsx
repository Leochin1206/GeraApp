import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Pressable, Alert } from 'react-native'
import { Link, useRouter } from 'expo-router'
import api, { AxiosError } from '../service/api' 
import * as SecureStore from 'expo-secure-store' 

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const router = useRouter()

  // 👇 2. Crie a função para lidar com o login
  const handleLogin = async () => {
    // Validação básica
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha e-mail e senha.')
      return
    }

    // O backend espera dados de formulário para o login
    const formData = new URLSearchParams()
    formData.append('username', email) // O backend espera 'username', não 'email'
    formData.append('password', senha)

    try {
      // Faz a requisição POST para o endpoint /login
      const response = await api.post('/login', formData)

      // Pega o token da resposta
      const { access_token } = response.data

      // 3. Salva o token de forma segura no dispositivo
      await SecureStore.setItemAsync('userToken', access_token)

      // Feedback de sucesso e navegação
      Alert.alert('Sucesso!', 'Login realizado com sucesso.', [
        { text: 'OK', onPress: () => router.push('/home') }, // Navega para a home
      ])
    } catch (error) {
      // Tratamento de erros
      if (error instanceof AxiosError && error.response) {
        console.error(
          'Erro do Backend:',
          JSON.stringify(error.response.data, null, 2)
        )
        Alert.alert('Erro no Login', error.response.data.detail)
      } else {
        console.error('Erro Desconhecido:', error)
        Alert.alert('Erro', 'Não foi possível fazer o login.')
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* ... (seu JSX para imagens e linhas) ... */}
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
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        {/* 👇 4. Conecte o onPress à nova função handleLogin */}
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleLogin}
        >
          {({ pressed }) => (
            <Text
              style={[styles.buttonText, pressed && styles.buttonTextPressed]}
            >
              Entrar
            </Text>
          )}
        </Pressable>

        <Link href="/cadastro" style={styles.cadastroContainer}>
          <Text style={styles.textCadastro}>
            Não possui uma conta?{' '}
            <Text style={styles.linkCadastro}>Cadastre-se Aqui!</Text>
          </Text>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 30, backgroundColor: '#0C1D2C', padding: 20 },
    form: { width: '90%', gap: 20 },
    images: { alignItems: 'center', gap: 20, marginTop: 30 },
    input: { height: 50, width: '100%', borderColor: '#ccc', borderWidth: 0,paddingHorizontal: 15, backgroundColor: '#fff', fontSize: 16 },
    label: { fontSize: 18, color: '#FFF', marginBottom: 8 },
    button: { alignItems: 'center', justifyContent: 'center', backgroundColor: "#0C1D2C", borderWidth: 1, borderColor: '#EFB322', padding: 8, width: '80%', alignSelf: 'center' },
    buttonText: { color: '#fff', fontSize: 20 },
    buttonPressed: { backgroundColor: '#EFB322' },
    buttonTextPressed: { color: '#0C1D2C' },
    viewLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, width: '100%', alignSelf: 'center' },
    linha: { height: 1, width: '56%', backgroundColor: '#fff' },
    cadastroContainer: { marginTop: 20, marginBottom: 30, textAlign: 'center' },
    textCadastro: { color: '#fff', fontSize: 14 },
    linkCadastro: { color: '#EFB322', fontWeight: 'bold' }
});