<template>
  <div class="antigravity-container">
    <!-- Header Tools -->
    <div class="header-tools">
      <div class="stock-info">
        <span class="label">网点库存</span>
        <span class="stock-item">主单: <span class="val">230</span></span>
        <span class="stock-item">子单: <span class="val">220</span></span>
      </div>
      <div class="action-buttons">
        <el-button plain icon="Document">政策汇总</el-button>
        <el-button plain icon="Setting">录单设置</el-button>
        <el-button plain icon="Printer">面单打印</el-button>
        <el-button plain icon="Plus">新增</el-button>
        <el-button type="primary" class="save-btn">保存</el-button>
      </div>
    </div>

    <!-- Tabs Layout -->
    <div class="tabs-container">
      <div class="tab-item active">录运单</div>
      <div class="tab-item">录回单</div>
      <div class="tab-item">录订单</div>
      <div class="tab-item">曼整车单</div>
    </div>

    <div class="form-body">
      <!-- 基础运单配置块 (顶部双排) -->
      <el-card shadow="never" class="basic-order-info mb-16 relative-card">
        <el-form label-width="90px">
          <!-- Row 1 -->
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="运单号">
                <el-input placeholder="录单保存后生成运单号" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="客户单号">
                <el-input placeholder="输入客户单号" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <div class="custom-label mb-row">
                <span class="required">*</span> 收件业务员
              </div>
              <el-input placeholder="" value="侯鹏" clearable />
            </el-col>
            <div class="pay-method-abs">
               <span class="label">装车方式</span>
               <el-select placeholder="请选择" style="width: 120px;" disabled></el-select>
            </div>
          </el-row>

          <!-- Row 2 -->
          <el-row :gutter="20" class="mt-4">
            <el-col :span="8">
              <el-form-item>
                <template #label><span class="required">*</span> 产品类型</template>
                <el-select model-value="零担" class="w-100"><el-option label="零担" value="1" /></el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <template #label><span class="required">*</span> 温区</template>
                <el-select model-value="冷冻" class="w-100"><el-option label="冷冻" value="1" /></el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <template #label><span class="required">*</span> 服务方式</template>
                <el-select model-value="派送" class="w-100"><el-option label="派送" value="1" /></el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 双栏卡片区 -->
      <el-row :gutter="16">
        <!-- 左侧功能卡片 -->
        <el-col :span="12">
          <!-- 寄件人信息 -->
          <el-card shadow="never" class="info-card mb-16">
            <template #header>
              <div class="card-header">
                <div class="title"><el-icon><UserFilled /></el-icon> 寄件人信息</div>
                <div class="card-action"><el-icon><EditPen /></el-icon> 智能填写</div>
              </div>
            </template>
            <el-form label-width="80px">
              <el-row :gutter="12">
                <el-col :span="12">
                   <el-form-item>
                     <template #label><span class="required">*</span>寄件人</template>
                     <el-input placeholder="请输入" />
                   </el-form-item>
                </el-col>
                <el-col :span="12">
                   <el-form-item label="寄件公司">
                     <el-input placeholder="输入寄件公司" />
                   </el-form-item>
                </el-col>
                <el-col :span="12">
                   <el-form-item label="寄件手机">
                     <el-input placeholder="条件项: 手机号和座机号二填一" />
                   </el-form-item>
                </el-col>
                <el-col :span="12">
                   <el-form-item label="寄件座机">
                     <el-input placeholder="条件项: 手机号和座机号二填一" />
                   </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="12">
                <el-col :span="8">
                  <el-form-item>
                     <template #label><span class="required">*</span>省</template>
                     <el-select class="w-100" placeholder="请选择"><el-option label="选择省" value="1" /></el-select>
                   </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="市" label-width="40px">
                     <el-select class="w-100" placeholder="请选择市"></el-select>
                   </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="区" label-width="40px">
                     <el-select class="w-100" placeholder="请选择区"></el-select>
                   </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                 <el-col :span="24">
                   <el-form-item>
                     <template #label><span class="required">*</span>详细地址</template>
                     <el-input placeholder="输入详细地址，将明确至'省'-'市'-'区'-'镇/街道'-'村/路段'-'详细地址'" />
                     <div class="addr-tag">查件匹配</div>
                   </el-form-item>
                 </el-col>
              </el-row>
              <el-row :gutter="12">
                 <el-col :span="12">
                   <el-form-item label="签收短信">
                     <el-select class="w-100" placeholder="请选择" value="全程通知"><el-option label="全程通知" value="1" /></el-select>
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item label="寄网点" label-width="60px">
                     <el-input value="总部" disabled />
                   </el-form-item>
                 </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 物品信息 -->
          <el-card shadow="never" class="info-card mb-16">
            <template #header>
              <div class="card-header">
                <div class="title"><el-icon><Box /></el-icon> 物品信息</div>
                <div class="card-action err-text"><el-icon><Warning /></el-icon> 允收禁收查询</div>
              </div>
            </template>
            <div class="goods-flex">
               <!-- Left Switch -->
               <div class="unit-switch">
                  <div class="label">单位切换:</div>
                  <div class="switch-box">
                    <div class="s-btn active">cm</div>
                    <div class="s-btn">m</div>
                  </div>
                  <div class="formula-box">长(cm)*宽(cm)*高(cm)*件数</div>
               </div>
               <!-- Right Forms -->
               <div class="goods-form">
                 <el-form label-width="80px">
                   <el-row :gutter="12">
                     <el-col :span="12">
                       <el-form-item>
                         <template #label><span class="required">*</span>物品名称</template>
                         <el-input placeholder="输入物品名称" />
                       </el-form-item>
                     </el-col>
                     <el-col :span="12">
                       <el-form-item>
                         <template #label><span class="required">*</span>包装类型</template>
                         <el-select class="w-100" placeholder="请选择"><el-option label="纸箱" value="1" /></el-select>
                       </el-form-item>
                     </el-col>
                   </el-row>
                   <el-row :gutter="12">
                     <el-col :span="12">
                       <el-form-item>
                         <template #label><span class="required">*</span>分类名称</template>
                         <el-select class="w-100" placeholder="请选择"></el-select>
                       </el-form-item>
                     </el-col>
                     <el-col :span="12">
                       <el-form-item>
                         <template #label><span class="required">*</span>总体积</template>
                         <el-input placeholder="输入总体积">
                            <template #suffix>m³</template>
                         </el-input>
                       </el-form-item>
                     </el-col>
                   </el-row>
                   <el-row :gutter="12">
                     <el-col :span="12">
                       <el-form-item>
                         <template #label><span class="required">*</span>实际重量</template>
                         <el-input placeholder="输入实际重量">
                            <template #suffix>kg</template>
                         </el-input>
                       </el-form-item>
                     </el-col>
                     <el-col :span="12">
                       <el-form-item label="估算总重量" label-width="90px">
                         <el-input placeholder="输入总预算重量">
                            <template #suffix>kg</template>
                         </el-input>
                       </el-form-item>
                     </el-col>
                   </el-row>
                   <!-- Sub row total -->
                   <el-row :gutter="12">
                     <el-col :span="12">
                        <el-form-item>
                         <template #label><span class="required">*</span>总件数</template>
                         <el-input placeholder="输入总件数" />
                       </el-form-item>
                     </el-col>
                   </el-row>
                 </el-form>
               </div>
            </div>
          </el-card>

          <!-- 服务信息 -->
          <el-card shadow="never" class="info-card mb-16">
            <template #header>
              <div class="card-header">
                <div class="title"><el-icon><Service /></el-icon> 服务信息</div>
              </div>
            </template>
            <!-- 占位空白内容 -->
          </el-card>
        </el-col> <!-- 结束左侧 -->

        <!-- 右侧功能卡片 -->
        <el-col :span="12">
          <!-- 收件人信息 -->
          <el-card shadow="never" class="info-card mb-16">
            <template #header>
              <div class="card-header">
                <div class="title receive-theme"><el-icon><UserFilled /></el-icon> 收件人信息</div>
                <div class="card-action"><el-icon><EditPen /></el-icon> 智能填写</div>
              </div>
            </template>
            <el-form label-width="80px">
              <el-row :gutter="12">
                <el-col :span="12">
                   <el-form-item>
                     <template #label><span class="required">*</span>收件人</template>
                     <el-input placeholder="请输入" />
                   </el-form-item>
                </el-col>
                <el-col :span="12">
                   <el-form-item label="收件公司">
                     <el-input placeholder="输入收件公司" />
                   </el-form-item>
                </el-col>
                <el-col :span="12">
                   <el-form-item label="收件手机">
                     <el-input placeholder="条件项: 手机号和座机号二填一" />
                   </el-form-item>
                </el-col>
                <el-col :span="12">
                   <el-form-item label="收件座机">
                     <el-input placeholder="条件项: 手机号和座机号二填一" />
                   </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="12">
                <el-col :span="8">
                  <el-form-item>
                     <template #label><span class="required">*</span>省</template>
                     <el-select class="w-100" placeholder="请选择"><el-option label="选择省" value="1" /></el-select>
                   </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="市" label-width="40px">
                     <el-select class="w-100" placeholder="请选择市"></el-select>
                   </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="区" label-width="40px">
                     <el-select class="w-100" placeholder="请选择区"></el-select>
                   </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                 <el-col :span="24">
                   <el-form-item>
                     <template #label><span class="required">*</span>详细地址</template>
                     <el-input placeholder="输入详细地址，将明确至'省'-'市'-'区'-'镇/街道'-'村/路段'-'详细地址'" />
                     <div class="addr-tag green">网点信息</div>
                   </el-form-item>
                 </el-col>
              </el-row>
              <el-row :gutter="12">
                 <el-col :span="12">
                   <el-form-item label="到达网点">
                     <el-input placeholder="请输入" />
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item label="派送距离" label-width="80px">
                     <el-input placeholder="输入派送距离">
                       <template #suffix>KM</template>
                     </el-input>
                   </el-form-item>
                 </el-col>
              </el-row>
              <el-row :gutter="12">
                 <el-col :span="12">
                   <el-form-item label="目的网点">
                     <el-input placeholder="请输入" />
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item label="" label-width="0">
                      <div class="d-flex align-items-center w-100 justify-between">
                         <el-checkbox>自提点件</el-checkbox>
                         <el-checkbox>派件通知短信</el-checkbox>
                         <el-button size="small">信息位置</el-button>
                      </div>
                   </el-form-item>
                 </el-col>
              </el-row>
               <el-row :gutter="12">
                 <el-col :span="12">
                   <el-form-item label="目的所属分拨" label-width="110px">
                     <el-input placeholder="" disabled />
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item label="目的分拨" label-width="80px">
                     <el-input placeholder="" disabled />
                   </el-form-item>
                 </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 收费信息 -->
          <el-card shadow="never" class="info-card mb-16">
            <template #header>
              <div class="card-header">
                <div class="title fee-theme"><el-icon><Money /></el-icon> 收费信息</div>
              </div>
            </template>
            <el-form label-width="80px">
               <el-row :gutter="12">
                 <el-col :span="12">
                   <el-form-item>
                     <template #label><span class="required">*</span>支付方式</template>
                     <el-select class="w-100" placeholder="请选择" value="现金"><el-option label="现金" value="1" /></el-select>
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item label="运费">
                     <el-input placeholder="" value="0" />
                   </el-form-item>
                 </el-col>
               </el-row>
               <el-row :gutter="12">
                 <el-col :span="12">
                   <el-form-item>
                     <template #label><span class="required">*</span>是否保价</template>
                     <el-radio-group model-value="是">
                       <el-radio label="是">是</el-radio>
                       <el-radio label="否">否</el-radio>
                     </el-radio-group>
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item>
                     <template #label><span class="required">*</span>保价金额</template>
                     <el-input placeholder="输入保价金额" />
                   </el-form-item>
                 </el-col>
               </el-row>
               <el-row :gutter="12">
                 <el-col :span="12">
                   <el-form-item label="其他费用">
                     <el-input placeholder="输入其他费用" />
                   </el-form-item>
                 </el-col>
                 <el-col :span="12">
                   <el-form-item label="应收账款">
                     <el-input placeholder="输入应收账款" />
                   </el-form-item>
                 </el-col>
               </el-row>
               <el-row>
                 <el-col :span="24">
                   <el-form-item label="备注">
                     <el-input placeholder="输入备注" />
                   </el-form-item>
                 </el-col>
               </el-row>
            </el-form>
          </el-card>

          <!-- 成本信息 -->
          <el-card shadow="never" class="info-card mb-16">
            <template #header>
              <div class="card-header" style="justify-content: flex-start; gap: 16px;">
                <div class="title cost-theme"><el-icon><Coin /></el-icon> 成本信息</div>
                <div class="total-cost">总计: 0元</div>
                <div class="card-action ml-auto"><el-icon><Warning /></el-icon> 显示所有费用项</div>
              </div>
            </template>
            <div style="color: #909399; font-size: 14px;">---</div>
          </el-card>
        </el-col> <!-- 结束右侧 -->
      </el-row>
    </div>

    <!-- Bottom Action Bar -->
    <div class="bottom-bar">
      <div class="left-cost">
        <el-icon class="cost-icon"><Coin /></el-icon> 成本
        <span class="c-val">¥ 0</span>
        <span class="cost-link"><el-icon><ArrowDown /></el-icon> 查看所有费用项</span>
      </div>
      <div class="right-btn">
        <el-button plain class="btn-new">＋新增</el-button>
        <el-button type="primary" class="save-btn px-8">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, Setting, Printer, Plus, UserFilled, Box, Warning, EditPen, Money, Coin, ArrowDown, Service } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
