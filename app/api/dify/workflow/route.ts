    import { NextRequest, NextResponse } from 'next/server';

// APIのベースURLとAPIキーを直接指定（環境変数が読み込めない場合のフォールバック）
const DIFY_API_URL = process.env.NEXT_PUBLIC_DIFY_API_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inputs, response_mode = 'blocking', user = 'anonymous' } = body;
    
    if (!inputs) {
      return NextResponse.json(
        { error: '入力が見つかりません' },
        { status: 400 }
      );
    }

    // APIのURLとキーをログに出力（デバッグ用）
    console.log('DIFY_API_URL:', DIFY_API_URL);
    console.log('DIFY_API_KEY is set:', !!DIFY_API_KEY);

    if (!DIFY_API_URL) {
      return NextResponse.json(
        { error: 'API URLが設定されていません' },
        { status: 500 }
      );
    }

    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 500 }
      );
    }

    // Dify APIにリクエスト
    // ワークフローIDは不要で、直接 /workflows/run エンドポイントを使用
    const response = await fetch(`${DIFY_API_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        inputs,
        response_mode,
        user,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Dify API error:', errorData);
      
      return NextResponse.json(
        { error: 'ワークフローの実行に失敗しました', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error running workflow:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
