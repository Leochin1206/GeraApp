import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import api, { AxiosError } from '../../service/api'; 
import GeradorItem from '../../components/geradorItem'; 
import AddGeradorModal from '../../components/addGeradorModal'; 
import EditGeradorModal from '../../components/editGeradorModal'; 

interface Gerador {
  id: number;
  nome: string;
  descricao: string | null; 
}

export default function GeradoresScreen() {
  const [geradores, setGeradores] = useState<Gerador[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedGerador, setSelectedGerador] = useState<Gerador | null>(null);

  const fetchGeradores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/geradores/');
      setGeradores(response.data);
    } catch (error) {
      console.error("Erro ao buscar geradores:", error);
      Alert.alert('Erro', 'Não foi possível carregar os geradores.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGeradores();
    }, [fetchGeradores])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGeradores();
  }, [fetchGeradores]);

  const handleAddGerador = async (nome: string, descricao: string | null) => {
    const dadosGerador = {
      nome: nome,
      descricao: descricao,
    };

    try {
      await api.post('/geradores/', dadosGerador); 
      setAddModalVisible(false);
      Alert.alert('Sucesso', 'Gerador adicionado!');
      fetchGeradores(); 
    } catch (error) {
      console.error("Erro ao adicionar gerador:", error);
      if (error instanceof AxiosError && error.response) {
         Alert.alert('Erro', error.response.data.detail || 'Não foi possível adicionar o gerador.');
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o gerador.');
      }
      throw error; 
    }
  };

  const handleUpdateGerador = async (id: number, nome: string, descricao: string | null) => {
    const dadosGeradorUpdate = {
      nome: nome,
      descricao: descricao,
    };

    try {
      await api.put(`/geradores/${id}`, dadosGeradorUpdate); 
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Gerador atualizado!');
      fetchGeradores(); 
    } catch (error) {
      console.error("Erro ao atualizar gerador:", error);
      if (error instanceof AxiosError && error.response) {
         Alert.alert('Erro', error.response.data.detail || 'Não foi possível atualizar o gerador.');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o gerador.');
      }
      throw error; 
    }
  };

  const handleDeleteGerador = async (id: number) => {
    try {
      await api.delete(`/geradores/${id}`);
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Gerador deletado!');
      fetchGeradores();
    } catch (error) {
      console.error("Erro ao deletar gerador:", error);
       if (error instanceof AxiosError && error.response) {
         Alert.alert('Erro', error.response.data.detail || 'Não foi possível deletar o gerador.');
      } else {
        Alert.alert('Erro', 'Não foi possível deletar o gerador.');
      }
      throw error; 
    }
  };

  const openEditModal = (gerador: Gerador) => {
    setSelectedGerador(gerador);
    setEditModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.counterText}>{geradores.length} Geradores Cadastrados</Text>
        <Pressable style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <MaterialCommunityIcons name="plus-circle-outline" size={30} color="#EFB322" />
        </Pressable>
      </View>

      {loading && geradores.length === 0 ? (
        <ActivityIndicator size="large" color="#EFB322" style={styles.loader}/>
      ) : (
        <FlatList
          data={geradores}
          renderItem={({ item }) => <GeradorItem gerador={item} onEditPress={openEditModal} />}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum gerador cadastrado.</Text>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EFB322" />
          }
        />
      )}

      <AddGeradorModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddGerador}
      />
      <EditGeradorModal
        visible={editModalVisible}
        gerador={selectedGerador}
        onClose={() => setEditModalVisible(false)}
        onUpdate={handleUpdateGerador}
        onDelete={handleDeleteGerador}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C1D2C', 
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF', 
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