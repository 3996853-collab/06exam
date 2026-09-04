/**
 * 意图识别提取出的关键词接口定义
 */
export interface ExtractedKeywords {
  /** 命中的时间/时效性关键词，若无则为空字符串 */
  time: string;
  /** 命中的业务/物流指标关键词，若无则为空字符串 */
  business: string;
}

/**
 * 默认的时间意图关键词列表
 * 必须包含“今天、最新、每天、每日、定时、早上、晚上”等时效性词汇
 */
export const DEFAULT_TIME_KEYWORDS = ['今天', '最新', '每天', '每日', '定时', '早上', '晚上'];

/**
 * 默认的业务意图关键词列表
 * 必须包含“货量、开单、应交、应提、应签、异常、温度”等核心物流指标词汇
 */
export const DEFAULT_BUSINESS_KEYWORDS = ['货量', '开单', '应交', '应提', '应签', '异常', '温度'];

/**
 * 意图识别工具类
 */
export class IntentRecognizer {
  private timeKeywords: string[];
  private businessKeywords: string[];
  private timeRegex: RegExp;
  private businessRegex: RegExp;

  /**
   * 构造函数，支持自定义时间与业务词库
   * @param timeKeywords 自定义时间关键词列表
   * @param businessKeywords 自定义业务关键词列表
   */
  constructor(
    timeKeywords: string[] = DEFAULT_TIME_KEYWORDS,
    businessKeywords: string[] = DEFAULT_BUSINESS_KEYWORDS
  ) {
    this.timeKeywords = [...timeKeywords];
    this.businessKeywords = [...businessKeywords];
    
    // 将关键词数组编译为正则，如 /今天|最新|每天/
    // 为了防止空数组导致正则错误，设置兜底匹配
    this.timeRegex = this.compileRegex(this.timeKeywords);
    this.businessRegex = this.compileRegex(this.businessKeywords);
  }

  /**
   * 编译关键词列表为正则表达式
   */
  private compileRegex(keywords: string[]): RegExp {
    if (keywords.length === 0) {
      // 匹配一个不可能成功的正则（前瞻否定）
      return /(?!)/;
    }
    // 对特殊正则字符进行转义，防止关键词包含正则保留字符导致语法错误
    const escaped = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(escaped.join('|'), 'g');
  }

  /**
   * 校验是否命中“自动订阅”意图
   * 只有当文本中同时包含时间意图词汇和业务意图词汇时，才返回 true
   * 
   * @param text 待检测的用户输入文本
   * @returns 是否同时命中了时间与业务意图
   */
  public checkSubscriptionIntent(text: string): boolean {
    if (!text) return false;
    
    // 重置正则的 lastIndex 以防全局匹配模式（g）影响多次测试
    this.timeRegex.lastIndex = 0;
    this.businessRegex.lastIndex = 0;

    const hasTime = this.timeRegex.test(text);
    const hasBusiness = this.businessRegex.test(text);

    return hasTime && hasBusiness;
  }

  /**
   * 提取命中的具体关键词，用于在 UI 上进行高亮或引导提示
   * 
   * @param text 待检测的用户输入文本
   * @returns 提取出的具体时间与业务关键词（多个词以“、”分隔）
   */
  public extractKeywords(text: string): ExtractedKeywords {
    if (!text) {
      return { time: '', business: '' };
    }

    // 匹配并去重命中的时间关键词
    const matchedTimeSet = new Set<string>();
    this.timeKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        matchedTimeSet.add(keyword);
      }
    });

    // 匹配并去重命中的业务关键词
    const matchedBusinessSet = new Set<string>();
    this.businessKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        matchedBusinessSet.add(keyword);
      }
    });

    return {
      time: Array.from(matchedTimeSet).join('、'),
      business: Array.from(matchedBusinessSet).join('、')
    };
  }
}

// 导出单例或常用纯函数，方便直接调用
const defaultRecognizer = new IntentRecognizer();

/**
 * 检查订阅意图（便捷单例函数）
 * @param text 待检测的文本
 */
export function checkSubscriptionIntent(text: string): boolean {
  return defaultRecognizer.checkSubscriptionIntent(text);
}

/**
 * 提取订阅关键词（便捷单例函数）
 * @param text 待检测的文本
 */
export function extractKeywords(text: string): ExtractedKeywords {
  return defaultRecognizer.extractKeywords(text);
}
