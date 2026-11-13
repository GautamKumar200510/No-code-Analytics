export const NODE_TYPES_DEF = [
  {
    type: 'dataLoader',
    label: 'Data Loading',
    category: 'Data Source',
    description: 'Select uploaded dataset or sample dataset for training',
    icon: 'Database',
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-400',
    accentColor: 'blue',
    inputs: 0,
    outputs: 1,
    defaultData: {
      dataset_id: 'sample_iris',
      target_column: 'species',
    }
  },
  {
    type: 'missingValueHandler',
    label: 'Handle Missing Values',
    category: 'Preprocessing',
    description: 'Drop rows or impute with mean, median, mode, or constant',
    icon: 'AlertCircle',
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-400',
    accentColor: 'amber',
    inputs: 1,
    outputs: 1,
    defaultData: {
      numerical_strategy: 'mean',
      categorical_strategy: 'mode',
    }
  },
  {
    type: 'preprocessor',
    label: 'Data Preprocessing',
    category: 'Preprocessing',
    description: 'Apply categorical encoding and numerical scaling',
    icon: 'Sliders',
    color: 'from-indigo-500 to-indigo-600',
    borderColor: 'border-indigo-400',
    accentColor: 'indigo',
    inputs: 1,
    outputs: 1,
    defaultData: {
      categorical_encoding: 'one_hot',
      scaling: 'standard',
    }
  },
  {
    type: 'featureSelector',
    label: 'Feature Selection',
    category: 'Feature Engineering',
    description: 'Select input features to include or exclude from model',
    icon: 'CheckSquare',
    color: 'from-emerald-500 to-emerald-600',
    borderColor: 'border-emerald-400',
    accentColor: 'emerald',
    inputs: 1,
    outputs: 1,
    defaultData: {
      selected_features: [],
    }
  },
  {
    type: 'trainTestSplit',
    label: 'Train-Test Split',
    category: 'Preparation',
    description: 'Divide dataset into training and evaluation sets',
    icon: 'Split',
    color: 'from-cyan-500 to-cyan-600',
    borderColor: 'border-cyan-400',
    accentColor: 'cyan',
    inputs: 1,
    outputs: 1,
    defaultData: {
      test_size: 0.2,
      random_state: 42,
    }
  },
  {
    type: 'modelSelector',
    label: 'Model Selection',
    category: 'Model',
    description: 'Choose machine learning algorithm and hyperparameters',
    icon: 'Cpu',
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-400',
    accentColor: 'purple',
    inputs: 1,
    outputs: 1,
    defaultData: {
      problem_type: 'classification',
      algorithm: 'random_forest',
      hyperparams: {
        n_estimators: 100,
        max_depth: null,
      }
    }
  },
  {
    type: 'modelTrainer',
    label: 'Model Training',
    category: 'Model',
    description: 'Fit the machine learning model on training data',
    icon: 'Zap',
    color: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-400',
    accentColor: 'orange',
    inputs: 1,
    outputs: 1,
    defaultData: {}
  },
  {
    type: 'modelEvaluator',
    label: 'Model Evaluation',
    category: 'Evaluation',
    description: 'Compute test accuracy, F1, confusion matrix or R², MAE',
    icon: 'BarChart3',
    color: 'from-violet-500 to-violet-600',
    borderColor: 'border-violet-400',
    accentColor: 'violet',
    inputs: 1,
    outputs: 1,
    defaultData: {}
  },
  {
    type: 'predictor',
    label: 'Prediction',
    category: 'Inference',
    description: 'Test interactive live predictions with custom feature inputs',
    icon: 'Sparkles',
    color: 'from-pink-500 to-pink-600',
    borderColor: 'border-pink-400',
    accentColor: 'pink',
    inputs: 1,
    outputs: 0,
    defaultData: {}
  }
];

