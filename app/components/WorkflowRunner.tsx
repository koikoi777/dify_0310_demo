'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';

interface PurposeOption {
  value: string;
  label: string;
}

interface WorkflowRunnerProps {
  purposeOptions: PurposeOption[];
}

export default function WorkflowRunner({ purposeOptions }: WorkflowRunnerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [purpose, setPurpose] = useState<string>(purposeOptions[0].value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル選択ハンドラー
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  // ファイルドロップハンドラー
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  // 用途選択ハンドラー
  const handlePurposeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPurpose(e.target.value);
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('ファイルをアップロードしてください');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      // ファイルアップロード
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', 'user-' + Date.now());

      const uploadResponse = await fetch('/api/dify/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('ファイルのアップロードに失敗しました');
      }

      const uploadData = await uploadResponse.json();
      const fileId = uploadData.id;

      // ワークフロー実行
      const workflowResponse = await fetch('/api/dify/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            meeting_minutes: {
              transfer_method: 'local_file',
              upload_file_id: fileId,
              type: 'document'
            },
            purpose: purpose
          },
          response_mode: 'blocking',
          user: 'user-' + Date.now()
        }),
      });

      if (!workflowResponse.ok) {
        throw new Error('ワークフローの実行に失敗しました');
      }

      const workflowData = await workflowResponse.json();
      
      // 結果の表示
      if (workflowData.data && workflowData.data.outputs && workflowData.data.outputs.text) {
        setResult(workflowData.data.outputs.text);
      } else {
        setResult(JSON.stringify(workflowData, null, 2));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // クリアボタンハンドラー
  const handleClear = () => {
    setFile(null);
    setResult('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* ファイルアップロードエリア */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            className="hidden" 
            accept=".txt,.md,.pdf,.docx,.doc"
          />
          <p className="mb-2">議事録を入れてください</p>
          <div className="flex justify-center gap-4">
            <button 
              type="button"
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              ローカルアップロード
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
              </svg>
              ファイルリンクの貼り付け
            </button>
          </div>
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              選択されたファイル: {file.name}
            </div>
          )}
        </div>

        {/* 用途選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">用途</label>
          <select
            value={purpose}
            onChange={handlePurposeChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {purposeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ボタンエリア */}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
            disabled={isLoading}
          >
            クリア
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                処理中...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                実行
              </>
            )}
          </button>
        </div>
      </form>

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* 結果表示 */}
      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md overflow-auto max-h-[500px]">
          <h3 className="text-lg font-medium mb-2">処理結果</h3>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
