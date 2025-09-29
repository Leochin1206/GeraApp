import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import api, { AxiosError } from '../service/api';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const router = useRouter();

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    const dadosUsuario = {
      nome: nome,
      email: email,
      password: senha, 
    };

    try {
      await api.post('/users/', dadosUsuario);

      Alert.alert('Sucesso!', 'Sua conta foi criada.', [
        { text: 'OK', onPress: () => router.push('/') },
      ]);

    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        console.error("Erro do Backend:", JSON.stringify(error.response.data, null, 2));
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          Alert.alert('Erro no Cadastro', detail);
        } else if (Array.isArray(detail)) {
          const errorMsg = detail[0].msg;
          const field = detail[0].loc[1];
          Alert.alert('Erro de Validação', `O campo '${field}' é inválido: ${errorMsg}`);
        } else {
          Alert.alert('Erro no Cadastro', 'Ocorreu um erro desconhecido no servidor.');
        }
      } else {
        console.error("Erro Desconhecido:", error);
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />
        </View>
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize='none' />
        </View>
        <View>
          <Text style={styles.label}>Senha</Text>
          <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
        </View>
        <View>
          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry />
        </View>

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleCadastro}>
          {({ pressed }) => (
            <Text style={[styles.buttonText, pressed && styles.buttonTextPressed]}>Cadastrar-se</Text>
          )}
        </Pressable>

        <Link href="/" style={styles.cadastroContainer}>
          <Text style={styles.textCadastro}>
            Já possui uma Conta?{' '}
            <Text style={styles.linkCadastro}>Faça login Aqui!</Text>
          </Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15, backgroundColor: '#0C1D2C', padding: 20 },
  form: { width: '90%', gap: 15 },
  label: { fontSize: 18, color: '#FFF', marginBottom: 8 },
  input: { height: 50, width: '100%', borderRadius: 8, paddingHorizontal: 15, backgroundColor: '#fff', fontSize: 16 },
  button: { alignItems: 'center', justifyContent: 'center', backgroundColor: "transparent", borderWidth: 2, borderColor: '#EFB322', paddingVertical: 12, width: '80%', alignSelf: 'center', borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#EFB322', fontSize: 18, fontWeight: 'bold' },
  buttonPressed: { backgroundColor: '#EFB322' },
  buttonTextPressed: { color: '#0C1D2C' },
  cadastroContainer: { marginTop: 15, width: '100%' },
  textCadastro: { color: '#fff', fontSize: 16, textAlign: 'center' },
  linkCadastro: { color: '#EFB322', fontWeight: 'bold' },
});