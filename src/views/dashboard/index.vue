<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="title-with-icon">
        <span class="title">待处理事项</span>
        <el-icon class="info-icon"><Warning /></el-icon>
      </div>
      <div class="update-time">最新更新时间: {{ currentTime }}</div>
    </div>

    <!-- Row 1: Top KPI Cards -->
    <div class="kpi-cards-row">
      <el-card shadow="never" class="kpi-card order-card">
        <div class="card-header">
          <el-icon class="card-icon"><Document /></el-icon>
          <span>订单</span>
        </div>
        <div class="card-body">
          <div class="kpi-item">
            <div class="label">待接单</div>
            <div class="value link">686</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="kpi-card delay-card">
        <div class="card-header">
          <el-icon class="card-icon"><Van /></el-icon>
          <span>延误预警-出港</span>
        </div>
        <div class="card-body multi-item">
          <div class="kpi-item">
            <div class="label">待交接</div>
            <div class="value link">10</div>
          </div>
          <div class="kpi-item">
            <div class="label">待出港</div>
            <div class="value">-</div>
          </div>
          <div class="kpi-item">
            <div class="label">待提领</div>
            <div class="value link">78</div>
          </div>
          <div class="kpi-item">
            <div class="label">待签收</div>
            <div class="value link">1</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="kpi-card confirm-card">
        <div class="card-header">
          <el-icon class="card-icon"><CircleCheck /></el-icon>
          <span>改单确认</span>
        </div>
        <div class="card-body">
          <div class="kpi-item">
            <div class="label">待处理</div>
            <div class="value link">47</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="kpi-card monitor-card">
        <div class="card-header">
          <el-icon class="card-icon"><VideoCamera /></el-icon>
          <span>监控</span>
        </div>
        <div class="card-body">
          <div class="kpi-item">
            <div class="label">待处理</div>
            <div class="value link">126</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="kpi-card receipt-card">
        <div class="card-header">
          <el-icon class="card-icon"><Tickets /></el-icon>
          <span>回单</span>
        </div>
        <div class="card-body">
          <div class="kpi-item">
            <div class="label">待登记</div>
            <div class="value link">895</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="dashboard-content-row">
      <!-- Left side: Traffic lights -->
      <div class="traffic-lights-section">
        <div class="section-header">
          <div class="title-with-icon">
            <div class="blue-line"></div>
            <span class="title">延误红绿灯</span>
          </div>
          <div class="legend">
            <span class="legend-item"><span class="dot green"></span>未预警</span>
            <span class="legend-item"><span class="dot orange"></span>已经延误</span>
            <span class="legend-item"><span class="dot red"></span>严重延误</span>
            <a href="#" class="view-more">查看省区列表>></a>
          </div>
        </div>

        <div class="traffic-cards">
          <el-card shadow="never" class="traffic-card">
            <div class="traffic-header bg-orange">交接</div>
            <div class="traffic-list">
              <div class="traffic-item">
                <span class="dot green"></span>
                <span class="value link green-text">467</span>
              </div>
              <div class="traffic-item">
                <span class="dot orange"></span>
                <span class="value link orange-text">280</span>
              </div>
              <div class="traffic-item">
                <span class="dot red"></span>
                <span class="value link red-text">26</span>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="traffic-card">
            <div class="traffic-header">出港</div>
            <div class="traffic-list">
              <div class="traffic-item">
                <span class="dot green"></span>
                <span class="value link green-text">292</span>
              </div>
              <div class="traffic-item">
                <span class="dot orange"></span>
                <span class="value link orange-text">460</span>
              </div>
              <div class="traffic-item">
                <span class="dot red"></span>
                <span class="value link red-text">6</span>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="traffic-card">
            <div class="traffic-header">提货</div>
            <div class="traffic-list">
              <div class="traffic-item">
                <span class="dot green"></span>
                <span class="value link green-text">1045</span>
              </div>
              <div class="traffic-item">
                <span class="dot orange"></span>
                <span class="value link orange-text">171</span>
              </div>
              <div class="traffic-item">
                <span class="dot red"></span>
                <span class="value link red-text">26</span>
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="traffic-card">
            <div class="traffic-header">签收</div>
            <div class="traffic-list">
              <div class="traffic-item">
                <span class="dot green"></span>
                <span class="value link green-text">3521</span>
              </div>
              <div class="traffic-item">
                <span class="dot orange"></span>
                <span class="value link orange-text">636</span>
              </div>
              <div class="traffic-item">
                <span class="dot red"></span>
                <span class="value link red-text">39</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- Right side: Target Progress -->
      <div class="target-section">
        <el-card shadow="never" class="target-card bg-cyan">
          <div class="target-title">本月货量目标(T)</div>
          <div class="target-value">31465</div>
          <div class="target-details">
            <span>已完成: 3198.3</span>
            <span>未完成: 28266.7</span>
          </div>
          <div class="progress-bar-container">
            <el-progress 
              :percentage="10.16" 
              :stroke-width="16"
              color="#ff9900"
              :show-text="false"
            />
            <span class="progress-text">10.16%</span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Empty State area -->
    <div class="empty-state">
      <el-empty description="功能开发中，敬请期待" image-size="120" />
    </div>

    <!-- Floating Toast Notification -->
    <div class="floating-toast" v-if="showToast">
      <div class="toast-header">
        <div class="toast-title">
          <el-icon><Bell /></el-icon>
          <span>差错待处理</span>
        </div>
        <el-icon class="close-icon" @click="showToast = false"><Close /></el-icon>
      </div>
      <div class="toast-body">
        您有新的待申诉差错，请及时处理！运单号/调度单号：800503970035，差错编号：CC202603051285315
      </div>
      <div class="toast-footer">
        <span class="toast-time">今日 11:16</span>
        <el-button type="primary" size="small" class="toast-btn">查看</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

