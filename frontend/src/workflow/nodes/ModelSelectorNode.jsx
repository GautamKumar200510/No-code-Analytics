import React from 'react';
import CustomNodeWrapper from './CustomNodeWrapper';
import { Cpu, Tag, Layers } from 'lucide-react';

const ALGO_LABELS = {
  logistic_regression: 'Logistic Regression',
  linear_regression: 'Linear Regression',
  decision_tree: 'Decision Tree',
  random_forest: 'Random Forest',
  knn: 'K-Nearest Neighbors',
  svm: 'Support Vector Machine'
};

export default function ModelSelectorNode({ id, data, selected }) {
  const problemType = data?.problem_type || 'classification';
  const algoKey = data?.algorithm || (problemType === 'classification' ? 'random_forest' : 'linear_regression');
  const algoName = ALGO_LABELS[algoKey] || algoKey.replace(/_/g, ' ');

  return (
    <CustomNodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Model Selection"
      subtitle="Algorithm & Params"
      iconName="Cpu"
      gradient="from-purple-500 to-purple-600"
      hasInput={true}
      hasOutput={true}
      onOpenConfig={data?.onOpenConfig}
      onDeleteNode={data?.onDeleteNode}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Tag className="w-3.5 h-3.5 text-purple-500" /> Type
          </span>
          <span className="font-semibold text-slate-800 capitalize">
            {problemType}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Layers className="w-3.5 h-3.5 text-purple-500" /> Model
          </span>
          <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[120px]" title={algoName}>
            {algoName}
          </span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
}
