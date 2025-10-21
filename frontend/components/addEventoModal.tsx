import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';

interface EventoFormData {
  local: string;
  descricao: string;
  data: string;
  operador: string;
  responsavel: string;
  fone_resp: string | null;
  id_gerador: number | null; 
}

interface AddEventoModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: EventoFormData) => Promise<void>;
}

const AddEventoModal: React.FC<AddEventoModalProps> = ({ visible, onClose, onAdd }) => {
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(''); 
  const [operador, setOperador] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [foneResp, setFoneResp] = useState('');
  const [idGerador, setIdGerador] = useState(''); 
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setLocal('');
    setDescricao('');
    setData('');
    setOperador('');
    setResponsavel('');
    setFoneResp('');
    setIdGerador('');
  };

  const handleSalvar = async () => {
    if (!local.trim() || !descricao.trim() || !data.trim() || !operador.trim() || !responsavel.trim() || !idGerador.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const idGeradorNum = parseInt(idGerador, 10);
    if (isNaN(idGeradorNum)) {
       Alert.alert('Erro', 'ID do Gerador inválido. Digite apenas números.');
       return;
    }
    
    setLoading(true);
    try {
      const eventoData: EventoFormData = {
        local: local.trim(),
        descricao: descricao.trim(),
        data: data.trim(), 
        operador: operador.trim(),
        responsavel: responsavel.trim(),
        fone_resp: foneResp.trim() || null, 
        id_gerador: idGeradorNum,
      };

      await onAdd(eventoData); 
      resetFields();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <Text style={styles.modalTitle}>Adicionar Evento</Text>

            <TextInput style={styles.input} placeholder="Local" value={local} onChangeText={setLocal} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Descrição" value={descricao} onChangeText={setDescricao} multiline numberOfLines={3} />
            <TextInput style={styles.input} placeholder="Data (AAAA-MM-DD)" value={data} onChangeText={setData} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Operador" value={operador} onChangeText={setOperador} />
            <TextInput style={styles.input} placeholder="Responsável" value={responsavel} onChangeText={setResponsavel} />
            <TextInput style={styles.input} placeholder="Fone Resp. (Opcional)" value={foneResp} onChangeText={setFoneResp} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="ID do Gerador" value={idGerador} onChangeText={setIdGerador} keyboardType="numeric" />

            <View style={styles.buttonContainer}>
              <Pressable style={[styles.button, styles.cancelButton]} onPress={handleClose} disabled={loading}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.saveButton]} onPress={handleSalvar} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', maxHeight: '85%', backgroundColor: '#1f2937', borderRadius: 10, paddingVertical: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  scrollViewContent: { 
      width: '100%',
      paddingHorizontal: 20,
      alignItems: 'center', 
  },
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
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 }, // Margin top para separar do último input
  button: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, elevation: 2, flex: 0.48 },
  cancelButton: { backgroundColor: '#4b5563' },
  saveButton: { backgroundColor: '#EFB322' },
  buttonText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
});

export default AddEventoModal;