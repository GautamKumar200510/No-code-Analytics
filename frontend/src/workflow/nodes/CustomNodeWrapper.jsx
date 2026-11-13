import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Database, Sliders, AlertCircle, CheckSquare, Split, Cpu, Zap, 
  BarChart3, Sparkles, Settings, Trash2, CheckCircle2, Loader2, AlertTriangle
} from 'lucide-react';

const ICON_MAP = {
  Database,
  Sliders,
  AlertCircle,
  CheckSquare,
  Split,
  Cpu,
  Zap,
  BarChart3,
  Sparkles,
};

export default function CustomNodeWrapper({
  id,
  data,
  selected,
  title,
  subtitle,
  iconName = 'Cpu',
  gradient = 'from-blue-500 to-blue-600',
  hasInput = true,
  hasOutput = true,
  children,
  onOpenConfig,
  onDeleteNode,
}) {
  const Icon = ICON_MAP[iconName] || Cpu;
  const status = data?.executionStatus; // 'idle' | 'running' | 'success' | 'error'

  return (
    <div
      className={`relative rounded-xl bg-white border shadow-soft transition-all duration-200 min-w-[240px] max-w-[280px] ${
        selected ? 'border-blue-500 ring-4 ring-blue-100 shadow-soft-lg' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Input Handle */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !-left-1.5 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 !transition-transform hover:scale-125"
        />
      )}

      {/* Node Header */}
      <div className={`flex items-center justify-between p-3 rounded-t-xl bg-gradient-to-r ${gradient} text-white`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold leading-tight truncate">{title}</h4>
            <p className="text-[10px] text-white/80 truncate leading-tight">{subtitle}</p>
          </div>
        </div>

        {/* Status / Quick Action */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
          {status === 'running' && (
            <span className="flex items-center gap-1 text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full text-white font-medium animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
            </span>
          )}
          {status === 'success' && (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/80 px-1.5 py-0.5 rounded-full text-white font-medium">
              <CheckCircle2 className="w-3 h-3" />
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 text-[10px] bg-rose-500/80 px-1.5 py-0.5 rounded-full text-white font-medium">
              <AlertTriangle className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 text-xs text-slate-600 space-y-2">
        {children}
      </div>

      {/* Node Footer Actions */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100 rounded-b-xl text-[11px] text-slate-500">
        <span className="text-[10px] text-slate-400 font-mono">ID: {id}</span>
        <div className="flex items-center gap-1.5">
          {onOpenConfig && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenConfig(id, data);
              }}
              title="Configure Node"
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteNode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(id);
              }}
              title="Delete Node"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Output Handle */}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !-right-1.5 !bg-indigo-500 !border-2 !border-white hover:!bg-indigo-600 !transition-transform hover:scale-125"
        />
      )}
    </div>
  );
}
