'use client';

import { useState } from 'react';
import WorkflowRunner from './components/WorkflowRunner';

export default function Home() {
  // Dify側の設定に合わせた用途選択オプション
  const purposeOptions = [
    { value: 'summary', label: '要約する', execution_option: '要約する' },
    { value: 'time_series', label: '時系列順にまとめる', execution_option: '時系列順にまとめる' },
    { value: 'verbatim', label: '全体を逐語訳する', execution_option: '全体を逐語訳する' },
    { value: 'action_items', label: 'ステークホルダー別のネクストアクションを整理', execution_option: 'ステークホルダー別のネクストアクションを整理' }
  ];

  return (
    <main className="min-h-screen bg-secondary-color py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-color mb-2 fade-in">
            議事録複数パターン処理
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            アップロードした議事録を、時系列順、逐語訳、アクションアイテム抽出、要約など様々な形式で整理できます
          </p>
        </header>
        
        {/* メインコンテンツ */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左側: 入力エリア */}
          <div className="w-full md:w-1/2 card p-6 fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-semibold mb-4 text-primary-color">入力</h2>
            <WorkflowRunner purposeOptions={purposeOptions} />
          </div>
          
          {/* 右側: 説明エリア（結果はWorkflowRunnerコンポーネント内で表示） */}
          <div className="w-full md:w-1/2 card p-6 fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-semibold mb-4 text-primary-color">使い方</h2>
            <div className="prose">
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <span className="font-medium">議事録ファイルをアップロード</span>
                  <p className="text-sm text-gray-600">テキスト、マークダウン、PDF、Word形式の議事録ファイルをアップロードできます。</p>
                </li>
                <li>
                  <span className="font-medium">処理方法を選択</span>
                  <p className="text-sm text-gray-600">要約、時系列順、逐語訳、アクションアイテム抽出から選択してください。</p>
                </li>
                <li>
                  <span className="font-medium">実行ボタンをクリック</span>
                  <p className="text-sm text-gray-600">AIが議事録を分析し、選択した形式で整理します。処理には数秒〜数十秒かかります。</p>
                </li>
                <li>
                  <span className="font-medium">結果を確認</span>
                  <p className="text-sm text-gray-600">処理結果が表示されます。結果はコピーして他のアプリケーションで利用できます。</p>
                </li>
              </ol>
            </div>
            
            {/* 処理方法の説明 */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-primary-color">処理方法の説明</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white border-l-4 border-primary-color rounded-r-md shadow-sm">
                  <h4 className="font-medium">要約する</h4>
                  <p className="text-sm text-gray-600">議事録の内容を簡潔に要約します。</p>
                </div>
                <div className="p-3 bg-white border-l-4 border-primary-color rounded-r-md shadow-sm">
                  <h4 className="font-medium">時系列順にまとめる</h4>
                  <p className="text-sm text-gray-600">議事録を時間の流れに沿って整理します。</p>
                </div>
                <div className="p-3 bg-white border-l-4 border-primary-color rounded-r-md shadow-sm">
                  <h4 className="font-medium">全体を逐語訳する</h4>
                  <p className="text-sm text-gray-600">議事録の内容を詳細に書き起こします。</p>
                </div>
                <div className="p-3 bg-white border-l-4 border-primary-color rounded-r-md shadow-sm">
                  <h4 className="font-medium">ステークホルダー別のネクストアクションを整理</h4>
                  <p className="text-sm text-gray-600">議事録から関係者ごとのアクションアイテムを抽出して整理します。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* フッター */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p> 2025 Powered by Givery</p>
        </footer>
      </div>
    </main>
  );
}
