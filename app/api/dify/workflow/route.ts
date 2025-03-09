import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Dify APIのエンドポイント
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

/**
 * Dify APIのワークフローエンドポイントにリクエストを送信する
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const { workflowId, inputs } = await request.json();

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'ワークフローIDが指定されていません' },
        { status: 400 }
      );
    }

    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'DIFY_API_KEYが設定されていません' },
        { status: 500 }
      );
    }

    // Dify APIリクエスト
    const response = await axios.post(
      `${DIFY_API_URL}/workflows/${workflowId}/run`,
      {
        inputs,
        user: 'user-' + Date.now() // 一意のユーザーID
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DIFY_API_KEY}`
        }
      }
    );

    // レスポンスの整形
    return NextResponse.json({
      success: true,
      result: response.data.output || response.data.result || JSON.stringify(response.data, null, 2)
    });

  } catch (error: any) {
    console.error('Dify API Error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.message || error.message || 'ワークフロー実行中にエラーが発生しました' 
      },
      { status: error.response?.status || 500 }
    );
  }
}
