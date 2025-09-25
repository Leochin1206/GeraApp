import { View, Text, StyleSheet } from 'react-native';

export default function CadastroScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eu sou a página de Cadastro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});