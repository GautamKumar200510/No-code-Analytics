# ML Flow – No-Code Machine Learning Platform

> **Build, Train, and Evaluate Machine Learning Models Without Writing Code.**

ML Flow is a modern, visual, beginner-friendly web application designed for students, educators, and aspiring data scientists. It provides an intuitive drag-and-drop workflow canvas powered by React Flow and connects directly to a Python Flask backend executing real Scikit-learn machine learning pipelines.

---

##  Key Features

### 1. Visual Drag-and-Drop Workflow Canvas
- **React Flow (@xyflow/react) Powered:** Drag blocks from the sidebar palette onto an infinite canvas, connect node handles, configure parameters, and delete or rearrange nodes.
- **9 Core Workflow Blocks:**
  1. **Data Loading:** Upload CSVs or choose from preloaded benchmark datasets.
  2. **Data Preprocessing:** Apply One-Hot or Label encoding and numerical feature scaling (StandardScaler / MinMaxScaler).
  3. **Handle Missing Values:** Impute numerical columns with mean/median/zero or categorical columns with mode/unknown, or drop missing rows.
  4. **Feature Selection:** Interactively include or exclude specific features.
  5. **Train-Test Split:** Adjustable training/testing ratio slider (10% to 50%) and random seed.
  6. **Model Selection:** Choose Classification or Regression and configure hyperparameters (e.g., `n_estimators`, `max_depth`, `C`, `n_neighbors`).
  7. **Model Training:** Triggers real Scikit-learn model fitting in the backend.
  8. **Model Evaluation:** Computes accuracy, precision, recall, F1-score, confusion matrix, or regression metrics (MAE, MSE, RMSE, R²).
  9. **Live Prediction:** Test interactive single-sample predictions with custom feature inputs directly in the flow.
- **One-Click Preset Templates:**
  - *Iris Classification Pipeline* (Multi-class Random Forest)
  - *Titanic Survival Flow* (Missing value imputation + Logistic Regression)
  - *Student Exam Score Predictor* (Linear Regression continuous target)
- **Real-Time Step Logs & Progress:** Displays animated edge connections, status badges (Running, Completed, Error), and execution durations in milliseconds.

### 2. Comprehensive Dataset Management & Preview
- **CSV Dataset Uploader:** Drag-and-drop CSV upload with file validation and error reporting.
- **Preloaded Benchmark Datasets:** Includes Iris, Titanic, Student Exam Performance, and Wine Quality for zero-friction experimentation.
- **Schema & Missing Value Analysis:** Detected data types (numerical vs. categorical), null count, null percentage, and unique counts per column.
- **Summary Statistics:** Mean, std, min, 25%, 50%, 75%, max for numeric columns, and top value frequencies for categorical columns.
- **Searchable Preview Table:** Inspect the head of the dataset with instant search.
- **Target Column Selector:** Select which variable to predict with class distribution previews.

### 3. Real Scikit-learn Machine Learning Engine
No mocked or hardcoded results. ML Flow fits authentic Scikit-learn estimators:
- **Classification Algorithms:**
  - Random Forest Classifier (`RandomForestClassifier`)
  - Logistic Regression (`LogisticRegression`)
  - Decision Tree Classifier (`DecisionTreeClassifier`)
  - K-Nearest Neighbors Classifier (`KNeighborsClassifier`)
  - Support Vector Machine (`SVC` with probability support)
- **Regression Algorithms:**
  - Linear Regression (`LinearRegression`)
  - Random Forest Regressor (`RandomForestRegressor`)
  - Decision Tree Regressor (`DecisionTreeRegressor`)
  - K-Nearest Neighbors Regressor (`KNeighborsRegressor`)
  - Support Vector Regressor (`SVR`)

### 4. Rich Evaluation & Visualizations
- **Classification:** Confusion Matrix interactive table with green diagonal highlighting correct predictions and red misclassifications, classification report, and class probability distribution.
- **Regression:** Interactive Actual vs. Predicted line and scatter charts, residual analysis, R² score, MAE, MSE, and RMSE.
- **Feature Importance:** Horizontal bar charts showing relative feature weights (tree Gini importance or linear coefficients).
- **Model Export:** Download fitted model pipelines as portable `.joblib` files.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Tailwind CSS, `@xyflow/react` (React Flow), Axios, Recharts, Lucide React, Vite |
| **Backend** | Python 3, Flask, Flask-CORS, Pandas, NumPy, Scikit-learn, Joblib |
| **Data Processing** | Missing value imputers, LabelEncoder, One-Hot Encoding, StandardScaler, MinMaxScaler |

---

## 📁 Project Structure

