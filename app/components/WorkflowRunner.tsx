'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';

interface PurposeOption {
  value: string;
  label: string;
  execution_option: string;
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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 選択された用途に対応するexecution_optionを取得する関数
  const getExecutionOption = (selectedPurpose: string): string => {
    const option = purposeOptions.find(opt => opt.value === selectedPurpose);
    return option ? option.execution_option : 'automatic'; // デフォルト値としてautomaticを使用
  };

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
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  // ドラッグオーバーハンドラー
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // ドラッグリーブハンドラー
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
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
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'ファイルのアップロードに失敗しました');
      }

      const uploadData = await uploadResponse.json();
      console.log('Upload response:', uploadData);
      
      // Dify APIからのレスポンスからファイルIDを取得
      const fileId = uploadData.id;
      
      if (!fileId) {
        throw new Error('ファイルIDが取得できませんでした');
      }

      // 選択された用途に対応するexecution_optionを取得
      const executionOption = getExecutionOption(purpose);
      console.log('Selected purpose:', purpose);
      console.log('Using execution_option:', executionOption);

      // ワークフロー実行
      const workflowResponse = await fetch('/api/dify/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            script_file: {
              transfer_method: 'local_file',
              upload_file_id: fileId,
              type: 'document'
            },
            purpose: purpose,
            execution_option: executionOption // 選択された用途に対応する値を使用
          },
          response_mode: 'blocking',
          user: 'user-' + Date.now()
        }),
      });

      if (!workflowResponse.ok) {
        const errorData = await workflowResponse.json();
        console.error('Workflow error details:', errorData);
        throw new Error(errorData.message || errorData.error || 'ワークフローの実行に失敗しました');
      }

      const workflowData = await workflowResponse.json();
      console.log('Workflow response:', workflowData);
      
      // 結果の表示
      if (workflowData.answer) {
        // 新しいAPIレスポンス形式
        setResult(workflowData.answer);
      } else if (workflowData.data && workflowData.data.outputs && workflowData.data.outputs.text) {
        // 古いAPIレスポンス形式
        setResult(workflowData.data.outputs.text);
      } else {
        // フォールバック: JSONをそのまま表示
        setResult(JSON.stringify(workflowData, null, 2));
      }
    } catch (err) {
      console.error('Error:', err);
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
          className={`upload-area ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mb-4 text-lg font-medium">議事録ファイルをドラッグ＆ドロップ</p>
          <p className="mb-4 text-sm text-gray-500">または</p>
          <button 
            type="button"
            className="btn btn-secondary scale-hover mx-auto"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            ファイルを選択
          </button>
          {file && (
            <div className="mt-4 p-2 bg-gray-50 rounded-md flex items-center justify-between fade-in">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <button 
                type="button" 
                className="text-gray-500 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 用途選択 */}
        <div>
          <label className="form-label">処理方法を選択</label>
          <select
            value={purpose}
            onChange={handlePurposeChange}
            className="form-select"
          >
            {purposeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ボタンエリア */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            クリア
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                処理中...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md fade-in">
          <div className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">エラーが発生しました</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 結果表示エリア */}
      {result && (
        <div className="mt-6 p-4 bg-white border border-gray-200 rounded-md shadow-sm overflow-auto slide-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-primary-color">処理結果</h3>
            <button
              type="button"
              className="text-gray-500 hover:text-primary-color"
              onClick={() => {
                navigator.clipboard.writeText(result);
                // コピー成功のフィードバックを表示する場合はここに追加
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
          <div className="prose max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
