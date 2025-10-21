import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
// Adjust paths if needed
import api, { AxiosError } from '../../service/api'; 
import EventoItem from '../../components/eventoItem'; 
import AddEventoModal from '../../components/addEventoModal'; 
import EditEventoModal from '../../components/editEventoModal'; 

// Define interfaces directly here or import from a types file
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

// Interface from AddEventoModal needed for handleAddEvento
interface EventoFormData {
  local: string;
  descricao: string;
  data: string;
  operador: string;
  responsavel: string;
  fone_resp: string | null;
  id_gerador: number | null;
}

// Simple interface for Generator List
interface Gerador {
    id: number;
    nome: string;
}

export default function EventosScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  // 👇 1. ADD STATE FOR GENERATORS
  const [listaGeradores, setListaGeradores] = useState<Gerador[]>([]); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  // 👇 2. RENAME & MODIFY FETCH FUNCTION
  const fetchDados = useCallback(async () => { 
    try {
      setLoading(true);
      // Fetch both lists concurrently
      const [eventosResponse, geradoresResponse] = await Promise.all([
        api.get('/eventos/'),
        api.get('/geradores/') // Fetch generators
      ]);
      setEventos(eventosResponse.data);
      setListaGeradores(geradoresResponse.data); // Set generators state
    } catch (error) {
      console.error("Erro ao buscar dados:", error); // Generic error message
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Use the combined fetch function
  useFocusEffect(
    useCallback(() => {
      fetchDados();
    }, [fetchDados])
  );

  // Use the combined fetch function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDados();
  }, [fetchDados]);

  // --- Funções CRUD ---

  // 👇 4. TYPE CHECK PARAMETER (optional but good)
  const handleAddEvento = async (data: EventoFormData) => { 
    try {
      await api.post('/eventos/', data); 
      setAddModalVisible(false);
      Alert.alert('Sucesso', 'Evento adicionado!');
      fetchDados(); // Refresh both lists might be safer
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      if (error instanceof AxiosError && error.response) {
        const detail = error.response.data.detail;
        if (detail === "Gerador não encontrado") {
          Alert.alert('Erro', 'O ID do Gerador informado não existe.');
        } else {
          Alert.alert('Erro', detail || 'Não foi possível adicionar o evento.'); 
        }
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o evento.'); 
      }
      throw error; 
    }
  };

  // handleUpdateEvento (no changes needed here, assuming EventoUpdateData is correct)
  const handleUpdateEvento = async (id: number, data: EventoUpdateData) => {
    try {
      await api.put(`/eventos/${id}`, data); 
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Evento atualizado!'); 
      fetchDados(); // Refresh both lists
    } catch (error) {
      console.error("Erro ao atualizar evento:", error); 
      if (error instanceof AxiosError && error.response) {
         Alert.alert('Erro', error.response.data.detail || 'Não foi possível atualizar o evento.'); 
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o evento.'); 
      }
      throw error; 
    }
  };

  // handleDeleteEvento (no changes needed here)
  const handleDeleteEvento = async (id: number) => {
    // ... (your existing delete logic is fine) ...
     try {
       await api.delete(`/eventos/${id}`); 
       setEditModalVisible(false); 
       if (Platform.OS !== 'web') {
         Alert.alert('Sucesso', 'Evento deletado!'); 
       }
       fetchDados(); // Refresh both lists
     } catch (error) {
       console.error("Erro ao deletar evento (API Call Failed):", error); 
       if (error instanceof AxiosError && error.response) {
         Alert.alert('Erro', error.response.data.detail || 'Não foi possível deletar o evento.'); 
       } else {
         Alert.alert('Erro', 'Não foi possível deletar o evento.'); 
       }
     }
  };

  // openEditModal (no changes needed)
  const openEditModal = (evento: Evento) => {
    setSelectedEvento(evento); 
    setEditModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header (no changes needed) */}
      <View style={styles.header}>
        <Text style={styles.counterText}>{eventos.length} Eventos Cadastrados</Text> 
        <Pressable style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <MaterialCommunityIcons name="plus-circle-outline" size={30} color="#EFB322" />
        </Pressable>
      </View>

      {/* List (no changes needed) */}
      {loading && eventos.length === 0 ? ( 
        <ActivityIndicator size="large" color="#EFB322" style={styles.loader}/>
      ) : (
        <FlatList
          data={eventos} 
          renderItem={({ item }) => <EventoItem evento={item} onEditPress={openEditModal} />} 
          keyExtractor={(item, index) => item?.id?.toString() ?? `evento-${index}`}
          style={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum evento cadastrado.</Text>} 
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EFB322" />
          }
        />
      )}

      {/* 👇 3. PASS GENERATORS TO AddEventoModal */}
      <AddEventoModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddEvento}
        geradores={listaGeradores} // Pass the fetched generator list
      />
      {/* Edit Modal (no changes needed here) */}
      <EditEventoModal
        visible={editModalVisible}
        evento={selectedEvento} 
        onClose={() => setEditModalVisible(false)}
        onUpdate={handleUpdateEvento} 
        onDelete={handleDeleteEvento} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc', 
    paddingTop: 20, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: '7.5%',
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    padding: 5,
  },
  list: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});