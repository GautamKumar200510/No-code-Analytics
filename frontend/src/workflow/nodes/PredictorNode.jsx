import React from 'react';
import CustomNodeWrapper from './CustomNodeWrapper';
import { Sparkles, PlayCircle } from 'lucide-react';

export default function PredictorNode({ id, data, selected }) {
  const lastPred = data?.lastPrediction;

  return (
    <CustomNodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Prediction Block"
      subtitle="Interactive Inference"
      iconName="Sparkles"
      gradient="from-pink-500 to-rose-600"
      hasInput={true}
      hasOutput={false}
      onOpenConfig={data?.onOpenConfig}
      onDeleteNode={data?.onDeleteNode}
    >
      <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
          <PlayCircle className="w-3.5 h-3.5 text-pink-500" /> Output
        </span>
        <span className="font-bold text-slate-800 text-[11px] truncate max-w-[120px]" title={lastPred ? String(lastPred) : 'Live Ready'}>
          {lastPred !== undefined ? `Pred: ${lastPred}` : 'Live Ready'}
        </span>
      </div>
    </CustomNodeWrapper>
  );
}
