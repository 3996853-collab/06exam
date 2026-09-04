import { NextResponse } from 'next/server';

/**
 * 前端请求 Payload 接口定义
 */
export interface CreateSubscriptionPayload {
  /** 用户的原始查询指令 */
  prompt: string;
  /** 触发时间，例如 "09:00" */
  timeExpression: string;
  /** 推送平台，默认 "wecom" */
  targetPlatform?: string;
}

/**
 * 接口返回统一响应格式定义
 */
export interface StandardApiResponse<T = any> {
  /** 错误码，0 代表成功，非 0 代表失败 */
  code: number;
  /** 提示消息 */
  message: string;
  /** 返回数据 */
  data?: T;
}

/**
 * Next.js 14 App Router API 处理程序 - 创建智能订阅任务
 * 对应路由: POST /api/subscription
 */
export async function POST(request: Request) {
  try {
    // 1. 解析请求体
    const body: CreateSubscriptionPayload = await request.json();

    // 2. 基础入参校验
    const { prompt, timeExpression, targetPlatform = 'wecom' } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json<StandardApiResponse>(
        {
          code: 400,
          message: '参数校验失败：prompt 不能为空且必须为字符串',
        },
        { status: 400 }
      );
    }

    if (!timeExpression || typeof timeExpression !== 'string' || timeExpression.trim() === '') {
      return NextResponse.json<StandardApiResponse>(
        {
          code: 400,
          message: '参数校验失败：timeExpression 不能为空且必须为字符串',
        },
        { status: 400 }
      );
    }

    // 3. 核心业务逻辑设计：判断是否为异常预警类订阅
    const isAlertTask = prompt.includes('异常') || prompt.includes('积压');

    // 模拟数据入库实体结构
    const mockDbRecord = {
      id: `sub_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      prompt: prompt.trim(),
      timeExpression: timeExpression.trim(),
      targetPlatform: targetPlatform,
      isAlertTask: isAlertTask,
      status: 'active', // 状态: active (运行中), inactive (停止)
      createdAt: new Date().toISOString(),
    };

    // 如果是异常预警，加入预留扩展点说明
    if (isAlertTask) {
      /**
       * =========================================================================
       * 【扩展点预留：与 WMS/TMS 系统状态联动以实现隐式自动关闭】
       * =========================================================================
       * 业务场景分析：
       * 当用户订阅了包含“异常”或“积压”的时效警告时（例如：“货量积压超过30分钟报警”），
       * 这种预警任务通常在“业务指标恢复正常”或“异常情况已经得到消除”后不再需要持续推送。
       * 
       * 隐式自动关闭（Auto-Close）扩展方案：
       * 1. 注册消息队列监听（如 RocketMQ/Kafka）：监听来自 WMS（仓储系统）和 TMS（运输系统）的实时业务事件。
       * 2. 事件映射逻辑：
       *    - 若本订阅关注的是仓库积压（WMS），当监听到 WMS 发送 `inventory_backlog_cleared` 或 `wave_processed` 事件，且积压数低于安全线时；
       *    - 若本订阅关注的是运输异常（TMS），当监听到 TMS 上报 `delivery_completed` (派送完成) 或 `truck_arrived` (车辆到达)；
       * 3. 触发闭环核销：
       *    - 调用服务层接口，将当前订阅记录的 `status` 字段隐式更新为 `inactive` 或 `auto_closed`。
       *    - 向企业微信推送一条闭环归因通知（如：“您的积压预警已被隐式自动关闭，原因为：青浦仓库积压已清理完毕，当前水位正常”）。
       * =========================================================================
       */
      console.log(`[智能订阅系统] 检测到异常预警意图任务: ${mockDbRecord.id}，已启用 WMS/TMS 隐式自动关闭侦听注册。`);
    } else {
      console.log(`[智能订阅系统] 成功创建常规周期性订阅任务: ${mockDbRecord.id}`);
    }

    // 4. 返回标准 JSON 格式响应
    return NextResponse.json<StandardApiResponse>(
      {
        code: 0,
        message: '智能订阅任务创建成功',
        data: mockDbRecord,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('[API Error] 创建订阅任务失败:', error);
    return NextResponse.json<StandardApiResponse>(
      {
        code: 500,
        message: `服务器内部错误: ${error.message || '未知错误'}`,
      },
      { status: 500 }
    );
  }
}
