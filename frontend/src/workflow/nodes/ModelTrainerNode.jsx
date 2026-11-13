import React from 'react';
import CustomNodeWrapper from './CustomNodeWrapper';
import { Zap, Activity } from 'lucide-react';

export default function ModelTrainerNode({ id, data, selected }) {
  const isTrained = data?.executionStatus === 'success';

  return (
    <CustomNodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Model Training"
      subtitle="Scikit-learn Engine"
      iconName="Zap"
      gradient="from-orange-500 to-amber-600"
      hasInput={true}
      hasOutput={true}
      onOpenConfig={data?.onOpenConfig}
      onDeleteNode={data?.onDeleteNode}
    >
      <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Activity className="w-3.5 h-3.5 text-orange-500" /> State
        </span>
        <span className={`font-semibold text-[11px] ${isTrained ? 'text-emerald-600 font-bold' : 'text-slate-600'}`}>
          {isTrained ? 'Trained ✓' : 'Ready to Run'}
        </span>
      </div>
    </CustomNodeWrapper>
  );
}
