import { checkSubscriptionIntent, extractKeywords, IntentRecognizer } from '../IntentRecognizer';

describe('IntentRecognizer 订阅意图识别测试', () => {
  
  test('应该同时命中间意图和业务意图并返回 true', () => {
    // 用例 1: 包含“今天”（时间）和“开单货量”（业务，命中 货量、开单）
    const text1 = '请帮我查一下今天华东冷链的开单货量是多少';
    expect(checkSubscriptionIntent(text1)).toBe(true);
    
    const keywords1 = extractKeywords(text1);
    expect(keywords1.time).toContain('今天');
    expect(keywords1.business).toContain('开单');
    expect(keywords1.business).toContain('货量');

    // 用例 2: 包含“定时”（时间）和“温度”（业务）
    const text2 = '如果大区车辆温度发生异常，请每天早上定时通知我';
    expect(checkSubscriptionIntent(text2)).toBe(true);
    
    const keywords2 = extractKeywords(text2);
    expect(keywords2.time).toContain('每天');
    expect(keywords2.time).toContain('早上');
    expect(keywords2.time).toContain('定时');
    expect(keywords2.business).toContain('温度');
    expect(keywords2.business).toContain('异常');
  });

  test('仅命中间时效性意图时，应该返回 false', () => {
    // 仅命中“最新”、“早上”
    const text = '把今天早上最新更新的数据发我看看';
    expect(checkSubscriptionIntent(text)).toBe(false);
    
    const keywords = extractKeywords(text);
    expect(keywords.time).toContain('今天');
    expect(keywords.time).toContain('早上');
    expect(keywords.time).toContain('最新');
    expect(keywords.business).toBe('');
  });

  test('仅命中核心物流指标意图时，应该返回 false', () => {
    // 仅命中“应签”、“异常”
    const text = '检查一下华北干线大区的应交应提以及应签是否有异常';
    expect(checkSubscriptionIntent(text)).toBe(false);
    
    const keywords = extractKeywords(text);
    expect(keywords.time).toBe('');
    expect(keywords.business).toContain('应交');
    expect(keywords.business).toContain('应提');
    expect(keywords.business).toContain('应签');
    expect(keywords.business).toContain('异常');
  });

  test('完全未命中的场景下，应该返回 false', () => {
    const text = '你好，我想了解一下咱们网点人员的分布明细，谢谢。';
    expect(checkSubscriptionIntent(text)).toBe(false);
    
    const keywords = extractKeywords(text);
    expect(keywords.time).toBe('');
    expect(keywords.business).toBe('');
  });

  test('自定义关键词列表的功能应该正常运行', () => {
    const customTime = ['下周', '下个月'];
    const customBusiness = ['罚金', '件量'];
    const recognizer = new IntentRecognizer(customTime, customBusiness);

    // 完全不匹配默认关键词
    expect(recognizer.checkSubscriptionIntent('今天有异常货量吗')).toBe(false);

    // 匹配自定义关键词
    const text = '下周一帮我导出罚金和件量表';
    expect(recognizer.checkSubscriptionIntent(text)).toBe(true);

    const keywords = recognizer.extractKeywords(text);
    expect(keywords.time).toBe('下周');
    expect(keywords.business).toContain('罚金');
    expect(keywords.business).toContain('件量');
  });
});
