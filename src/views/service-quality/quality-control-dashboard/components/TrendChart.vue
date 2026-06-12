<template>
  <div class="trend-chart-container">
    <div class="chart-header">
      <div class="header-left">
        <h3 class="chart-title">
          {{ metricMeta.name }} - {{ activeViewTab === 'trend' ? '趋势分析' : '异常排行' }}
        </h3>
        
        <!-- 图表类型切换按钮 -->
        <el-radio-group v-model="localViewTab" size="default" class="view-tab-toggle" @change="handleViewTabChange">
          <el-radio-button value="trend">时序趋势</el-radio-button>
          <el-radio-button value="ranking">异常排行 (倒序 Top 10)</el-radio-button>
        </el-radio-group>
      </div>

      <div class="header-right">
        <!-- 如果是趋势视角且不是对比模式 -->
        <div class="chart-legend-custom" v-if="localViewTab === 'trend'">
          <span class="legend-item"><span class="legend-color line"></span>比率趋势</span>
          <span class="legend-item"><span class="legend-color bar"></span>分母单量</span>
          <span class="legend-item"><span class="legend-color target font-danger"></span>目标阈值 ({{ (metricMeta.threshold * 100).toFixed(0) }}%)</span>
        </div>

        <!-- 如果是排行视角 -->
        <div class="ranking-filters" v-if="localViewTab === 'ranking'">
          <span class="filter-label">排行维度</span>
          <el-radio-group v-model="localRankingDim" size="small" @change="handleRankingDimChange">
            <el-radio-button value="province">按省区</el-radio-button>
            <el-radio-button value="station">按网点</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
    
    <div ref="chartRef" class="echart-div"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { MetricMeta } from '../types';

const props = defineProps<{
  activeViewTab: 'trend' | 'ranking';
  rankingDim: 'province' | 'station';
  metricMeta: MetricMeta;
  // Trend Mode Inputs
  dates: string[];
  rates: number[];
  volumes: number[];
  // Ranking Mode Inputs (Worst Top 10)
  rankingData: { name: string; rate: number }[];
}>();

const emit = defineEmits<{
  (e: 'update:activeViewTab', val: 'trend' | 'ranking'): void;
  (e: 'update:rankingDim', val: 'province' | 'station'): void;
  (e: 'chart-click', data: { date: string; seriesName: string; value: any }): void;
}>();

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

const localViewTab = ref(props.activeViewTab);
const localRankingDim = ref(props.rankingDim);

watch(() => props.activeViewTab, (newVal) => { localViewTab.value = newVal; });
watch(() => props.rankingDim, (newVal) => { localRankingDim.value = newVal; });

const handleViewTabChange = (val: any) => {
  emit('update:activeViewTab', val);
};

const handleRankingDimChange = (val: any) => {
  emit('update:rankingDim', val);
};

// Build options dynamically
const getChartOptions = (): echarts.EChartsOption => {
  const isPositive = props.metricMeta.isPositive;
  const threshold = props.metricMeta.threshold;

  if (localViewTab.value === 'trend') {
    // 1. Time Series Trend: Dual Axis Line & Bar
    return {
      tooltip: {
        trigger: 'axis',
        confine: true, // Prevent tooltips from going off-screen on mobile
        formatter: (params: any) => {
          let res = `<div style="font-weight: bold; margin-bottom: 4px;">${params[0].name}</div>`;
          params.forEach((item: any) => {
            if (item.seriesType === 'line') {
              res += `<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <span>${item.marker} ${item.seriesName}:</span>
                <span style="font-weight: bold;">${(item.value * 100).toFixed(2)}%</span>
              </div>`;
            } else {
              res += `<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <span>${item.marker} ${item.seriesName}:</span>
                <span style="font-weight: bold;">${item.value.toLocaleString()} 单</span>
              </div>`;
            }
          });
          return res;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderWidth: 1,
        borderColor: 'rgb(235, 238, 245)',
        textStyle: { color: 'rgba(0, 0, 0, 0.8)' }
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '8%',
        top: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: props.dates,
        axisLine: { lineStyle: { color: 'rgb(228, 231, 237)' } },
        axisLabel: { color: 'rgb(96, 98, 102)', fontSize: 10 }
      },
      yAxis: [
        {
          type: 'value',
          name: '比率',
          min: (value) => {
            const calculatedMin = Math.max(0, value.min - 0.05);
            return Math.min(calculatedMin, threshold - 0.05);
          },
          max: 1.0,
          axisLabel: {
            formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
            color: 'rgb(96, 98, 102)'
          },
          splitLine: { lineStyle: { color: 'rgb(240, 242, 245)' } }
        },
        {
          type: 'value',
          name: '单量',
          axisLabel: { color: 'rgb(96, 98, 102)' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '分母单量',
          type: 'bar',
          yAxisIndex: 1,
          data: props.volumes,
          barWidth: '40%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 190, 190, 0.35)' },
              { offset: 1, color: 'rgba(0, 190, 190, 0.05)' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '比率趋势',
          type: 'line',
          yAxisIndex: 0,
          data: props.rates,
          symbolSize: 6,
          showSymbol: true,
          itemStyle: { color: 'rgb(0, 190, 190)' },
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(0, 190, 190, 0.3)',
            shadowBlur: 8,
            shadowOffsetY: 4
          },
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            data: [
              {
                yAxis: threshold,
                lineStyle: {
                  color: 'rgba(240, 0, 0, 0.6)',
                  type: 'dashed',
                  width: 1.5
                },
                label: {
                  position: 'end',
                  formatter: `${(threshold * 100).toFixed(0)}%`,
                  color: 'rgb(240, 0, 0)',
                  fontSize: 10
                }
              }
            ]
          }
        }
      ]
    };
  } else {
    // 2. Ranking Mode: Horizontal Bar Chart showing Bottom 10 (Worst performers)
    const dataCopy = [...props.rankingData].reverse();
    const names = dataCopy.map(d => d.name);
    const rates = dataCopy.map(d => d.rate);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        confine: true, // Restrict tooltip inside screen bounds
        formatter: (params: any) => {
          const item = params[0];
          return `<div style="font-weight: bold; margin-bottom: 4px;">${item.name}</div>
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                    <span>${props.metricMeta.name}:</span>
                    <span style="font-weight: bold; color: rgb(240, 0, 0);">${(item.value * 100).toFixed(2)}%</span>
                  </div>`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderWidth: 1,
        borderColor: 'rgb(235, 238, 245)',
        textStyle: { color: 'rgba(0, 0, 0, 0.8)' }
      },
      grid: {
        left: '2%',
        right: '10%',
        bottom: '5%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 1.0,
        axisLabel: {
          formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
          color: 'rgb(96, 98, 102)'
        },
        splitLine: { lineStyle: { color: 'rgb(240, 242, 245)' } }
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: { color: 'rgba(0, 0, 0, 0.8)', fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgb(228, 231, 237)' } }
      },
      series: [
        {
          name: props.metricMeta.name,
          type: 'bar',
          data: rates,
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: 'rgba(240, 0, 0, 0.85)' },
              { offset: 1, color: 'rgba(240, 0, 0, 0.15)' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => `${(params.value * 100).toFixed(1)}%`,
            color: 'rgb(240, 0, 0)',
            fontWeight: 'bold',
            fontSize: 10
          },
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            data: [
              {
                xAxis: threshold,
                lineStyle: {
                  color: 'rgba(0, 0, 0, 0.3)',
                  type: 'dashed',
                  width: 1.2
                },
                label: {
                  position: 'end',
                  formatter: `${(threshold * 100).toFixed(0)}%`,
                  color: 'rgba(0,0,0,0.5)',
                  fontSize: 10
                }
              }
            ]
          }
        }
      ]
    };
  }
};

