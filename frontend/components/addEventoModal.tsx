import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaskInput, { Masks } from 'react-native-mask-input'; 

interface EventoFormData {
  local: string;
  descricao: string;
  data: string; 
  operador: string;
  responsavel: string;
  fone_resp: string | null;
  id_gerador: number | null;
}

interface Gerador { id: number; nome: string; }
interface AddEventoModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: EventoFormData) => Promise<void>;
  geradores: Gerador[];
}

const AddEventoModal: React.FC<AddEventoModalProps> = ({ visible, onClose, onAdd, geradores }) => {
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [operador, setOperador] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [foneResp, setFoneResp] = useState('');
  const [dataString, setDataString] = useState(''); 
  const [selectedGeradorId, setSelectedGeradorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      console.log("[AddEventoModal] Geradores recebidos via prop:", geradores);
      resetFields();
    }
  }, [visible]);

  const resetFields = () => {
    setLocal('');
    setDescricao('');
    setDataString(''); 
    setOperador('');
    setResponsavel('');
    setFoneResp('');
    setSelectedGeradorId(null);
  };

  const handleSalvar = async () => {
    console.log("handleSalvar chamado");
    console.log("Valores:", { local, descricao, dataString, operador, responsavel, selectedGeradorId });

    if (!local.trim() || !descricao.trim() || !dataString.trim() || !operador.trim() || !responsavel.trim() || selectedGeradorId === null) {
      console.log("Falha na validação: Campos obrigatórios não preenchidos.");
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const dateFormatRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dateFormatRegex.test(dataString.trim())) {
      console.log(`Falha na validação: Formato da data inválido ('${dataString}')`);
      Alert.alert('Erro', 'Data incompleta ou inválida. Use DD/MM/AAAA.');
      return;
    }

    const [dia, mes, ano] = dataString.trim().split('/');
    const dataFormatadaBackend = `${ano}-${mes}-${dia}`;
    console.log("Validações passaram. Data formatada para backend:", dataFormatadaBackend);

    setLoading(true);
    try {
      const eventoData: EventoFormData = {
        local: local.trim(),
        descricao: descricao.trim(),
        data: dataFormatadaBackend, 
        operador: operador.trim(),
        responsavel: responsavel.trim(),
        fone_resp: foneResp.trim() || null,
        id_gerador: selectedGeradorId,
      };
      console.log("Chamando onAdd com:", eventoData);
      await onAdd(eventoData);
      console.log("onAdd executado com sucesso (no modal).");
    } catch (error) {
       console.error("Erro capturado DENTRO do handleSalvar:", error);
    } finally {
       console.log("Bloco finally: Setando loading para false.");
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

            <MaskInput
              style={styles.input}
              placeholder="Data (DD/MM/AAAA)" 
              placeholderTextColor="#888"
              value={dataString}
              onChangeText={(masked) => {
                setDataString(masked); 
              }}
              mask={Masks.DATE_DDMMYYYY} 
              keyboardType="numeric"
            />

            <TextInput style={styles.input} placeholder="Operador" value={operador} onChangeText={setOperador} />
            <TextInput style={styles.input} placeholder="Responsável" value={responsavel} onChangeText={setResponsavel} />
            <TextInput style={styles.input} placeholder="Fone Resp. (Opcional)" value={foneResp} onChangeText={setFoneResp} keyboardType="phone-pad" />

            <View style={styles.pickerContainer}>
              <Picker
                 selectedValue={selectedGeradorId}
                 onValueChange={(itemValue) => setSelectedGeradorId(itemValue)}
                 style={styles.picker}
                 dropdownIconColor="#000"
               >
                 <Picker.Item label="-- Selecione um Gerador --" value={null} style={styles.pickerItemDisabled} />
                 {Array.isArray(geradores) && geradores.length > 0 ? (
                   geradores.map((g) => (
                     <Picker.Item key={g.id} label={g.nome} value={g.id} style={styles.pickerItem} />
                   ))
                 ) : (
                    <Picker.Item label="Nenhum gerador disponível" value={null} enabled={false} style={styles.pickerItemDisabled} />
                 )}
               </Picker>
            </View>

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
  modalView: { width: '90%', maxHeight: '90%', backgroundColor: '#1f2937', borderRadius: 10, paddingVertical: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  scrollViewContent: { width: '100%', paddingHorizontal: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 25 },
  input: { height: 60, width: 250, backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 18, fontSize: 16, marginBottom: 20, textAlignVertical: 'center' },
  textArea: { height: 120, paddingTop: 18, textAlignVertical: 'top' },
  pickerContainer: { height: 60, width: '100%', backgroundColor: '#FFF', borderRadius: 10, marginBottom: 20, justifyContent: 'center' },
  picker: { height: '100%', width: '100%' },
  pickerItem: { fontSize: 16 },
  pickerItemDisabled: { fontSize: 16, color: '#888', borderRadius: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
  button: { borderRadius: 10, paddingVertical: 14, paddingHorizontal: 20, elevation: 2, flex: 0.48 },
  cancelButton: { backgroundColor: '#4b5563' },
  saveButton: { backgroundColor: '#EFB322' },
  buttonText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
});

export default AddEventoModal;