export const WORKFLOW_TEMPLATES = [
  {
    id: 'iris-classification',
    name: 'Iris Flower Classifier (Beginner Template)',
    description: 'Complete multi-class classification pipeline on Iris dataset using Random Forest.',
    problem_type: 'classification',
    nodes: [
      {
        id: 'node-1',
        type: 'dataLoader',
        position: { x: 50, y: 150 },
        data: { dataset_id: 'sample_iris', target_column: 'species' }
      },
      {
        id: 'node-2',
        type: 'preprocessor',
        position: { x: 340, y: 150 },
        data: { categorical_encoding: 'one_hot', scaling: 'standard' }
      },
      {
        id: 'node-3',
        type: 'trainTestSplit',
        position: { x: 630, y: 150 },
        data: { test_size: 0.2, random_state: 42 }
      },
      {
        id: 'node-4',
        type: 'modelSelector',
        position: { x: 920, y: 150 },
        data: {
          problem_type: 'classification',
          algorithm: 'random_forest',
          hyperparams: { n_estimators: 100 }
        }
      },
      {
        id: 'node-5',
        type: 'modelTrainer',
        position: { x: 1210, y: 150 },
        data: {}
      },
      {
        id: 'node-6',
        type: 'modelEvaluator',
        position: { x: 1500, y: 80 },
        data: {}
      },
      {
        id: 'node-7',
        type: 'predictor',
        position: { x: 1500, y: 320 },
        data: {}
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true },
      { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true },
      { id: 'e5-6', source: 'node-5', target: 'node-6', animated: true },
      { id: 'e5-7', source: 'node-5', target: 'node-7', animated: true }
    ]
  },
  {
    id: 'titanic-pipeline',
    name: 'Titanic Survival with Missing Values',
    description: 'Pipeline handling missing ages, encoding categorical variables, and training Logistic Regression.',
    problem_type: 'classification',
    nodes: [
      {
        id: 't-1',
        type: 'dataLoader',
        position: { x: 50, y: 150 },
        data: { dataset_id: 'sample_titanic', target_column: 'survived' }
      },
      {
        id: 't-2',
        type: 'missingValueHandler',
        position: { x: 340, y: 150 },
        data: { numerical_strategy: 'median', categorical_strategy: 'mode' }
      },
      {
        id: 't-3',
        type: 'preprocessor',
        position: { x: 630, y: 150 },
        data: { categorical_encoding: 'one_hot', scaling: 'standard' }
      },
      {
        id: 't-4',
        type: 'trainTestSplit',
        position: { x: 920, y: 150 },
        data: { test_size: 0.25, random_state: 42 }
      },
      {
        id: 't-5',
        type: 'modelSelector',
        position: { x: 1210, y: 150 },
        data: { problem_type: 'classification', algorithm: 'logistic_regression', hyperparams: { max_iter: 1000 } }
      },
      {
        id: 't-6',
        type: 'modelTrainer',
        position: { x: 1500, y: 150 },
        data: {}
      },
      {
        id: 't-7',
        type: 'modelEvaluator',
        position: { x: 1790, y: 150 },
        data: {}
      }
    ],
    edges: [
      { id: 'te1-2', source: 't-1', target: 't-2', animated: true },
      { id: 'te2-3', source: 't-2', target: 't-3', animated: true },
      { id: 'te3-4', source: 't-3', target: 't-4', animated: true },
      { id: 'te4-5', source: 't-4', target: 't-5', animated: true },
      { id: 'te5-6', source: 't-5', target: 't-6', animated: true },
      { id: 'te6-7', source: 't-6', target: 't-7', animated: true }
    ]
  },
  {
    id: 'student-regression',
    name: 'Student Grade Prediction (Regression)',
    description: 'Predict continuous final exam grades using Linear Regression.',
    problem_type: 'regression',
    nodes: [
      {
        id: 's-1',
        type: 'dataLoader',
        position: { x: 50, y: 150 },
        data: { dataset_id: 'sample_student_performance', target_column: 'final_grade' }
      },
      {
        id: 's-2',
        type: 'trainTestSplit',
        position: { x: 360, y: 150 },
        data: { test_size: 0.2, random_state: 42 }
      },
      {
        id: 's-3',
        type: 'modelSelector',
        position: { x: 670, y: 150 },
        data: { problem_type: 'regression', algorithm: 'linear_regression' }
      },
      {
        id: 's-4',
        type: 'modelTrainer',
        position: { x: 980, y: 150 },
        data: {}
      },
      {
        id: 's-5',
        type: 'modelEvaluator',
        position: { x: 1290, y: 80 },
        data: {}
      },
      {
        id: 's-6',
        type: 'predictor',
        position: { x: 1290, y: 320 },
        data: {}
      }
    ],
    edges: [
      { id: 'se1-2', source: 's-1', target: 's-2', animated: true },
      { id: 'se2-3', source: 's-2', target: 's-3', animated: true },
      { id: 'se3-4', source: 's-3', target: 's-4', animated: true },
      { id: 'se4-5', source: 's-4', target: 's-5', animated: true },
      { id: 'se5-6', source: 's-4', target: 's-6', animated: true }
    ]
  }
];
