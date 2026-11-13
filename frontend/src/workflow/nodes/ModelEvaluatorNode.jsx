import React from 'react';
import CustomNodeWrapper from './CustomNodeWrapper';
import { BarChart3, Award } from 'lucide-react';

export default function ModelEvaluatorNode({ id, data, selected }) {
  const metrics = data?.metrics;
  const isEvaluated = !!metrics;

  return (
    <CustomNodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Model Evaluation"
      subtitle="Metrics & Confusion Matrix"
      iconName="BarChart3"
      gradient="from-violet-500 to-purple-600"
      hasInput={true}
      hasOutput={true}
      onOpenConfig={data?.onOpenConfig}
      onDeleteNode={data?.onDeleteNode}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Award className="w-3.5 h-3.5 text-violet-500" /> Result
          </span>
          <span className="font-bold text-slate-800 text-[11px]">
            {metrics?.accuracy !== undefined
              ? `Acc: ${metrics.accuracy}%`
              : metrics?.r2_score !== undefined
              ? `R²: ${metrics.r2_score}`
              : 'Awaiting Run'}
          </span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
}
