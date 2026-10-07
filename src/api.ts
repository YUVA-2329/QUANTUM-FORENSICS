export type AnalysisStatus = 'idle' | 'selected' | 'ingesting' | 'normalizing' | 'ela' | 'features' | 'classifier' | 'regions' | 'verdict' | 'complete' | 'error';

export interface Region {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

export interface AnalysisResult {
  verdict: 'AUTHENTIC' | 'TAMPERED';
  confidence: number;
  class_probabilities: {
    AUTHENTIC: number;
    TAMPERED: number;
  };
  image: {
    width: number;
    height: number;
    format: string;
    size_bytes: number;
  };
  ela: {
    quality: number;
    image_url: string;
    mean_error: number;
    std_error: number;
    max_error: number;
    high_error_ratio: number;
  };
  features: {
    count: number;
  };
  model: {
    algorithm: string;
    feature_count: number;
    ela_quality: number;
    training_samples: number;
    test_samples: number;
    random_state: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
  };
  regions: Region[];
}

export async function analyzeImage(file: File, onProgress: (status: AnalysisStatus, progress: number) => void): Promise<AnalysisResult> {
  // We simulate progress for the UI while the backend is doing its job synchronously.
  // In a real production app with websockets, the backend would send progress updates.
  onProgress('ingesting', 10);
  
  const formData = new FormData();
  formData.append("file", file);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  try {
    onProgress('ela', 30);
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    onProgress('features', 60);
    const data = await response.json();
    
    if (!data.success || !data.analysis) {
      throw new Error("Invalid response format from backend.");
    }
    
    onProgress('verdict', 90);
    // Give a small delay so the user sees the final step
    await new Promise(resolve => setTimeout(resolve, 300));
    onProgress('complete', 100);
    
    return data.analysis as AnalysisResult;
  } catch (e) {
    console.error(e);
    onProgress('error', 0);
    throw e;
  }
}
