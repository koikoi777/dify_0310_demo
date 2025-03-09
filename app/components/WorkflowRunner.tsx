'use client';

import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// 入力フィールドの型定義
type InputFieldType = 'text' | 'textarea' | 'select';

interface InputField {
  name: string;
  label: string;
  type: InputFieldType;
  placeholder: string;
  options?: { value: string; label: string }[];
}

interface WorkflowRunnerProps {
  title: string;
  workflowId: string;
  inputFields: InputField[];
}

export default function WorkflowRunner({ title, workflowId, inputFields }: WorkflowRunnerProps) {
  // 入力値の状態を管理
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 入力値の変更を処理
  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // ワークフロー実行
  const runWorkflow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/dify/workflow', {
        workflowId,
        inputs
      });
      
      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || 'ワークフロー実行中にエラーが発生しました');
      }
    } catch (err) {
      setError('APIリクエスト中にエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 入力フィールドをレンダリング
  const renderInputField = (field: InputField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={inputs[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
          />
        );
      case 'select':
        return (
          <select
            id={field.name}
            value={inputs[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{field.placeholder}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            id={field.name}
            value={inputs[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        <div className="space-y-4">
          {inputFields.map(field => (
            <div key={field.name} className="mb-4">
              <label htmlFor={field.name} className="block mb-1 font-medium">
                {field.label}
              </label>
              {renderInputField(field)}
            </div>
          ))}
          
          <div className="flex justify-end mt-4">
            <button
              onClick={runWorkflow}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '処理中...' : '実行'}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {result && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3">結果</h3>
          <div className="prose max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
