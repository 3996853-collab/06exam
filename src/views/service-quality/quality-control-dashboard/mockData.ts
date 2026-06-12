import dayjs from 'dayjs';
import { DailyMetricRecord, PROVINCE_STATIONS_MAP, MetricValue, AnomalyTicket, METRIC_CONFIGS } from './types';

// Helper to generate a random number within a range
const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Global array to hold abnormal order details
export let mockAnomalyTickets: AnomalyTicket[] = [];

// Generate a MetricValue and create detailed anomaly records for failed tickets
const generateMetricValueAndTickets = (
  metricKey: string,
  baseRate: number,
  denominatorMin: number,
  denominatorMax: number,
  isPositive: boolean,
  dateStr: string,
  province: string,
  station: string
): MetricValue => {
  const denominator = Math.floor(randomRange(50, 150));
  
  // Base rates fluctuate slightly by day
  let rate = baseRate + randomRange(-0.06, 0.06);
  rate = Math.max(0.01, Math.min(0.99, rate));
  
  const numerator = Math.round(denominator * rate);
  const actualRate = denominator > 0 ? numerator / denominator : 0;

  // Calculate failed/anomaly ticket count
  const anomalyCount = isPositive ? (denominator - numerator) : numerator;

  // Generate detailed anomaly tickets for this specific record
  const config = METRIC_CONFIGS.find(c => c.key === metricKey);
  const expectTimeSuffix = " 10:00:00";
  
  for (let t = 0; t < anomalyCount; t++) {
    // Limit to reasonable generation size (max 5 per metric per day per station to prevent memory bloat)
    if (t >= 5) break;

    const ticketId = `ZT${dayjs(dateStr).format('YYYYMMDD')}${Math.floor(randomRange(1000, 9999))}`;
    
    // Calculate random actual time that exceeds expected time
    const delayHours = randomRange(1.5, 8.5);
    const expectedTime = dayjs(`${dateStr}${expectTimeSuffix}`);
    const actualTime = expectedTime.add(delayHours, 'hour').format('YYYY-MM-DD HH:mm:ss');
    
    mockAnomalyTickets.push({
      orderId: ticketId,
      province,
      station,
      expectedTime: expectedTime.format('YYYY-MM-DD HH:mm:ss'),
      actualTime: metricKey === 'orderAccept' && Math.random() > 0.85 ? '超时未接单' : actualTime,
      metricKey,
      date: dateStr
    });
  }

  return {
    numerator,
    denominator,
    rate: actualRate
  };
};

export const generateMockData = (): DailyMetricRecord[] => {
  mockAnomalyTickets = []; // Reset anomaly pool
  const records: DailyMetricRecord[] = [];
  const today = dayjs();
  
  // Generate 30 days of daily data
  for (let i = 29; i >= 0; i--) {
    const dateStr = today.subtract(i, 'day').format('YYYY-MM-DD');
    
    // For each province
    Object.entries(PROVINCE_STATIONS_MAP).forEach(([province, stations]) => {
      // For each station in the province
      stations.forEach(station => {
        // Base rate configurations based on province performance
        let provinceFactor = 0;
        if (province === '上海' || province === '北京' || province === '广东') provinceFactor = 0.03;
        if (province === '河北' || province === '福建') provinceFactor = -0.04;

        // Base rate configurations based on station performance
        let stationFactor = 0;
        if (station.includes('江宁') || station.includes('西湖') || station.includes('张江')) stationFactor = 0.02;
        if (station.includes('梁溪') || station.includes('鹿城') || station.includes('友谊')) stationFactor = -0.03;

        const baseOrderAccept = 0.94 + provinceFactor + stationFactor;
        const basePickup = 0.92 + provinceFactor + stationFactor;
        const baseDelivery = 0.90 + provinceFactor + stationFactor;
        const baseDispatch = 0.93 + provinceFactor + stationFactor;
        const basePodReturn = 0.95 + provinceFactor + stationFactor;

        const baseFirstResponse = 0.91 + provinceFactor + stationFactor;
        const baseCompletion = 0.94 + provinceFactor + stationFactor;
        const baseRepeatComplaint = 0.04 - provinceFactor - stationFactor; // Lower is better
        const baseArbitration = 0.015 - provinceFactor - stationFactor;    // Lower is better

        records.push({
          date: dateStr,
          province,
          station,
          
          // 履约域
          orderAccept: generateMetricValueAndTickets('orderAccept', baseOrderAccept, 50, 150, true, dateStr, province, station),
          pickup: generateMetricValueAndTickets('pickup', basePickup, 50, 150, true, dateStr, province, station),
          delivery: generateMetricValueAndTickets('delivery', baseDelivery, 50, 150, true, dateStr, province, station),
          dispatch: generateMetricValueAndTickets('dispatch', baseDispatch, 50, 150, true, dateStr, province, station),
          podReturn: generateMetricValueAndTickets('podReturn', 40, 120, true, dateStr, province, station),

          // 客诉域
          firstResponse: generateMetricValueAndTickets('firstResponse', baseFirstResponse, 5, 30, true, dateStr, province, station),
          completion: generateMetricValueAndTickets('completion', baseCompletion, 5, 30, true, dateStr, province, station),
          repeatComplaint: generateMetricValueAndTickets('repeatComplaint', baseRepeatComplaint, 2, 20, false, dateStr, province, station),
          arbitration: generateMetricValueAndTickets('arbitration', baseArbitration, 1, 15, false, dateStr, province, station)
        });
      });
    });
  }

  return records;
};

export const mockMetricRecords = generateMockData();
export const allAnomalyTickets = mockAnomalyTickets;
