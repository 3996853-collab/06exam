import { defineStore } from 'pinia'
import { ref } from 'vue'

export type MainCategory = 'business' | 'basic'
export type BusinessSubCategory = 'operation_volume' | 'operation_quality' | 'transport_quality'
export type BasicSubCategory = 'site_info' | 'material_info' | 'service_outlet'
export type SubCategory = BusinessSubCategory | BasicSubCategory

export interface MetricConfigItem {
  id: string
  metricKey: string
  displayName: string
  unit: string
  category: MainCategory
  subCategory: SubCategory
  isVisible: boolean
  sortOrder: number
  trendType: 'positive' | 'negative'
  value?: number | string
  targetValue?: number // 目标值
  dod?: number // 日环比 %
  wow?: number // 周同比 %
  extra?: string // 备注或辅助文本
  // 自定义颜色配置
  achievedColor?: string // 达成目标时文字颜色 (默认 #16a34a 或 #0f172a)
  unachievedColor?: string // 未达成目标时文字颜色 (默认 #dc2626)
  dodRiseColor?: string // 环比上升颜色 (默认 #ef4444)
  dodFallColor?: string // 环比下降颜色 (默认 #22c55e)
}

// 温控评级标准规则接口
export interface TempRatingRule {
  id: string
  zoneName: string
  code: 'dock' | 'chilled' | 'frozen'
  standardRange: string
  minTemp: number
  maxTemp: number
  currentTemp: number
  currentRating: string
  // 字体颜色配置
  normalTextColor: string
  warningTextColor: string
  riseRateColor: string // 温度上升字体颜色
  fallRateColor: string // 温度下降字体颜色
  ratingCriteria: string // 评级标准说明
}

// 机构部门接口
export interface OrgUnit {
  id: string
  name: string
  type: 'headquarter' | 'hub' | 'station'
  region: string
  ratio: number // 占总部的权重比例
}

export const ORG_LIST: OrgUnit[] = [
  { id: 'hq', name: '总部 (全国汇总)', type: 'headquarter', region: '全国', ratio: 1.0 },
  { id: 'gz-hub', name: '广州分拨中心', type: 'hub', region: '华南大区', ratio: 0.25 },
  { id: 'jjj-hub', name: '京津冀转运中心', type: 'hub', region: '华北大区', ratio: 0.23 },
  { id: 'cd-hub', name: '成都分拨中心', type: 'hub', region: '西南大区', ratio: 0.19 },
  { id: 'sh-hub', name: '上海分拨中心', type: 'hub', region: '华东大区', ratio: 0.18 },
  { id: 'wh-hub', name: '武汉分拨中心', type: 'hub', region: '华中大区', ratio: 0.15 },
  { id: 'py-sta', name: '广州番禺集配站', type: 'station', region: '华南大区', ratio: 0.08 },
  { id: 'sy-sta', name: '北京顺义集配站', type: 'station', region: '华北大区', ratio: 0.07 },
  { id: 'sl-sta', name: '成都双流集配站', type: 'station', region: '西南大区', ratio: 0.06 }
]

// 初始温控评级标准
const DEFAULT_TEMP_RULES: TempRatingRule[] = [
  {
    id: 'tr-1',
    zoneName: '全封闭控温月台',
    code: 'dock',
    standardRange: '≤ 12℃',
    minTemp: 0,
    maxTemp: 12,
    currentTemp: 8.5,
    currentRating: '五星 A+',
    normalTextColor: '#f59e0b',
    warningTextColor: '#ef4444',
    riseRateColor: '#ef4444',
    fallRateColor: '#22c55e',
    ratingCriteria: '均温≤10℃且双门封密闭评定五星A+；10~12℃评定A级'
  },
  {
    id: 'tr-2',
    zoneName: '恒温冷藏库 (0~4℃)',
    code: 'chilled',
    standardRange: '0℃ ~ 4℃',
    minTemp: 0,
    maxTemp: 4,
    currentTemp: 2.3,
    currentRating: '卓越 A级',
    normalTextColor: '#0284c7',
    warningTextColor: '#ef4444',
    riseRateColor: '#ef4444',
    fallRateColor: '#22c55e',
    ratingCriteria: '波动幅差≤0.5℃且24h合规率≥99.5%评定卓越A级'
  },
  {
    id: 'tr-3',
    zoneName: '深冷速冻库 (-18~-25℃)',
    code: 'frozen',
    standardRange: '-18℃ ~ -25℃',
    minTemp: -25,
    maxTemp: -18,
    currentTemp: -19.6,
    currentRating: '卓越 A级',
    normalTextColor: '#6366f1',
    warningTextColor: '#ef4444',
    riseRateColor: '#ef4444',
    fallRateColor: '#22c55e',
    ratingCriteria: '核心温域恒定≤-18℃且化霜回温恢复时效≤30min评定A级'
  }
]