const currentTime = ref('')
const showToast = ref(true)

onMounted(() => {
  currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  setInterval(() => {
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }, 1000)
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 16px 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);
  position: relative;
  
  // Dashboard Header
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 6px;
      
      .title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
      
      .info-icon {
        color: #999;
        cursor: pointer;
      }
    }

    .update-time {
      font-size: 13px;
      color: #999;
    }
  }

  // Row 1: KPI Cards
  .kpi-cards-row {
    display: grid;
    grid-template-columns: 1fr 2.5fr 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;

    .kpi-card {
      border: none;
      border-radius: 4px;

      :deep(.el-card__body) {
        padding: 16px;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 16px;

        .card-icon {
          color: #00b8c4;
          font-size: 16px;
        }
      }

      .card-body {
        display: flex;
        
        &.multi-item {
          justify-content: space-between;
        }
        
        .kpi-item {
          flex: 1;
          
          .label {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .value {
            font-size: 24px;
            font-weight: 500;
            color: #333;
            
            &.link {
              color: #00b8c4;
              cursor: pointer;
              
              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
  }

  // Row 2: Content Row
  .dashboard-content-row {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;

    .traffic-lights-section {
      flex: 3;
      background: white;
      padding: 16px;
      border-radius: 4px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .title-with-icon {
          display: flex;
          align-items: center;
          gap: 8px;

          .blue-line {
            width: 4px;
            height: 16px;
            background: #00b8c4;
            border-radius: 2px;
          }

          .title {
            font-size: 16px;
            font-weight: 500;
            color: #333;
          }
        }

        .legend {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: #666;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .view-more {
            color: #00b8c4;
            text-decoration: none;
            margin-left: 8px;
            
            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      .traffic-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;

        .traffic-card {
          border: 1px solid #ebeef5;
          border-radius: 4px;

          :deep(.el-card__body) {
            padding: 0;
          }

          .traffic-header {
            padding: 8px 0;
            text-align: center;
            font-size: 14px;
            background: #f8f9fa;
            border-bottom: 1px solid #ebeef5;
            
            &.bg-orange {
              background: #fff3e0;
              color: #e6a23c;
            }
          }

          .traffic-list {
            padding: 16px;
            
            .traffic-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 12px;
              
              &:last-child {
                margin-bottom: 0;
              }

              .value {
                font-weight: 500;
                
                &.link {
                  cursor: pointer;
                  &:hover {
                    text-decoration: underline;
                  }
                }
                
                &.green-text { color: #67c23a; }
                &.orange-text { color: #e6a23c; }
                &.red-text { color: #f56c6c; }
              }
            }
          }
        }
      }
    }

    .target-section {
      flex: 1;

      .target-card {
        border: none;
        border-radius: 4px;
        height: 100%;
        background: linear-gradient(135deg, #e0f7f8 0%, #c4f0f2 100%);

        :deep(.el-card__body) {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .target-title {
          font-size: 14px;
          color: #666;
          margin-bottom: 12px;
        }

        .target-value {
          font-size: 32px;
          font-weight: 500;
          color: #00b8c4;
          margin-bottom: 16px;
        }

        .target-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
          margin-bottom: 12px;
          
          span:last-child {
            color: #e6a23c;
          }
        }

        .progress-bar-container {
          position: relative;
          
          :deep(.el-progress-bar__outer) {
            background-color: white;
          }

          .progress-text {
            position: absolute;
            left: 8px;
            top: 50%;
            transform: translateY(-50%);
            color: white;
            font-size: 12px;
            font-weight: 500;
            line-height: 1;
          }
        }
      }
    }
  }

  // Dots
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    
    &.green { background-color: #67c23a; }
    &.orange { background-color: #e6a23c; }
    &.red { background-color: #f56c6c; }
  }

  // Empty State
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    background: transparent;
  }

  // Floating Toast Notification
  .floating-toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 320px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    overflow: hidden;

    .toast-header {
      background: #00b8c4;
      color: white;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toast-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 500;
      }

      .close-icon {
        cursor: pointer;
        opacity: 0.8;
        &:hover { opacity: 1; }
      }
    }

    .toast-body {
      padding: 16px;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
    }

    .toast-footer {
      padding: 0 16px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toast-time {
        font-size: 12px;
        color: #999;
      }

      .toast-btn {
        background: #00b8c4;
        border-color: #00b8c4;
      }
    }
  }
}
</style>
