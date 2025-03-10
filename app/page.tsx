'use client';

import { useState } from 'react';
import WorkflowRunner from './components/WorkflowRunner';

export default function Home() {
  // 用途選択オプション
  const purposeOptions = [
    { value: 'time_series', label: '時系列順にまとめる' },
    { value: 'agenda_based', label: '議題ごとにまとめる' },
    { value: 'action_items', label: 'アクションアイテムを抽出する' },
    { value: 'summary', label: '要約する' }
  ];

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">議事録複数パターン処理デモ</h1>
      
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* 左側: 入力エリア */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow p-4">
          <WorkflowRunner purposeOptions={purposeOptions} />
        </div>
        
        {/* 右側: 結果表示エリア (WorkflowRunnerコンポーネント内で管理) */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow p-4 min-h-[400px]">
          <div className="text-sm text-gray-500 mb-2">結果</div>
          <div id="result-container" className="min-h-[350px]">
            {/* 結果はWorkflowRunnerコンポーネント内で管理・表示 */}
          </div>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        Powered by Givery
      </footer>
    </main>
  );
}