// 完整的指标初始清单 (带目标值与颜色配置)
const DEFAULT_CONFIGS: MetricConfigItem[] = [
  // ================= 业务数据 - 操作量 =================
  {
    id: 'bv-1',
    metricKey: 'total_operation_volume',
    displayName: '总操作量',
    unit: '万件',
    category: 'business',
    subCategory: 'operation_volume',
    isVisible: true,
    sortOrder: 1,
    trendType: 'positive',
    value: 864.2,
    targetValue: 800.0,
    dod: 6.8,
    wow: 12.4,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bv-2',
    metricKey: 'trunk_operation_volume',
    displayName: '干线操作量',
    unit: '万件',
    category: 'business',
    subCategory: 'operation_volume',
    isVisible: true,
    sortOrder: 2,
    trendType: 'positive',
    value: 582.4,
    targetValue: 550.0,
    dod: 7.2,
    wow: 14.1,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bv-3',
    metricKey: 'trunk_loading_volume',
    displayName: '干线装车',
    unit: '万件',
    category: 'business',
    subCategory: 'operation_volume',
    isVisible: true,
    sortOrder: 3,
    trendType: 'positive',
    value: 298.6,
    targetValue: 280.0,
    dod: 5.4,
    wow: 11.2,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bv-4',
    metricKey: 'trunk_unloading_volume',
    displayName: '干线卸车',
    unit: '万件',
    category: 'business',
    subCategory: 'operation_volume',
    isVisible: true,
    sortOrder: 4,
    trendType: 'positive',
    value: 283.8,
    targetValue: 270.0,
    dod: 8.9,
    wow: 16.8,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bv-5',
    metricKey: 'branch_operation_volume',
    displayName: '支线操作量',
    unit: '万件',
    category: 'business',
    subCategory: 'operation_volume',
    isVisible: true,
    sortOrder: 5,
    trendType: 'positive',
    value: 281.8,
    targetValue: 260.0,
    dod: 4.1,
    wow: 8.5,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bv-6',
    metricKey: 'branch_loading_volume',
    displayName: '支线装车',
    unit: '万件',
    category: 'business',
    subCategory: 'operation_volume',
    isVisible: true,
    sortOrder: 6,
    trendType: 'positive',
    value: 145.2,
    targetValue: 135.0,
    dod: 3.8,
    wow: 7.9,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bv-7',
    metricKey: 'branch_unloading_volume',
    displayName: '支线卸车',
    unit: '万件',
    category: 'business',
    subCategory: 'operation_volume',
    isVisible: true,
    sortOrder: 7,
    trendType: 'positive',
    value: 136.6,
    targetValue: 125.0,
    dod: 4.5,
    wow: 9.1,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },

  // ================= 业务数据 - 操作质量 =================
  {
    id: 'bq-1',
    metricKey: 'trunk_loading_efficiency',
    displayName: '干线装车效率',
    unit: '件/h',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 10,
    trendType: 'positive',
    value: 1250,
    targetValue: 1200,
    dod: 4.2,
    wow: 8.0,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-2',
    metricKey: 'trunk_unloading_efficiency',
    displayName: '干线卸车效率',
    unit: '件/h',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 11,
    trendType: 'positive',
    value: 1380,
    targetValue: 1300,
    dod: 5.6,
    wow: 9.3,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-3',
    metricKey: 'trunk_loading_timeliness_rate',
    displayName: '干线装车及时率',
    unit: '%',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 12,
    trendType: 'positive',
    value: 98.8,
    targetValue: 98.0,
    dod: 0.6,
    wow: 1.2,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-4',
    metricKey: 'trunk_unloading_timeliness_rate',
    displayName: '干线卸车及时率',
    unit: '%',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 13,
    trendType: 'positive',
    value: 99.2,
    targetValue: 98.5,
    dod: 0.3,
    wow: 0.8,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-5',
    metricKey: 'trunk_inbound_rate',
    displayName: '干线入库率',
    unit: '%',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 14,
    trendType: 'positive',
    value: 99.6,
    targetValue: 99.0,
    dod: 0.2,
    wow: 0.5,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-6',
    metricKey: 'branch_loading_efficiency',
    displayName: '支线装车效率',
    unit: '件/h',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 15,
    trendType: 'positive',
    value: 920,
    targetValue: 900,
    dod: 3.1,
    wow: 6.4,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-7',
    metricKey: 'branch_unloading_efficiency',
    displayName: '支线卸车效率',
    unit: '件/h',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 16,
    trendType: 'positive',
    value: 980,
    targetValue: 950,
    dod: 2.8,
    wow: 5.9,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-8',
    metricKey: 'branch_loading_timeliness_rate',
    displayName: '支线装车及时率',
    unit: '%',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 17,
    trendType: 'positive',
    value: 98.4,
    targetValue: 98.0,
    dod: 0.4,
    wow: 1.1,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-9',
    metricKey: 'branch_unloading_timeliness_rate',
    displayName: '支线卸车及时率',
    unit: '%',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 18,
    trendType: 'positive',
    value: 98.9,
    targetValue: 98.5,
    dod: 0.5,
    wow: 1.0,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-10',
    metricKey: 'branch_inbound_rate',
    displayName: '支线入库率',
    unit: '%',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 19,
    trendType: 'positive',
    value: 99.4,
    targetValue: 99.0,
    dod: 0.1,
    wow: 0.7,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-11',
    metricKey: 'temp_pallet_count',
    displayName: '临时托盘数',
    unit: '个',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 20,
    trendType: 'negative',
    value: 128,
    targetValue: 150, // 逆向指标，低于 150 为达标
    dod: -8.5,
    wow: -16.2,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-12',
    metricKey: 'temp_pallet_item_count',
    displayName: '临时托盘集托件数',
    unit: '件',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 21,
    trendType: 'positive',
    value: 5860,
    targetValue: 5000,
    dod: 4.8,
    wow: 12.0,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bq-13',
    metricKey: 'temp_pallet_weight_t',
    displayName: '临时托盘集托重量T',
    unit: 'T',
    category: 'business',
    subCategory: 'operation_quality',
    isVisible: true,
    sortOrder: 22,
    trendType: 'positive',
    value: 46.8,
    targetValue: 40.0,
    dod: 3.2,
    wow: 9.5,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },

  // ================= 业务数据 - 运输质量 =================
  {
    id: 'bt-1',
    metricKey: 'outbound_timeliness_rate',
    displayName: '出站及时率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 30,
    trendType: 'positive',
    value: 97.9, // 特别标注为 T-2 日数据
    targetValue: 98.0,
    dod: 0.5,
    wow: 1.1,
    extra: 'T-2 归档数据',
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-2',
    metricKey: 'departure_timeliness_rate',
    displayName: '发车及时率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 31,
    trendType: 'positive',
    value: 98.2,
    targetValue: 98.0,
    dod: 0.5,
    wow: 1.1,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-3',
    metricKey: 'operation_compliance_rate',
    displayName: '运行合格率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 32,
    trendType: 'positive',
    value: 99.1,
    targetValue: 99.0,
    dod: 0.4,
    wow: 0.9,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-4',
    metricKey: 'arrival_timeliness_rate',
    displayName: '到车及时率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 33,
    trendType: 'positive',
    value: 97.8,
    targetValue: 97.5,
    dod: 1.2,
    wow: 2.3,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-5',
    metricKey: 'load_rate',
    displayName: '装载率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 34,
    trendType: 'positive',
    value: 91.5,
    targetValue: 90.0,
    dod: 2.1,
    wow: 4.8,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-6',
    metricKey: 'fixed_task_load_rate',
    displayName: '固定任务装载率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 35,
    trendType: 'positive',
    value: 94.2,
    targetValue: 93.0,
    dod: 1.6,
    wow: 3.5,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-7',
    metricKey: 'temp_task_load_rate',
    displayName: '临时任务装载率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 36,
    trendType: 'positive',
    value: 86.8,
    targetValue: 85.0,
    dod: 3.4,
    wow: 7.2,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-8',
    metricKey: 'frozen_in_transit_qualified_rate',
    displayName: '冷冻在途合格率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 37,
    trendType: 'positive',
    value: 99.8,
    targetValue: 99.5,
    dod: 0.1,
    wow: 0.3,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-9',
    metricKey: 'self_vehicle_frozen_rate',
    displayName: '自有车冷冻在途合格率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 38,
    trendType: 'positive',
    value: 100.0,
    targetValue: 99.8,
    dod: 0.0,
    wow: 0.2,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-10',
    metricKey: 'third_party_frozen_rate',
    displayName: '三方车冷冻在途合格率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 39,
    trendType: 'positive',
    value: 99.5,
    targetValue: 99.0,
    dod: 0.3,
    wow: 0.5,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-11',
    metricKey: 'chilled_in_transit_qualified_rate',
    displayName: '冷藏在途合格率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 40,
    trendType: 'positive',
    value: 99.6,
    targetValue: 99.0,
    dod: 0.2,
    wow: 0.4,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-12',
    metricKey: 'self_vehicle_chilled_rate',
    displayName: '自有车冷藏在途合格率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 41,
    trendType: 'positive',
    value: 99.9,
    targetValue: 99.5,
    dod: 0.1,
    wow: 0.2,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },
  {
    id: 'bt-13',
    metricKey: 'third_party_chilled_rate',
    displayName: '三方车冷藏在途合格率',
    unit: '%',
    category: 'business',
    subCategory: 'transport_quality',
    isVisible: true,
    sortOrder: 42,
    trendType: 'positive',
    value: 99.2,
    targetValue: 98.8,
    dod: 0.4,
    wow: 0.6,
    achievedColor: '#16a34a',
    unachievedColor: '#dc2626',
    dodRiseColor: '#ef4444',
    dodFallColor: '#22c55e'
  },

  // ================= 基础数据 - 场地信息 =================
  {
    id: 'bs-1',
    metricKey: 'site_center_address',
    displayName: '中心地址',
    unit: '',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 50,
    trendType: 'positive',
    value: '上海市青浦区华新镇华隆路1688号中通冷链总部枢纽',
    extra: '甲级现代智慧枢纽园区'
  },
  {
    id: 'bs-2',
    metricKey: 'dock_count',
    displayName: '月台数量',
    unit: '个',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 51,
    trendType: 'positive',
    value: 36,
    targetValue: 30,
    dod: 0,
    wow: 12.5,
    extra: '含双侧伸缩充气门封'
  },
  {
    id: 'bs-3',
    metricKey: 'dock_area',
    displayName: '月台面积',
    unit: '㎡',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 52,
    trendType: 'positive',
    value: 2450,
    targetValue: 2000,
    dod: 0,
    wow: 0
  },
  {
    id: 'bs-4',
    metricKey: 'dock_avg_temperature',
    displayName: '月台平均温度',
    unit: '℃',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 53,
    trendType: 'negative',
    value: 8.5,
    targetValue: 12.0,
    dod: -0.8,
    wow: -1.2,
    extra: '全封闭控温装卸区'
  },
  {
    id: 'bs-5',
    metricKey: 'dock_rating',
    displayName: '月台评级',
    unit: '级',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 54,
    trendType: 'positive',
    value: '五星 A+',
    extra: '国家星级冷链标准认证'
  },
  {
    id: 'bs-6',
    metricKey: 'chilled_storage_area',
    displayName: '冷藏库面积',
    unit: '㎡',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 55,
    trendType: 'positive',
    value: 6800,
    targetValue: 6000,
    extra: '多温区精细化温控 (0~4℃)'
  },
  {
    id: 'bs-7',
    metricKey: 'chilled_avg_temperature',
    displayName: '冷藏库平均温度',
    unit: '℃',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 56,
    trendType: 'negative',
    value: 2.3,
    targetValue: 4.0,
    dod: -0.2,
    wow: -0.4,
    extra: '波动幅度 < 0.5℃'
  },
  {
    id: 'bs-8',
    metricKey: 'chilled_rating',
    displayName: '冷藏库评级',
    unit: '级',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 57,
    trendType: 'positive',
    value: '卓越 A级',
    extra: '医药/生鲜双认证标准'
  },
  {
    id: 'bs-9',
    metricKey: 'frozen_storage_area',
    displayName: '冷冻库面积',
    unit: '㎡',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 58,
    trendType: 'positive',
    value: 5200,
    targetValue: 5000,
    extra: '深冷低温区 (-18~-25℃)'
  },
  {
    id: 'bs-10',
    metricKey: 'frozen_avg_temperature',
    displayName: '冷冻库平均温度',
    unit: '℃',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 59,
    trendType: 'negative',
    value: -19.6,
    targetValue: -18.0,
    dod: -0.5,
    wow: -0.8,
    extra: '24小时恒温监测'
  },
  {
    id: 'bs-11',
    metricKey: 'frozen_rating',
    displayName: '冷冻库评级',
    unit: '级',
    category: 'basic',
    subCategory: 'site_info',
    isVisible: true,
    sortOrder: 60,
    trendType: 'positive',
    value: '卓越 A级',
    extra: '国际冷库标准卓越级'
  },

  // ================= 基础数据 - 物资信息 =================
  {
    id: 'bm-1',
    metricKey: 'turnover_basket_stock',
    displayName: '标准折叠周转筐',
    unit: '个',
    category: 'basic',
    subCategory: 'material_info',
    isVisible: true,
    sortOrder: 70,
    trendType: 'positive',
    value: 28600,
    targetValue: 25000,
    dod: 3.5,
    wow: 8.2,
    extra: '在库 24,200 | 在途借调 4,400'
  },
  {
    id: 'bm-2',
    metricKey: 'temp_recorder_stock',
    displayName: '智能温湿度记录仪',
    unit: '台',
    category: 'basic',
    subCategory: 'material_info',
    isVisible: true,
    sortOrder: 71,
    trendType: 'positive',
    value: 1580,
    targetValue: 1500,
    dod: 1.2,
    wow: 5.0,
    extra: '4G实时上传 / 完好率 99.6%'
  },
  {
    id: 'bm-3',
    metricKey: 'insulation_box_stock',
    displayName: '高密度蓄冷保温箱',
    unit: '个',
    category: 'basic',
    subCategory: 'material_info',
    isVisible: true,
    sortOrder: 72,
    trendType: 'positive',
    value: 6400,
    targetValue: 6000,
    dod: 2.1,
    wow: 6.7,
    extra: 'VIP真空绝热板材质'
  },
  {
    id: 'bm-4',
    metricKey: 'gps_terminal_stock',
    displayName: '车载冷机GPS监控终端',
    unit: '套',
    category: 'basic',
    subCategory: 'material_info',
    isVisible: true,
    sortOrder: 73,
    trendType: 'positive',
    value: 460,
    targetValue: 450,
    dod: 0.5,
    wow: 2.0,
    extra: '北斗双模定位 / 在线率 99.2%'
  },
  {
    id: 'bm-5',
    metricKey: 'cold_plate_stock',
    displayName: '相变蓄冷排/冰排',
    unit: '块',
    category: 'basic',
    subCategory: 'material_info',
    isVisible: true,
    sortOrder: 74,
    trendType: 'positive',
    value: 42000,
    targetValue: 40000,
    dod: 4.0,
    wow: 11.5,
    extra: '-21℃及0℃多梯度温域配置'
  },

  // ================= 基础数据 - 服务网点 =================
  {
    id: 'bo-1',
    metricKey: 'total_outlets_count',
    displayName: '网点总数量',
    unit: '家',
    category: 'basic',
    subCategory: 'service_outlet',
    isVisible: true,
    sortOrder: 80,
    trendType: 'positive',
    value: 1680,
    targetValue: 1600,
    dod: 1.8,
    wow: 5.6,
    extra: '覆盖华东与全国重点核心城市群'
  },
  {
    id: 'bo-2',
    metricKey: 'delivery_outlets_count',
    displayName: '交货网点数',
    unit: '家',
    category: 'basic',
    subCategory: 'service_outlet',
    isVisible: true,
    sortOrder: 81,
    trendType: 'positive',
    value: 1120,
    targetValue: 1050,
    dod: 2.4,
    wow: 6.8,
    extra: '占比 66.7% / 具备冷链末端派送能力'
  },
  {
    id: 'bo-3',
    metricKey: 'pickup_outlets_count',
    displayName: '提货网点数',
    unit: '家',
    category: 'basic',
    subCategory: 'service_outlet',
    isVisible: true,
    sortOrder: 82,
    trendType: 'positive',
    value: 560,
    targetValue: 500,
    dod: 0.9,
    wow: 3.2,
    extra: '占比 33.3% / 覆盖冷链产地仓与前置仓'
  }
]