const initChart = () => {
  if (!chartRef.value) return;
  
  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption(getChartOptions());
  
  chartInstance.on('click', (params: any) => {
    emit('chart-click', {
      date: params.name,
      seriesName: params.seriesName,
      value: params.value
    });
  });

  window.addEventListener('resize', handleResize);
};

const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption(getChartOptions(), true);
  }
};

const handleResize = () => {
  chartInstance?.resize();
};

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
  chartInstance = null;
});

// Watch inputs and tab changes to reload chart
watch(
  [() => localViewTab.value, () => localRankingDim.value, () => props.metricMeta, () => props.dates, () => props.rates, () => props.volumes, () => props.rankingData],
  () => {
    updateChart();
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.trend-chart-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 4px 12px 0px;
  border: 1px solid rgb(235, 238, 245);
  padding: 20px;
  margin-top: 20px;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgb(240, 242, 245);
    padding-bottom: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;

      .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.8);
        margin: 0;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .ranking-filters {
        display: flex;
        align-items: center;
        gap: 8px;

        .filter-label {
          font-size: 13px;
          color: rgb(96, 98, 102);
          font-weight: 500;
        }
      }
    }

    .chart-legend-custom {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: rgb(96, 98, 102);

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .legend-color {
        display: inline-block;
        
        &.line {
          width: 12px;
          height: 3px;
          background-color: rgb(0, 190, 190);
          border-radius: 1px;
        }
        &.bar {
          width: 12px;
          height: 8px;
          background-color: rgba(0, 190, 190, 0.3);
          border-radius: 1px;
        }
        &.target {
          width: 12px;
          height: 1px;
          border-top: 2px dashed rgb(240, 0, 0);
        }
      }
    }
  }

  .echart-div {
    width: 100%;
    height: 400px;
  }

  /* Theme style overrides */
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    background-color: rgb(0, 190, 190);
    border-color: rgb(0, 190, 190);
    box-shadow: -1px 0 0 0 rgb(0, 190, 190);
  }
  :deep(.el-radio-button__inner:hover) {
    color: rgb(0, 190, 190);
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    padding: 12px;
    margin-top: 12px;

    .chart-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      margin-bottom: 12px;

      .header-left {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        
        .chart-title {
          font-size: 14px;
        }

        .view-tab-toggle {
          width: 100%;
          display: flex;
          :deep(.el-radio-button) {
            flex: 1;
            .el-radio-button__inner {
              width: 100%;
              text-align: center;
              padding: 8px 0;
              font-size: 12px;
            }
          }
        }
      }

      .header-right {
        width: 100%;
        justify-content: flex-start;

        .chart-legend-custom {
          flex-wrap: wrap;
          gap: 10px;
          font-size: 11px;
        }

        .ranking-filters {
          width: 100%;
          justify-content: space-between;
          .filter-label {
            font-size: 12px;
          }
        }
      }
    }

    .echart-div {
      height: 320px !important;
    }
  }
}
</style>
