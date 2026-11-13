import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';

import DataLoaderNode from './nodes/DataLoaderNode';
import MissingValueNode from './nodes/MissingValueNode';
import PreprocessorNode from './nodes/PreprocessorNode';
import FeatureSelectorNode from './nodes/FeatureSelectorNode';
import TrainTestSplitNode from './nodes/TrainTestSplitNode';
import ModelSelectorNode from './nodes/ModelSelectorNode';
import ModelTrainerNode from './nodes/ModelTrainerNode';
import ModelEvaluatorNode from './nodes/ModelEvaluatorNode';
import PredictorNode from './nodes/PredictorNode';

import WorkflowToolbar from './WorkflowToolbar';
import WorkflowSidebar from './WorkflowSidebar';
import NodeConfigDrawer from './NodeConfigDrawer';
import WorkflowExecutionModal from './WorkflowExecutionModal';

import { NODE_TYPES_DEF, WORKFLOW_TEMPLATES } from './templates';
import { runWorkflow, validateWorkflow } from '../services/api';

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: '#6366f1', strokeWidth: 2.5 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
    width: 16,
    height: 16,
  },
};

export default function WorkflowCanvas({ initialTemplate = 'iris-classification' }) {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Initialize with Iris template
  const defaultTmpl = WORKFLOW_TEMPLATES.find(t => t.id === initialTemplate) || WORKFLOW_TEMPLATES[0];

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultTmpl.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultTmpl.edges);

  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Node deletion helper
  const handleDeleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // Open config drawer
  const handleOpenConfig = useCallback((id, data) => {
    const targetNode = nodes.find((n) => n.id === id);
    if (targetNode) {
      setSelectedNode(targetNode);
    }
  }, [nodes]);

  // Inject callbacks into node data
  const processedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onDeleteNode: handleDeleteNode,
        onOpenConfig: handleOpenConfig,
      },
    }));
  }, [nodes, handleDeleteNode, handleOpenConfig]);

  // Register Custom Node Types
  const nodeTypes = useMemo(() => ({
    dataLoader: DataLoaderNode,
    missingValueHandler: MissingValueNode,
    preprocessor: PreprocessorNode,
    featureSelector: FeatureSelectorNode,
    trainTestSplit: TrainTestSplitNode,
    modelSelector: ModelSelectorNode,
    modelTrainer: ModelTrainerNode,
    modelEvaluator: ModelEvaluatorNode,
    predictor: PredictorNode,
  }), []);

  // Validate connections whenever nodes or edges change
  useEffect(() => {
    const errs = [];
    const types = nodes.map(n => n.type);
    if (!types.includes('dataLoader')) {
      errs.push("Add a 'Data Loading' node to specify dataset.");
    }
    if (!types.includes('modelSelector') && !types.includes('modelTrainer')) {
      errs.push("Add a 'Model Selection' or 'Model Training' block.");
    }
    if (nodes.length > 1 && edges.length === 0) {
      errs.push("Connect nodes together with edges.");
    }
    setValidationErrors(errs);
  }, [nodes, edges]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2.5 } }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Drag and drop handlers
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;

    const nodeDef = NODE_TYPES_DEF.find(n => n.type === type);
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition
      ? reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY })
      : {
          x: event.clientX - bounds.left - 100,
          y: event.clientY - bounds.top - 50,
        };

    const newNodeId = `node-${Date.now().toString().slice(-4)}`;
    const newNode = {
      id: newNodeId,
      type,
      position,
      data: {
        ...(nodeDef?.defaultData || {}),
        executionStatus: 'idle',
      },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  // Update node data from drawer
  const handleUpdateNodeData = useCallback((id, updatedData) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              ...updatedData,
            },
          };
        }
        return n;
      })
    );
  }, [setNodes]);

  // Load a prebuilt template
  const handleLoadTemplate = useCallback((template) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNode(null);
    if (reactFlowInstance) {
      setTimeout(() => reactFlowInstance.fitView({ padding: 0.2 }), 100);
    }
  }, [reactFlowInstance, setNodes, setEdges]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all blocks from the canvas?")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setExecutionResult(null);
    }
  }, [setNodes, setEdges]);

  // Fit View
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);

  // Save to localStorage
  const handleSaveWorkflow = useCallback(() => {
    const flow = { nodes, edges };
    localStorage.setItem('mlflow_saved_workflow', JSON.stringify(flow));
    alert("Workflow saved successfully to your browser storage!");
  }, [nodes, edges]);

  // Export workflow JSON
  const handleExportWorkflow = useCallback(() => {
    const flow = { nodes, edges };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `mlflow_pipeline_${Date.now()}.json`);
    dlAnchorElem.click();
  }, [nodes, edges]);

  // Run Workflow via Backend API
  const handleRunWorkflow = async () => {
    if (validationErrors.length > 0) {
      alert("Please fix the workflow issues before running:\n\n• " + validationErrors.join('\n• '));
      return;
    }

    try {
      setIsRunning(true);
      // Mark all nodes as running
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, executionStatus: 'running' },
        }))
      );

      const res = await runWorkflow(nodes, edges);

      if (res.success) {
        setExecutionResult(res);
        setShowResultModal(true);

        // Update each node with execution results and success status
        setNodes((nds) =>
          nds.map((n) => {
            const stepInfo = res.steps?.find((s) => s.node_id === n.id);
            const extraData = {};
            if (n.type === 'modelEvaluator') {
              extraData.metrics = res.evaluation?.metrics;
            }
            if (n.type === 'predictor') {
              extraData.model_id = res.model_id;
              extraData.feature_info = res.model_metadata?.feature_info;
              if (res.sample_prediction) {
                extraData.lastPrediction = res.sample_prediction.prediction;
              }
            }
            return {
              ...n,
              data: {
                ...n.data,
                ...extraData,
                executionStatus: stepInfo ? stepInfo.status : 'success',
              },
            };
          })
        );
      } else {
        alert("Workflow execution failed:\n" + (res.message || res.error || "Unknown error"));
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: { ...n.data, executionStatus: 'error' },
          }))
        );
      }
    } catch (err) {
      alert("Network or Server error: " + (err.response?.data?.error || err.message));
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, executionStatus: 'error' },
        }))
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50">
      {/* Left Sidebar */}
      <WorkflowSidebar onLoadTemplate={handleLoadTemplate} />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col h-full relative" ref={reactFlowWrapper}>
        <WorkflowToolbar
          isRunning={isRunning}
          onRunWorkflow={handleRunWorkflow}
          onClearCanvas={handleClearCanvas}
          onFitView={handleFitView}
          onSaveWorkflow={handleSaveWorkflow}
          onExportWorkflow={handleExportWorkflow}
          validationErrors={validationErrors}
        />

        <div className="flex-1 w-full h-full relative">
          <ReactFlow
            nodes={processedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls className="!bg-white !border !border-slate-200 !shadow-soft !rounded-xl overflow-hidden" />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'dataLoader': return '#3b82f6';
                  case 'preprocessor': return '#6366f1';
                  case 'missingValueHandler': return '#f59e0b';
                  case 'featureSelector': return '#10b981';
                  case 'trainTestSplit': return '#06b6d4';
                  case 'modelSelector': return '#a855f7';
                  case 'modelTrainer': return '#f97316';
                  case 'modelEvaluator': return '#8b5cf6';
                  case 'predictor': return '#ec4899';
                  default: return '#94a3b8';
                }
              }}
              className="!bg-white/80 !border !border-slate-200 !shadow-soft !rounded-xl overflow-hidden"
            />
            <Background color="#cbd5e1" gap={20} size={1.2} />
          </ReactFlow>
        </div>
      </div>

      {/* Configuration Drawer */}
      {selectedNode && (
        <NodeConfigDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdateNodeData={handleUpdateNodeData}
        />
      )}

      {/* Execution Results Modal */}
      <WorkflowExecutionModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={executionResult}
        isRunning={isRunning}
      />
    </div>
  );
}
