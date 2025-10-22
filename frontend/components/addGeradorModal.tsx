import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Pressable, Alert } from 'react-native';

interface AddGeradorModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (nome: string, descricao: string | null) => Promise<void>; 
}

const AddGeradorModal: React.FC<AddGeradorModalProps> = ({ visible, onClose, onAdd }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome do gerador é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      await onAdd(nome, descricao.trim() || null); 
      setNome('');
      setDescricao(''); 
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNome('');
    setDescricao(''); 
    onClose();
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose} 
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Adicionar Gerador</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome do Gerador"
            placeholderTextColor="#888"
            value={nome}
            onChangeText={setNome}
          />

          <TextInput
            style={[styles.input, styles.textArea]} 
            placeholder="Descrição (Opcional)"
            placeholderTextColor="#888"
            value={descricao}
            onChangeText={setDescricao}
            multiline={true} 
            numberOfLines={4} 
          />

          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={handleClose} disabled={loading}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.saveButton]} onPress={handleSalvar} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', backgroundColor: '#1f2937', borderRadius: 10, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  input: { height: 50, width: '100%', backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, marginBottom: 20, textAlignVertical: 'top' },
  textArea: { height: 100, paddingTop: 15 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, elevation: 2, flex: 0.48 },
  cancelButton: { backgroundColor: '#4b5563' },
  saveButton: { backgroundColor: '#EFB322' },
  buttonText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
});


export default AddGeradorModal;