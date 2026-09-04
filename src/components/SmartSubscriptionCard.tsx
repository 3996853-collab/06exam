'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export interface SmartSubscriptionCardProps {
  /** 命中的时间/时效关键词，例如：“今天”、“每天” */
  timeKeyword?: string;
  /** 命中的业务/物流指标关键词，例如：“货量”、“开单” */
  businessKeyword?: string;
  /** 点击“一键配置监控”按钮时的回调函数 */
  onConfigure: () => void;
  /** 点击关闭/忽略时的回调函数（用于通知父组件） */
  onClose?: () => void;
}

/**
 * SmartSubscriptionCard - 智能问数订阅提醒卡片 (React Client Component)
 * 适用于 Next.js (App Router) + Tailwind CSS + TypeScript
 */
export default function SmartSubscriptionCard({
  timeKeyword = '最新',
  businessKeyword = '业务指标',
  onConfigure,
  onClose,
}: SmartSubscriptionCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // 处理关闭动作，执行淡出动画后从 DOM 中卸载
  const handleClose = () => {
    setIsAnimatingOut(true);
  };

  useEffect(() => {
    if (isAnimatingOut) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300); // 对应 transition-all duration-300 的动画时间
      return () => clearTimeout(timer);
    }
  }, [isAnimatingOut, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        w-full max-w-4xl mx-auto my-3 px-4 py-3 
        bg-blue-50/90 border border-blue-100 rounded-xl shadow-sm
        flex items-center justify-between gap-4
        backdrop-blur-sm transition-all duration-300 ease-out
        ${isAnimatingOut 
          ? 'opacity-0 scale-95 translate-y-2' 
          : 'animate-in fade-in slide-in-from-top-4 duration-300'
        }
      `}
      role="alert"
    >
      {/* 左侧提醒图标 */}
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-100/80 rounded-lg text-blue-600">
        <Bell className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      {/* 中间文字内容 */}
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-bold text-slate-800 leading-snug truncate">
          发现您在关注 {timeKeyword ? `【${timeKeyword}】` : ''} 的 {businessKeyword ? `【${businessKeyword}】` : ''} 动态
        </h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed truncate">
          系统检测到该查询具有高频监控价值，建议开启定时预警任务，数据将自动投递至企业微信/钉钉。
        </p>
      </div>

      {/* 右侧操作按钮 */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {/* 一键配置监控按钮 */}
        <button
          onClick={onConfigure}
          className="
            px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
            text-white text-xs font-semibold rounded-lg shadow-sm 
            transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
        >
          一键配置监控
        </button>

        {/* 忽略/关闭按钮 */}
        <button
          onClick={handleClose}
          aria-label="关闭提醒"
          className="
            p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-600 
            transition-all duration-150 focus:outline-none
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
