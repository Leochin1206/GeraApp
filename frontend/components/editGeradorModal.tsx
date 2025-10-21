import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Pressable, Alert, Platform } from 'react-native';

interface Gerador {
  id: number;
  nome: string;
  descricao: string | null;
}

interface EditGeradorModalProps {
  visible: boolean;
  gerador: Gerador | null;
  onClose: () => void;
  onUpdate: (id: number, nome: string, descricao: string | null) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const EditGeradorModal: React.FC<EditGeradorModalProps> = ({ visible, gerador, onClose, onUpdate, onDelete }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gerador) {
      setNome(gerador.nome);
      setDescricao(gerador.descricao || '');
    } else {
      setNome('');
      setDescricao('');
    }
  }, [gerador]);

  const handleSalvar = async () => {
    if (!gerador || !nome.trim()) {
      Alert.alert('Erro', 'O nome do gerador é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      await onUpdate(gerador.id, nome, descricao.trim() || null);
    } catch (error) {  }
    finally { setLoading(false); }
  };

  const handleDeleteConfirm = () => {
    if (!gerador) return;

    if (Platform.OS === 'web') {
      if (window.confirm(`Tem certeza que deseja deletar o gerador "${gerador.nome}"?`)) {
        handleDelete(); 
      }
    } else {
      Alert.alert(
        "Confirmar Exclusão",
        `Tem certeza que deseja deletar o gerador "${gerador.nome}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Deletar", style: "destructive", onPress: handleDelete } 
        ]
      );
    }
  };

  const handleDelete = async () => {
    if (!gerador) return;
    setLoading(true);
    try {
      await onDelete(gerador.id);
    } catch (error) {  }
    finally { setLoading(false); }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Editar Gerador</Text>

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
            <Pressable style={[styles.button, styles.deleteButton]} onPress={handleDeleteConfirm} disabled={loading}>
              <Text style={styles.buttonText}>Deletar</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.saveButton]} onPress={handleSalvar} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
            </Pressable>
          </View>
          <Pressable style={[styles.button, styles.cancelButton, { marginTop: 10 }]} onPress={onClose} disabled={loading}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', backgroundColor: '#1f2937', borderRadius: 10, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  input: { height: 50, width: '100%', backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, marginBottom: 20, textAlignVertical: 'top', },
  textArea: { height: 100, paddingTop: 15, },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, elevation: 2, flex: 0.48 },
  cancelButton: { backgroundColor: '#4b5563', flex: 1 },
  saveButton: { backgroundColor: '#EFB322' },
  deleteButton: { backgroundColor: '#ef4444' },
  buttonText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
});

export default EditGeradorModal;