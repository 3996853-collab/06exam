<template>
  <div class="warning-platform-container">
    <!-- 顶部标题与状态 -->
    <div class="page-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>物流策略预警平台 (MVP)</el-breadcrumb-item>
        </el-breadcrumb>
        <h1 class="page-title">
          <el-icon class="title-icon"><Warning /></el-icon>
          供应链物流策略预警平台 - 时效履约与订单流转
        </h1>
      </div>
      <div class="header-right">
        <div class="engine-status">
          <span class="status-dot healthy"></span>
          <span class="status-text">Flink CEP 规则引擎运行中</span>
          <el-divider direction="vertical" />
          <span class="latency-label">端到端延迟:</span>
          <span class="latency-value">1.1s</span>
          <el-divider direction="vertical" />
          <span class="tput-label">吞吐率:</span>
          <span class="tput-value">12,450 eps</span>
        </div>
      </div>
    </div>

    <!-- 顶层主标签页 -->
    <el-tabs v-model="activeTab" class="custom-tabs">
      <!-- T1: 实时预警大盘 -->
      <el-tab-pane label="时效与流转监控大盘" name="dashboard">
        <!-- KPI 指标卡片 -->
        <el-row :gutter="16" class="stat-row">
          <el-col :span="6" v-for="kpi in kpis" :key="kpi.label">
            <el-card shadow="hover" class="kpi-card" :body-style="{ padding: '16px' }">
              <div class="kpi-inner">
                <div class="kpi-icon" :style="{ background: kpi.bg }">
                  <el-icon><component :is="kpi.icon" /></el-icon>
                </div>
                <div class="kpi-info">
                  <div class="kpi-value">
                    {{ kpi.value }}
                    <span v-if="kpi.unit" class="kpi-unit">{{ kpi.unit }}</span>
                  </div>
                  <div class="kpi-label">{{ kpi.label }}</div>
                </div>
                <div class="kpi-trend" :class="kpi.trendClass">
                  {{ kpi.trend }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 数据处理拓扑链路图 -->
        <el-card shadow="never" class="topo-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon class="section-icon"><Cpu /></el-icon>
                流批一体预警计算拓扑链路 (实时处理状态)
              </span>
              <div class="card-actions">
                <el-tag type="info" size="small">批：DWD表 -> Redis缓存</el-tag>
                <el-tag type="success" size="small" style="margin-left: 8px;">流：Kafka事件 -> Flink CEP</el-tag>
              </div>
            </div>
          </template>
          <div class="topo-wrapper">
            <!-- 左侧：流式输入 -->
            <div class="topo-node-col">
              <div class="topo-node stream" id="node-kafka">
                <el-icon class="node-icon"><Connection /></el-icon>
                <div class="node-name">实时事件流 (Kafka)</div>
                <div class="node-desc">OMS/WMS/TMS 实时状态触发</div>
                <div class="pulse-ring"></div>
              </div>
            </div>
            
            <!-- 连线 1 -->
            <div class="topo-line-arrow">
              <div class="running-dot stream-dot"></div>
              <div class="arrow-line"></div>
            </div>

            <!-- 中间：Flink 引擎 + 缓存 -->
            <div class="topo-node-col flex-center">
              <div class="topo-node cache" id="node-redis">
                <el-icon class="node-icon"><Refresh /></el-icon>
                <div class="node-name">时效基准缓存 (Redis)</div>
                <div class="node-desc">绑定数仓 DWD 标准时效与库存</div>
              </div>
              <div class="db-sync-arrow">
                <div class="sync-dot"></div>
                <span class="sync-text">每小时增量/T+1 同步</span>
              </div>
              <div class="topo-node db" id="node-dwd">
                <el-icon class="node-icon"><Compass /></el-icon>
                <div class="node-name">数仓 DWD 核心表</div>
                <div class="node-desc">Hive/ClickHouse 批数据基准</div>
              </div>
            </div>

            <!-- 缓存流向引擎连线 -->
            <div class="topo-line-arrow-vertical">
              <div class="running-dot batch-dot"></div>
              <div class="arrow-line-vertical"></div>
            </div>

            <div class="topo-line-arrow">
              <div class="running-dot stream-dot"></div>
              <div class="arrow-line"></div>
            </div>

            <!-- 中右：Flink CEP -->
            <div class="topo-node-col">
              <div class="topo-node engine" id="node-flink">
                <el-icon class="node-icon"><Cpu /></el-icon>
                <div class="node-name">Flink CEP 规则引擎</div>
                <div class="node-desc">延时窗口匹配 & 动态阈值比对</div>
                <div class="pulse-ring bg-teal"></div>
              </div>
            </div>

            <!-- 连线 3 -->
            <div class="topo-line-arrow">
              <div class="running-dot alert-dot"></div>
              <div class="arrow-line"></div>
            </div>

            <!-- 右侧：输出与核销 -->
            <div class="topo-node-col flex-center">
              <div class="topo-node alert" id="node-alert">
                <el-icon class="node-icon"><Notification /></el-icon>
                <div class="node-name">策略预警分发器</div>
                <div class="node-desc">单向推送站长PDA/企业微信</div>
              </div>
              <div class="clear-loop-arrow">
                <div class="clear-dot"></div>
                <span class="clear-text">后续补救事件到达 -> 自动核销</span>
              </div>
              <div class="topo-node clear-engine" id="node-clear">
                <el-icon class="node-icon"><CircleCheck /></el-icon>
                <div class="node-name">隐性自动核销引擎</div>
                <div class="node-desc">实时对比核销特征、无感消警</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 预警看板与模拟控制区 -->
        <el-row :gutter="16" class="main-content-row">
          <!-- 左侧：实时活动预警列表 -->
          <el-col :span="16">
            <el-card shadow="never" class="alert-list-card">
              <template #header>
                <div class="card-header-with-tabs">
                  <span class="card-title">
                    <el-icon class="section-icon"><Warning /></el-icon>
                    活动预警监视板 (未处理/运行中)
                  </span>
                  <el-radio-group v-model="alertTypeFilter" size="small">
                    <el-radio-button label="ALL">全部 ({{ activeAlerts.length + archivedAlerts.length }})</el-radio-button>
                    <el-radio-button label="ACTIVE">异常中 ({{ activeAlerts.length }})</el-radio-button>
                    <el-radio-button label="VERIFIED_AUTO">已核销 ({{ archivedAlerts.length }})</el-radio-button>
                  </el-radio-group>
                </div>
              </template>

              <el-table 
                :data="displayAlerts" 
                style="width: 100%"
                row-key="alert_id"
                :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '500' }"
              >
                <el-table-column label="级别" width="80" align="center">
                  <template #default="scope">
                    <el-tag :type="getLevelTagType(scope.row.alert_level)" size="small" effect="dark">
                      {{ scope.row.alert_level === 'RED' ? '高' : scope.row.alert_level === 'YELLOW' ? '中' : '低' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="预警ID" width="160" prop="alert_id">
                  <template #default="scope">
                    <code class="code-id">{{ scope.row.alert_id }}</code>
                  </template>
                </el-table-column>
                <el-table-column label="监测对象" width="160">
                  <template #default="scope">
                    <div class="target-info">
                      <span class="target-type">{{ getTargetTypeLabel(scope.row.biz_type) }}:</span>
                      <span class="target-val">{{ scope.row.target_key }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="预警明细说明" min-width="220">
                  <template #default="scope">
                    <div class="alert-desc-cell">
                      <span class="alert-reason">{{ scope.row.context.reason }}</span>
                      <div class="alert-meta-details">
                        <span>当前节点: <strong>{{ scope.row.context.current_node }}</strong></span>
                        <el-divider direction="vertical" />
                        <span>已超时: <strong class="color-warn">{{ scope.row.context.elapsed_time_mins }} 分钟</strong></span>
                        <el-divider direction="vertical" />
                        <span v-if="scope.row.context.sla_deadline">SLA时效底线: {{ scope.row.context.sla_deadline.split(' ')[1] }}</span>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="110" align="center">
                  <template #default="scope">
                    <span :class="['status-badge', scope.row.status.toLowerCase()]">
                      {{ getStatusLabel(scope.row.status) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="模拟事件流驱动" width="150" align="center">
                  <template #default="scope">
                    <el-button 
                      v-if="scope.row.status === 'ACTIVE'"
                      type="primary" 
                      size="small" 
                      link
                      @click="triggerMockVerification(scope.row)"
                    >
                      <el-icon style="margin-right: 4px;"><VideoPlay /></el-icon>
                      发送正向事件核销
                    </el-button>
                    <span v-else class="color-success">
                      <el-icon><CircleCheck /></el-icon> 隐性核销完毕
                    </span>
                  </template>
                </el-table-column>
              </el-table>

              <div class="alert-list-footer">
                <span class="alert-notice">
                  <el-icon><InfoFilled /></el-icon> 
                  <strong>系统规范说明：</strong>本平台全自动进行“无感/隐性核销”，无需操作人员手动点击“我已处理”按钮。当后续正向业务事件被 Kafka 捕获时，系统自动执行核销。
                </span>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧：事件总线与预警分发流 (Kafka / Alert Dispatcher) -->
          <el-col :span="8">
            <!-- 实时 Kafka 事件总线 -->
            <el-card shadow="never" class="bus-card">
              <template #header>
                <div class="card-header">
                  <span class="card-title">
                    <el-icon class="section-icon"><Connection /></el-icon>
                    Kafka 实时事件总线 (流式输入)
                  </span>
                  <el-switch 
                    v-model="busStreaming" 
                    active-color="#00bebe"
                    size="small"
                    active-text="流式监听中"
                    inactive-text="已暂停"
                  />
                </div>
              </template>
              <div class="terminal-container" ref="busTerminal">
                <div 
                  v-for="(log, idx) in busLogs" 
                  :key="idx" 
                  :class="['log-line', log.type]"
                >
                  <span class="log-time">[{{ log.time }}]</span>
                  <span class="log-tag">[{{ log.source }}]</span>
                  <span class="log-msg">{{ log.message }}</span>
                </div>
              </div>
            </el-card>

            <!-- 预警分发推送器 (Dispatcher API JSON Logs) -->
            <el-card shadow="never" class="bus-card mt-16">
              <template #header>
                <div class="card-header">
                  <span class="card-title">
                    <el-icon class="section-icon"><Share /></el-icon>
                    Alert Dispatcher 预警推送网关
                  </span>
                  <el-tag type="info" size="small">API JSON</el-tag>
                </div>
              </template>
              <div class="terminal-container dispatcher">
                <pre class="json-code"><code>{{ latestDispatchedJson }}</code></pre>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- T2: 规则配置与仿真器 (神策/帆软深度融合) -->
      <el-tab-pane label="策略配置与仿真器 (神策/帆软)" name="configurator">
        <el-row :gutter="16">
          <!-- 左侧：神策/帆软 BI 规则配置面板 -->
          <el-col :span="14">
            <!-- 1. 神策行为分析式条件配置 -->
            <el-card shadow="never" class="rule-edit-card">
              <template #header>
                <div class="card-header">
                  <span class="card-title text-teal">
                    <el-icon><Cpu /></el-icon>
                    神策数据分析式「事件 + 动态基线」配置
                  </span>
                </div>
              </template>

              <el-form label-width="120px" label-position="left" size="small">
                <!-- WHEN -->
                <el-form-item label="事件定义 (WHEN)" required>
                  <div class="when-row">
                    <span class="prefix-tag">当发生</span>
                    <el-select v-model="ruleForm.triggerEvent" placeholder="触发事件" style="width: 180px; margin: 0 8px;">
                      <el-option label="揽收成功 (package_collected)" value="package_collected" />
                      <el-option label="下单成功 (order_created)" value="order_created" />
                      <el-option label="库存扣减 (inventory_changed)" value="inventory_changed" />
                    </el-select>
                    <span class="text-hint">实时事件被 Kafka 捕获时启动计时</span>
                  </div>
                </el-form-item>

                <!-- WHERE -->
                <el-form-item label="过滤条件 (WHERE)">
                  <div class="where-container">
                    <div v-for="(filter, index) in whereFilters" :key="index" class="where-filter-row">
                      <el-select v-model="filter.attribute" placeholder="属性字段" style="width: 140px;">
                        <el-option label="customer_type (客户类型)" value="customer_type" />
                        <el-option label="transport_mode (运输方式)" value="transport_mode" />
                        <el-option label="route_id (路线)" value="route_id" />
                        <el-option label="warehouse_id (大仓)" value="warehouse_id" />
                      </el-select>
                      
                      <el-select v-model="filter.operator" style="width: 80px; margin: 0 8px;">
                        <el-option label="等于 (==)" value="==" />
                        <el-option label="不等于 (!=)" value="!=" />
                        <el-option label="包含" value="contains" />
                      </el-select>

                      <el-input v-model="filter.value" placeholder="匹配值" style="width: 130px; margin-right: 8px;" />
                      
                      <el-button type="danger" :icon="Delete" circle @click="removeFilter(index)" />
                    </div>
                    <el-button type="primary" size="small" :icon="Plus" plain @click="addFilter" style="margin-top: 8px;">添加过滤条件</el-button>
                  </div>
                </el-form-item>

                <!-- THEN -->
                <el-form-item label="计算逻辑 (THEN)" required>
                  <div class="then-logic-container">
                    <div class="then-row">
                      <span class="prefix-tag">如果在接下来</span>
                      <el-select v-model="ruleForm.sensorsBaselineType" style="width: 200px; margin: 0 8px;">
                        <el-option label="固定基线 (固定时长)" value="fixed" />
                        <el-option label="神策动态基线 (历史环比)" value="sensors_dynamic" />
                      </el-select>
                      <span class="prefix-tag">内，未发生</span>
                      <el-select v-model="ruleForm.expectedEvent" style="width: 180px; margin-left: 8px;">
                        <el-option label="分拣入库 (hub_inbound)" value="hub_inbound" />
                        <el-option label="波次创建 (wave_created)" value="wave_created" />
                        <el-option label="签收成功 (signed_success)" value="signed_success" />
                      </el-select>
                    </div>

                    <!-- 对应不同的基线详情输入 -->
                    <div v-if="ruleForm.sensorsBaselineType === 'fixed'" class="baseline-detail mt-8">
                      <span class="prefix-tag">设定时限：</span>
                      <el-input-number v-model="ruleForm.sensorsFixedHours" :min="1" style="width: 110px; margin: 0 8px;" />
                      <span class="prefix-tag">小时</span>
                    </div>

                    <div v-else class="baseline-detail mt-8 dynamic">
                      <span class="prefix-tag">动态统计：过去</span>
                      <el-input-number v-model="ruleForm.sensorsDynamicDays" :min="1" :max="90" style="width: 90px; margin: 0 8px;" />
                      <span class="prefix-tag">天，同段路由平均耗时 &times;</span>
                      <el-input-number v-model="ruleForm.sensorsDynamicRatio" :min="100" :max="300" :step="10" style="width: 100px; margin: 0 8px;" />
                      <span class="prefix-tag">% 作为判定红线</span>
                      <div class="hint-block mt-4">
                        💡 系统将实时拉取 DWD 过去 14 天快照，当前耗时超出均值的 130% 时，Flink 即触发异常状态。
                      </div>
                    </div>
                  </div>
                </el-form-item>
              </el-form>
            </el-card>

            <!-- 2. 帆软分级响应矩阵与动态模板 -->
            <el-card shadow="never" class="rule-edit-card mt-16">
              <template #header>
                <div class="card-header">
                  <span class="card-title text-teal">
                    <el-icon><Notification /></el-icon>
                    帆软式「分级响应矩阵与动态模板」配置
                  </span>
                </div>
              </template>

              <el-form label-width="120px" label-position="left" size="small">
                <!-- 响应分级 -->
                <el-form-item label="分级响应矩阵" required>
                  <div class="matrix-container">
                    <!-- LEVEL 1 -->
                    <div class="matrix-level-card border-yellow">
                      <div class="level-header bg-yellow-soft">
                        <span class="level-title">Level 1 (黄色轻度预警)</span>
                        <el-checkbox v-model="ruleForm.level1Active">启用</el-checkbox>
                      </div>
                      <div class="level-body">
                        <div class="level-field">
                          <span>超时达基准 </span>
                          <el-input-number v-model="ruleForm.level1TimeoutPercent" :min="1" style="width: 80px; margin: 0 4px;" size="small" />
                          <span> % 时触发</span>
                        </div>
                        <div class="level-field mt-4">
                          <span>通知渠道: </span>
                          <el-select v-model="ruleForm.level1Channel" style="width: 140px;" size="small">
                            <el-option label="PDA (现场作业员)" value="PDA (现场作业员)" />
                            <el-option label="企业微信 (班组长)" value="企业微信 (班组长)" />
                          </el-select>
                        </div>
                        <span class="channel-desc mt-4">动作: 单向 PUSH 提醒，不生成工单。</span>
                      </div>
                    </div>

                    <!-- LEVEL 2 -->
                    <div class="matrix-level-card border-orange">
                      <div class="level-header bg-orange-soft">
                        <span class="level-title">Level 2 (橙色中度预警)</span>
                        <el-checkbox v-model="ruleForm.level2Active">启用</el-checkbox>
                      </div>
                      <div class="level-body">
                        <div class="level-field">
                          <span>超时达基准 </span>
                          <el-input-number v-model="ruleForm.level2TimeoutPercent" :min="1" style="width: 80px; margin: 0 4px;" size="small" />
                          <span> % 且未核销</span>
                        </div>
                        <div class="level-field mt-4">
                          <span>通知渠道: </span>
                          <el-select v-model="ruleForm.level2Channel" style="width: 140px;" size="small">
                            <el-option label="企业微信 (网点站长)" value="企业微信 (网点站长)" />
                            <el-option label="手机短信 (分拨主管)" value="手机短信 (分拨主管)" />
                          </el-select>
                        </div>
                        <div class="level-field mt-4">
                          <el-checkbox v-model="ruleForm.level2Task">自动生成督办任务工单</el-checkbox>
                        </div>
                      </div>
                    </div>

                    <!-- LEVEL 3 -->
                    <div class="matrix-level-card border-red">
                      <div class="level-header bg-red-soft">
                        <span class="level-title">Level 3 (红色危急预警)</span>
                        <el-checkbox v-model="ruleForm.level3Active">启用</el-checkbox>
                      </div>
                      <div class="level-body">
                        <div class="level-field">
                          <span>超时达基准 </span>
                          <el-input-number v-model="ruleForm.level3TimeoutPercent" :min="1" style="width: 80px; margin: 0 4px;" size="small" />
                          <span> % ；或临近 SLA 前 </span>
                          <el-input-number v-model="ruleForm.level3SlaBuffer" :min="1" style="width: 60px; margin: 0 4px;" size="small" />
                          <span> 小时</span>
                        </div>
                        <div class="level-field mt-4">
                          <span>通知渠道: </span>
                          <el-select v-model="ruleForm.level3Channel" style="width: 160px;" size="small">
                            <el-option label="组织树自动上报 (城市经理)" value="组织树自动上报 (城市经理)" />
                            <el-option label="电话语音告警 (区域总监)" value="电话语音告警 (区域总监)" />
                          </el-select>
                        </div>
                        <span class="channel-desc mt-4">动作: 拦截自动化流程，挂起订单。</span>
                      </div>
                    </div>
                  </div>
                </el-form-item>

                <!-- 动态模板 -->
                <el-form-item label="动态推送模板" required>
                  <div class="template-editor-container">
                    <el-input 
                      type="textarea" 
                      v-model="ruleForm.alertTemplate" 
                      rows="3" 
                      placeholder="编写预警信息模板，使用占位符引入属性"
                    />
                    <div class="placeholder-tags mt-8">
                      <span class="tag-title">点击插入占位变量:</span>
                      <el-button size="small" plain @click="insertPlaceholder('${customer_name}')">大客户名称</el-button>
                      <el-button size="small" plain @click="insertPlaceholder('${waybill_no}')">运单号</el-button>
                      <el-button size="small" plain @click="insertPlaceholder('${current_hub}')">当前网点</el-button>
                      <el-button size="small" plain @click="insertPlaceholder('${elapsed_time}')">等待时长(分)</el-button>
                    </div>

                    <!-- 实时模板生成预览 -->
                    <div class="template-live-render mt-8">
                      <div class="preview-title">帆软模板实时渲染效果:</div>
                      <div class="preview-body">{{ renderedTemplatePreview }}</div>
                    </div>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button type="success" size="default" @click="saveAndStartSimulation" class="btn-primary-teal">
                    <el-icon style="margin-right: 4px;"><VideoPlay /></el-icon>
                    部署新策略并激活仿真测试
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>

          <!-- 右侧：策略 JSON Payload 与策略测试仿真器 -->
          <el-col :span="10">
            <!-- 实时生成的 JSON Payload 结构 -->
            <el-card shadow="never" class="preview-card">
              <template #header>
                <div class="card-header">
                  <span class="card-title">神策/帆软合并规则 JSON Payload</span>
                  <el-tag type="success" size="small">实时编译</el-tag>
                </div>
              </template>
              <div class="expr-box">
                <pre class="json-code scrollable-pre"><code>{{ generateRulePayloadJson() }}</code></pre>
              </div>
            </el-card>

            <!-- 可交互策略仿真测试面板 (核心特色功能) -->
            <el-card shadow="never" class="bus-card mt-16">
              <template #header>
                <div class="card-header">
                  <span class="card-title text-teal">
                    <el-icon><Compass /></el-icon>
                    物流预警仿真控制台 (Life Cycle Simulator)
                  </span>
                  <el-tag :type="isSimulating ? 'success' : 'info'" size="small">
                    {{ isSimulating ? '仿真测试中' : '等待激活' }}
                  </el-tag>
                </div>
              </template>

              <div class="simulator-wrapper">
                <el-steps :active="simStep" finish-status="success" align-center size="small" class="custom-steps">
                  <el-step title="事件触发" />
                  <el-step title="时效计时" />
                  <el-step title="分级升级" />
                  <el-step title="隐性核销" />
                </el-steps>

                <!-- 仿真控制器 -->
                <div class="simulator-controls mt-16">
                  <!-- 第一步：触发 -->
                  <div v-if="simStep === 0" class="sim-initial-box">
                    <p class="sim-desc">提示：配置完左侧规则后，点击按钮以模拟 Kafka 揽收成功事件流入。</p>
                    <el-button type="primary" size="default" @click="startSimulation" style="width: 100%;">
                      模拟发送揽收事件 (Trigger package_collected)
                    </el-button>
                  </div>

                  <!-- 计时与升级仿真 -->
                  <div v-if="simStep === 1 || simStep === 2" class="sim-running-box">
                    <div class="sim-slider-label">
                      <span>模拟揽收后的等待时间 (小时):</span>
                      <strong class="color-teal">{{ simElapsedTime.toFixed(1) }} 小时</strong>
                    </div>
                    <el-slider 
                      v-model="simElapsedTime" 
                      :min="0" 
                      :max="8" 
                      :step="0.1" 
                      show-stops
                      @input="handleSimTimeChange"
                    />
                    
                    <div class="current-warning-status mt-8">
                      <span>当前触发警报状态: </span>
                      <span v-if="simLastAlertLevel === 'NONE'" class="badge badge-normal">无告警 (小于基准的 110%)</span>
                      <span v-if="simLastAlertLevel === 'YELLOW'" class="badge badge-yellow">Level 1 (黄色轻度预警)</span>
                      <span v-if="simLastAlertLevel === 'ORANGE'" class="badge badge-orange">Level 2 (橙色中度预警)</span>
                      <span v-if="simLastAlertLevel === 'RED'" class="badge badge-red">Level 3 (红色危急预警)</span>
                    </div>

                    <!-- 隐性核销正向事件触发 -->
                    <el-button 
                      type="success" 
                      size="default" 
                      @click="resolveSimulation" 
                      style="width: 100%; margin-top: 16px;"
                      class="btn-success-green"
                    >
                      模拟发送分拣入库事件 (触发隐性自动核销)
                    </el-button>
                  </div>

                  <!-- 仿真完毕 -->
                  <div v-if="simStep === 3" class="sim-complete-box text-center">
                    <el-icon class="complete-icon" color="#38ef7d"><CircleCheck /></el-icon>
                    <p class="complete-text">仿真闭环核销测试圆满成功！</p>
                    <p class="complete-desc">运单已分拣入库，Flink CEP 规则匹配隐性核销，报警已无感销警。</p>
                    <el-button size="small" plain @click="simStep = 0" style="margin-top: 8px;">重新启动仿真</el-button>
                  </div>
                </div>

                <!-- 仿真日志终端 -->
                <div class="sim-logs-title mt-16">仿真进程控制台输出 (Terminal):</div>
                <div class="terminal-container simulator-terminal" ref="simTerminal">
                  <div v-for="(log, idx) in simLogs" :key="idx" :class="['log-line', log.type]">
                    <span class="log-time">[{{ log.time }}]</span>
                    <span class="log-msg">{{ log.msg }}</span>
                  </div>
                  <div v-if="simLogs.length === 0" class="empty-terminal-text">等待发送触发事件...</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- T3: 数据接入配置交互模块 -->
      <el-tab-pane label="数据接入配置" name="integration">
        <el-row :gutter="16">
          <!-- 左侧：接入源配置 -->
          <el-col :span="12">
            <!-- 流式数据接入 Kafka -->
            <el-card shadow="never" class="integration-card">
              <template #header>
                <div class="card-header">
                  <span class="card-title">
                    <el-icon class="section-icon"><Connection /></el-icon>
                    Kafka 实时事件流配置
                  </span>
                  <el-tag type="success">流式接入</el-tag>
                </div>
              </template>

              <el-form :model="kafkaForm" label-position="left" label-width="120px" size="default">
                <el-form-item label="Bootstrap Brokers" required>
                  <el-input v-model="kafkaForm.brokers" placeholder="kafka-broker1.zto.local:9092,kafka-broker2.zto.local:9092" />
                </el-form-item>
                
                <el-form-item label="订阅事件 Topics" required>
                  <el-select v-model="kafkaForm.topics" multiple placeholder="选择订阅的事件Topic" style="width: 100%;">
                    <el-option label="order_events (OMS下单/取消事件)" value="order_events" />
                    <el-option label="warehouse_events (WMS波次/库存事件)" value="warehouse_events" />
                    <el-option label="transit_node_events (TMS路由/揽收分拣事件)" value="transit_node_events" />
                  </el-select>
                </el-form-item>

                <el-row :gutter="12">
                  <el-col :span="12">
                    <el-form-item label="消费 Group ID" required>
                      <el-input v-model="kafkaForm.groupId" placeholder="flink-cep-warning-group" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="起始消费位点" required>
                      <el-select v-model="kafkaForm.offsetReset" style="width: 100%;">
                        <el-option label="最新消息 (LATEST)" value="latest" />
                        <el-option label="最早消息 (EARLIEST)" value="earliest" />
                        <el-option label="指定时间戳" value="timestamp" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="传输反序列化" required>
                  <el-radio-group v-model="kafkaForm.serializer">
                    <el-radio label="JSON">JSON 序列化</el-radio>
                    <el-radio label="Protobuf">Protobuf (Schema Registry)</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" :loading="testingKafka" @click="testKafkaConnection">
                    <el-icon style="margin-right: 4px;"><Link /></el-icon>
                    Kafka 连通性测试
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <!-- 离线数仓 DWD 表同步配置 -->
            <el-card shadow="never" class="integration-card mt-16">
              <template #header>
                <div class="card-header">
                  <span class="card-title">
                    <el-icon class="section-icon"><Compass /></el-icon>
                    数仓 DWD 离线拉取与 Redis 缓存热同步
                  </span>
                  <el-tag type="info">批/定时同步</el-tag>
                </div>
              </template>

              <el-form :model="dwdForm" label-position="left" label-width="120px" size="default">
                <el-form-item label="数仓数据源类型" required>
                  <el-radio-group v-model="dwdForm.dbType">
                    <el-radio label="Hive">Hive (HDFS 离线仓)</el-radio>
                    <el-radio label="ClickHouse">ClickHouse (实时 OLAP)</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="同步的 DWD 核心表" required>
                  <el-select v-model="dwdForm.tableName" placeholder="选择要同步映射的数仓表" style="width: 100%;">
                    <el-option label="dwd_log_order_detail_di (订单明细承诺时效)" value="dwd_log_order_detail_di" />
                    <el-option label="dwd_log_waybill_node_hi (网点标准时效分拣时效)" value="dwd_log_waybill_node_hi" />
                    <el-option label="dwd_log_inventory_snapshot_di (大仓安全库存快照)" value="dwd_log_inventory_snapshot_di" />
                  </el-select>
                </el-form-item>

                <el-row :gutter="12">
                  <el-col :span="12">
                    <el-form-item label="拉取提取周期" required>
                      <el-select v-model="dwdForm.syncFrequency" style="width: 100%;">
                        <el-option label="每小时拉取 (T+0)" value="hourly" />
                        <el-option label="每日凌晨拉取 (T+1)" value="daily" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="缓存 TTL 生效天数" required>
                      <el-input-number v-model="dwdForm.ttlDays" :min="1" :max="30" style="width: 100%;" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="Redis 键设计映射" required>
                  <div class="mapper-row">
                    <span class="mapper-part">Key Prefix: </span>
                    <el-input v-model="dwdForm.redisPrefix" placeholder="wlbl:node:std" style="width: 150px; margin: 0 8px;" />
                    <span class="mapper-part">+ 关联 ID (如 route_id)</span>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" :loading="syncingDwd" @click="triggerDwdSync">
                    <el-icon style="margin-right: 4px;"><Refresh /></el-icon>
                    测试执行数仓同步 (写缓存)
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>

          <!-- 右侧：字段可视化映射与连通性样本 -->
          <el-col :span="12">
            <!-- 字段映射关系可视化 -->
            <el-card shadow="never" class="mapping-card">
              <template #header>
                <div class="card-header">
                  <span class="card-title">数据上下文变量映射模型 (DWD / Kafka -> Flink CEP)</span>
                </div>
              </template>
              <div class="mapping-diagram">
                <div class="mapping-column source">
                  <div class="column-title">数据源字段 (Source)</div>
                  <div class="mapping-node" v-for="map in currentFieldMappings" :key="map.src">
                    {{ map.src }}
                    <span class="source-tag" :class="map.sourceType">{{ map.sourceType }}</span>
                  </div>
                </div>
                
                <div class="mapping-lines-svg">
                  <svg width="100%" height="220">
                    <line x1="0" y1="28" x2="100%" y2="28" stroke="#00bebe" stroke-width="1.5" stroke-dasharray="4" />
                    <line x1="0" y1="83" x2="100%" y2="83" stroke="#00bebe" stroke-width="1.5" stroke-dasharray="4" />
                    <line x1="0" y1="138" x2="100%" y2="138" stroke="#00bebe" stroke-width="1.5" stroke-dasharray="4" />
                    <line x1="0" y1="193" x2="100%" y2="193" stroke="#00bebe" stroke-width="1.5" stroke-dasharray="4" />
                  </svg>
                </div>

                <div class="mapping-column target">
                  <div class="column-title">预警引擎标准变量 (Rule Context)</div>
                  <div class="mapping-node matched" v-for="map in currentFieldMappings" :key="map.dest">
                    {{ map.dest }}
                    <span class="datatype-tag">{{ map.type }}</span>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 接入校验样本解析 -->
            <el-card shadow="never" class="sample-parse-card mt-16">
              <template #header>
                <div class="card-header">
                  <span class="card-title">接入校验样本报文解析器 (Data Inspector)</span>
                </div>
              </template>
              
              <div class="inspector-box">
                <div class="inspector-header">
                  <el-radio-group v-model="inspectorTab" size="small">
                    <el-radio-button label="KAFKA">Kafka 实时消息样本</el-radio-button>
                    <el-radio-button label="REDIS">Redis 缓存基准样本</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="inspector-body">
                  <pre class="json-code"><code>{{ currentInspectorJson }}</code></pre>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { 
  Warning, Odometer, VideoPlay, Connection, 
  Notification, Setting, InfoFilled, CircleCheck, 
  Link, Cpu, Refresh, ArrowRight, Delete, Plus, Compass, Share
} from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'

// TAB 切换
const activeTab = ref('dashboard')

// KPI 卡片数据
const kpis = ref([
  { 
    label: '正在活动预警 (Active Alerts)', 
    value: '3', 
    unit: '条', 
    trend: '+1 较半小时前', 
    trendClass: 'trend-up', 
    icon: 'Warning',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
  },
  { 
    label: '今日预警总数 (Total Today)', 
    value: '142', 
    unit: '条', 
    trend: '-12% 较昨日同期', 
    trendClass: 'trend-down', 
    icon: 'Odometer',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
  },
  { 
    label: '流式事件隐性自动核销率', 
    value: '94.2', 
    unit: '%', 
    trend: '+2.1% 运营提升', 
    trendClass: 'trend-up', 
    icon: 'CircleCheck',
    bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' 
  },
  { 
    label: '策略分发通知触发次数', 
    value: '133', 
    unit: '次', 
    trend: '99.8% 成功送达', 
    trendClass: 'trend-up', 
    icon: 'Notification',
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
  }
])

// 1. 活动预警数据 (模拟 WMS, TMS, OMS 的三个 PRD 场景)
const activeAlerts = ref([
  {
    alert_id: 'ALT_20260525_0001',
    biz_type: 'FULFILLMENT_TIMEOUT',
    target_key: 'WAYBILL_998712345',
    alert_level: 'RED',
    trigger_time: '2026-05-25 15:00:00',
    status: 'ACTIVE',
    context: {
      current_node: 'package_collected (已揽收)',
      missing_node: 'hub_inbound (分拣入库)',
      elapsed_time_mins: 288,
      sla_deadline: '2026-05-26 12:00:00',
      reason: '运单揽收成功，系统依据 route_id 查询 Redis 缓存（来自 dwd_log_waybill_node_hi 标准时效 4h）。动态超时阈值为 4 * 1.2 = 4.8小时。目前等待已达 4.8 小时且未收到分拣入库事件。'
    },
    owner_id: 'STATION_MANAGER_HZ_01'
  },
  {
    alert_id: 'ALT_20260525_0002',
    biz_type: 'ORDER_STUCK',
    target_key: 'ORD_20260525_7894',
    alert_level: 'YELLOW',
    trigger_time: '2026-05-25 15:05:00',
    status: 'ACTIVE',
    context: {
      current_node: 'order_created (下单成功)',
      missing_node: 'wave_created (波次创建)',
      elapsed_time_mins: 32,
      sla_deadline: '2026-05-25 18:00:00',
      reason: '订单下单成功已超过 30 分钟。Flink 延迟窗口（30分钟）检测到后端 WMS 系统尚未发送对应该订单的波次创建（wave_created）事件，单据疑似静默卡死。'
    },
    owner_id: 'OMS_OPERATOR_SH_05'
  },
  {
    alert_id: 'ALT_20260525_0003',
    biz_type: 'STOCK_CRITICAL',
    target_key: 'SKU_OUT_8871A',
    alert_level: 'BLUE',
    trigger_time: '2026-05-25 15:08:00',
    status: 'ACTIVE',
    context: {
      current_node: 'avail_qty (可用库存 15)',
      missing_node: 'safety_stock_qty (安全库存 50)',
      elapsed_time_mins: 15,
      sla_deadline: '实时预警无截止限',
      reason: '可用库存被击穿。检测到 WMS 实时上报 inventory_changed 事件导致库存扣减。该 SKU 当前可用库存量 15 小于数仓定义的动态安全库存值 50（根据 dwd_log_inventory_snapshot_di 同步）。'
    },
    owner_id: 'WAREHOUSE_MGR_GZ_09'
  }
])

const archivedAlerts = ref<any[]>([])

// 列表过滤
const alertTypeFilter = ref('ALL')
const displayAlerts = computed(() => {
  if (alertTypeFilter.value === 'ALL') {
    return [...activeAlerts.value, ...archivedAlerts.value]
  } else if (alertTypeFilter.value === 'ACTIVE') {
    return activeAlerts.value
  } else {
    return archivedAlerts.value
  }
})

// 表格辅助格式化
const getLevelTagType = (level: string) => {
  if (level === 'RED') return 'danger'
  if (level === 'YELLOW') return 'warning'
  return 'info'
}

const getTargetTypeLabel = (bizType: string) => {
  if (bizType === 'FULFILLMENT_TIMEOUT') return '运单'
  if (bizType === 'ORDER_STUCK') return '订单'
  return 'SKU'
}

const getStatusLabel = (status: string) => {
  if (status === 'ACTIVE') return '异常预警激活'
  if (status === 'VERIFIED_AUTO') return '已自动隐性核销'
  return status
}

// 2. 实时事件流日志 (Kafka)
const busStreaming = ref(true)
const busLogs = ref<any[]>([
  { time: '15:10:02', source: 'OMS', type: 'info', message: '实时事件已消费: order_created {"order_id": "ORD_20260525_7894", "customer_id": "CUST_ZTO_01"}' },
  { time: '15:10:05', source: 'TMS', type: 'info', message: '实时事件已消费: waybill_assigned {"waybill_no": "WAYBILL_998712345", "route_id": "ROUTE_SH_HZ"}' },
  { time: '15:10:10', source: 'TMS', type: 'info', message: '实时事件已消费: package_collected {"waybill_no": "WAYBILL_998712345", "route_id": "ROUTE_SH_HZ", "std_duration_hub": 240}' },
  { time: '15:10:12', source: 'DWD', type: 'success', message: '数仓离线拉取：读取 dwd_log_waybill_node_hi 标准时效 std_duration_hub = 240分钟 -> 缓存写入 Redis' },
  { time: '15:10:15', source: 'WMS', type: 'info', message: '实时事件已消费: inventory_changed {"sku_id": "SKU_OUT_8871A", "avail_qty": 15, "warehouse_id": "WH_GZ_01"}' },
  { time: '15:10:20', source: 'Flink', type: 'error', message: 'Flink CEP Pattern 触发: 运单 WAYBILL_998712345 揽收后已超时 4.8 小时未见分拣入库，触发 RED 级预警！' },
  { time: '15:10:22', source: 'Flink', type: 'error', message: 'Flink CEP 窗口触发: 订单 ORD_20260525_7894 已经过 30 分钟未见 WMS 响应 wave_created，触发 YELLOW 预警！' },
  { time: '15:10:25', source: 'Flink', type: 'error', message: 'Flink CEP 阈值击穿: SKU SKU_OUT_8871A 当前库存 15 < 安全库存 50，触发 BLUE 预警！' }
])

const busTerminal = ref<any>(null)

// 动态追加 Kafka 实时滚动事件
let streamTimer: any = null
const startKafkaMockStream = () => {
  streamTimer = setInterval(() => {
    if (!busStreaming.value) return

    const sources = ['OMS', 'WMS', 'TMS', 'Flink']
    const source = sources[Math.floor(Math.random() * sources.length)]
    let message = ''
    let type = 'info'

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    if (source === 'OMS') {
      const orderId = 'ORD_' + now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + '_' + Math.floor(1000 + Math.random()*9000)
      message = `实时事件已消费: order_created {"order_id": "${orderId}", "customer_id": "CUST_GEN_${Math.floor(Math.random()*100)}"}`
    } else if (source === 'TMS') {
      const waybillNo = 'WAYBILL_' + Math.floor(100000000 + Math.random()*900000000)
      const events = ['waybill_assigned', 'package_collected', 'hub_inbound', 'signed_success']
      const ev = events[Math.floor(Math.random()*events.length)]
      message = `实时事件已消费: ${ev} {"waybill_no": "${waybillNo}", "route_id": "ROUTE_GEN_${Math.floor(Math.random()*50)}"}`
    } else if (source === 'WMS') {
      const skuId = 'SKU_GEN_' + Math.floor(1000 + Math.random()*9000) + 'X'
      message = `实时事件已消费: inventory_changed {"sku_id": "${skuId}", "avail_qty": ${Math.floor(Math.random()*100)}, "warehouse_id": "WH_GEN_02"}`
    } else {
      type = 'success'
      message = `规则引擎心跳检测正常。活跃状态槽位占用率: 14.5%, 累积消费位点Offset: ${3840228 + Math.floor(Math.random()*1000)}`
    }

    busLogs.value.push({ time: timeStr, source, type, message })
    if (busLogs.value.length > 50) {
      busLogs.value.shift()
    }

    // 滚动到底部
    if (busTerminal.value) {
      setTimeout(() => {
        busTerminal.value.scrollTop = busTerminal.value.scrollHeight
      }, 50)
    }
  }, 3500)
}

// 3. 预警分发中心最新日志
const latestDispatchedJson = ref(`{
  "alert_id": "ALT_20260525_0001",
  "biz_type": "FULFILLMENT_TIMEOUT",
  "target_key": "WAYBILL_NO_998712345",
  "alert_level": "RED",
  "trigger_time": "2026-05-25 15:00:00",
  "context": {
    "current_node": "COLLECTED",
    "missing_node": "HUB_INBOUND",
    "elapsed_time_mins": 288,
    "sla_deadline": "2026-05-26 12:00:00"
  },
  "owner_id": "STATION_MANAGER_HZ_01"
}`)

// 模拟发送后续正向业务事件，进行隐性核销 (PRD的核心亮点)
const triggerMockVerification = (alert: any) => {
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  // 1. 根据业务类型组装补救事件
  let eventName = ''
  let payload: any = {}

  if (alert.biz_type === 'FULFILLMENT_TIMEOUT') {
    eventName = 'hub_inbound'
    payload = {
      waybill_no: alert.target_key,
      node: 'HUB_INBOUND',
      inbound_time: now.toISOString().replace('T', ' ').substring(0, 19),
      hub_id: 'HUB_EAST_HZ_01',
      operator_id: 'OP_SYS_99'
    }
  } else if (alert.biz_type === 'ORDER_STUCK') {
    eventName = 'wave_created'
    payload = {
      order_id: alert.target_key,
      wave_id: 'WAVE_AUTO_' + Math.floor(1000 + Math.random()*9000),
      warehouse_id: 'WH_SH_EAST',
      created_time: now.toISOString().replace('T', ' ').substring(0, 19)
    }
  } else if (alert.biz_type === 'STOCK_CRITICAL') {
    eventName = 'inventory_changed'
    payload = {
      sku_id: alert.target_key,
      avail_qty: 65, // 库存回升至 65
      change_type: 'REPLENISHMENT',
      updated_time: now.toISOString().replace('T', ' ').substring(0, 19)
    }
  }

  // 2. 将事件注入 Kafka 流中，展现数据流动的视觉流程
  busLogs.value.push({
    time: timeStr,
    source: alert.biz_type === 'FULFILLMENT_TIMEOUT' ? 'TMS' : alert.biz_type === 'ORDER_STUCK' ? 'WMS' : 'WMS',
    type: 'success',
    message: `模拟发射核销事件 Kafka [${eventName}]: ${JSON.stringify(payload)}`
  })

  // 滚动到底部
  if (busTerminal.value) {
    setTimeout(() => {
      busTerminal.value.scrollTop = busTerminal.value.scrollHeight
    }, 50)
  }

  // 3. Flink 计算比对并触发核销
  setTimeout(() => {
    // 将预警移出活动列表，加入核销归档列表
    const index = activeAlerts.value.findIndex(a => a.alert_id === alert.alert_id)
    if (index > -1) {
      const matchedAlert = activeAlerts.value[index]
      matchedAlert.status = 'VERIFIED_AUTO'
      
      // 更新其说明以反映已核销
      if (alert.biz_type === 'FULFILLMENT_TIMEOUT') {
        matchedAlert.context.reason = '「已隐性自动核销」：Kafka 管道监测到运单在分拨中心成功扫描入库 (hub_inbound) 事件，Flink 状态清理，系统自动撤销预警。'
      } else if (alert.biz_type === 'ORDER_STUCK') {
        matchedAlert.context.reason = '「已隐性自动核销」：大仓上报对应订单的 wave_created 波次事件，已解除“静默卡死”状态，预警关闭。'
      } else if (alert.biz_type === 'STOCK_CRITICAL') {
        matchedAlert.context.reason = '「已隐性自动核销」：WMS 上报入库增加库存事件，可用库存恢复水位线（当前 65 > 安全库存 50），预警已闭环。'
      }

      activeAlerts.value.splice(index, 1)
      archivedAlerts.value.unshift(matchedAlert)

      // 更新 KPI 卡片
      kpis.value[0].value = activeAlerts.value.length.toString()
      
      // 计算核销率
      const total = activeAlerts.value.length + archivedAlerts.value.length
      const rate = ((archivedAlerts.value.length / total) * 100).toFixed(1)
      kpis.value[2].value = rate

      // 实时发出 Element 通知
      ElNotification({
        title: '流式异常隐性核销成功',
        message: `检测到正向补救事件【${eventName}】，预警 ID ${alert.alert_id} 自动清算核销。`,
        type: 'success',
        duration: 4500
      })

      // 更新 Dispatcher 推送 JSON（推送自动核销状态变更）
      latestDispatchedJson.value = JSON.stringify({
        alert_id: alert.alert_id,
        biz_type: alert.biz_type === 'FULFILLMENT_TIMEOUT' ? 'FULFILLMENT_TIMEOUT' : alert.biz_type === 'ORDER_STUCK' ? 'ORDER_STUCK' : 'STOCK_CRITICAL',
        target_key: alert.target_key,
        alert_level: alert.alert_level,
        status: 'VERIFIED_AUTO',
        verified_time: now.toISOString().replace('T', ' ').substring(0, 19),
        verification_event: eventName,
        message: 'Alert cleared silently. Positive flow confirmed.'
      }, null, 2)
    }
  }, 1000)
}

// 4. 规则引擎配置器 (可视化)
const ruleForm = reactive({
  name: '神策事件+帆软分级响应：揽收超时策略预警',
  alertLevel: 'RED',
  targetType: 'Waybill',
  triggerEvent: 'package_collected',
  expectedEvent: 'hub_inbound',
  baselineType: 'dynamic',
  fixedTime: 30,
  timeUnit: 'mins',
  dwdTableName: 'dwd_log_waybill_node_hi',
  dwdField: 'std_duration_hub',
  coefficient: 1.2,
  actionPushPda: true,
  actionBlockFlow: false,
  actionTriggerReplenish: false,
  
  // 神策式动态配置
  sensorsBaselineType: 'sensors_dynamic', 
  sensorsFixedHours: 4,
  sensorsDynamicDays: 14,
  sensorsDynamicRatio: 130, // 130%
  
  // 帆软式分级配置
  level1Active: true,
  level1TimeoutPercent: 10,
  level1Channel: 'PDA (现场作业员)',
  
  level2Active: true,
  level2TimeoutPercent: 30,
  level2Channel: '企业微信 (网点站长)',
  level2Task: true,
  
  level3Active: true,
  level3TimeoutPercent: 50,
  level3Channel: '组织树自动上报 (城市经理)',
  level3SlaBuffer: 2, 
  
  alertTemplate: '【超时告警】您的VIP客户 ${customer_name} 的单号 ${waybill_no} 已在 ${current_hub} 滞留 ${elapsed_time}分钟，请立即处理。'
})

// DWD 字段联动
const currentDwdFields = ref<string[]>(['std_duration_hub', 'std_duration_line'])

const handleTargetTypeChange = (val: string) => {
  if (val === 'Waybill') {
    ruleForm.triggerEvent = 'package_collected'
    ruleForm.expectedEvent = 'hub_inbound'
    ruleForm.dwdTableName = 'dwd_log_waybill_node_hi'
    handleDwdTableChange('dwd_log_waybill_node_hi')
  } else if (val === 'Order') {
    ruleForm.triggerEvent = 'order_created'
    ruleForm.expectedEvent = 'wave_created'
    ruleForm.dwdTableName = 'dwd_log_order_detail_di'
    handleDwdTableChange('dwd_log_order_detail_di')
  } else if (val === 'SKU') {
    ruleForm.triggerEvent = 'inventory_changed'
    ruleForm.expectedEvent = 'stock_recovered'
    ruleForm.dwdTableName = 'dwd_log_inventory_snapshot_di'
    handleDwdTableChange('dwd_log_inventory_snapshot_di')
  }
}

const handleDwdTableChange = (val: string) => {
  if (val === 'dwd_log_waybill_node_hi') {
    currentDwdFields.value = ['std_duration_hub', 'std_duration_line']
    ruleForm.dwdField = 'std_duration_hub'
  } else if (val === 'dwd_log_order_detail_di') {
    currentDwdFields.value = ['promise_delivery_time', 'expected_processing_mins']
    ruleForm.dwdField = 'expected_processing_mins'
  } else if (val === 'dwd_log_inventory_snapshot_di') {
    currentDwdFields.value = ['safety_stock_qty']
    ruleForm.dwdField = 'safety_stock_qty'
  }
}

// 模板套用
const applyTemplate = (scenario: string) => {
  if (scenario === 'SCENARIO_A') {
    ruleForm.name = '单据链路流转阻塞：下单后30分钟未见波次配置'
    ruleForm.alertLevel = 'YELLOW'
    ruleForm.targetType = 'Order'
    ruleForm.triggerEvent = 'order_created'
    ruleForm.expectedEvent = 'wave_created'
    ruleForm.sensorsBaselineType = 'fixed'
    ruleForm.sensorsFixedHours = 1
    ruleForm.level1TimeoutPercent = 10
    ruleForm.level2TimeoutPercent = 30
    ruleForm.level3TimeoutPercent = 50
    ruleForm.alertTemplate = '【阻塞告警】您的订单 ${waybill_no} 已在此节点停留 ${elapsed_time}分钟，未在预计时间内进入波次，请处理。'
  } else if (scenario === 'SCENARIO_B') {
    ruleForm.name = '干线与分拨流转异常：揽收后超时未分拣入库'
    ruleForm.alertLevel = 'RED'
    ruleForm.targetType = 'Waybill'
    ruleForm.triggerEvent = 'package_collected'
    ruleForm.expectedEvent = 'hub_inbound'
    ruleForm.sensorsBaselineType = 'sensors_dynamic'
    ruleForm.sensorsDynamicDays = 14
    ruleForm.sensorsDynamicRatio = 130
    ruleForm.level1TimeoutPercent = 10
    ruleForm.level2TimeoutPercent = 30
    ruleForm.level3TimeoutPercent = 50
    ruleForm.alertTemplate = '【超时告警】您的VIP客户 ${customer_name} 的单号 ${waybill_no} 已在 ${current_hub} 滞留 ${elapsed_time}分钟，请立即处理。'
  } else if (scenario === 'SCENARIO_C') {
    ruleForm.name = '仓库预警：SKU 可用库存击穿数仓动态安全水位线'
    ruleForm.alertLevel = 'BLUE'
    ruleForm.targetType = 'SKU'
    ruleForm.triggerEvent = 'inventory_changed'
    ruleForm.expectedEvent = 'stock_recovered'
    ruleForm.sensorsBaselineType = 'fixed'
    ruleForm.sensorsFixedHours = 2
    ruleForm.level1TimeoutPercent = 5
    ruleForm.level2TimeoutPercent = 20
    ruleForm.level3TimeoutPercent = 40
    ruleForm.alertTemplate = '【库存预警】大仓内的 SKU ${waybill_no} 水位严重下滑，当前已超过警戒持续 ${elapsed_time}分钟，请立即安排补货！'
  }

  ElNotification({
    title: '预设模版应用成功',
    message: `已自动装填 ${scenario} 业务流批配置模板，可直接进行二次修改。`,
    type: 'success'
  })
}

// 规则配置器中的神策 WHERE 过滤条件
const whereFilters = ref([
  { attribute: 'customer_type', operator: '==', value: 'VIP' },
  { attribute: 'transport_mode', operator: '==', value: '航空件' }
])

const addFilter = () => {
  whereFilters.value.push({ attribute: 'customer_type', operator: '==', value: '' })
}

const removeFilter = (index: number) => {
  whereFilters.value.splice(index, 1)
}

// 推送占位符插入
const insertPlaceholder = (tag: string) => {
  ruleForm.alertTemplate += tag
}

// 实时渲染模板预览 (模拟大客户 顺丰备用仓，运单 998712345，滞留 288 分钟)
const renderedTemplatePreview = computed(() => {
  let tpl = ruleForm.alertTemplate
  const elapsedMinutes = Math.round(simElapsedTime.value > 0 ? simElapsedTime.value * 60 : 288)
  tpl = tpl.replace(/\${customer_name}/g, '大客户(顺丰备用仓)')
  tpl = tpl.replace(/\${waybill_no}/g, 'WAYBILL_998712345')
  tpl = tpl.replace(/\${current_hub}/g, '上海静安分拨')
  tpl = tpl.replace(/\${elapsed_time}/g, elapsedMinutes.toString())
  return tpl
})

// 生成符合神策/帆软相结合的策略 Payload JSON 供后端解析
const generateRulePayloadJson = () => {
  return JSON.stringify({
    "strategy_rule_name": ruleForm.name,
    "sensors_event_definition": {
      "when_event": ruleForm.triggerEvent,
      "where_filters": whereFilters.value.map(f => `${f.attribute} ${f.operator} "${f.value}"`),
      "then_logic": {
        "type": ruleForm.sensorsBaselineType,
        "parameters": ruleForm.sensorsBaselineType === 'fixed' 
          ? { "fixed_limit_hours": ruleForm.sensorsFixedHours }
          : { "past_days": ruleForm.sensorsDynamicDays, "threshold_ratio": `${ruleForm.sensorsDynamicRatio}%` }
      }
    },
    "finereport_escalation_matrix": {
      "level_1_yellow": {
        "enabled": ruleForm.level1Active,
        "threshold": `timeout_exceeds_${ruleForm.level1TimeoutPercent}%`,
        "notification_channel": ruleForm.level1Channel,
        "action": "single_push_pda"
      },
      "level_2_orange": {
        "enabled": ruleForm.level2Active,
        "threshold": `timeout_exceeds_${ruleForm.level2TimeoutPercent}%`,
        "notification_channel": ruleForm.level2Channel,
        "generate_supervision_task": ruleForm.level2Task
      },
      "level_3_red": {
        "enabled": ruleForm.level3Active,
        "threshold": `timeout_exceeds_${ruleForm.level3TimeoutPercent}%_or_sla_buffer_${ruleForm.level3SlaBuffer}h`,
        "notification_channel": ruleForm.level3Channel,
        "escalation_route": "org_tree_city_manager"
      }
    },
    "alert_template": {
      "raw_template": ruleForm.alertTemplate,
      "live_sample": renderedTemplatePreview.value
    }
  }, null, 2)
}

// 模拟部署规则到 Flink
const deployedRules = ref([
  { id: 1, name: '【揽-分】超期预警', targetType: 'Waybill', expectedEvent: 'hub_inbound', level: 'RED', description: '揽收后超过 dwd_log_waybill_node_hi.std_duration_hub * 1.2 未分拣入库则报错。' },
  { id: 2, name: '【下单-波次】静默卡死', targetType: 'Order', expectedEvent: 'wave_created', level: 'YELLOW', description: '下单后 30 分钟未生成波次。' },
  { id: 3, name: '【库存水位】动态安全警戒', targetType: 'SKU', expectedEvent: 'stock_recovered', level: 'BLUE', description: '可用库存小于 dwd_log_inventory_snapshot_di.safety_stock_qty 触发补货。' }
])

// 仿真生命周期状态
const simStep = ref(0)
const simElapsedTime = ref(0.0)
const simLogs = ref<any[]>([])
const simTerminal = ref<any>(null)
const isSimulating = ref(false)
const simLastAlertLevel = ref('NONE')

// 开启策略仿真
const saveAndStartSimulation = () => {
  // 保存并部署至列表
  deployedRules.value.push({
    id: Date.now(),
    name: ruleForm.name,
    targetType: ruleForm.targetType,
    expectedEvent: ruleForm.expectedEvent,
    level: ruleForm.alertLevel,
    description: `[神策/帆软闭环]: ${ruleForm.triggerEvent} -> ${ruleForm.expectedEvent}，基准：${ruleForm.sensorsBaselineType === 'fixed' ? ruleForm.sensorsFixedHours + '小时' : '过去' + ruleForm.sensorsDynamicDays + '天均值*' + ruleForm.sensorsDynamicRatio + '%'}`
  })

  // 1. 同步写到 Kafka 事件流总线显示部署日志
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  busLogs.value.push({
    time: timeStr,
    source: 'Flink',
    type: 'success',
    message: `策略重新部署: ${ruleForm.name} 已成功编入 Flink CEP 内存，等待仿真事件流入。`
  })

  // 2. 初始化右侧仿真大底
  startSimulation()
}

// 启动仿真流程
const startSimulation = () => {
  simStep.value = 1
  simElapsedTime.value = 0.0
  simLastAlertLevel.value = 'NONE'
  simLogs.value = [
    { time: '15:22:04', type: 'info', msg: `[KAFKA INCOMING] 仿真触发器收到起始事件: package_collected {"waybill_no": "WAYBILL_998712345"}` },
    { time: '15:22:05', type: 'info', msg: `[WHERE CHECK] 属性比对: customer_type=="VIP" (MATCHED), transport_mode=="航空件" (MATCHED). Flink 状态机切换为 ACTIVE。` },
    { time: '15:22:05', type: 'success', msg: `[BASELINE CALCULATED] 基于 14 天同路由历史平均耗时 (4.0小时)，动态判定基准时效设定为: 4.0h * 130% = 5.2小时。` }
  ]
  isSimulating.value = true
  
  ElNotification({
    title: '仿真测试启动',
    message: 'Kafka 触发事件已成功发送，开始进入时效延时计时阶段。请拖动计时滑块模拟超时！',
    type: 'success'
  })
}

// 模拟时效滑块拖动升级逻辑 (帆软分级响应矩阵)
const handleSimTimeChange = (hours: number) => {
  if (simStep.value < 1) return
  simStep.value = 2
  
  // baseline is 5.2 hours.
  const baseline = 5.2 
  const ratio = (hours / baseline)
  const elapsedMinutes = Math.round(hours * 60)
  
  // level 3: 50% timeout (ratio >= 1.50)
  if (ratio >= 1.50) {
    if (simLastAlertLevel.value !== 'RED') {
      simLastAlertLevel.value = 'RED'
      simLogs.value.push({
        time: '15:22:15',
        type: 'error',
        msg: `[LEVEL 3 RED WARNING] 持续等待达 ${hours.toFixed(1)} 小时 (超时率达 50%)！触发帆软红色告警，自动向上汇报至城市经理！`
      })
      simLogs.value.push({
        time: '15:22:16',
        type: 'error',
        msg: `[Escalation Dispatched] 推送内容: "${renderedTemplatePreview.value}"`
      })
      ElNotification({
        title: '触发三级红色预警 (红线告警)',
        message: '已超时 50%，系统已自动根据组织架构树上报至城市经理！',
        type: 'error'
      })
    }
  } else if (ratio >= 1.30) {
    if (simLastAlertLevel.value !== 'ORANGE') {
      simLastAlertLevel.value = 'ORANGE'
      simLogs.value.push({
        time: '15:22:12',
        type: 'warning',
        msg: `[LEVEL 2 ORANGE WARNING] 持续等待达 ${hours.toFixed(1)} 小时 (超时率达 30%)！触发帆软橙色预警，发送至网点站长微信！`
      })
      simLogs.value.push({
        time: '15:22:13',
        type: 'warning',
        msg: `[System Task] 已自动生成轻量级异常督办工单，指派给网点负责人。`
      })
      ElNotification({
        title: '触发二级橙色预警',
        message: '已超时 30%，已发送推送至站长企业微信，并自动指派异常督办工单！',
        type: 'warning'
      })
    }
  } else if (ratio >= 1.10) {
    if (simLastAlertLevel.value !== 'YELLOW') {
      simLastAlertLevel.value = 'YELLOW'
      simLogs.value.push({
        time: '15:22:08',
        type: 'primary',
        msg: `[LEVEL 1 YELLOW WARNING] 持续等待达 ${hours.toFixed(1)} 小时 (超时率达 10%)！触发帆软黄色预警，单向 Push 告警至现场作业员 PDA。`
      })
      ElNotification({
        title: '触发一级黄色预警',
        message: '超时 10%，已单向推送警报至现场作业员 PDA！',
        type: 'info'
      })
    }
  } else {
    if (simLastAlertLevel.value !== 'NONE' && hours < baseline) {
      simLastAlertLevel.value = 'NONE'
      simLogs.value.push({
        time: '15:22:07',
        type: 'info',
        msg: `[TIMER CHECK] 已耗时 ${hours.toFixed(1)} 小时，尚未超过 110% 时效阈值，状态保持为 ACTIVE。`
      })
    }
  }
}

// 仿真中的隐性核销正向事件触发
const resolveSimulation = () => {
  simStep.value = 3
  isSimulating.value = false
  simLogs.value.push({
    time: '15:22:20',
    type: 'success',
    msg: `[KAFKA INCOMING] 收到补救核销事件: hub_inbound {"waybill_no": "WAYBILL_998712345", "node": "HUB_INBOUND"}`
  })
  simLogs.value.push({
    time: '15:22:21',
    type: 'success',
    msg: `[AUTO CLEAR] Flink CEP 引擎匹配成功，预警状态转为 VERIFIED_AUTO，本次仿真闭环核销完成。`
  })
  
  ElNotification({
    title: '时效预警自动隐性核销',
    message: '检测到分拣入库事件到来，平台自动执行隐性核销，预警消除，无感闭环！',
    type: 'success'
  })

  // 同步在主面板的 Kafka 流日志追加
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  busLogs.value.push({
    time: timeStr,
    source: 'TMS',
    type: 'success',
    message: `仿真核销流流入 Kafka: hub_inbound {"waybill_no": "WAYBILL_998712345"}`
  })
}

// 删除规则
const deleteRule = (id: number) => {
  const idx = deployedRules.value.findIndex(r => r.id === id)
  if (idx > -1) {
    deployedRules.value.splice(idx, 1)
    ElNotification({
      title: '规则下线成功',
      message: 'Flink 算子已成功卸载对应的 CEP Pattern 实例。',
      type: 'warning'
    })
  }
}

// 5. 数据接入配置交互模块
const kafkaForm = reactive({
  brokers: 'kafka-broker1.zto.local:9092,kafka-broker2.zto.local:9092',
  topics: ['transit_node_events', 'order_events', 'warehouse_events'],
  groupId: 'flink-cep-warning-group',
  offsetReset: 'latest',
  serializer: 'JSON'
})

const dwdForm = reactive({
  dbType: 'Hive',
  tableName: 'dwd_log_waybill_node_hi',
  syncFrequency: 'hourly',
  ttlDays: 7,
  redisPrefix: 'wlbl:node:std'
})

const testingKafka = ref(false)
const testKafkaConnection = () => {
  testingKafka.value = true
  setTimeout(() => {
    testingKafka.value = false
    ElNotification({
      title: 'Kafka 连通性测试通过',
      message: `Bootstrap Brokers [${kafkaForm.brokers}] 响应正常。Topic 消费分区握手完成。`,
      type: 'success'
    })
  }, 1200)
}

const syncingDwd = ref(false)
const triggerDwdSync = () => {
  syncingDwd.value = true
  setTimeout(() => {
    syncingDwd.value = false
    ElNotification({
      title: '数仓同步测试成功',
      message: `从 ${dwdForm.dbType} 批量提取 DWD 数据并热缓存至 Redis 节点，写入 1,280 条时效及安全库存键。`,
      type: 'success'
    })
  }, 1500)
}

// 字段映射可视化数据联动
const currentFieldMappings = computed(() => {
  if (dwdForm.tableName === 'dwd_log_waybill_node_hi') {
    return [
      { src: 'waybill_no', sourceType: 'Kafka/流', dest: 'target_key', type: 'VARCHAR' },
      { src: 'route_id', sourceType: 'Kafka/流', dest: 'context.route_id', type: 'VARCHAR' },
      { src: 'std_duration_hub', sourceType: 'DWD/批', dest: 'context.std_duration_hub', type: 'INTEGER (秒)' },
      { src: 'std_duration_line', sourceType: 'DWD/批', dest: 'context.std_duration_line', type: 'INTEGER (秒)' }
    ]
  } else if (dwdForm.tableName === 'dwd_log_order_detail_di') {
    return [
      { src: 'order_id', sourceType: 'Kafka/流', dest: 'target_key', type: 'VARCHAR' },
      { src: 'customer_id', sourceType: 'Kafka/流', dest: 'context.customer_id', type: 'VARCHAR' },
      { src: 'promise_delivery_time', sourceType: 'DWD/批', dest: 'context.sla_deadline', type: 'TIMESTAMP' },
      { src: 'sla_type', sourceType: 'DWD/批', dest: 'context.sla_type', type: 'VARCHAR' }
    ]
  } else {
    return [
      { src: 'sku_id', sourceType: 'Kafka/流', dest: 'target_key', type: 'VARCHAR' },
      { src: 'avail_qty', sourceType: 'Kafka/流', dest: 'context.avail_qty', type: 'INTEGER' },
      { src: 'safety_stock_qty', sourceType: 'DWD/批', dest: 'context.safety_stock_qty', type: 'INTEGER' },
      { src: 'warehouse_id', sourceType: 'DWD/批', dest: 'context.warehouse_id', type: 'VARCHAR' }
    ]
  }
})

// 字段详情数据校验查看
const inspectorTab = ref('KAFKA')
const currentInspectorJson = computed(() => {
  if (inspectorTab.value === 'KAFKA') {
    if (dwdForm.tableName === 'dwd_log_waybill_node_hi') {
      return JSON.stringify({
        "event_header": {
          "topic": "transit_node_events",
          "offset": 9982713,
          "timestamp": 1779779401200
        },
        "event_payload": {
          "waybill_no": "WAYBILL_998712345",
          "route_id": "ROUTE_SH_HZ_01",
          "node_code": "package_collected",
          "node_name": "揽收成功",
          "station_id": "STATION_SH_01",
          "operator_id": "OP_SH_33",
          "timestamp": "2026-05-25 15:10:10"
        }
      }, null, 2)
    } else if (dwdForm.tableName === 'dwd_log_order_detail_di') {
      return JSON.stringify({
        "event_header": {
          "topic": "order_events",
          "offset": 4519927,
          "timestamp": 1779779402500
        },
        "event_payload": {
          "order_id": "ORD_20260525_7894",
          "customer_id": "CUST_ZTO_01",
          "sku_list": [{"sku_id": "SKU_OUT_8871A", "qty": 1}],
          "amount": 299.00,
          "timestamp": "2026-05-25 15:10:02"
        }
      }, null, 2)
    } else {
      return JSON.stringify({
        "event_header": {
          "topic": "warehouse_events",
          "offset": 128947,
          "timestamp": 1779779405000
        },
        "event_payload": {
          "sku_id": "SKU_OUT_8871A",
          "change_qty": -1,
          "avail_qty": 15,
          "warehouse_id": "WH_GZ_01",
          "operator_id": "OP_WMS_04",
          "timestamp": "2026-05-25 15:10:15"
        }
      }, null, 2)
    }
  } else {
    // REDIS CACHE
    if (dwdForm.tableName === 'dwd_log_waybill_node_hi') {
      return JSON.stringify({
        "redis_key": "wlbl:node:std:ROUTE_SH_HZ_01",
        "data_type": "HASH",
        "ttl_seconds": 604800,
        "fields": {
          "route_id": "ROUTE_SH_HZ_01",
          "route_name": "上海静安分拨 -> 杭州下沙网点",
          "std_duration_hub": "14400", 
          "std_duration_line": "18000", 
          "sync_timestamp": "2026-05-25 15:00:00",
          "sync_batch_no": "BATCH_HI_2026052515"
        }
      }, null, 2)
    } else if (dwdForm.tableName === 'dwd_log_order_detail_di') {
      return JSON.stringify({
        "redis_key": "order:sla:CUST_ZTO_01",
        "data_type": "HASH",
        "ttl_seconds": 86400,
        "fields": {
          "customer_id": "CUST_ZTO_01",
          "customer_name": "天猫大客户-顺丰备用仓",
          "sla_type": "VIP_FAST",
          "promise_delivery_time": "2026-05-26 12:00:00",
          "expected_processing_mins": "30",
          "sync_timestamp": "2026-05-25 04:00:00"
        }
      }, null, 2)
    } else {
      return JSON.stringify({
        "redis_key": "wms:safety:SKU_OUT_8871A",
        "data_type": "STRING",
        "ttl_seconds": 86400,
        "value": {
          "sku_id": "SKU_OUT_8871A",
          "warehouse_id": "WH_GZ_01",
          "safety_stock_qty": "50",
          "current_dwd_qty": "120",
          "sync_timestamp": "2026-05-25 04:00:00"
        }
      }, null, 2)
    }
  }
})

// 生命周期
onMounted(() => {
  startKafkaMockStream()
})

onUnmounted(() => {
  if (streamTimer) clearInterval(streamTimer)
})
</script>

<style scoped lang="scss">
.warning-platform-container {
  padding: 16px;
  background-color: rgb(240, 242, 245);
  min-height: calc(100vh - 84px);
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  color: rgba(0, 0, 0, 0.8);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 12px 0px;

  .header-left {
    .page-title {
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.8);
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 8px;

      .title-icon {
        color: rgb(0, 190, 190);
        font-size: 18px;
      }
    }
  }

  .engine-status {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: rgb(96, 98, 102);

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;

      &.healthy {
        background-color: #38ef7d;
        box-shadow: 0 0 8px #38ef7d;
        animation: pulse 1.5s infinite;
      }
    }

    .latency-label, .tput-label {
      color: rgb(96, 98, 102);
      margin-right: 4px;
    }

    .latency-value, .tput-value {
      font-weight: bold;
      color: rgb(0, 190, 190);
    }
  }
}

.custom-tabs {
  background: transparent;

  :deep(.el-tabs__header) {
    margin-bottom: 16px;
    border-bottom: none;

    .el-tabs__nav-wrap {
      padding: 4px 8px;
      background: white;
      border-radius: 8px;
      box-shadow: rgba(0, 0, 0, 0.05) 0 2px 4px;
    }
    
    .el-tabs__item {
      font-weight: 500;
      font-size: 13px;
      color: rgb(96, 98, 102);
      padding: 0 20px;
      transition: all 0.3s;

      &.is-active {
        color: rgb(0, 190, 190) !important;
        font-weight: bold;
      }
    }

    .el-tabs__active-bar {
      background-color: rgb(0, 190, 190);
      height: 3px;
    }
  }
}

// KPI 卡片样式
.stat-row {
  margin-bottom: 16px;
}

.kpi-card {
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 8px 16px 0px;
  }

  .kpi-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .kpi-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
  }

  .kpi-info {
    flex: 1;
    margin-left: 12px;

    .kpi-value {
      font-size: 22px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.8);
      line-height: 1.1;

      .kpi-unit {
        font-size: 12px;
        color: rgb(96, 98, 102);
        font-weight: normal;
        margin-left: 2px;
      }
    }

    .kpi-label {
      font-size: 11px;
      color: rgb(96, 98, 102);
      margin-top: 4px;
    }
  }

  .kpi-trend {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;

    &.trend-up {
      background-color: rgba(56, 239, 125, 0.1);
      color: #11998e;
    }

    &.trend-down {
      background-color: rgba(245, 87, 108, 0.1);
      color: #f5576c;
    }
  }
}