```
ml-flow/
├── README.md
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── dist/                      # Production build bundle
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── services/
│       │   └── api.js             # Axios API integration
│       ├── components/
│       │   └── Navbar.jsx         # Navigation bar & API status
│       ├── pages/
│       │   ├── LandingPage.jsx    # Hero, Features & Algorithm Showcase
│       │   ├── DashboardPage.jsx  # KPI Cards, Templates & Models Table
│       │   ├── DatasetsPage.jsx   # CSV Upload & Dataset Schema Inspector
│       │   ├── PreprocessingPage.jsx # Data Cleaning & Scaling Studio
│       │   ├── TrainingPage.jsx   # Guided Step-by-Step Training Wizard
│       │   ├── PredictionPage.jsx # Live Feature Input Inference
│       │   └── ModelsPage.jsx     # Trained Models Hub & Performance
│       └── workflow/
│           ├── templates.js       # Node schemas & Pipeline templates
│           ├── WorkflowCanvas.jsx # Main React Flow visual canvas
│           ├── WorkflowSidebar.jsx # Palette of draggable blocks & templates
│           ├── WorkflowToolbar.jsx # Run, Clear, Fit View, Save buttons
│           ├── NodeConfigDrawer.jsx# Inspector drawer for editing block data
│           ├── WorkflowExecutionModal.jsx # Visual results & metrics modal
│           └── nodes/
│               ├── CustomNodeWrapper.jsx
│               ├── DataLoaderNode.jsx
│               ├── MissingValueNode.jsx
│               ├── PreprocessorNode.jsx
│               ├── FeatureSelectorNode.jsx
│               ├── TrainTestSplitNode.jsx
│               ├── ModelSelectorNode.jsx
│               ├── ModelTrainerNode.jsx
│               ├── ModelEvaluatorNode.jsx
│               └── PredictorNode.jsx
└── backend/
    ├── app.py                     # Main Flask server & SPA file server
    ├── requirements.txt
    ├── routes/
    │   ├── datasets.py            # /api/upload, /api/datasets, /api/dataset/<id>
    │   ├── models.py              # /api/train, /api/models, /api/predict, /api/model/<id>/download
    │   └── workflow.py            # /api/workflow/run, /api/workflow/validate
    ├── services/
    │   ├── data_service.py        # Pandas loading, stats, cleaning, scaling
    │   ├── model_service.py       # Scikit-learn training, joblib serialization, predict
    │   └── workflow_service.py    # Pipeline graph validation & execution
    ├── models/
    │   └── ml_engine.py           # Estimator factory & metric evaluation
    ├── utils/
    │   └── helpers.py             # JSON sanitizers, type conversions, IDs
    ├── uploads/                   # Uploaded user CSV files
    ├── sample_data/               # Preloaded benchmark datasets (Iris, Titanic, etc.)
    └── models_storage/            # Serialized .joblib models and .json metadata
```

---

##  Getting Started

### Prerequisites
- Python 3.9+ with pip
- Node.js 18+ and npm

### Quick Start (Single Command - Production Mode)
The frontend has already been built into `frontend/dist/`. Flask automatically serves both the API and the React SPA!

```bash
# Navigate to backend
cd backend

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start ML Flow application
python app.py
```
Open your browser to: **`http://127.0.0.1:5000`**

---

### Development Mode (Hot-Reloading)

If you wish to make changes with hot module replacement:

#### 1. Start the Flask Backend:
```bash
cd backend
python app.py
# Backend runs on http://127.0.0.1:5000
```

#### 2. Start the Vite Frontend:
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000 (proxies /api to Flask)
```

Open your browser to: **`http://localhost:3000`**

---

## 📖 How to Build a Visual Pipeline (Step-by-Step)

1. **Load a Template or Start Clean:** Click **"Visual Workflow"** in the top navigation. Select **Iris Flower Classifier** or drag blocks from the left sidebar.
2. **Connect Nodes:** Connect the right handle (output) of each node to the left handle (input) of the next node:
   `Data Loading → Data Preprocessing → Train-Test Split → Model Selection → Model Training → Model Evaluation → Prediction`
3. **Configure Block Settings:** Click any node to open its configuration drawer on the right. You can change algorithms (e.g. Random Forest to SVM), adjust test split sizes, or change missing value strategies.
4. **Click "Run Workflow":** Watch the animated pipeline execute in real time. The backend will fit the Scikit-learn model and present the evaluation results modal with Confusion Matrices, R² metrics, and feature importance bars.
5. **Live Test & Export:** Type custom values in the Prediction tab to test your model live, or click **"Export Model (.joblib)"** to save the trained pipeline to your computer!

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check and server status |
| `/api/datasets` | GET | List sample and uploaded datasets |
| `/api/upload` | POST | Upload CSV dataset file |
| `/api/dataset/<id>` | GET | Get row/col count, schemas, stats, and preview |
| `/api/preprocess` | POST | Preprocess, impute, encode, and scale dataset |
| `/api/algorithms` | GET | List supported classification and regression algorithms |
| `/api/models` | GET | List trained models and metadata |
| `/api/train` | POST | Fit Scikit-learn model on dataset |
| `/api/model/<id>` | GET | Get model parameters and evaluation results |
| `/api/model/<id>/download` | GET | Download `.joblib` model file |
| `/api/predict` | POST | Generate prediction using trained model |
| `/api/workflow/validate` | POST | Validate workflow node graph |
| `/api/workflow/run` | POST | Execute end-to-end visual workflow pipeline |

---

## 🎓 Target Audience

- **Students & Beginners:** Learn ML concepts like overfitting, train-test splits, confusion matrices, and feature importance visually without getting stuck in syntax errors.
- **Educators:** Use interactive diagrams and real-time execution in classroom demonstrations.
- **Data Analysts:** Rapidly prototype baseline models and export trained pipelines.
