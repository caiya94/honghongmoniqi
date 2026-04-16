import { NextRequest, NextResponse } from 'next/server';
import { LLMClient } from 'coze-coding-dev-sdk';

interface Message {
  role: 'user' | 'partner';
  content: string;
}

interface ChatRequest {
  gender: 'female' | 'male';
  scenario: string;
  messages: Message[];
  affection: number;
  step: number;
  isGameOver: boolean;
  won: boolean;
}

interface Option {
  id: string;
  content: string;
  score: number;
}

// 随机打乱选项顺序
const shuffleOptions = (options: Option[]): Option[] => {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 解析 LLM 返回的选项
const parseOptions = (optionsText: string): Option[] => {
  const lines = optionsText.split('\n').filter((line) => line.trim());
  const options: Option[] = [];

  for (const line of lines) {
    // 匹配格式如 "1. 选项内容 (+10)" 或 "1. 选项内容 (+10分)" 或 "1. 选项内容(-10)" 或 "选项内容 (分数)"
    const match = line.match(/^\d*[.、:：\s]*\s*(.+?)(?:[（(]\s*([+-]?\d+)\s*(?:分)?[）)]\s*)?$/);
    if (match && match[1]) {
      const content = match[1].trim();
      const score = match[2] ? parseInt(match[2], 10) : Math.floor(Math.random() * 31) - 15;
      if (content && content.length > 2) {
        options.push({
          id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          content,
          score: isNaN(score) ? 0 : score,
        });
      }
    }
  }

  // 如果按行解析失败，尝试按数字序号分割
  if (options.length < 3) {
    const numSplit = optionsText.split(/\d+[.、:：]/).filter(s => s.trim());
    for (const text of numSplit) {
      if (options.length >= 6) break;
      const cleanText = text.replace(/[（(][+-]?\d+\s*(?:分)?[）)]/g, '').trim();
      if (cleanText && cleanText.length > 2) {
        const scoreMatch = cleanText.match(/[（(]([+-]?\d+)\s*(?:分)?[）)]/);
        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : Math.floor(Math.random() * 31) - 15;
        const content = cleanText.replace(/[（(][+-]?\d+\s*(?:分)?[）)]/g, '').trim();
        if (content) {
          options.push({
            id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            content,
            score: isNaN(score) ? 0 : score,
          });
        }
      }
    }
  }

  // 如果还是不够，用更激进的方式提取
  if (options.length < 3) {
    // 按分号或其他分隔符分割
    const parts = optionsText.split(/[;；|｜\n]/).filter(s => s.trim());
    for (const part of parts) {
      if (options.length >= 6) break;
      const cleanText = part.replace(/^\d*[.、:：\s]*/, '').replace(/[（(][+-]?\d+\s*(?:分)?[）)]/g, '').trim();
      if (cleanText && cleanText.length > 5) {
        const scoreMatch = part.match(/[（(]([+-]?\d+)\s*(?:分)?[）)]/);
        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : Math.floor(Math.random() * 31) - 15;
        options.push({
          id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          content: cleanText,
          score: isNaN(score) ? 0 : score,
        });
      }
    }
  }

  // 去重：如果有重复内容的选项，只保留一个
  const uniqueOptions: Option[] = [];
  const seen = new Set<string>();
  for (const opt of options) {
    const key = opt.content.slice(0, 10);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueOptions.push(opt);
    }
  }

  // 确保有 6 个选项
  while (uniqueOptions.length < 6) {
    uniqueOptions.push({
      id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      content: `随便吧，反正你也不会认真对待`,
      score: -10,
    });
  }

  return shuffleOptions(uniqueOptions.slice(0, 6));
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { gender, scenario, messages, affection, isGameOver, won } = body;

    // 如果游戏已结束，返回结束语
    if (isGameOver) {
      const endMessages = won
        ? [
            `哼，看在你这么努力哄我的份上...我就原谅你这一次吧！下次不许再犯了哦~`,
            `好吧好吧，我承认你是有点本事的...这次就算了，但是你要请我吃大餐！`,
            `算你过关了！下次要是再这样，我绝对不会这么容易原谅你的！`,
          ]
        : [
            `我们...先冷静一下吧。我需要一个人静静。`,
            `你真的在乎我的感受吗？我现在真的很失望...`,
            `我不想说话了，我觉得我们之间可能需要一些空间。`,
          ];

      return NextResponse.json({
        partnerMessage: endMessages[Math.floor(Math.random() * endMessages.length)],
        options: [],
        isEnd: true,
      });
    }

    // 构建对话历史
    const pronoun = gender === 'female' ? '她' : '他';
    const partnerName = gender === 'female' ? '女朋友' : '男朋友';

    // 获取情绪描述
    let emotionDesc = '';
    if (affection < -30) {
      emotionDesc = `非常生气，可能会说"我不想跟你说话"或冷漠回应`;
    } else if (affection < 0) {
      emotionDesc = `很生气，可能会质问或冷嘲热讽`;
    } else if (affection < 30) {
      emotionDesc = `还在生气，但愿意听你解释`;
    } else if (affection < 60) {
      emotionDesc = `情绪缓和了一些，可能还嘴硬但语气没那么冲`;
    } else if (affection < 80) {
      emotionDesc = `快被哄好了，可能会小声说"哼"或者撒娇`;
    } else {
      emotionDesc = `已经被哄好了，但还是会要求你保证不再犯`;
    }

    // 第一轮的引导语
    const introPrompt =
      messages.length === 0
        ? `场景：${scenario}。${pronoun}是你的${partnerName}，现在非常生气。
请用一句话开始对话，表达${pronoun}的愤怒和不开心。不要太长，15-30字左右。`
        : '';

    // 后续对话的引导语
    const followUpPrompt =
      messages.length > 0
        ? `继续对话。${pronoun}现在的状态：${emotionDesc}。
根据之前的对话，以${pronoun}的口吻回应用户的选择，保持情绪连贯。不要重复之前说过的内容。
如果好感度>=80，说明已经被哄好了，可以表达原谅但还要提要求。
如果好感度<0，说明还在生气，态度要更加强硬。`
        : '';

    const userPrompt = messages.length === 0 ? introPrompt : followUpPrompt;

    // 构建系统提示
    const systemPrompt = `你是一个情绪化的${gender === 'female' ? '女性' : '男性'}朋友，正在和用户对话。你的回复要符合以下要求：
1. 语气和态度要根据好感度调整（上面已经给出当前状态描述）
2. 可以用括号描述动作和表情，如（吸吸鼻子）、（眼眶红红的）等
3. 对话要自然，不要太长，模拟真实情侣吵架的语气
4. 每次回复要生成6个选项让用户选择后续行动
5. 选项设计要求（重点！）：
   - 2个加分选项（真诚道歉、具体弥补方案、提起共同美好回忆等）+5到+20分
   - 4个减分选项，其中必须包含让人"忍不住想选"的离谱选项！
   
   减分选项的精髓：表面看起来很有道理/很搞笑/很机智，但实际上会让对方更生气！
   举例：
   - "掏出手机搜'女朋友生气了怎么办'念给她听" (-15)
   - "突然开始背社会主义核心价值观" (-20)
   - "发自拍说'我错了但我帅啊'" (-25)
   - "说'你生气的样子还挺可爱的'" (-20)
   - "开始讲一个完全不相关的冷笑话" (-15)
   - "模仿电视剧男主单膝下跪求婚" (-30)
   - "突然认真分析'从心理学角度看...' " (-25)
   - "说'我妈说你不应该这么小气'" (-30)
   - "假装晕倒看对方反应" (-25)
   - "开始唱《爱情买卖》" (-20)
   - "说'那你去找更好的啊'" (-30)
   - "反手也生气'你就不考虑我感受吗'" (-25)
   - "掏出计算器算这次吵架的时间成本" (-25)
   - "开始直播吵架求网友评理" (-30)
   - "突然夸别的女生/男生" (-30)
   
6. 不要告诉用户选项的好坏
7. 格式要求：每行一个选项，格式为"选项内容 (分数)"
8. 选项要多样化，不要重复之前出现过的选项`;

    // 构建消息历史
    const conversationHistory: { role: 'system' | 'user' | 'assistant'; content: string }[] = messages.map((msg) => ({
      role: msg.role === 'partner' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // 调用 LLM
    const client = new LLMClient();
    let partnerMessage = '';
    let optionsText = '';

    try {
      const response = await client.invoke(
        [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userPrompt },
        ],
        {
          temperature: 0.9,
        }
      );

      // 解析响应
      const fullResponse = response.content || '';
      
      // 分离消息和选项
      const lines = fullResponse.split('\n');
      const messageLines: string[] = [];
      const optionLines: string[] = [];
      let inOptions = false;

      for (const line of lines) {
        if (line.match(/^\d+[.、:：]/)) {
          inOptions = true;
          optionLines.push(line);
        } else if (inOptions) {
          optionLines[optionLines.length - 1] += ' ' + line;
        } else {
          messageLines.push(line);
        }
      }

      partnerMessage = messageLines.join('\n').trim();
      optionsText = optionLines.join('\n');

      // 如果消息为空，使用默认值
      if (!partnerMessage) {
        partnerMessage =
          affection < 0
            ? `${pronoun}不理你，继续生闷气...`
            : `哼，你还好意思说！`;
      }
    } catch (error) {
      console.error('LLM API error:', error);
      // 降级处理
      partnerMessage =
        affection < 0
          ? `${pronoun}还是不想理你，叹了口气...`
          : `你怎么现在才来？`;
      optionsText = `1. 真诚道歉 (+15)
2. 解释原因 (+5)
3. 撒娇求原谅 (+10)
4. 转移话题 (-10)
5. 说都是别人的错 (-20)
6. 发个表情包敷衍一下 (-5)`;
    }

    // 解析选项
    const options = parseOptions(optionsText);

    // 清理消息中的括号内容（用于 TTS）
    const cleanMessage = partnerMessage
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/[「」『』]/g, '')
      .trim();

    return NextResponse.json({
      partnerMessage: cleanMessage || partnerMessage,
      options,
      isEnd: false,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
