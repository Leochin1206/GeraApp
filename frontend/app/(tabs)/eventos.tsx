import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import api, { AxiosError } from '../../service/api';
import EventoItem from '../../components/eventoItem';
import AddEventoModal from '../../components/addEventoModal';
import EditEventoModal from '../../components/editEventoModal';

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

interface EventoFormData {
  local: string;
  descricao: string;
  data: string;
  operador: string;
  responsavel: string;
  fone_resp: string | null;
  id_gerador: number | null;
}

interface Gerador {
  id: number;
  nome: string;
}

export default function EventosScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [listaGeradores, setListaGeradores] = useState<Gerador[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  const fetchDados = useCallback(async () => {
    try {
      setLoading(true);
      const [eventosResponse, geradoresResponse] = await Promise.all([
        api.get('/eventos/'),
        api.get('/geradores/')
      ]);

      const eventosFormatados = eventosResponse.data.map((e: any, index: number) => ({
        id: index + 1,
        local: e.local,
        descricao: e.descricao,
        data: e.data,
        operador: e.operador,
        responsavel: e.responsavel,
        fone_resp: e.fone_resp,
        id_gerador: e.id_gerador,
      }));

      setEventos(eventosFormatados);

      setListaGeradores(geradoresResponse.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDados();
    }, [fetchDados])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDados();
  }, [fetchDados]);

  const handleAddEvento = async (data: EventoFormData) => {
    try {
      await api.post('/eventos/', data);
      setAddModalVisible(false);
      Alert.alert('Sucesso', 'Evento adicionado!');
      fetchDados();
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

  const handleUpdateEvento = async (id: number, data: EventoUpdateData) => {
    console.log("[EventosScreen] handleUpdateEvento called with ID:", id);
    if (id === undefined) {
      console.error("!!! ID received by handleUpdateEvento is UNDEFINED !!!");
      Alert.alert('Erro', 'ID do evento não encontrado. Não foi possível atualizar.');
      return;
    }
    try {
      await api.put(`/eventos/${id}`, data);
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Evento atualizado!');
      fetchDados();
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

  const handleDeleteEvento = async (id: number) => {
    try {
      await api.delete(`/eventos/${id}`);
      setEditModalVisible(false);
      if (Platform.OS !== 'web') {
        Alert.alert('Sucesso', 'Evento deletado!');
      }
      fetchDados();
    } catch (error) {
      console.error("Erro ao deletar evento (API Call Failed):", error);
      if (error instanceof AxiosError && error.response) {
        Alert.alert('Erro', error.response.data.detail || 'Não foi possível deletar o evento.');
      } else {
        Alert.alert('Erro', 'Não foi possível deletar o evento.');
      }
    }
  };

  const openEditModal = (evento: Evento) => {
    console.log("[EventosScreen] Opening edit modal for evento:", evento);
    setSelectedEvento(evento);
    setEditModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.counterText}>{eventos.length} Eventos Cadastrados</Text>
        <Pressable style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <MaterialCommunityIcons name="plus-circle-outline" size={30} color="#EFB322" />
        </Pressable>
      </View>

      {loading && eventos.length === 0 ? (
        <ActivityIndicator size="large" color="#EFB322" style={styles.loader} />
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

      <AddEventoModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddEvento}
        geradores={listaGeradores}
      />

      {selectedEvento && (
        <EditEventoModal
          visible={editModalVisible}
          evento={selectedEvento}
          onClose={() => setEditModalVisible(false)}
          onUpdate={handleUpdateEvento}
          onDelete={handleDeleteEvento}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc', paddingTop: 20, },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, marginHorizontal: '7.5%', marginBottom: 20,backgroundColor: "#FFFFFF", borderRadius: 10, width: "85%", shadowColor: "#000",shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3.84,elevation: 4 },
  counterText: { fontSize: 16, fontWeight: '600', color: '#333' },
  addButton: { padding: 5 },
  list: { flex: 1, paddingHorizontal: 15 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#A0AEC0', textAlign: 'center', marginTop: 50, fontSize: 16 },
});