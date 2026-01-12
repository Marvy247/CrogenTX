'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Copy, Check, ExternalLink } from 'lucide-react';
import { X402Transaction } from '@/lib/cronos/types';

export default function TransactionInspector() {
  const [txHash, setTxHash] = useState('');
  const [transaction, setTransaction] = useState<X402Transaction | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const inspectTransaction = async () => {
    if (!txHash) return;

    setLoading(true);
    try {
      // Fetch debug info
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionHash: txHash }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTransaction(result.transaction);
        setDebugInfo(result.debug);
      } else {
        alert('Transaction not found');
      }
    } catch (error) {
      console.error('Error inspecting transaction:', error);
      alert('Failed to inspect transaction');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter transaction hash (0x...)"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={inspectTransaction}
              disabled={!txHash || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Inspecting...' : 'Inspect'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      {transaction && debugInfo && (
        <>
          {/* Basic Info */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Hash</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-white font-mono">{transaction.txHash.slice(0, 20)}...</code>
                    <button onClick={() => copyToClipboard(transaction.txHash)}>
                      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    transaction.status === 'success' ? 'bg-green-500/20 text-green-400' :
                    transaction.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 mb-1">Block Number</p>
                  <p className="text-sm text-white">{transaction.blockNumber}</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 mb-1">Instruction Type</p>
                  <p className="text-sm text-white">{transaction.instructionType}</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 mb-1">Value</p>
                  <p className="text-sm text-white">{transaction.value} CRO</p>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 mb-1">Gas Used</p>
                  <p className="text-sm text-white">{transaction.gasUsed}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(`https://cronoscan.com/tx/${transaction.txHash}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Cronoscan
              </Button>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Issues */}
              {debugInfo.issues.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-300 mb-2">Issues</h4>
                  <div className="space-y-2">
                    {debugInfo.issues.map((issue: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          issue.severity === 'critical' ? 'bg-red-500/10 border border-red-500/20' :
                          issue.severity === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                          'bg-blue-500/10 border border-blue-500/20'
                        }`}
                      >
                        <p className="text-sm text-white">{issue.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution Trace */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-300 mb-2">Execution Trace</h4>
                <div className="space-y-2">
                  {debugInfo.trace.map((step: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <span className={`text-lg ${
                        step.status === 'success' ? 'text-green-400' :
                        step.status === 'failed' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {step.status === 'success' ? '✓' : step.status === 'failed' ? '✗' : '⋯'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{step.step}</p>
                        <p className="text-xs text-zinc-400 mt-1">{step.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gas Analysis */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-300 mb-2">Gas Analysis</h4>
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Gas Used</span>
                    <span className="text-sm text-white font-mono">{debugInfo.gas.used}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Gas Price</span>
                    <span className="text-sm text-white font-mono">{debugInfo.gas.price} Gwei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Efficiency</span>
                    <span className={`text-sm font-medium ${
                      debugInfo.gas.efficiency === 'optimal' ? 'text-green-400' :
                      debugInfo.gas.efficiency === 'fair' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {debugInfo.gas.efficiency.toUpperCase()}
                    </span>
                  </div>
                  {debugInfo.gas.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-700">
                      <p className="text-xs text-zinc-400 mb-2">Suggestions:</p>
                      {debugInfo.gas.suggestions.map((suggestion: string, index: number) => (
                        <p key={index} className="text-xs text-zinc-300">• {suggestion}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {debugInfo.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-zinc-300 mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {debugInfo.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="text-blue-400">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
