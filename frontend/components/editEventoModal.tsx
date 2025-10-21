import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Pressable, Alert, ScrollView, Platform } from 'react-native';

interface Evento {
  id: number;
  local: string;
  descricao: string;
  data: string; 
  operador: string;
  responsavel: string;
  fone_resp: string | null;
  id_gerador: number;
}

interface EventoUpdateData {
  local?: string;
  descricao?: string;
  data?: string;
  operador?: string;
  responsavel?: string;
  fone_resp?: string | null;
  id_gerador?: number;
}

interface EditEventoModalProps {
  visible: boolean;
  evento: Evento | null;
  onClose: () => void;
  onUpdate: (id: number, data: EventoUpdateData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const EditEventoModal: React.FC<EditEventoModalProps> = ({ visible, evento, onClose, onUpdate, onDelete }) => {
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [operador, setOperador] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [foneResp, setFoneResp] = useState('');
  const [idGerador, setIdGerador] = useState(''); 

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (evento) {
      setLocal(evento.local);
      setDescricao(evento.descricao);
      setData(evento.data || '');
      setOperador(evento.operador);
      setResponsavel(evento.responsavel);
      setFoneResp(evento.fone_resp || '');
      setIdGerador(evento.id_gerador?.toString() || ''); 
    } else {
      setLocal('');
      setDescricao('');
      setData('');
      setOperador('');
      setResponsavel('');
      setFoneResp('');
      setIdGerador('');
    }
  }, [evento]);

  const handleSalvar = async () => {
    if (!evento) return; 

    if (!local.trim() || !descricao.trim() || !data.trim() || !operador.trim() || !responsavel.trim() || !idGerador.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const idGeradorNum = parseInt(idGerador, 10);
    if (isNaN(idGeradorNum)) {
       Alert.alert('Erro', 'ID do Gerador inválido.');
       return;
    }

    setLoading(true);
    try {
      const updateData: EventoUpdateData = {
        local: local.trim(),
        descricao: descricao.trim(),
        data: data.trim(),
        operador: operador.trim(),
        responsavel: responsavel.trim(),
        fone_resp: foneResp.trim() || null,
        id_gerador: idGeradorNum,
      };
      await onUpdate(evento.id, updateData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!evento) return;
    const eventDescription = evento.local || `Evento ID ${evento.id}`; 

    if (Platform.OS === 'web') {
      if (window.confirm(`Tem certeza que deseja deletar o evento em "${eventDescription}"?`)) {
        handleDelete();
      }
    } else {
      Alert.alert(
        "Confirmar Exclusão",
        `Tem certeza que deseja deletar o evento em "${eventDescription}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Deletar", style: "destructive", onPress: handleDelete }
        ]
      );
    }
  };

  const handleDelete = async () => {
    if (!evento) return;
    setLoading(true);
    try {
      await onDelete(evento.id);
    } catch (error) {
    } finally {
      setLoading(false);
    }
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
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Text style={styles.modalTitle}>Editar Evento</Text>

            <TextInput style={styles.input} placeholder="Local" value={local} onChangeText={setLocal} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Descrição" value={descricao} onChangeText={setDescricao} multiline numberOfLines={3} />
            <TextInput style={styles.input} placeholder="Data (AAAA-MM-DD)" value={data} onChangeText={setData} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Operador" value={operador} onChangeText={setOperador} />
            <TextInput style={styles.input} placeholder="Responsável" value={responsavel} onChangeText={setResponsavel} />
            <TextInput style={styles.input} placeholder="Fone Resp. (Opcional)" value={foneResp} onChangeText={setFoneResp} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="ID do Gerador" value={idGerador} onChangeText={setIdGerador} keyboardType="numeric" />

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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', maxHeight: '85%', backgroundColor: '#1f2937', borderRadius: 10, paddingVertical: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  scrollViewContent: { width: '100%', paddingHorizontal: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  textArea: {
    height: 80,
    paddingTop: 15,
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  button: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, elevation: 2, flex: 0.48 },
  cancelButton: { backgroundColor: '#4b5563', flex: 1 },
  saveButton: { backgroundColor: '#EFB322' },
  deleteButton: { backgroundColor: '#ef4444' },
  buttonText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
});

export default EditEventoModal;