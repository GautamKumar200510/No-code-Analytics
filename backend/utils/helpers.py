import os
import json
import uuid
import numpy as np
import pandas as pd

def sanitize_json(data):
    """
    Recursively sanitize data to be standard JSON serializable.
    Converts NaN, Infinity to None/null, numpy types to Python native types.
    """
    if isinstance(data, dict):
        return {str(k): sanitize_json(v) for k, v in data.items()}
    elif isinstance(data, (list, tuple, np.ndarray)):
        return [sanitize_json(v) for v in data]
    elif isinstance(data, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(data)
    elif isinstance(data, (np.floating, np.float64, np.float32)):
        if np.isnan(data) or np.isinf(data):
            return None
        return float(data)
    elif isinstance(data, (np.bool_, bool)):
        return bool(data)
    elif pd.isna(data):
        return None
    return data

def generate_id(prefix=""):
    uid = str(uuid.uuid4())[:8]
    return f"{prefix}_{uid}" if prefix else uid