// 拓扑图卡片
.topo-card {
  border: none;
  border-radius: 8px;
  background: white;
  margin-bottom: 16px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-title {
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;

      .section-icon {
        color: rgb(0, 190, 190);
        font-size: 16px;
      }
    }
  }
}

.topo-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0b1d30; // 酷炫暗色科技风背景
  border-radius: 8px;
  padding: 30px;
  position: relative;
  overflow: hidden;
  min-height: 220px;
}

.topo-node-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;

  &.flex-center {
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
}

.topo-node {
  width: 170px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  color: #fff;
  position: relative;

  .node-icon {
    font-size: 22px;
    margin-bottom: 6px;
    color: rgb(0, 190, 190);
  }

  .node-name {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .node-desc {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.2;
  }

  // 特殊类型节点边框色彩
  &.stream {
    border-color: rgba(56, 239, 125, 0.5);
    background: rgba(56, 239, 125, 0.06);
    .node-icon { color: #38ef7d; }
  }

  &.cache {
    border-color: rgba(240, 147, 251, 0.5);
    background: rgba(240, 147, 251, 0.06);
    .node-icon { color: #f093fb; }
  }

  &.db {
    border-color: rgba(79, 172, 254, 0.5);
    background: rgba(79, 172, 254, 0.06);
    .node-icon { color: #4facfe; }
  }

  &.engine {
    border-color: rgba(0, 190, 190, 0.8);
    background: rgba(0, 190, 190, 0.1);
    .node-icon { color: rgb(0, 190, 190); }
  }

  &.alert {
    border-color: rgba(245, 87, 108, 0.5);
    background: rgba(245, 87, 108, 0.06);
    .node-icon { color: #f5576c; }
  }

  &.clear-engine {
    border-color: rgba(56, 239, 125, 0.5);
    background: rgba(56, 239, 125, 0.08);
    .node-icon { color: #38ef7d; }
  }
}

// 动态呼吸环
.pulse-ring {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 6px;
  border: 1px solid #38ef7d;
  animation: pulse-border 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  pointer-events: none;

  &.bg-teal {
    border-color: rgb(0, 190, 190);
  }
}

// 连线与运动微粒子
.topo-line-arrow {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.15);
  position: relative;
  margin: 0 10px;

  .arrow-line {
    position: absolute;
    right: 0;
    top: -4px;
    width: 0; height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 8px solid rgba(255, 255, 255, 0.3);
  }

  .running-dot {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    top: -2px;
    animation: flow-particle 2s linear infinite;

    &.stream-dot {
      background-color: #38ef7d;
      box-shadow: 0 0 6px #38ef7d;
    }

    &.alert-dot {
      background-color: #f5576c;
      box-shadow: 0 0 6px #f5576c;
      animation-duration: 1.5s;
    }
  }
}

// 垂直方向同步连线
.db-sync-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 24px;
  position: relative;
  justify-content: center;

  .sync-dot {
    width: 4px;
    height: 4px;
    background-color: #f093fb;
    border-radius: 50%;
    animation: flow-vertical 1.5s linear infinite;
  }

  .sync-text {
    font-size: 8px;
    color: rgba(255,255,255,0.4);
    margin-top: 2px;
  }
}

// flink与缓存间垂直引线
.topo-line-arrow-vertical {
  width: 2px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  position: absolute;
  left: calc(39% + 80px); // 根据拓扑进行对齐
  top: 90px;
  z-index: 1;

  .arrow-line-vertical {
    position: absolute;
    bottom: 0;
    left: -4px;
    width: 0; height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 8px solid rgba(255, 255, 255, 0.3);
  }

  .running-dot.batch-dot {
    background-color: #f093fb;
    width: 6px; height: 6px;
    border-radius: 50%;
    left: -2px;
    animation: flow-particle-vertical 1.8s linear infinite;
  }
}

// 闭环清算连线
.clear-loop-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 24px;
  position: relative;
  justify-content: center;

  .clear-dot {
    width: 4px;
    height: 4px;
    background-color: #38ef7d;
    border-radius: 50%;
    animation: flow-vertical-up 1.5s linear infinite;
  }

  .clear-text {
    font-size: 8px;
    color: rgba(56, 239, 125, 0.8);
    margin-top: 2px;
  }
}

// 预警主区
.main-content-row {
  margin-top: 16px;
}

.alert-list-card {
  border: none;
  border-radius: 8px;
  background: white;
  min-height: 520px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;

  .card-header-with-tabs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .card-title {
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;

      .section-icon {
        color: rgb(0, 190, 190);
        font-size: 16px;
      }
    }
  }

  .alert-list-footer {
    margin-top: 16px;
    padding: 12px;
    background-color: rgb(240, 242, 245);
    border-radius: 6px;

    .alert-notice {
      font-size: 11px;
      color: rgb(96, 98, 102);
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.4;

      .el-icon {
        color: rgb(0, 190, 190);
        font-size: 14px;
      }
    }
  }
}

.code-id {
  font-family: Consolas, Monaco, monospace;
  font-size: 11px;
  color: rgb(96, 98, 102);
  background-color: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.target-info {
  display: flex;
  flex-direction: column;

  .target-type {
    font-size: 10px;
    color: rgb(96, 98, 102);
  }

  .target-val {
    font-size: 12px;
    font-weight: 500;
    margin-top: 2px;
  }
}

.alert-desc-cell {
  .alert-reason {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.8);
    display: block;
    line-height: 1.4;
  }

  .alert-meta-details {
    margin-top: 6px;
    font-size: 11px;
    color: rgb(96, 98, 102);

    strong {
      color: rgba(0, 0, 0, 0.8);
      font-weight: 500;
    }

    .color-warn {
      color: #e6a23c;
    }
  }
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;

  &.active {
    background-color: rgba(245, 87, 108, 0.1);
    color: #f5576c;
    border: 1px solid rgba(245, 87, 108, 0.2);
  }

  &.verified_auto {
    background-color: rgba(56, 239, 125, 0.1);
    color: #11998e;
    border: 1px solid rgba(56, 239, 125, 0.2);
  }
}

// 终端监控与日志卡片
.bus-card {
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;

      .section-icon {
        color: rgb(0, 190, 190);
        font-size: 14px;
      }
    }
  }
}

