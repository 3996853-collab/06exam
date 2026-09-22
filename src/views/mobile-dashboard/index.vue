<template>
  <div class="mobile-dashboard-page">
    <!-- PC Top Navigation / Control Bar -->
    <div class="control-bar">
      <div class="bar-left">
        <el-icon class="icon"><Cellphone /></el-icon>
        <span class="title">小程序移动端指标看板</span>
        <el-tag size="small" type="success" effect="light" class="tag">T+1 跑批数据 (出站T-2)</el-tag>
      </div>

      <div class="bar-right">
        <!-- 部门机构切换 -->
        <div class="org-selector-group">
          <span class="lbl">查看机构:</span>
          <el-select v-model="metricStore.currentOrgId" size="small" class="org-select" @change="onOrgChange">
            <el-option
              v-for="org in metricStore.orgList"
              :key="org.id"
              :label="org.name"
              :value="org.id"
            >
              <div class="org-option-row">
                <span>{{ org.name }}</span>
                <el-tag size="small" :type="org.type === 'headquarter' ? 'danger' : org.type === 'hub' ? 'primary' : 'info'">
                  {{ org.type === 'headquarter' ? '总部' : org.type === 'hub' ? '分拨' : '集配' }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 归档日期 (默认T-1) -->
        <el-date-picker
          v-model="selectedDate"
          type="date"
          size="small"
          placeholder="数据归档日"
          value-format="YYYY-MM-DD"
          :clearable="false"
          class="date-picker"
        />

        <!-- 视图模式切换 -->
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="mobile">真机模拟 (390px)</el-radio-button>
          <el-radio-button label="responsive">响应式平铺</el-radio-button>
        </el-radio-group>

        <!-- 进入总部配置工具 -->
        <el-button size="small" type="primary" plain :icon="Setting" @click="goToConfig">
          总部配置工具
        </el-button>
      </div>
    </div>

    <!-- Main Container -->
    <div class="content-wrapper" :class="{ 'is-mobile-frame': viewMode === 'mobile' }">
      <div class="phone-shell">
        <!-- 1. 小程序顶部状态栏 -->
        <div class="phone-status-bar">
          <span class="time">{{ currentClock }}</span>
          <div class="notch-camera"></div>
          <div class="status-icons">
            <span class="signal">5G</span>
            <span class="battery">100%</span>
          </div>
        </div>

        <!-- 2. 小程序原生导航栏带微信胶囊 -->
        <div class="mini-app-navbar">
          <div class="nav-title-area">
            <div class="org-badge-wrap" @click="showOrgDrawer = true">
              <span class="nav-title">{{ currentOrg.name }}</span>
              <el-icon class="arrow"><ArrowDown /></el-icon>
            </div>
            <span class="nav-subtitle">
              {{ currentOrg.region }} · 数据归档日: {{ selectedDate }} (T-1)
            </span>
          </div>
          <div class="wechat-capsule">
            <span class="capsule-dots">•••</span>
            <span class="capsule-divider"></span>
            <span class="capsule-circle">○</span>
          </div>
        </div>

        <!-- 3. 总部机构下：顶部可搜索中心，查看对应中心情况 (需求⑤) -->
        <div v-if="isHeadquarter" class="hq-search-bar">
          <div class="search-input-wrapper">
            <el-icon class="search-icon"><Search /></el-icon>
            <input
              v-model="centerSearchKeyword"
              type="text"
              placeholder="搜索分拨中心 / 集配站 (如: 广州, 京津冀, 成都)..."
              class="mobile-search-input"
              @focus="isSearching = true"
            />
            <el-icon v-if="centerSearchKeyword" class="clear-icon" @click="centerSearchKeyword = ''">
              <CircleClose />
            </el-icon>
          </div>

          <!-- 搜索联想下拉浮层 -->
          <div v-if="isSearching && filteredSearchCenters.length > 0" class="search-results-dropdown">
            <div class="res-tip">匹配到以下分拨与集配机构 (点击直达)：</div>
            <div
              v-for="center in filteredSearchCenters"
              :key="center.id"
              class="search-res-item"
              @click="selectSearchedCenter(center)"
            >
              <div class="res-info">
                <span class="res-name">{{ center.name }}</span>
                <span class="res-reg">{{ center.region }}</span>
              </div>
              <el-tag size="small" :type="center.type === 'hub' ? 'primary' : 'info'">
                {{ center.type === 'hub' ? '分拨中心' : '集配站' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 当前非总部机构时的提示 Banner -->
        <div v-else class="branch-view-banner">
          <div class="bb-left">
            <el-tag size="small" type="warning" effect="dark">分机构数据</el-tag>
            <span class="bb-txt">当前查看：<b>{{ currentOrg.name }}</b> 独立运营指标</span>
          </div>
          <el-button link size="small" type="primary" @click="metricStore.currentOrgId = 'hq'">
            返回总部视角
          </el-button>
        </div>

        <!-- 4. 顶部 2 栏切换：业务数据 vs 基础数据 -->
        <div class="top-segmented-bar">
          <div
            class="segment-item"
            :class="{ 'active': activeMainTab === 'business' }"
            @click="switchMainTab('business')"
          >
            <el-icon class="seg-icon"><DataAnalysis /></el-icon>
            <span>业务数据</span>
            <div v-if="activeMainTab === 'business'" class="active-indicator"></div>
          </div>
          <div
            class="segment-item"
            :class="{ 'active': activeMainTab === 'basic' }"
            @click="switchMainTab('basic')"
          >
            <el-icon class="seg-icon"><Files /></el-icon>
            <span>基础数据</span>
            <div v-if="activeMainTab === 'basic'" class="active-indicator"></div>
          </div>
        </div>

        <!-- 5. 可滚动卡片内容区 -->
        <div class="cards-scroll-body" ref="scrollContainer" @click="isSearching = false">
          <!-- 业务数据分类 -->
          <template v-if="activeMainTab === 'business'">
            <div class="category-header-banner">
              <div class="banner-title">
                <span class="dot"></span>
                <span>{{ currentSubCategoryTitle }}</span>
                <span class="org-scope-badge">{{ isHeadquarter ? '全网汇总' : currentOrg.name }}</span>
              </div>
              <span class="banner-sub">共 {{ currentMetricList.length }} 项监控指标 (默认T-1, 出站T-2)</span>
            </div>

            <div v-if="currentMetricList.length === 0" class="empty-tip">
              <el-empty description="暂无该分类的指标数据" />
            </div>

            <!-- 标准指标卡片列表 -->
            <div
              v-for="item in currentMetricList"
              :key="item.id"
              class="metric-card"
              :class="{ 'expanded': expandedMap[item.metricKey] }"
            >
              <!-- Card Header -->
              <div class="card-header" @click="toggleExpand(item.metricKey)">
                <div class="metric-name-group">
                  <span class="metric-name">{{ item.displayName }}</span>
                  <!-- 需求②: 出站及时率特别展示 T-2 归档角标 -->
                  <el-tag
                    v-if="item.metricKey === 'outbound_timeliness_rate'"
                    size="small"
                    type="danger"
                    effect="dark"
                    class="t2-tag"
                  >
                    T-2 数据
                  </el-tag>
                  <el-tag
                    v-else
                    size="small"
                    :type="item.trendType === 'positive' ? 'success' : 'warning'"
                    effect="plain"
                    class="trend-tag"
                  >
                    {{ item.trendType === 'positive' ? '正向指标' : '逆向指标' }}
                  </el-tag>
                </div>

                <div class="header-actions">
                  <span class="tap-hint">{{ expandedMap[item.metricKey] ? '折叠趋势' : '点击趋势' }}</span>
                  <div class="expand-icon" :class="{ 'rotated': expandedMap[item.metricKey] }">
                    <el-icon><ArrowDown /></el-icon>
                  </div>
                </div>
              </div>

              <!-- Card Value Row (需求④: 点击数值查看30天折线趋势，配置工具字体颜色生效) -->
              <div class="card-value-row" @click="toggleExpand(item.metricKey)">
                <div class="val-main-box">
                  <span
                    class="main-val"
                    :style="{ color: getMetricValueColor(item) }"
                  >
                    {{ formatNumber(getScopedValue(item)) }}
                  </span>
                  <span v-if="item.unit" class="unit">{{ item.unit }}</span>
                </div>

                <!-- 目标值展示 (配置工具③配置的目标值) -->
                <div v-if="item.targetValue" class="target-val-box">
                  <span class="t-lbl">目标:</span>
                  <span class="t-val">{{ formatNumber(getScopedTarget(item)) }}{{ item.unit }}</span>
                  <span
                    class="t-status"
                    :class="isTargetAchieved(item) ? 'achieved' : 'unachieved'"
                  >
                    {{ isTargetAchieved(item) ? '已达标' : '未达标' }}
                  </span>
                </div>
              </div>

              <!-- Card Rates Row (日环比 / 周同比，配置工具④字体颜色生效) -->
              <div class="card-rates-row">
                <!-- 日环比 -->
                <div
                  class="rate-badge"
                  :style="getRateBadgeStyle(item.dod ?? 0, item)"
                >
                  <span class="rate-label">日环比</span>
                  <el-icon v-if="(item.dod ?? 0) > 0"><Top /></el-icon>
                  <el-icon v-else-if="(item.dod ?? 0) < 0"><Bottom /></el-icon>
                  <span class="rate-val">{{ Math.abs(item.dod ?? 0) }}%</span>
                </div>

                <!-- 周同比 -->
                <div
                  class="rate-badge"
                  :style="getRateBadgeStyle(item.wow ?? 0, item)"
                >
                  <span class="rate-label">周同比</span>
                  <el-icon v-if="(item.wow ?? 0) > 0"><Top /></el-icon>
                  <el-icon v-else-if="(item.wow ?? 0) < 0"><Bottom /></el-icon>
                  <span class="rate-val">{{ Math.abs(item.wow ?? 0) }}%</span>
                </div>

                <!-- 需求④: 总部机构下，每项数据支持下钻到中心&集配 (例如总操作量 -> 广州, 京津冀, 成都...) -->
                <div
                  v-if="isHeadquarter"
                  class="breakdown-toggle-btn"
                  :class="{ 'active': breakdownMap[item.metricKey] }"
                  @click.stop="toggleBreakdown(item.metricKey)"
                >
                  <el-icon><Histogram /></el-icon>
                  <span>{{ breakdownMap[item.metricKey] ? '收起下钻' : '下钻分拨&集配' }}</span>
                </div>
              </div>

              <!-- 需求④: 下钻展示各大分拨中心与集配站的贡献明细列表 -->
              <transition name="drilldown">
                <div v-if="breakdownMap[item.metricKey]" class="center-breakdown-panel" @click.stop>
                  <div class="breakdown-header">
                    <div class="bh-title">
                      <el-icon><OfficeBuilding /></el-icon>
                      <span>{{ item.displayName }} - 各中心/集配下钻排行</span>
                    </div>
                    <span class="bh-tip">点击中心可切换深入查看</span>
                  </div>

                  <div class="breakdown-list">
                    <div
                      v-for="(subCenter, bIdx) in metricStore.getMetricBreakdown(item.metricKey)"
                      :key="subCenter.orgId"
                      class="breakdown-item-row"
                      @click="drillIntoCenter(subCenter.orgId)"
                    >
                      <div class="center-rank">
                        <span class="rank-idx" :class="{ 'top-3': bIdx < 3 }">{{ bIdx + 1 }}</span>
                        <div class="center-name-box">
                          <span class="center-name">{{ subCenter.orgName }}</span>
                          <span class="center-type">{{ subCenter.region }} · {{ subCenter.type }}</span>
                        </div>
                      </div>

                      <div class="center-val-box">
                        <div class="val-line">
                          <span class="b-val">{{ subCenter.value }}</span>
                          <span class="b-u">{{ subCenter.unit }}</span>
                        </div>
                        <div class="b-dod" :class="subCenter.dod >= 0 ? 'text-rise' : 'text-fall'">
                          环比: {{ subCenter.dod >= 0 ? '+' : '' }}{{ subCenter.dod }}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>

              <!-- 需求③: ECharts 30天完成值趋势图 (点击点显示日期和完成值) -->
              <transition name="drilldown">
                <div
                  v-if="expandedMap[item.metricKey]"
                  class="chart-drawer"
                  @click.stop
                >
                  <div class="chart-title">
                    <span class="title-text">
                      <el-icon><TrendCharts /></el-icon> 近 30 天走势波动 (点击坐标点查看明细)
                    </span>
                    <span v-if="selectedChartPoint[item.metricKey]" class="active-point-badge">
                      已选: {{ selectedChartPoint[item.metricKey].date }} ({{ selectedChartPoint[item.metricKey].value }}{{ item.unit }})
                    </span>
                  </div>

                  <!-- 选中点的交互明细条 (需求③) -->
                  <div v-if="selectedChartPoint[item.metricKey]" class="point-detail-bar">
                    <div class="pd-item">
                      <span class="pd-lbl">日期:</span>
                      <span class="pd-val">{{ selectedChartPoint[item.metricKey].date }}</span>
                    </div>
                    <div class="pd-item">
                      <span class="pd-lbl">完成值:</span>
                      <span class="pd-val highlight">{{ selectedChartPoint[item.metricKey].value }} {{ item.unit }}</span>
                    </div>
                    <div v-if="item.targetValue" class="pd-item">
                      <span class="pd-lbl">目标值:</span>
                      <span class="pd-val">{{ formatNumber(getScopedTarget(item)) }} {{ item.unit }}</span>
                    </div>
                  </div>

                  <div class="echart-box" :ref="el => setChartRef(el, item.metricKey)"></div>
                </div>
              </transition>
            </div>
          </template>

          <!-- 基础数据分类 -->
          <template v-else>
            <!-- 场地信息 (融合配置工具①的温控评级标准) -->
            <div v-if="activeSubTab === 'site_info'" class="basic-section">
              <!-- 中心地址卡片 -->
              <div class="site-hero-card">
                <div class="site-badge">
                  <el-icon><Location /></el-icon> {{ currentOrg.name }}
                </div>
                <div class="site-name">{{ currentOrg.name }} · 基础设施枢纽</div>
                <div class="site-addr">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>{{ currentOrg.region }}核心物流枢纽园区 · 标准冷链智慧立体仓储</span>
                </div>
                <div class="site-tags">
                  <span class="tag-item">现代化多温区</span>
                  <span class="tag-item">全封闭月台</span>
                  <span class="tag-item">24h温湿度智能传感</span>
                </div>
              </div>

              <!-- 月台与温控库房明细卡片 (由温控评级标准驱动) -->
              <div class="site-grid">
                <div
                  v-for="rule in metricStore.tempRatingRules"
                  :key="rule.id"
                  class="facility-card"
                >
                  <div class="fac-header">
                    <div class="fac-title">
                      <el-icon class="fac-icon" :style="{ color: rule.normalTextColor }">
                        <component :is="rule.code === 'dock' ? Van : rule.code === 'chilled' ? MostlyCloudy : Compass" />
                      </el-icon>
                      <span>{{ rule.zoneName }}</span>
                    </div>
                    <!-- 温控评级 -->
                    <el-tag
                      size="small"
                      effect="dark"
                      :style="{ backgroundColor: rule.normalTextColor, borderColor: rule.normalTextColor }"
                    >
                      {{ rule.currentRating }}
                    </el-tag>
                  </div>

                  <div class="fac-rule-tip">
                    <span class="rule-lbl">控温标准:</span>
                    <span class="rule-val">{{ rule.standardRange }}</span>
                    <span class="rule-desc">({{ rule.ratingCriteria }})</span>
                  </div>

                  <div class="fac-stats">
                    <div class="stat-col">
                      <div class="stat-num" :style="{ color: rule.normalTextColor }">
                        {{ rule.currentTemp }} <span class="u">℃</span>
                      </div>
                      <div class="stat-lbl">实时监控均温</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-num">
                        {{ rule.code === 'dock' ? '36个' : rule.code === 'chilled' ? '6,800㎡' : '5,200㎡' }}
                      </div>
                      <div class="stat-lbl">{{ rule.code === 'dock' ? '月台泊位数' : '温区总面积' }}</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-num" :style="{ color: rule.fallRateColor }">
                        -0.4℃
                      </div>
                      <div class="stat-lbl">24h环比温差</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 物资信息 -->
            <div v-else-if="activeSubTab === 'material_info'" class="basic-section">
              <div class="material-banner">
                <div class="banner-title">
                  <el-icon><Box /></el-icon> {{ currentOrg.name }} - 冷链核心周转物资统计
                </div>
                <div class="banner-desc">实时监控在库物资库存、在途借调与完好状态</div>
              </div>

              <div class="materials-list">
                <div
                  v-for="mat in getMetricsBySub('material_info')"
                  :key="mat.id"
                  class="material-item-card"
                >
                  <div class="mat-left">
                    <div class="mat-name">{{ mat.displayName }}</div>
                    <div class="mat-extra">{{ mat.extra }}</div>
                  </div>
                  <div class="mat-right">
                    <div class="mat-val">
                      {{ formatNumber(Number(mat.value) * currentOrg.ratio) }}
                      <span class="unit">{{ mat.unit }}</span>
                    </div>
                    <div class="mat-trend">
                      周环比: <span class="text-success">+{{ mat.wow }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 服务网点 (点击交货网点数/提货网点数下钻展开) -->
            <div v-else-if="activeSubTab === 'service_outlet'" class="basic-section">
              <!-- 网点总量概览 -->
              <div class="outlet-hero-card">
                <div class="title-row">
                  <span class="title"><el-icon><Connection /></el-icon> {{ currentOrg.name }} - 服务网点总览</span>
                  <el-tag size="small" type="success">100% 数字化直连</el-tag>
                </div>
                <div class="outlet-main-stat">
                  <div class="huge-number">
                    {{ Math.round(1680 * currentOrg.ratio) }} <span class="unit">家</span>
                  </div>
                  <div class="sub-lbl">服务网点总数 (覆盖周边重点核心商圈及冷链集配网络)</div>
                </div>

                <!-- 进度条占比 -->
                <div class="progress-section">
                  <div class="prog-labels">
                    <span class="delivery-lbl">交货网点 {{ Math.round(1120 * currentOrg.ratio) }} 家 (66.7%)</span>
                    <span class="pickup-lbl">提货网点 {{ Math.round(560 * currentOrg.ratio) }} 家 (33.3%)</span>
                  </div>
                  <div class="dual-progress-bar">
                    <div class="bar-delivery" style="width: 66.7%"></div>
                    <div class="bar-pickup" style="width: 33.3%"></div>
                  </div>
                </div>
              </div>

              <!-- 分类可点击卡片 -->
              <div class="outlet-cards-grid">
                <!-- 交货网点数 -->
                <div
                  class="outlet-detail-card clickable"
                  :class="{ 'is-active': expandedOutletType === 'delivery' }"
                  @click="toggleOutletExpand('delivery')"
                >
                  <div class="card-top-action">
                    <div class="card-icon delivery"><Van /></div>
                    <div class="drill-tip" :class="{ 'rotated': expandedOutletType === 'delivery' }">
                      <span>{{ expandedOutletType === 'delivery' ? '收起明细' : '下钻展开' }}</span>
                      <el-icon><ArrowDown /></el-icon>
                    </div>
                  </div>
                  <div class="card-info">
                    <div class="name">交货网点数</div>
                    <div class="val">{{ Math.round(1120 * currentOrg.ratio) }} <span class="u">家</span></div>
                    <div class="desc">截单时间 · 规划交货时间</div>
                  </div>
                </div>

                <!-- 提货网点数 -->
                <div
                  class="outlet-detail-card clickable"
                  :class="{ 'is-active': expandedOutletType === 'pickup' }"
                  @click="toggleOutletExpand('pickup')"
                >
                  <div class="card-top-action">
                    <div class="card-icon pickup"><Box /></div>
                    <div class="drill-tip" :class="{ 'rotated': expandedOutletType === 'pickup' }">
                      <span>{{ expandedOutletType === 'pickup' ? '收起明细' : '下钻展开' }}</span>
                      <el-icon><ArrowDown /></el-icon>
                    </div>
                  </div>
                  <div class="card-info">
                    <div class="name">提货网点数</div>
                    <div class="val">{{ Math.round(560 * currentOrg.ratio) }} <span class="u">家</span></div>
                    <div class="desc">提货截单 · 打卡 · 规划发车</div>
                  </div>
                </div>
              </div>

              <!-- 下钻展开区域：交货网点明细 -->
              <transition name="drilldown">
                <div v-if="expandedOutletType === 'delivery'" class="outlet-drilldown-box delivery-box">
                  <div class="drilldown-header">
                    <div class="dh-title">
                      <el-icon class="text-delivery"><Van /></el-icon>
                      <span>交货网点排期明细</span>
                      <span class="count-tag">共 {{ Math.round(1120 * currentOrg.ratio) }} 家</span>
                    </div>
                    <span class="close-txt" @click="expandedOutletType = null">收起</span>
                  </div>

                  <div class="outlet-item-list">
                    <div v-for="item in deliveryOutletList" :key="item.id" class="outlet-row-card">
                      <div class="row-top">
                        <span class="outlet-title">{{ item.name }}</span>
                        <el-tag size="small" type="primary" effect="plain">{{ item.tag }}</el-tag>
                      </div>
                      <div class="schedule-grid delivery-schedule">
                        <div class="schedule-item">
                          <span class="lbl"><el-icon><Timer /></el-icon> 截单时间</span>
                          <span class="val highlight-orange">{{ item.cutoffTime }}</span>
                        </div>
                        <div class="schedule-item">
                          <span class="lbl"><el-icon><Clock /></el-icon> 规划交货时间</span>
                          <span class="val highlight-cyan">{{ item.plannedDeliveryTime }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>

              <!-- 下钻展开区域：提货网点明细 -->
              <transition name="drilldown">
                <div v-if="expandedOutletType === 'pickup'" class="outlet-drilldown-box pickup-box">
                  <div class="drilldown-header">
                    <div class="dh-title">
                      <el-icon class="text-pickup"><Box /></el-icon>
                      <span>提货网点时效明细</span>
                      <span class="count-tag">共 {{ Math.round(560 * currentOrg.ratio) }} 家</span>
                    </div>
                    <span class="close-txt" @click="expandedOutletType = null">收起</span>
                  </div>

                  <div class="outlet-item-list">
                    <div v-for="item in pickupOutletList" :key="item.id" class="outlet-row-card">
                      <div class="row-top">
                        <span class="outlet-title">{{ item.name }}</span>
                        <el-tag size="small" type="warning" effect="plain">{{ item.tag }}</el-tag>
                      </div>
                      <div class="schedule-grid pickup-schedule">
                        <div class="schedule-item">
                          <span class="lbl"><el-icon><Timer /></el-icon> 提货截单时间</span>
                          <span class="val highlight-orange">{{ item.pickupCutoffTime }}</span>
                        </div>
                        <div class="schedule-item">
                          <span class="lbl"><el-icon><User /></el-icon> 规划打卡时间</span>
                          <span class="val highlight-blue">{{ item.plannedClockInTime }}</span>
                        </div>
                        <div class="schedule-item">
                          <span class="lbl"><el-icon><Promotion /></el-icon> 规划发车时间</span>
                          <span class="val highlight-green">{{ item.plannedDepartureTime }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </template>
        </div>

        <!-- 6. 小程序原生底部 TabBar -->
        <div class="phone-bottom-tabbar">
          <div
            v-for="tab in currentSubCategoryTabs"
            :key="tab.key"
            class="tab-bar-item"
            :class="{ 'active': activeSubTab === tab.key }"
            @click="activeSubTab = tab.key"
          >
            <el-icon class="tab-icon">
              <component :is="tab.icon" />
            </el-icon>
            <span class="tab-label">{{ tab.name }}</span>
            <span v-if="activeSubTab === tab.key" class="tab-dot"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  Cellphone,
  Setting,
  ArrowDown,
  Top,
  Bottom,
  TrendCharts,
  DataAnalysis,
  Files,
  Box,
  Van,
  Odometer,
  OfficeBuilding,
  Location,
  Connection,
  MostlyCloudy,
  Compass,
  Timer,
  Clock,
  User,
  Promotion,
  Search,
  CircleClose,
  Histogram
} from '@element-plus/icons-vue'
import {
  useMetricConfigStore,
  MainCategory,
  MetricConfigItem,
  OrgUnit
} from '@/store/modules/metricConfig'

const router = useRouter()
const metricStore = useMetricConfigStore()

const viewMode = ref<'mobile' | 'responsive'>('mobile')
// 需求②: 当日默认展示 T-1 日数据 (2026-09-21)
const selectedDate = ref('2026-09-21')
const currentClock = ref('09:41')
const scrollContainer = ref<HTMLElement | null>(null)

// 需求⑤: 顶部中心搜索
const centerSearchKeyword = ref('')
const isSearching = ref(false)
const showOrgDrawer = ref(false)

// 当前选中的机构对象
const currentOrg = computed<OrgUnit>(() => {
  return metricStore.orgList.find(o => o.id === metricStore.currentOrgId) || metricStore.orgList[0]
})

const isHeadquarter = computed(() => currentOrg.value.type === 'headquarter')

// 搜索匹配的分拨中心/集配站
const filteredSearchCenters = computed(() => {
  if (!centerSearchKeyword.value.trim()) return []
  const kw = centerSearchKeyword.value.trim().toLowerCase()
  return metricStore.orgList.filter(o => o.type !== 'headquarter' && (
    o.name.toLowerCase().includes(kw) || o.region.toLowerCase().includes(kw)
  ))
})

const selectSearchedCenter = (center: OrgUnit) => {
  metricStore.currentOrgId = center.id
  centerSearchKeyword.value = ''
  isSearching.value = false
}

const onOrgChange = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

// 1. 顶部主分类切换：业务数据 vs 基础数据
const activeMainTab = ref<MainCategory>('business')

// 2. 业务数据下的底部三项分类
const businessSubTabs = [
  { key: 'operation_volume', name: '操作量', icon: Box },
  { key: 'operation_quality', name: '操作质量', icon: Odometer },
  { key: 'transport_quality', name: '运输质量', icon: Van }
]

// 3. 基础数据下的底部三项分类
const basicSubTabs = [
  { key: 'site_info', name: '场地信息', icon: OfficeBuilding },
  { key: 'material_info', name: '物资信息', icon: Box },
  { key: 'service_outlet', name: '服务网点', icon: Connection }
]

// 当前子分类 Tab
const activeSubTab = ref<string>('operation_volume')

const currentSubCategoryTabs = computed(() => {
  return activeMainTab.value === 'business' ? businessSubTabs : basicSubTabs
})

const switchMainTab = (tab: MainCategory) => {
  activeMainTab.value = tab
  if (tab === 'business') {
    activeSubTab.value = 'operation_volume'
  } else {
    activeSubTab.value = 'site_info'
  }
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

watch(activeSubTab, () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
})

const currentSubCategoryTitle = computed(() => {
  const allTabs = [...businessSubTabs, ...basicSubTabs]
  return allTabs.find(t => t.key === activeSubTab.value)?.name || '指标明细'
})

// 控制服务网点下钻展开 ('delivery' | 'pickup' | null)
const expandedOutletType = ref<'delivery' | 'pickup' | null>(null)

const toggleOutletExpand = (type: 'delivery' | 'pickup') => {
  if (expandedOutletType.value === type) {
    expandedOutletType.value = null
  } else {
    expandedOutletType.value = type
  }
}

// 需求④: 控制各指标下钻各大中心明细的展开状态
const breakdownMap = ref<Record<string, boolean>>({})

const toggleBreakdown = (metricKey: string) => {
  breakdownMap.value[metricKey] = !breakdownMap.value[metricKey]
}

const drillIntoCenter = (orgId: string) => {
  metricStore.currentOrgId = orgId
}

// 需求①: 根据查看机构动态计算指标数值
const getScopedValue = (item: MetricConfigItem) => {
  if (typeof item.value !== 'number') return item.value ?? 0
  if (isHeadquarter.value) return item.value
  // 分拨中心/集配站显示本部门数据
  return Number((item.value * currentOrg.value.ratio).toFixed(1))
}

const getScopedTarget = (item: MetricConfigItem) => {
  if (!item.targetValue) return null
  if (isHeadquarter.value) return item.targetValue
  return Number((item.targetValue * currentOrg.value.ratio).toFixed(1))
}

// 判定是否达成目标
const isTargetAchieved = (item: MetricConfigItem) => {
  const val = getScopedValue(item)
  const target = getScopedTarget(item)
  if (typeof val !== 'number' || typeof target !== 'number') return true
  if (item.trendType === 'positive') {
    return val >= target
  } else {
    return val <= target
  }
}

// 获取完成值字体颜色 (根据配置工具④是否达成目标值配置)
const getMetricValueColor = (item: MetricConfigItem) => {
  if (!item.targetValue) return '#0f172a'
  const achieved = isTargetAchieved(item)
  return achieved ? (item.achievedColor || '#16a34a') : (item.unachievedColor || '#dc2626')
}

// 获取环比徽章样式 (配置工具④字体颜色配置生效)
const getRateBadgeStyle = (rate: number, item: MetricConfigItem) => {
  if (rate === 0) return { background: '#f1f5f9', color: '#94a3b8' }
  const isUp = rate > 0
  const color = isUp ? (item.dodRiseColor || '#ef4444') : (item.dodFallColor || '#22c55e')
  const bg = isUp ? '#fef2f2' : '#f0fdf4'
  return {
    color,
    background: bg
  }
}

// 过滤当前子分类下的指标列表
const getMetricsBySub = (subKey: string) => {
  return metricStore.configs
    .filter(c => c.subCategory === subKey && c.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

const currentMetricList = computed(() => {
  return getMetricsBySub(activeSubTab.value)
})

// 控制展开折叠与 ECharts 实例管理 (需求③: 点击折线图上的某个点显示日期和完成值)
const expandedMap = ref<Record<string, boolean>>({})
const chartInstances: Record<string, echarts.ECharts> = {}
const chartDomRefs: Record<string, HTMLElement> = {}
const selectedChartPoint = ref<Record<string, { date: string; value: number }>>({})

const setChartRef = (el: any, key: string) => {
  if (el) {
    chartDomRefs[key] = el as HTMLElement
  }
}

const formatNumber = (val: number | string) => {
  if (typeof val === 'number') {
    return val.toLocaleString('zh-CN')
  }
  return val
}

const toggleExpand = async (metricKey: string) => {
  expandedMap.value[metricKey] = !expandedMap.value[metricKey]

  if (expandedMap.value[metricKey]) {
    await nextTick()
    setTimeout(() => {
      renderChart(metricKey)
    }, 100)
  } else {
    if (chartInstances[metricKey]) {
      chartInstances[metricKey].dispose()
      delete chartInstances[metricKey]
    }
  }
}

// 需求③: 渲染近 30 天 ECharts 走势，点击折线图上的点显示日期和完成值
const renderChart = (metricKey: string) => {
  const dom = chartDomRefs[metricKey]
  if (!dom) return

  if (chartInstances[metricKey]) {
    chartInstances[metricKey].dispose()
  }

  const chart = echarts.init(dom)
  chartInstances[metricKey] = chart

  const config = metricStore.configs.find(c => c.metricKey === metricKey)
  const scopedBase = getScopedValue(config || { value: 100 } as any)
  const baseNum = typeof scopedBase === 'number' ? scopedBase : 100

  // 模拟近 30 天走势数据
  const dates: string[] = []
  const values: number[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000)
    dates.push(`${d.getMonth() + 1}月${d.getDate()}日`)
    const fluctuation = (Math.sin(i / 2.5) * 0.12 + (Math.random() - 0.5) * 0.05)
    const val = Number((baseNum * (1 + fluctuation)).toFixed(1))
    values.push(val)
  }

  // 默认选中最新点
  selectedChartPoint.value[metricKey] = {
    date: dates[dates.length - 1],
    value: values[values.length - 1]
  }

  const isPositive = config?.trendType === 'positive'
  const themeColor = isPositive ? '#f56c6c' : '#00bebe'
  const areaColor = isPositive ? 'rgba(245, 108, 108, 0.18)' : 'rgba(0, 190, 190, 0.18)'

  const option: echarts.EChartsOption = {
    grid: {
      left: 42,
      right: 14,
      top: 20,
      bottom: 24
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 33, 64, 0.90)',
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontSize: 11 },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `<div style="font-family:sans-serif;">
          <div style="color:#94a3b8;font-size:10px;">${p.name}</div>
          <div style="font-size:13px;font-weight:bold;margin-top:2px;">完成值: ${p.value} ${config?.unit || ''}</div>
        </div>`
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisTick: { show: false },
      axisLabel: { color: '#909399', fontSize: 9, interval: 5 }
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: { show: false },
      axisLabel: { color: '#909399', fontSize: 9 }
    },
    series: [
      {
        name: config?.displayName || '完成值',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        data: values,
        lineStyle: { width: 2.4, color: themeColor },
        itemStyle: { color: themeColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: areaColor },
            { offset: 1, color: 'rgba(255, 255, 255, 0)' }
          ])
        }
      }
    ]
  }

  chart.setOption(option)

  // 需求③: 点击折线图上的某个点，显示日期和完成值
  chart.on('click', (params: any) => {
    if (params && params.name) {
      selectedChartPoint.value[metricKey] = {
        date: params.name,
        value: params.value
      }
    }
  })
}

// 机构切换重刷图表
watch(() => metricStore.currentOrgId, () => {
  Object.keys(expandedMap.value).forEach(key => {
    if (expandedMap.value[key]) {
      renderChart(key)
    }
  })
})

const goToConfig = () => {
  router.push('/dashboard-config')
}

// 服务网点数据源
const deliveryOutletList = [
  { id: 'd1', name: '上海青浦华新网点', cutoffTime: '17:00', plannedDeliveryTime: '次日 08:30', tag: '一级干线直达' },
  { id: 'd2', name: '苏州昆山花桥网点', cutoffTime: '17:30', plannedDeliveryTime: '次日 09:00', tag: '优先直送' },
  { id: 'd3', name: '杭州萧山钱江网点', cutoffTime: '16:45', plannedDeliveryTime: '次日 08:45', tag: '冷链专线' },
  { id: 'd4', name: '无锡新吴梅村网点', cutoffTime: '17:15', plannedDeliveryTime: '次日 09:15', tag: '标准配送' },
  { id: 'd5', name: '嘉兴秀洲高新网点', cutoffTime: '18:00', plannedDeliveryTime: '次日 09:30', tag: '定时达' },
  { id: 'd6', name: '南京江宁百家湖网点', cutoffTime: '16:30', plannedDeliveryTime: '次日 09:00', tag: '重点保供' }
]

const pickupOutletList = [
  { id: 'p1', name: '嘉兴南湖产地直采仓', pickupCutoffTime: '14:30', plannedClockInTime: '15:00', plannedDepartureTime: '15:30', tag: '源头产地仓' },
  { id: 'p2', name: '湖州德清生鲜集配仓', pickupCutoffTime: '14:00', plannedClockInTime: '14:30', plannedDepartureTime: '15:00', tag: '特色冷鲜仓' },
  { id: 'p3', name: '苏州阳澄湖特色前置仓', pickupCutoffTime: '15:00', plannedClockInTime: '15:30', plannedDepartureTime: '16:00', tag: '时令保鲜专仓' },
  { id: 'p4', name: '上海金山现代农业直采站', pickupCutoffTime: '15:30', plannedClockInTime: '16:00', plannedDepartureTime: '16:30', tag: '果蔬直发中心' },
  { id: 'p5', name: '南通海门禽蛋集约中心', pickupCutoffTime: '14:15', plannedClockInTime: '14:45', plannedDepartureTime: '15:15', tag: '恒温专用站' },
  { id: 'p6', name: '舟山定海海鲜直配中心', pickupCutoffTime: '13:30', plannedClockInTime: '14:00', plannedDepartureTime: '14:30', tag: '极速冷冻直发' }
]

onMounted(() => {
  if (currentMetricList.value.length > 0) {
    const firstKey = currentMetricList.value[0].metricKey
    toggleExpand(firstKey)
  }
})
</script>

<style scoped lang="scss">
.mobile-dashboard-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 84px);
  background-color: #eef2f7;

  // 顶部 PC 控制栏
  .control-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 12px 24px;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    z-index: 10;

    .bar-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .icon {
        font-size: 20px;
        color: #00bebe;
      }
      .title {
        font-size: 16px;
        font-weight: 600;
        color: #1f2d3d;
      }
      .tag {
        margin-left: 4px;
      }
    }

    .bar-right {
      display: flex;
      align-items: center;
      gap: 14px;

      .org-selector-group {
        display: flex;
        align-items: center;
        gap: 6px;

        .lbl {
          font-size: 12px;
          color: #64748b;
          white-space: nowrap;
        }

        .org-select {
          width: 170px;
        }
      }

      .date-picker {
        width: 140px;
      }
    }
  }

  // 核心展示区域
  .content-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 20px 16px 28px;

    &.is-mobile-frame {
      .phone-shell {
        width: 395px;
        max-width: 100%;
        height: 820px;
        border-radius: 42px;
        border: 11px solid #1f2937;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
        overflow: hidden;
      }
    }

    &:not(.is-mobile-frame) {
      .phone-shell {
        width: 100%;
        max-width: 960px;
        height: auto;
        min-height: 800px;
        border-radius: 14px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      }
      .phone-status-bar,
      .wechat-capsule {
        display: none;
      }
    }
  }

  .phone-shell {
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    // 1. 状态栏
    .phone-status-bar {
      height: 38px;
      background: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
      flex-shrink: 0;

      .notch-camera {
        width: 80px;
        height: 18px;
        background: #0f172a;
        border-radius: 12px;
      }
      .status-icons {
        display: flex;
        gap: 6px;
        font-size: 10px;
      }
    }

    // 2. 小程序导航条
    .mini-app-navbar {
      background: #fff;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;

      .nav-title-area {
        display: flex;
        flex-direction: column;

        .org-badge-wrap {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;

          .nav-title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.2px;
          }

          .arrow {
            font-size: 12px;
            color: #64748b;
          }
        }

        .nav-subtitle {
          font-size: 11px;
          color: #64748b;
          margin-top: 1px;
        }
      }

      .wechat-capsule {
        display: flex;
        align-items: center;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        border-radius: 16px;
        padding: 4px 10px;
        gap: 8px;
        font-size: 12px;
        color: #334155;

        .capsule-dots { font-weight: bold; font-size: 11px; }
        .capsule-divider { width: 1px; height: 12px; background: #cbd5e1; }
        .capsule-circle { font-size: 12px; font-weight: bold; }
      }
    }

    // 需求⑤: 总部下搜索中心
    .hq-search-bar {
      background: #fff;
      padding: 8px 14px;
      border-bottom: 1px solid #e2e8f0;
      position: relative;
      flex-shrink: 0;

      .search-input-wrapper {
        display: flex;
        align-items: center;
        background: #f1f5f9;
        border-radius: 8px;
        padding: 6px 10px;
        gap: 6px;

        .search-icon {
          font-size: 14px;
          color: #94a3b8;
        }

        .mobile-search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 12px;
          color: #0f172a;

          &::placeholder {
            color: #94a3b8;
          }
        }

        .clear-icon {
          font-size: 14px;
          color: #94a3b8;
          cursor: pointer;
        }
      }

      .search-results-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border-bottom: 1px solid #e2e8f0;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        z-index: 50;
        max-height: 280px;
        overflow-y: auto;
        padding: 6px 0;

        .res-tip {
          padding: 6px 14px;
          font-size: 10px;
          color: #94a3b8;
          border-bottom: 1px solid #f1f5f9;
        }

        .search-res-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border-bottom: 1px solid #f8fafc;
          cursor: pointer;

          &:hover {
            background: #f0fdfa;
          }

          .res-info {
            display: flex;
            flex-direction: column;

            .res-name {
              font-size: 13px;
              font-weight: 600;
              color: #0f172a;
            }
            .res-reg {
              font-size: 10px;
              color: #64748b;
            }
          }
        }
      }
    }

    .branch-view-banner {
      background: #fefce8;
      border-bottom: 1px solid #fef08a;
      padding: 6px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;

      .bb-left {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #854d0e;
      }
    }

    // 4. 顶部 2 栏切换
    .top-segmented-bar {
      display: flex;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;

      .segment-item {
        flex: 1;
        text-align: center;
        padding: 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;

        .seg-icon {
          font-size: 16px;
        }

        &.active {
          color: #00bebe;
          background: rgba(0, 190, 190, 0.03);

          .active-indicator {
            position: absolute;
            bottom: 0;
            left: 20%;
            right: 20%;
            height: 3px;
            background: #00bebe;
            border-radius: 3px 3px 0 0;
          }
        }
      }
    }

    // 5. 滚动内容区
    .cards-scroll-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .category-header-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 2px;

        .banner-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 6px;

          .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #00bebe;
          }

          .org-scope-badge {
            font-size: 10px;
            font-weight: normal;
            background: #f1f5f9;
            color: #64748b;
            padding: 1px 6px;
            border-radius: 10px;
          }
        }
        .banner-sub {
          font-size: 11px;
          color: #94a3b8;
        }
      }

      // 指标卡片
      .metric-card {
        background: #fff;
        border-radius: 14px;
        padding: 14px 16px;
        border: 1px solid #f1f5f9;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        transition: all 0.22s ease;

        &:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        &.expanded {
          border-color: #00bebe;
          box-shadow: 0 4px 16px rgba(0, 190, 190, 0.12);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;

          .metric-name-group {
            display: flex;
            align-items: center;
            gap: 6px;

            .metric-name {
              font-size: 13px;
              font-weight: 600;
              color: #475569;
            }
            .trend-tag {
              font-size: 10px;
              height: 20px;
              line-height: 18px;
              padding: 0 4px;
            }
            .t2-tag {
              font-size: 10px;
              height: 20px;
              line-height: 18px;
              padding: 0 5px;
            }
          }

          .header-actions {
            display: flex;
            align-items: center;
            gap: 4px;

            .tap-hint {
              font-size: 10px;
              color: #94a3b8;
            }

            .expand-icon {
              color: #94a3b8;
              transition: transform 0.22s;
              &.rotated {
                transform: rotate(180deg);
                color: #00bebe;
              }
            }
          }
        }

        .card-value-row {
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          cursor: pointer;

          .val-main-box {
            display: flex;
            align-items: baseline;
            gap: 5px;

            .main-val {
              font-size: 26px;
              font-weight: 800;
              font-family: 'Helvetica Neue', Arial, sans-serif;
              letter-spacing: -0.5px;
              transition: color 0.2s;
            }
            .unit {
              font-size: 12px;
              color: #64748b;
              font-weight: 500;
            }
          }

          .target-val-box {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            color: #64748b;

            .t-val {
              font-weight: 600;
              color: #334155;
            }

            .t-status {
              font-size: 10px;
              padding: 1px 5px;
              border-radius: 4px;

              &.achieved {
                background: #f0fdf4;
                color: #16a34a;
              }
              &.unachieved {
                background: #fef2f2;
                color: #dc2626;
              }
            }
          }
        }

        .card-rates-row {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;

          .rate-badge {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            font-size: 11px;
            padding: 2px 7px;
            border-radius: 6px;
            font-weight: 600;

            .rate-label {
              font-weight: normal;
              opacity: 0.85;
              margin-right: 2px;
            }
          }

          .breakdown-toggle-btn {
            margin-left: auto;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            color: #0284c7;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            padding: 2px 8px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover,
            &.active {
              background: #0284c7;
              color: #fff;
              border-color: #0284c7;
            }
          }
        }

        // 需求④: 各中心/集配下钻排列表格面板
        .center-breakdown-panel {
          margin-top: 12px;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;

          .breakdown-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 8px;

            .bh-title {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              font-weight: 700;
              color: #1e293b;
            }
            .bh-tip {
              font-size: 10px;
              color: #94a3b8;
            }
          }

          .breakdown-list {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .breakdown-item-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #fff;
              padding: 8px 10px;
              border-radius: 6px;
              border: 1px solid #f1f5f9;
              cursor: pointer;
              transition: all 0.18s;

              &:hover {
                border-color: #00bebe;
                background: #f0fdfa;
              }

              .center-rank {
                display: flex;
                align-items: center;
                gap: 8px;

                .rank-idx {
                  width: 18px;
                  height: 18px;
                  line-height: 18px;
                  text-align: center;
                  font-size: 10px;
                  font-weight: 700;
                  background: #f1f5f9;
                  color: #64748b;
                  border-radius: 50%;

                  &.top-3 {
                    background: #ffedd5;
                    color: #ea580c;
                  }
                }

                .center-name-box {
                  display: flex;
                  flex-direction: column;

                  .center-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: #0f172a;
                  }
                  .center-type {
                    font-size: 9px;
                    color: #94a3b8;
                  }
                }
              }

              .center-val-box {
                text-align: right;

                .val-line {
                  .b-val {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0f172a;
                  }
                  .b-u {
                    font-size: 10px;
                    color: #64748b;
                    margin-left: 2px;
                  }
                }

                .b-dod {
                  font-size: 9px;
                  &.text-rise { color: #ef4444; }
                  &.text-fall { color: #22c55e; }
                }
              }
            }
          }
        }

        // 需求③: 折线趋势图展开区
        .chart-drawer {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px dashed #e2e8f0;

          .chart-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 6px;

            .title-text {
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .active-point-badge {
              font-size: 10px;
              color: #00bebe;
              background: rgba(0, 190, 190, 0.08);
              padding: 1px 6px;
              border-radius: 4px;
            }
          }

          .point-detail-bar {
            display: flex;
            gap: 14px;
            background: #f8fafc;
            padding: 6px 10px;
            border-radius: 6px;
            margin-bottom: 6px;
            font-size: 11px;

            .pd-item {
              display: flex;
              gap: 3px;

              .pd-lbl { color: #64748b; }
              .pd-val {
                font-weight: 600;
                color: #0f172a;
                &.highlight { color: #00bebe; font-weight: 700; }
              }
            }
          }

          .echart-box {
            width: 100%;
            height: 160px;
          }
        }
      }

      // 基础数据专有卡片
      .basic-section {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .site-hero-card {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);

          .site-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            background: rgba(0, 190, 190, 0.2);
            color: #00e5e5;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .site-name {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: -0.3px;
          }
          .site-addr {
            display: flex;
            align-items: flex-start;
            gap: 6px;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 6px;
            line-height: 1.4;
          }
          .site-tags {
            display: flex;
            gap: 6px;
            margin-top: 12px;
            flex-wrap: wrap;

            .tag-item {
              font-size: 10px;
              background: rgba(255, 255, 255, 0.1);
              padding: 2px 7px;
              border-radius: 4px;
              color: #cbd5e1;
            }
          }
        }

        .site-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;

          .facility-card {
            background: #fff;
            border-radius: 14px;
            padding: 14px 16px;
            border: 1px solid #f1f5f9;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

            .fac-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .fac-title {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                font-weight: 700;
                color: #1e293b;
              }
            }

            .fac-rule-tip {
              font-size: 11px;
              color: #64748b;
              background: #f8fafc;
              padding: 4px 8px;
              border-radius: 6px;
              margin-bottom: 10px;
              display: flex;
              gap: 4px;

              .rule-lbl { color: #94a3b8; }
              .rule-val { font-weight: 600; color: #334155; }
              .rule-desc { color: #94a3b8; }
            }

            .fac-stats {
              display: flex;
              justify-content: space-between;
              background: #f8fafc;
              padding: 10px 14px;
              border-radius: 10px;

              .stat-col {
                display: flex;
                flex-direction: column;
                align-items: center;

                .stat-num {
                  font-size: 16px;
                  font-weight: 800;
                  color: #0f172a;

                  .u { font-size: 11px; font-weight: normal; color: #64748b; }
                }
                .stat-lbl {
                  font-size: 10px;
                  color: #64748b;
                  margin-top: 2px;
                }
              }
            }
          }
        }

        .material-banner {
          background: linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%);
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #bae6fd;

          .banner-title {
            font-size: 13px;
            font-weight: 700;
            color: #0369a1;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .banner-desc {
            font-size: 11px;
            color: #0284c7;
            margin-top: 2px;
          }
        }

        .materials-list {
          display: flex;
          flex-direction: column;
          gap: 10px;

          .material-item-card {
            background: #fff;
            border-radius: 12px;
            padding: 12px 14px;
            border: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

            .mat-left {
              .mat-name { font-size: 13px; font-weight: 700; color: #1e293b; }
              .mat-extra { font-size: 11px; color: #64748b; margin-top: 3px; }
            }

            .mat-right {
              text-align: right;
              .mat-val {
                font-size: 18px;
                font-weight: 800;
                color: #0f172a;
                .unit { font-size: 11px; color: #64748b; font-weight: normal; }
              }
              .mat-trend {
                font-size: 10px;
                color: #64748b;
                margin-top: 2px;
                .text-success { color: #22c55e; font-weight: 600; }
              }
            }
          }
        }

        .outlet-hero-card {
          background: #fff;
          border-radius: 16px;
          padding: 16px 18px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

          .title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title { font-size: 14px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px; }
          }

          .outlet-main-stat {
            margin: 12px 0;
            .huge-number {
              font-size: 32px;
              font-weight: 900;
              color: #00bebe;
              font-family: 'Helvetica Neue', Arial, sans-serif;
              line-height: 1;
              .unit { font-size: 14px; font-weight: 600; color: #475569; }
            }
            .sub-lbl { font-size: 11px; color: #64748b; margin-top: 4px; }
          }

          .progress-section {
            margin-top: 14px;
            .prog-labels {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              margin-bottom: 6px;
              .delivery-lbl { color: #0284c7; font-weight: 600; }
              .pickup-lbl { color: #f59e0b; font-weight: 600; }
            }
            .dual-progress-bar {
              height: 8px;
              background: #f1f5f9;
              border-radius: 4px;
              overflow: hidden;
              display: flex;
              .bar-delivery { background: #0284c7; height: 100%; }
              .bar-pickup { background: #f59e0b; height: 100%; }
            }
          }
        }

        .outlet-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;

          .outlet-detail-card {
            background: #fff;
            border-radius: 14px;
            padding: 13px 14px;
            border: 1px solid #f1f5f9;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
            cursor: pointer;
            transition: all 0.22s ease;

            &.clickable {
              &:hover { border-color: #cbd5e1; transform: translateY(-1px); }
              &.is-active { border-color: #00bebe; box-shadow: 0 4px 14px rgba(0, 190, 190, 0.12); }
            }

            .card-top-action {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .drill-tip {
                display: flex;
                align-items: center;
                gap: 2px;
                font-size: 10px;
                color: #00bebe;
                font-weight: 600;
                .el-icon { transition: transform 0.22s ease; }
                &.rotated .el-icon { transform: rotate(180deg); }
              }
            }

            .card-icon {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              &.delivery { background: #e0f2fe; color: #0284c7; }
              &.pickup { background: #fef3c7; color: #d97706; }
            }

            .card-info {
              .name { font-size: 12px; color: #64748b; font-weight: 500; }
              .val {
                font-size: 20px;
                font-weight: 800;
                color: #0f172a;
                margin: 2px 0;
                .u { font-size: 11px; color: #94a3b8; font-weight: normal; }
              }
              .desc { font-size: 10px; color: #94a3b8; line-height: 1.3; }
            }
          }
        }

        .outlet-drilldown-box {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          padding: 12px 14px 14px;

          &.delivery-box { border-top: 3px solid #0284c7; }
          &.pickup-box { border-top: 3px solid #f59e0b; }

          .drilldown-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #f1f5f9;
            margin-bottom: 10px;

            .dh-title {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              .text-delivery { color: #0284c7; font-size: 15px; }
              .text-pickup { color: #f59e0b; font-size: 15px; }
              .count-tag { font-size: 10px; font-weight: normal; background: #f1f5f9; color: #64748b; padding: 1px 6px; border-radius: 10px; }
            }
            .close-txt { font-size: 11px; color: #94a3b8; cursor: pointer; &:hover { color: #64748b; } }
          }

          .outlet-item-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 380px;
            overflow-y: auto;

            .outlet-row-card {
              background: #f8fafc;
              border: 1px solid #f1f5f9;
              border-radius: 10px;
              padding: 10px 12px;
              display: flex;
              flex-direction: column;
              gap: 6px;

              .row-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                .outlet-title { font-size: 12px; font-weight: 700; color: #1e293b; }
              }

              .schedule-grid {
                display: grid;
                gap: 6px;
                margin-top: 2px;
                &.delivery-schedule { grid-template-columns: 1fr 1fr; }
                &.pickup-schedule { grid-template-columns: 1fr 1fr 1fr; }

                .schedule-item {
                  display: flex;
                  flex-direction: column;
                  gap: 1px;
                  .lbl { font-size: 10px; color: #94a3b8; display: flex; align-items: center; gap: 3px; }
                  .val {
                    font-size: 12px;
                    font-weight: 700;
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    &.highlight-orange { color: #ea580c; }
                    &.highlight-cyan { color: #0284c7; }
                    &.highlight-blue { color: #2563eb; }
                    &.highlight-green { color: #16a34a; }
                  }
                }
              }
            }
          }
        }
      }
    }

    // 6. 底部原生 TabBar
    .phone-bottom-tabbar {
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      padding: 6px 12px 10px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-shrink: 0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);

      .tab-bar-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        cursor: pointer;
        padding: 4px 16px;
        position: relative;
        color: #64748b;
        transition: all 0.2s;

        .tab-icon { font-size: 18px; transition: transform 0.2s; }
        .tab-label { font-size: 11px; font-weight: 500; }
        .tab-dot { position: absolute; bottom: -2px; width: 4px; height: 4px; border-radius: 50%; background: #00bebe; }

        &.active {
          color: #00bebe;
          .tab-icon { transform: scale(1.1); }
          .tab-label { font-weight: 700; }
        }
      }
    }
  }
}

.drilldown-enter-active,
.drilldown-leave-active {
  transition: all 0.24s ease-out;
}
.drilldown-enter-from,
.drilldown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
