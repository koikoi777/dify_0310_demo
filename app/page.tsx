'use client';

import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import WorkflowRunner from './components/WorkflowRunner';

export default function Home() {
  // Difyワークフローの実際のIDを設定
  const [workflowId, setWorkflowId] = useState('小泉_Realvalue_議事録');
  const [activeTab, setActiveTab] = useState('workflow');
  
  // ワークフローの入力フィールド定義（Difyワークフローに合わせて調整）
  const workflowInputFields = [
    { 
      name: 'text', 
      label: '議事録テキスト', 
      type: 'textarea' as const, 
      placeholder: '議事録のテキストを入力してください...' 
    },
    { 
      name: 'format', 
      label: '出力フォーマット', 
      type: 'select' as const,
      options: [
        { value: 'json', label: 'JSON' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'text', label: 'プレーンテキスト' }
      ],
      placeholder: '出力フォーマットを選択' 
    },
    {
      name: 'use_case',
      label: '用途',
      type: 'select' as const,
      options: [
        { value: 'summary', label: '要約' },
        { value: 'action_items', label: 'アクションアイテム抽出' },
        { value: 'decision_points', label: '決定事項抽出' }
      ],
      placeholder: '用途を選択'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Dify 議事録処理ワークフロー</h1>
        <p className="text-gray-600 text-lg">
          Difyで作成した議事録処理ワークフローをAPIとして利用するフロントエンド
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'workflow' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('workflow')}
        >
          ワークフロー実行
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'chat' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('chat')}
        >
          チャットインターフェース
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'settings' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          設定
        </button>
      </div>

      {/* タブコンテンツ */}
      <div>
        {/* ワークフロー実行タブ */}
        {activeTab === 'workflow' && (
          <WorkflowRunner 
            title="議事録処理ワークフロー" 
            workflowId={workflowId}
            inputFields={workflowInputFields}
          />
        )}

        {/* チャットインターフェースタブ */}
        {activeTab === 'chat' && (
          <ChatInterface title="Difyアシスタント" />
        )}

        {/* 設定タブ */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">ワークフロー設定</h3>
              
              <div className="mb-4">
                <label className="block mb-1">ワークフローID</label>
                <div className="flex">
                  <input
                    type="text"
                    value={workflowId}
                    onChange={(e) => setWorkflowId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  DifyダッシュボードからワークフローIDを取得してください
                </p>
              </div>

              <div>
                <p className="mb-2">APIキーの設定方法:</p>
                <p className="text-sm">
                  1. プロジェクトルートの .env.local ファイルを編集<br />
                  2. DIFY_API_KEY に有効なAPIキーを設定<br />
                  3. サーバーを再起動
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
