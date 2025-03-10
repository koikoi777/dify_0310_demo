import { NextRequest, NextResponse } from 'next/server';

// ワークフローID（環境変数から取得するか、APIキーに紐づいている場合は不要）
const WORKFLOW_ID = 'f5f98718-2861-49ef-9407-0213d756b5d0';

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

    // Dify APIにリクエスト
    const response = await fetch(`${process.env.DIFY_API_URL}/workflows/${WORKFLOW_ID}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
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
      
      // 404エラーの場合、ワークフローIDが見つからない可能性がある
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'ワークフローIDが見つかりません。APIキーに紐づいているか確認してください。' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'ワークフローの実行に失敗しました' },
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
