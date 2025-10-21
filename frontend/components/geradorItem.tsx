import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Gerador {
  id: number;
  nome: string;
  descricao: string | null;
}

interface GeradorItemProps {
  gerador: Gerador;
  onEditPress: (gerador: Gerador) => void;
}

const GeradorItem: React.FC<GeradorItemProps> = ({ gerador, onEditPress }) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.nome}>{gerador.nome}</Text>
        {gerador.descricao && (
          <Text style={styles.descricao}>{gerador.descricao}</Text>
        )}
      </View>
      <Pressable onPress={() => onEditPress(gerador)} style={styles.editButton}>
        <MaterialCommunityIcons name="pencil" size={24} color="#EFB322" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
    backgroundColor: '#1f2937',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1, 
    marginRight: 10, 
  },
  nome: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 4, 
  },
  descricao: {
    fontSize: 14,
    color: '#D1D5DB', 
  },
  editButton: {
    padding: 5,
    marginLeft: 'auto', 
  },
});

export default GeradorItem;