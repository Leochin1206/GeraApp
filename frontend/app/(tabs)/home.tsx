import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import api, { AxiosError } from '../../service/api';
import EventChart from '@/components/eventChart';

interface UserData { nome: string; }

interface Gerador { id: number; }

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

interface ChartData {
  value: number;
  label: string;
}

export default function HomeScreen() {
  const [userName, setUserName] = useState<string | null>(null);
  const [totalGeradores, setTotalGeradores] = useState<number>(0);
  const [geradoresDisponiveis, setGeradoresDisponiveis] = useState<number>(0);
  const [geradoresEmUso, setGeradoresEmUso] = useState<number>(0);
  const [taxaDisponibilidade, setTaxaDisponibilidade] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [chartData, setChartData] = useState<ChartData[] | null>(null);
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) { setGreeting('Bom dia'); }
    else if (hour < 18) { setGreeting('Boa tarde'); }
    else { setGreeting('Boa noite'); }
  };

  const processEventData = (eventos: Evento[]): ChartData[] => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthBins: { [key: string]: number } = {};
    const labelsInOrder: { key: string; label: string }[] = [];

    let currentDate = new Date();

    for (let i = 0; i < 6; i++) {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear().toString().slice(-2);
      const label = `${monthNames[month]} ${year}`;
      const yearMonthKey = `${currentDate.getFullYear()}-${String(month + 1).padStart(2, '0')}`;
      labelsInOrder.unshift({ key: yearMonthKey, label: label });
      monthBins[yearMonthKey] = 0;

      currentDate.setMonth(currentDate.getMonth() - 1);
    }

    eventos.forEach(evento => {
      try {
        const eventYearMonth = evento.data.substring(0, 7);
        if (monthBins.hasOwnProperty(eventYearMonth)) {
          monthBins[eventYearMonth]++;
        }
      } catch (e) { console.error(`Data de evento inválida: ${evento.data}`); }
    });

    const formattedChartData = labelsInOrder.map(item => ({
      value: monthBins[item.key],
      label: item.label,
    }));

    return formattedChartData;
  };

  const formatData = (isoDateString: string) => {
    try {
      const [year, month, day] = isoDateString.split('-').map(Number);
      if (!year || !month || !day) return isoDateString; 
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return isoDateString; 
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    updateGreeting();
    let token: string | null = null;
    try {
      if (Platform.OS === 'web') { token = localStorage.getItem('userToken'); }
      else { token = await SecureStore.getItemAsync('userToken'); }
      if (!token) { return; }

      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      const [userResponse, geradoresResponse, eventosResponse] = await Promise.all([
        api.get<UserData>('/users/me', authHeaders),
        api.get<Gerador[]>('/geradores/', authHeaders),
        api.get<Evento[]>('/eventos/', authHeaders)
      ]);

      if (userResponse?.data?.nome) { setUserName(userResponse.data.nome.split(' ')[0]); }
      else { setUserName("Usuário"); }

      const allGeradores = geradoresResponse?.data || [];
      const allEventos = eventosResponse?.data || [];
      const total = allGeradores.length;
      setTotalGeradores(total);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); 
      
      const geradoresEmUsoIds = new Set<number>();
      const eventosFuturos: Evento[] = []; 

      allEventos.forEach(evento => {
         try {
            const [year, month, day] = evento.data.split('-').map(Number);
            const dataEvento = new Date(year, month - 1, day); 
            dataEvento.setHours(0,0,0,0);
            
            if (!isNaN(dataEvento.getTime()) && dataEvento >= hoje) { 
               geradoresEmUsoIds.add(evento.id_gerador);
               eventosFuturos.push(evento); 
            }
          } catch(e) { console.error(`Erro ao processar data do evento ${evento.id}: ${evento.data}`, e)}
      });

      eventosFuturos.sort((a, b) => a.data.localeCompare(b.data));
      setProximosEventos(eventosFuturos.slice(0, 5));
      const emUsoCount = geradoresEmUsoIds.size;
      const disponiveisCount = total - emUsoCount;
      setGeradoresEmUso(emUsoCount);
      setGeradoresDisponiveis(disponiveisCount);
      if (total > 0) { setTaxaDisponibilidade((disponiveisCount / total) * 100); }
      else { setTaxaDisponibilidade(100); }

      const processedChartData = processEventData(allEventos);
      setChartData(processedChartData);

    } catch (error) {
      console.error("Erro ao buscar dados da home:", error);
      if (!userName) setUserName("Usuário");
      Alert.alert('Erro', 'Não foi possível carregar os dados do dashboard.');
    }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.appName}>GeraApp</Text>
        <Text style={styles.greetingText}>
          {greeting}, {loading ? '...' : userName}!
        </Text>
      </View>

      <View style={styles.card}>
        <View>
          <Text style={styles.cardTitle}>Total de Geradores</Text>
          {loading ? <ActivityIndicator size="large" color="#333" /> : <Text style={styles.cardNumber}>{totalGeradores}</Text>}
        </View>
        <View style={styles.cardIconContainer}>
          <MaterialCommunityIcons name="flash" size={28} color="#0C1D2C" style={styles.cardIcon} />
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.statusCard, styles.cardDisponivel]}>
          <View style={[styles.statusIconWrapper, styles.iconBgDisponivel]}>
            <MaterialCommunityIcons name="check-circle-outline" size={24} color="#10B981" />
          </View>
          {loading ? <ActivityIndicator size="small" color="#10B981" /> : <Text style={[styles.statusNumber, styles.textDisponivel]}>{geradoresDisponiveis}</Text>}
          <Text style={styles.statusLabel}>Disponíveis</Text>
        </View>

        <View style={[styles.statusCard, styles.cardEmUso]}>
          <View style={[styles.statusIconWrapper, styles.iconBgEmUso]}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#F59E0B" />
          </View>
          {loading ? <ActivityIndicator size="small" color="#F59E0B" /> : <Text style={[styles.statusNumber, styles.textEmUso]}>{geradoresEmUso}</Text>}
          <Text style={styles.statusLabel}>Em Uso</Text>
        </View>
      </View>

      <View style={styles.rateCard}>
        <Text style={styles.rateCardTitle}>Taxa de Disponibilidade</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#EFB322" style={{ marginVertical: 10 }} />
        ) : (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${taxaDisponibilidade}%` }]} />
            </View>
            <Text style={styles.percentageText}>{Math.round(taxaDisponibilidade)}%</Text>
          </View>
        )}
      </View>

      <EventChart loading={loading} data={chartData} />

      <View style={styles.upcomingCard}>
        <Text style={styles.upcomingTitle}>Próximos Eventos</Text>
        <Text style={styles.upcomingSubtitle}>Eventos agendados</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#EFB322" style={{ marginVertical: 20 }} />
        ) : proximosEventos.length > 0 ? (
          proximosEventos.map((evento, index) => (
            <View key={evento.id} style={[styles.eventoRow, index === proximosEventos.length - 1 && styles.lastEventoRow]}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#EFB322" style={styles.eventoIcon} />
              <View style={styles.eventoTextContainer}>
                <Text style={styles.eventoLocal} numberOfLines={1} ellipsizeMode="tail">{evento.local}</Text>
                <Text style={styles.eventoData}>{formatData(evento.data)}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noEventsText}>Nenhum evento agendado.</Text>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  headerContainer: { marginBottom: 30 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#EFB322', marginBottom: 5 },
  greetingText: { fontSize: 18, color: '#555' },
  card: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  cardTitle: { fontSize: 16, color: '#6B7280', marginBottom: 8 },
  cardNumber: { fontSize: 36, fontWeight: 'bold', color: '#111827' },
  cardIconContainer: { backgroundColor: '#EFB322', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  cardIcon: {},
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statusCard: { borderRadius: 12, padding: 15, width: '48%', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  cardDisponivel: { backgroundColor: '#ECFDF5' },
  cardEmUso: { backgroundColor: '#FFFBEB' },
  statusIconWrapper: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  iconBgDisponivel: { backgroundColor: '#A7F3D0' },
  iconBgEmUso: { backgroundColor: '#FDE68A' },
  statusNumber: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  textDisponivel: { color: '#059669' },
  textEmUso: { color: '#D97706' },
  statusLabel: { fontSize: 14, color: '#6B7280' },
  rateCard: { backgroundColor: '#1f2937', borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  rateCardTitle: { fontSize: 16, color: '#A0AEC0', marginBottom: 15 },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBarBackground: { flex: 1, height: 10, backgroundColor: '#374151', borderRadius: 5, marginRight: 15, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#EFB322', borderRadius: 5 },
  percentageText: { fontSize: 18, fontWeight: 'bold', color: '#EFB322' },
  upcomingCard: { backgroundColor: '#1f2937',  borderRadius: 12, padding: 20, marginBottom: 40,  shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  upcomingTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  upcomingSubtitle: { fontSize: 14, color: '#A0AEC0', marginBottom: 15 },
  eventoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#374151' },
  lastEventoRow: { borderBottomWidth: 0 },
  eventoIcon: { marginRight: 12 },
  eventoTextContainer: { flex: 1 },
  eventoLocal: { fontSize: 16, fontWeight: '600', color: '#E5E7EB', marginBottom: 4 },
  eventoData: { fontSize: 14, color: '#A0AEC0' },
  noEventsText: { color: '#A0AEC0', fontSize: 14, textAlign: 'center', paddingVertical: 20 }
});