.terminal-container {
  height: 180px;
  background-color: #0d1117; 
  border-radius: 6px;
  padding: 10px;
  overflow-y: auto;
  font-family: Consolas, Monaco, Courier, monospace;
  font-size: 10px;
  line-height: 1.4;

  &.dispatcher {
    height: 195px;
    background-color: #0b1d30;
  }

  &.simulator-terminal {
    height: 130px;
    background-color: #050e18;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .log-line {
    margin-bottom: 4px;
    white-space: pre-wrap;
    word-break: break-all;

    &.info { color: #8b949e; }
    &.success { color: #38ef7d; }
    &.error { color: #f5576c; }
    &.warning { color: #ff9800; }
    &.primary { color: #00bcd4; }

    .log-time {
      color: rgb(0, 190, 190);
      margin-right: 4px;
    }

    .log-tag {
      color: #f093fb;
      margin-right: 4px;
    }
  }
}

.json-code {
  color: #a5d6ff;
  font-size: 10px;
  margin: 0;
  white-space: pre-wrap;

  &.scrollable-pre {
    max-height: 240px;
    overflow-y: auto;
  }
}

// T2: 规则配置与仿真器样式
.text-teal {
  color: rgb(0, 190, 190);
}

.when-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.prefix-tag {
  font-size: 12px;
  color: rgb(96, 98, 102);
}

.text-hint {
  font-size: 11px;
  color: #909399;
}

.where-container {
  background: #f8fafc;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid rgb(235, 238, 245);
}

.where-filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.then-logic-container {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgb(235, 238, 245);
  width: 100%;
}

.then-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.baseline-detail {
  display: flex;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed rgb(228, 231, 237);

  &.dynamic {
    flex-wrap: wrap;
  }

  .hint-block {
    width: 100%;
    font-size: 11px;
    color: rgb(0, 190, 190);
  }
}

.matrix-container {
  display: flex;
  gap: 12px;
  width: 100%;
  overflow-x: auto;
  padding-bottom: 4px;
}

.matrix-level-card {
  flex: 1;
  min-width: 180px;
  border: 1px solid;
  border-radius: 6px;
  background: white;
  overflow: hidden;

  &.border-yellow { border-color: rgba(230, 162, 44, 0.3); }
  &.border-orange { border-color: rgba(224, 86, 36, 0.3); }
  &.border-red { border-color: rgba(245, 87, 108, 0.3); }

  .level-header {
    padding: 6px 10px;
    font-size: 11px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &.bg-yellow-soft { background: #fdf6ec; color: #e6a23c; }
    &.bg-orange-soft { background: #fff5eb; color: #ff9800; }
    &.bg-red-soft { background: #fef0f0; color: #f56c6c; }
  }

  .level-body {
    padding: 8px;
    font-size: 11px;
    color: rgb(96, 98, 102);

    .level-field {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .channel-desc {
      display: block;
      color: #999;
      font-size: 10px;
    }
  }
}

.template-editor-container {
  width: 100%;
}

.placeholder-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  .tag-title {
    font-size: 11px;
    color: rgb(96, 98, 102);
  }
}

.template-live-render {
  background: #f0fafb;
  border: 1px solid #cceef0;
  border-radius: 6px;
  padding: 8px 12px;

  .preview-title {
    font-size: 11px;
    font-weight: bold;
    color: rgb(0, 190, 190);
    margin-bottom: 4px;
  }

  .preview-body {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.8);
    line-height: 1.4;
  }
}

.btn-primary-teal {
  background-color: rgb(0, 190, 190);
  border-color: rgb(0, 190, 190);
  color: white;

  &:hover {
    background-color: #00bebe;
    border-color: #00bebe;
  }
}

.btn-success-green {
  background-color: #38ef7d;
  border-color: #38ef7d;
  color: white;

  &:hover {
    background-color: #2ece6f;
    border-color: #2ece6f;
  }
}

// 仿真控制台样式
.simulator-wrapper {
  padding: 8px 0;

  .custom-steps {
    :deep(.el-step__title) {
      font-size: 11px !important;
    }
  }
}

.simulator-controls {
  background: #f8fafc;
  border: 1px solid rgb(235, 238, 245);
  border-radius: 6px;
  padding: 12px;

  .sim-desc {
    font-size: 11px;
    color: rgb(96, 98, 102);
    margin: 0 0 10px 0;
    line-height: 1.4;
  }
}

.sim-slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgb(96, 98, 102);
  margin-bottom: 6px;
}

.current-warning-status {
  font-size: 12px;
  color: rgb(96, 98, 102);
  display: flex;
  align-items: center;
  gap: 8px;

  .badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
    color: white;

    &.badge-normal { background: #38ef7d; }
    &.badge-yellow { background: #e6a23c; }
    &.badge-orange { background: #ff9800; }
    &.badge-red { background: #f56c6c; }
  }
}

.sim-complete-box {
  padding: 10px 0;

  .complete-icon {
    font-size: 42px;
  }

  .complete-text {
    font-size: 14px;
    font-weight: bold;
    color: #303133;
    margin: 8px 0 4px 0;
  }

  .complete-desc {
    font-size: 11px;
    color: rgb(96, 98, 102);
    margin: 0;
  }
}

.sim-logs-title {
  font-size: 11px;
  font-weight: bold;
  color: rgb(96, 98, 102);
  margin-bottom: 6px;
}

.empty-terminal-text {
  color: rgba(255,255,255,0.3);
  font-size: 11px;
  text-align: center;
  padding-top: 40px;
}

.rule-edit-card {
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 14px;
      font-weight: 500;
    }

    .quick-templates {
      font-size: 11px;
      color: rgb(96, 98, 102);
      display: flex;
      align-items: center;

      .template-label {
        margin-right: 8px;
        color: rgb(96, 98, 102);
      }
    }
  }
}

.form-divider {
  margin: 20px 0;
  :deep(.el-divider__text) {
    font-size: 12px;
    color: rgb(0, 190, 190);
    font-weight: 500;
  }
}

.checkbox-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 12px;
  background-color: rgb(240, 242, 245);
  border-radius: 6px;
  width: 100%;

  :deep(.el-checkbox) {
    height: auto;
    margin-right: 0;
    .el-checkbox__label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.8);
    }
  }
}

.form-hint {
  font-size: 11px;
  color: rgb(96, 98, 102);
}

.dynamic-config-panel {
  background-color: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid rgb(0, 190, 190);
  margin-bottom: 12px;
}

.formula-preview {
  font-size: 12px;
  color: rgb(96, 98, 102);
  margin-left: 120px;
  margin-top: 4px;

  .formula-code {
    font-family: monospace;
    color: #e6a23c;
    background-color: #fffaf0;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #fdf6ec;
  }
}

// 规则预览卡片
.preview-card {
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .card-title {
      font-size: 12px;
      font-weight: 500;
    }
  }

  .expr-box {
    .expr-title {
      font-size: 11px;
      font-weight: bold;
      color: rgb(96, 98, 102);
      margin-bottom: 6px;
    }

    .expr-natural {
      background-color: #f0f9fa;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e0f2f1;
      margin-bottom: 12px;

      .expr-text {
        font-size: 12px;
        line-height: 1.5;
        color: rgba(0, 0, 0, 0.8);
        margin: 0;
      }
    }

    .expr-code {
      pre {
        background-color: #0d1117;
        padding: 10px;
        border-radius: 6px;
        margin: 0;
        overflow-x: auto;
        code {
          color: #7ee787;
          font-size: 10px;
          font-family: monospace;
        }
      }
    }
  }
}

// 已部署规则库
.deployed-rules-card {
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;

  .card-header {
    .card-title {
      font-size: 12px;
      font-weight: 500;
    }
  }

  .deployed-rules-list {
    max-height: 280px;
    overflow-y: auto;
  }

  .deployed-rule-item {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid rgb(235, 238, 245);
    background-color: rgb(250, 250, 250);
    margin-bottom: 8px;

    .rule-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      
      .rule-name-tag {
        font-size: 12px;
        font-weight: bold;
      }
    }

    .rule-expr {
      font-size: 11px;
      color: rgb(96, 98, 102);
      line-height: 1.4;
      margin-bottom: 6px;
    }

    .rule-bottom {
      font-size: 10px;
      color: #999;
      display: flex;
      align-items: center;
      
      .rule-meta-tag {
        color: rgb(96, 98, 102);
      }
    }
  }
}

// T3: 数据接入样式
.integration-card {
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .card-title {
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;

      .section-icon {
        color: rgb(0, 190, 190);
        font-size: 16px;
      }
    }
  }
}

.mapper-row {
  display: flex;
  align-items: center;
  width: 100%;
  
  .mapper-part {
    font-size: 12px;
    color: rgb(96, 98, 102);
  }
}

.mapping-card {
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;

  .card-header {
    .card-title {
      font-size: 13px;
      font-weight: 500;
    }
  }
}

.mapping-diagram {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  position: relative;

  .mapping-column {
    width: 42%;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .column-title {
      font-size: 12px;
      font-weight: bold;
      color: rgb(96, 98, 102);
      margin-bottom: 4px;
      text-align: center;
      padding-bottom: 6px;
      border-bottom: 2px solid rgb(228, 231, 237);
    }
  }

  .mapping-node {
    background-color: rgb(250, 250, 250);
    border: 1px solid rgb(235, 238, 245);
    border-radius: 6px;
    padding: 10px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: monospace;

    .source-tag {
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 4px;
      font-family: sans-serif;

      &.Kafka\/流 {
        background-color: rgba(56, 239, 125, 0.15);
        color: #11998e;
      }
      &.DWD\/批 {
        background-color: rgba(240, 147, 251, 0.15);
        color: #764ba2;
      }
    }

    &.matched {
      border-left: 3px solid rgb(0, 190, 190);
      background-color: #f0f9fa;
      
      .datatype-tag {
        font-size: 9px;
        background-color: rgba(0, 190, 190, 0.1);
        color: rgb(0, 190, 190);
        padding: 1px 4px;
        border-radius: 4px;
        font-family: sans-serif;
      }
    }
  }

  .mapping-lines-svg {
    position: absolute;
    left: 42%;
    width: 16%;
    top: 36px;
    height: 220px;
    pointer-events: none;
  }
}

.sample-parse-card {
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;

  .card-header {
    .card-title {
      font-size: 13px;
      font-weight: 500;
    }
  }

  .inspector-box {
    border: 1px solid rgb(235, 238, 245);
    border-radius: 6px;
    overflow: hidden;

    .inspector-header {
      background-color: rgb(250, 250, 250);
      padding: 8px 12px;
      border-bottom: 1px solid rgb(235, 238, 245);
    }

    .inspector-body {
      padding: 10px;
      background-color: #0d1117;
      min-height: 180px;
      overflow-x: auto;
    }
  }
}

.mt-16 { margin-top: 16px; }
.mt-8 { margin-top: 8px; }
.mt-4 { margin-top: 4px; }

// Flink UI 动效关键帧
@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 239, 125, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(56, 239, 125, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 239, 125, 0); }
}

@keyframes pulse-border {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.12); opacity: 0; }
}

@keyframes flow-particle {
  0% { left: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}

@keyframes flow-particle-vertical {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

@keyframes flow-vertical {
  0% { transform: translateY(-10px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(10px); opacity: 0; }
}

@keyframes flow-vertical-up {
  0% { transform: translateY(10px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-10px); opacity: 0; }
}
</style>
