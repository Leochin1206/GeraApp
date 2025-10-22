import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

interface ChartData {
  value: number;
  label: string;
}

interface EventChartProps {
  loading: boolean;
  data: ChartData[] | null;
}

const screenWidth = Dimensions.get('window').width;

const EventChart: React.FC<EventChartProps> = ({ loading, data }) => {
  const hasData = data && data.length > 0;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Eventos - Últimos 6 Meses</Text>
      <Text style={styles.chartSubtitle}>Histórico de eventos realizados</Text>
      
      {loading || !hasData ? (
        <ActivityIndicator size="large" color="#EFB322" style={styles.chartLoader} />
      ) : (
        <View style={{ paddingLeft: 0, paddingTop: 10, paddingBottom: 30 }}> 
          <BarChart
            data={data}
            isAnimated
            barWidth={15}
            barBorderRadius={4}
            frontColor={'#EFB322'}
            gradientColor={'#fde68a'}
            noOfSections={4} 
            yAxisThickness={1}
            yAxisColor={"#374151"} 
            yAxisTextStyle={{ color: '#000000ff' }} 
            xAxisThickness={1}
            xAxisColor={"#374151"}
            xAxisLabelTextStyle={{ fontSize: 0 }}
            topLabelTextStyle={{ color: '#FFFFFF', fontSize: 12, marginBottom: 5 }}
            height={240} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: { },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', alignSelf: 'flex-start' },
  chartSubtitle: { fontSize: 14, color: '#A0AEC0', alignSelf: 'flex-start', marginBottom: 20 },
  chartLoader: { height: 270, justifyContent: 'center', alignItems: 'center' },
});

export default EventChart;