import { NextRequest, NextResponse } from 'next/server';
import { TTSClient } from 'coze-coding-dev-sdk';

interface TTSRequest {
  text: string;
  speaker: string;
  uid: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, speaker, uid } = body;

    if (!text || !speaker) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 清理文本
    const cleanText = text
      .replace(/（[^）]*）/g, '')  // 去掉中文括号
      .replace(/\([^)]*\)/g, '')   // 去掉英文括号
      .replace(/\[[^\]]*\]/g, '')  // 去掉中括号
      .replace(/[「」『』]/g, '')  // 去掉其他标点
      .replace(/\s+/g, ' ')        // 合并空格
      .trim();

    if (!cleanText) {
      return NextResponse.json(
        { error: 'No text to synthesize after cleaning' },
        { status: 400 }
      );
    }

    // 调用 TTS API
    const client = new TTSClient();

    try {
      const response = await client.synthesize({
        uid: uid || `user-${Date.now()}`,
        text: cleanText,
        speaker: speaker,
        audioFormat: 'mp3',
        sampleRate: 24000,
      });

      // 返回音频数据
      return NextResponse.json({
        audioUri: response.audioUri || null,
        audioData: null,
        audioSize: response.audioSize || 0,
      });
    } catch (ttsError) {
      console.error('TTS API error:', ttsError);
      // TTS 失败不影响游戏继续
      return NextResponse.json(
        { 
          error: 'TTS generation failed',
          audioUri: null,
          audioData: null,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('TTS route error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}
