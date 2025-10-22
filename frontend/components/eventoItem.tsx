import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

interface EventoItemProps {
  evento: Evento;
  onEditPress: (evento: Evento) => void;
}

const EventoItem: React.FC<EventoItemProps> = ({ evento, onEditPress }) => {
  const formatData = (isoDateString: string) => {
    try {
      const date = new Date(isoDateString + 'T00:00:00');
      if (isNaN(date.getTime())) return isoDateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return isoDateString;
    }
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Pressable onPress={() => onEditPress(evento)} style={styles.cardContainer}>
      <View style={styles.mainInfo}>
        <View style={styles.iconTextContainer}>
          <MaterialCommunityIcons name="map-marker-outline" size={22} color="#EFB322" style={styles.icon} />
          <Text style={styles.localText}>{truncateText(evento.local, 12)}</Text>
        </View>
        <View style={styles.iconTextContainer}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={20} color="#EFB322" style={styles.icon} />
          <Text style={styles.dataText}>{formatData(evento.data)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.secondaryInfo}>
        <Text style={styles.label}>Descrição:</Text>
        <Text style={styles.value}>{evento.descricao}</Text>

        <Text style={styles.label}>Operador:</Text>
        <Text style={styles.value}>{evento.operador}</Text>

        <Text style={styles.label}>Responsável:</Text>
        <Text style={styles.value}>{evento.responsavel} {evento.fone_resp ? `(${evento.fone_resp})` : ''}</Text>
      </View>

      <Pressable onPress={() => onEditPress(evento)} style={styles.editButton}>
        <MaterialCommunityIcons name="pencil-circle" size={32} color="#EFB322" />
      </Pressable>


    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: { backgroundColor: '#1f2937', borderRadius: 10, padding: 15, marginVertical: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },shadowOpacity: 0.20, shadowRadius: 1.41, elevation: 2 },
  mainInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',marginBottom: 10 },
  iconTextContainer: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 6 },
  localText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', flexShrink: 1 },
  dataText: { fontSize: 16, color: '#E5E7EB' },
  divider: { height: 1, backgroundColor: '#374151', marginVertical: 10 },
  secondaryInfo: { },
  label: { fontSize: 12, color: '#A0AEC0', marginBottom: 2, marginTop: 6 },
  value: { fontSize: 14, color: '#E5E7EB', marginBottom: 4, width: '87%', textAlign: 'left' },
  editButton: { position: 'absolute', top: 100, right: 10 },
  chevron: { position: 'absolute', right: 15, top: '50%', transform: [{ translateY: -14 }] }
});

export default EventoItem;