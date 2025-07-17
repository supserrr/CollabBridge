import React, { useState, useEffect } from 'react';
import { frontendChecker } from '@/utils/integrationChecker';
import { ENV } from '@/config';

interface ConnectionCheckResult {
  component: string;
  status: 'connected' | 'disconnected' | 'partial';
  details: string;
  critical: boolean;
}

interface DebugPanelProps {
  className?: string;
}

export function DebugPanel({ className = '' }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<ConnectionCheckResult[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      const checkResults = await frontendChecker.checkAll();
      setResults(checkResults);
      setScore(frontendChecker.getConnectionScore());
    } catch (error) {
      console.error('Debug panel check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && results.length === 0) {
      runCheck();
    }
  }, [isOpen]);

  // Only show in development
  if (!ENV.IS_DEVELOPMENT) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score === 100) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'partial':
        return '⚠️';
      case 'disconnected':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Debug Panel"
      >
        <i className="fas fa-bug"></i>
        {score > 0 && (
          <span className={`ml-2 font-semibold ${getScoreColor(score)}`}>
            {score}%
          </span>
        )}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Frontend Debug
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={runCheck}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  title="Refresh"
                >
                  <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            {score > 0 && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Connection Score:
                  </span>
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      score === 100 ? 'bg-green-600' : 
                      score >= 90 ? 'bg-yellow-600' : 
                      'bg-red-600'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-80">
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-500"></i>
                <p className="text-gray-500 mt-2">Running connectivity check...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <span className="text-lg" title={result.status}>
                      {getStatusIcon(result.status)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.component}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {result.details}
                      </p>
                      {result.critical && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mt-1">
                          Critical
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-info-circle text-2xl mb-2"></i>
                <p>Click refresh to run connectivity check</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Development mode only
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebugPanel;
