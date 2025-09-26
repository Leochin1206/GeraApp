import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Pressable, Alert, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import api, { AxiosError } from '../service/api';
import * as ImagePicker from 'expo-image-picker';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  const router = useRouter();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Você precisa permitir o acesso à galeria para escolher uma foto.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Image,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };


  // 👇 4. Função de cadastro ATUALIZADA
  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    formData.append('password', senha);

    if (foto) {
      // A linha abaixo continua igual
      const filename = foto.split('/').pop();

      // 👇 Adicione uma verificação para garantir que 'filename' não é undefined
      if (filename) {
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        // Agora o TypeScript sabe que 'filename' é uma string aqui dentro
        formData.append('foto', { uri: foto, name: filename, type } as any);
      }
    }

    try {
      // Envia o FormData para o backend
      await api.post('/users/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Sucesso!', 'Sua conta foi criada.', [
        { text: 'OK', onPress: () => router.push('/') },
      ]);

    } catch (error) {
      // 👇 Verificação de tipo
      if (error instanceof AxiosError && error.response) {
        // Se o erro for do backend, o 'error.response' existirá
        console.error("Erro do Backend:", JSON.stringify(error.response.data, null, 2));

        const detail = error.response.data.detail;

        // O FastAPI pode retornar a mensagem de erro como uma string ou uma lista
        if (typeof detail === 'string') {
          // Ex: "E-mail já cadastrado"
          Alert.alert('Erro no Cadastro', detail);
        } else if (Array.isArray(detail)) {
          // Ex: Erros de validação do Pydantic vêm como uma lista
          // Vamos pegar a mensagem do primeiro erro da lista
          const errorMsg = detail[0].msg;
          const field = detail[0].loc[1]; // Pega o nome do campo
          Alert.alert('Erro de Validação', `O campo '${field}' é inválido: ${errorMsg}`);
        } else {
          Alert.alert('Erro no Cadastro', 'Ocorreu um erro desconhecido no servidor.');
        }
      } else {
        // Erros de rede (sem resposta do servidor) ou outros tipos de erro
        console.error("Erro Desconhecido:", error);
        Alert.alert('Erro', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
      }
    }

  };

  return (
    <View style={styles.container}>
      {/* ... Imagens ... */}

      {/* 👇 5. UI para escolher e pré-visualizar a foto */}
      <Pressable onPress={pickImage}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.fotoPerfil} />
        ) : (
          <View style={styles.fotoPlaceholder}>
            <Text style={styles.fotoPlaceholderText}>Escolher Foto</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.form}>
        {/* ... Inputs ... (sem alteração) */}
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

// 👇 6. Adicionei os estilos para a foto
const styles = StyleSheet.create({
  // ... (seus estilos anteriores, pode ajustar o gap se precisar)
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    backgroundColor: '#0C1D2C',
    padding: 20,
  },
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

  // Estilos para a foto de perfil
  fotoPerfil: {
    width: 120,
    height: 120,
    borderRadius: 60, // Metade da largura/altura para um círculo perfeito
    borderColor: '#EFB322',
    borderWidth: 2,
  },
  fotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1f2937', // Um cinza escuro
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#EFB322',
    borderWidth: 2,
  },
  fotoPlaceholderText: {
    color: '#EFB322',
  },
});