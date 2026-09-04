// Metric Value structure including numerator, denominator, and rate
export interface MetricValue {
  numerator: number;   // 分子
  denominator: number; // 分母
  rate: number;        // 比率 (0 - 1)
}

// Data record for a specific date, province, and station (no regions or carriers)
export interface DailyMetricRecord {
  date: string;       // 日期 YYYY-MM-DD
  province: string;   // 省区 (江苏、浙江、上海、北京、河北、山东、广东、福建)
  station: string;    // 网点
  productType?: string; // 产品类型 (零担小件、冷链快递)
  
  // 履约域 (正向指标)
  orderAccept: MetricValue;   // 订单接单及时率
  pickup: MetricValue;        // 提货及时率
  delivery: MetricValue;      // 签收及时率
  dispatch: MetricValue;      // 交货及时率
  podReturn: MetricValue;     // 回单返回及时率

  // 客诉域
  firstResponse: MetricValue; // 工单时效内首响率 (正向)
  completion: MetricValue;    // 工单时效内完结率 (正向)
  repeatComplaint: MetricValue; // 工单重复投诉率 (负向)
  arbitration: MetricValue;     // 仲裁率 (负向)
}

// Detail list record for an abnormal/untimely ticket
export interface AnomalyTicket {
  orderId: string;      // 订单号 / 工单号
  province: string;     // 省区
  station: string;      // 责任网点
  expectedTime: string; // 应处理时间
  actualTime: string;   // 实际处理时间
  metricKey: string;    // 关联指标 key
  date: string;         // 日期 YYYY-MM-DD
  productType?: string; // 产品类型
}

// Metric type metadata definition
export interface MetricMeta {
  key: keyof Omit<DailyMetricRecord, 'date' | 'province' | 'station'>;
  name: string;
  domain: 'delivery' | 'complaint'; // 履约域 | 客诉域
  isPositive: boolean; // 是否是正向指标
  threshold: number;   // 达标阈值 (0 - 1)
  expectTitle: string; // Detail page expectation header
  actualTitle: string; // Detail page actual header
  fractionLabel: string; // The label replacing "异常数/总数:"
}

// Global metric configurations
export const METRIC_CONFIGS: MetricMeta[] = [
  // 履约域 (Moved "交货及时率" before "提货及时率")
  { 
    key: 'orderAccept', 
    name: '订单接单及时率', 
    domain: 'delivery', 
    isPositive: true, 
    threshold: 0.95, 
    expectTitle: '应接单时间', 
    actualTitle: '实际接单时间',
    fractionLabel: '及时接单数/订单总数'
  },
  { 
    key: 'dispatch', 
    name: '交货及时率', 
    domain: 'delivery', 
    isPositive: true, 
    threshold: 0.93, 
    expectTitle: '应交货时间', 
    actualTitle: '实际交货时间',
    fractionLabel: '交货及时票数/应交货票数'
  },
  { 
    key: 'pickup', 
    name: '提货及时率', 
    domain: 'delivery', 
    isPositive: true, 
    threshold: 0.92, 
    expectTitle: '应提货时间', 
    actualTitle: '实际提货时间',
    fractionLabel: '提货及时票数/应提货票数'
  },
  { 
    key: 'delivery', 
    name: '签收及时率', 
    domain: 'delivery', 
    isPositive: true, 
    threshold: 0.90, 
    expectTitle: '应签收时间', 
    actualTitle: '实际签收时间',
    fractionLabel: '签收及时票数/应签票数'
  },
  { 
    key: 'podReturn', 
    name: '回单返回及时率', 
    domain: 'delivery', 
    isPositive: true, 
    threshold: 0.95, 
    expectTitle: '应返回时间', 
    actualTitle: '实际返回时间',
    fractionLabel: '回单返回及时票数/应返回回单数'
  },

  // 客诉域
  { 
    key: 'firstResponse', 
    name: '工单时效内首响率', 
    domain: 'complaint', 
    isPositive: true, 
    threshold: 0.90, 
    expectTitle: '应首响时间', 
    actualTitle: '实际首响时间',
    fractionLabel: '时效内首响工单量/总工单量'
  },
  { 
    key: 'completion', 
    name: '工单时效内完结率', 
    domain: 'complaint', 
    isPositive: true, 
    threshold: 0.95, 
    expectTitle: '应完结时间', 
    actualTitle: '实际完结时间',
    fractionLabel: '时效内完结工单/总工单量'
  },
  { 
    key: 'repeatComplaint', 
    name: '工单重复投诉率', 
    domain: 'complaint', 
    isPositive: false, 
    threshold: 0.05, 
    expectTitle: '首次投诉时间', 
    actualTitle: '重复投诉时间',
    fractionLabel: '重复投诉工单量/总工单量'
  },
  { 
    key: 'arbitration', 
    name: '仲裁率', 
    domain: 'complaint', 
    isPositive: false, 
    threshold: 0.02, 
    expectTitle: '投诉时间', 
    actualTitle: '仲裁判定时间',
    fractionLabel: '仲裁成立单量/（派件签收单量+寄件单量+中转出港单量）'
  }
];

// Province-Station mapping
export const PROVINCE_STATIONS_MAP: Record<string, string[]> = {
  '江苏': ['南京江宁网点', '苏州园区网点', '无锡梁溪网点'],
  '浙江': ['杭州西湖网点', '宁波鄞州网点', '温州鹿城网点'],
  '上海': ['浦东张江网点', '闵行虹桥网点', '宝山友谊网点'],
  '北京': ['朝阳大屯网点', '海淀中关村网点', '丰台总部基地网点'],
  '河北': ['石家庄长安网点', '保定竞秀网点', '廊坊广阳网点'],
  '山东': ['济南历城网点', '青岛市南网点', '烟台芝罘网点'],
  '广东': ['广州天河网点', '深圳福田网点', '东莞南城网点'],
  '福建': ['福州鼓楼网点', '厦门思明网点', '泉州丰泽网点']
};

export const PROVINCES = Object.keys(PROVINCE_STATIONS_MAP);
export const ALL_STATIONS = Object.values(PROVINCE_STATIONS_MAP).flat();
export const HEADQUARTERS = '总部';