export const useMetricConfigStore = defineStore('metricConfig', () => {
  // 当前选中的机构部门 (默认总部，支持切换到广州、京津冀、成都等中心/集配)
  const currentOrgId = ref<string>('hq')

  // 指标配置列表
  const configs = ref<MetricConfigItem[]>(
    (() => {
      try {
        const saved = localStorage.getItem('zto_metric_configs_v3')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 20) {
            return parsed
          }
        }
        return DEFAULT_CONFIGS
      } catch {
        return DEFAULT_CONFIGS
      }
    })()
  )

  // 温控评级标准规则
  const tempRatingRules = ref<TempRatingRule[]>(
    (() => {
      try {
        const saved = localStorage.getItem('zto_temp_rating_rules')
        if (saved) {
          return JSON.parse(saved)
        }
        return DEFAULT_TEMP_RULES
      } catch {
        return DEFAULT_TEMP_RULES
      }
    })()
  )

  const saveToLocal = () => {
    try {
      localStorage.setItem('zto_metric_configs_v3', JSON.stringify(configs.value))
      localStorage.setItem('zto_temp_rating_rules', JSON.stringify(tempRatingRules.value))
    } catch (e) {
      console.error('Failed to save to localStorage', e)
    }
  }

  const updateConfig = (id: string, partial: Partial<MetricConfigItem>) => {
    const target = configs.value.find(c => c.id === id)
    if (target) {
      Object.assign(target, partial)
      saveToLocal()
    }
  }

  const updateTempRatingRule = (id: string, partial: Partial<TempRatingRule>) => {
    const target = tempRatingRules.value.find(r => r.id === id)
    if (target) {
      Object.assign(target, partial)
      saveToLocal()
    }
  }

  const updateSortOrder = (newOrderItems: { id: string; sortOrder: number }[]) => {
    newOrderItems.forEach(item => {
      const target = configs.value.find(c => c.id === item.id)
      if (target) {
        target.sortOrder = item.sortOrder
      }
    })
    configs.value.sort((a, b) => a.sortOrder - b.sortOrder)
    saveToLocal()
  }

  const resetToDefault = () => {
    configs.value = JSON.parse(JSON.stringify(DEFAULT_CONFIGS))
    tempRatingRules.value = JSON.parse(JSON.stringify(DEFAULT_TEMP_RULES))
    saveToLocal()
  }

  // 获取某项指标在各大中心与集配的下钻明细
  const getMetricBreakdown = (metricKey: string) => {
    const baseItem = configs.value.find(c => c.metricKey === metricKey)
    const baseVal = typeof baseItem?.value === 'number' ? baseItem.value : 100
    const centers = ORG_LIST.filter(o => o.type !== 'headquarter')

    return centers.map(center => {
      // 根据中心权重和微小正态离散计算分中心数值
      const centerVal = Number((baseVal * center.ratio).toFixed(1))
      const dodChange = Number(((center.ratio * 10 - 1.5) * 1.8).toFixed(1))
      const targetVal = baseItem?.targetValue ? Number((baseItem.targetValue * center.ratio).toFixed(1)) : null
      const isAchieved = targetVal ? centerVal >= targetVal : true

      return {
        orgId: center.id,
        orgName: center.name,
        type: center.type === 'hub' ? '分拨中心' : '集配站',
        region: center.region,
        value: centerVal,
        unit: baseItem?.unit || '',
        dod: dodChange,
        targetValue: targetVal,
        isAchieved
      }
    })
  }

  return {
    configs,
    tempRatingRules,
    currentOrgId,
    orgList: ORG_LIST,
    updateConfig,
    updateTempRatingRule,
    updateSortOrder,
    resetToDefault,
    getMetricBreakdown
  }
})
