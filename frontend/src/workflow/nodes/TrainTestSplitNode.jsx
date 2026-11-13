import React from 'react';
import CustomNodeWrapper from './CustomNodeWrapper';
import { Split, PieChart, Shuffle } from 'lucide-react';

export default function TrainTestSplitNode({ id, data, selected }) {
  const testSize = data?.test_size !== undefined ? Number(data.test_size) : 0.2;
  const trainPct = Math.round((1 - testSize) * 100);
  const testPct = Math.round(testSize * 100);

  return (
    <CustomNodeWrapper
      id={id}
      data={data}
      selected={selected}
      title="Train-Test Split"
      subtitle="Data Partitioning"
      iconName="Split"
      gradient="from-cyan-500 to-cyan-600"
      hasInput={true}
      hasOutput={true}
      onOpenConfig={data?.onOpenConfig}
      onDeleteNode={data?.onDeleteNode}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <PieChart className="w-3.5 h-3.5 text-cyan-500" /> Ratio
          </span>
          <span className="font-semibold text-slate-800">
            {trainPct}% / {testPct}%
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Shuffle className="w-3.5 h-3.5 text-cyan-500" /> Seed
          </span>
          <span className="font-mono text-slate-800 font-semibold">
            {data?.random_state ?? 42}
          </span>
        </div>
      </div>
    </CustomNodeWrapper>
  );
}