/* --- 遵守 AGENTS.md 主机色系设定 --- */
$brand-color: #00bebe;
$dark-text: rgba(0, 0, 0, 0.8);
$gray-text: rgb(96, 98, 102);

.antigravity-container {
  min-height: 100%;
  background-color: #f0f2f5;
  padding-bottom: 60px; /* space for fixed bottom bar */
}

.header-tools {
  background-color: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .stock-info {
    font-size: 14px;
    .label {
      color: $gray-text;
      margin-right: 16px;
    }
    .stock-item {
      color: $dark-text;
      margin-right: 16px;
      .val {
        color: $brand-color;
        font-weight: bold;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    .save-btn {
      background-color: $brand-color;
      border-color: $brand-color;
    }
  }
}

.tabs-container {
  display: flex;
  background-color: #fff;
  padding: 0 24px;
  border-bottom: 1px solid #e4e7ed;

  .tab-item {
    padding: 12px 24px;
    font-size: 14px;
    cursor: pointer;
    color: $gray-text;
    position: relative;
    font-weight: 500;

    &.active {
      color: #fff;
      background-color: $brand-color;
      border-radius: 4px 4px 0 0;
    }
  }
}

.form-body {
  padding: 16px 24px;
}

.required {
  color: #f56c6c;
  margin-right: 4px;
}

.mb-16 {
  margin-bottom: 16px;
}
.w-100 {
  width: 100%;
}

.relative-card {
  position: relative;
  border-radius: 8px;
  
  .pay-method-abs {
    position: absolute;
    right: 24px;
    top: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: $gray-text;
  }
}

.custom-label {
  font-size: 14px;
  color: $gray-text;
  margin-bottom: 8px;
  display: inline-block;
}

/* Card General */
.info-card {
  border-radius: 8px;
  :deep(.el-card__header) {
    padding: 12px 16px;
    border-bottom: 1px dashed #e4e7ed;
  }
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    color: $brand-color; /* default theme */
  }

  /* Specific header colors from proto */
  .receive-theme { color: #f28247; }
  .fee-theme { color: #43bfe0; }
  .cost-theme { color: #00bebe; }

  .total-cost {
    color: $brand-color;
    font-size: 16px;
    font-weight: bold;
  }

  .card-action {
    font-size: 14px;
    color: $brand-color;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    &.err-text {
      color: #f56c6c;
    }
  }
}

.ml-auto {
  margin-left: auto;
}

.d-flex { display: flex; }
.align-items-center { align-items: center; }
.justify-between { justify-content: space-between; }

/* In-form specific styling */
.addr-tag {
  position: absolute;
  right: 8px;
  top: 6px;
  background-color: $brand-color;
  color: #fff;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
  height: 20px;
  cursor: pointer;
  
  &.green {
    background-color: #00bebe;
  }
}

.goods-flex {
  display: flex;
  gap: 16px;
  
  .unit-switch {
    width: 140px;
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .label {
      font-size: 13px;
      color: $gray-text;
    }
    .switch-box {
      display: flex;
      background: #e4e7ed;
      border-radius: 4px;
      overflow: hidden;
      
      .s-btn {
        flex: 1;
        text-align: center;
        padding: 4px 0;
        font-size: 13px;
        color: $gray-text;
        cursor: pointer;
        
        &.active {
          background-color: $brand-color;
          color: #fff;
        }
      }
    }
    
    .formula-box {
      background: #fff;
      border: 1px dashed #dcdfe6;
      border-radius: 4px;
      padding: 12px 8px;
      font-size: 12px;
      color: #ccc;
      text-align: center;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      word-break: break-all;
    }
  }
  
  .goods-form {
    flex: 1;
  }
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 200px; /* assuming sidebar width */
  right: 0;
  height: 60px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;

  .left-cost {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    color: $dark-text;

    .cost-icon {
      color: $brand-color;
      font-size: 24px;
    }

    .c-val {
      color: $brand-color;
      font-weight: bold;
      font-size: 20px;
    }

    .cost-link {
      font-size: 14px;
      color: $brand-color;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .right-btn {
    display: flex;
    gap: 12px;

    .btn-new {
      border-color: #dcdfe6;
      border-radius: 4px;
    }
    .save-btn {
      background-color: $brand-color;
      border-color: $brand-color;
      padding: 0 32px;
    }
  }
}
</style>
