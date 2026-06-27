import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RiskReport, AnalysisStatus } from '@/types';

interface AnalysisStore {
  status: AnalysisStatus;
  progress: number;
  report: RiskReport | null;
  error: string | null;
  setStatus: (status: AnalysisStatus) => void;
  setProgress: (progress: number) => void;
  setReport: (report: RiskReport) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as AnalysisStatus,
  progress: 0,
  report: null as RiskReport | null,
  error: null as string | null,
};

export const useAnalysisStore = create<AnalysisStore>()(
  devtools(
    (set) => ({
      ...initialState,
      setStatus: (status) => set({ status }),
      setProgress: (progress) => set({ progress }),
      setReport: (report) => set({ report, status: 'complete' as AnalysisStatus }),
      setError: (error) => set({ error, status: 'error' as AnalysisStatus }),
      reset: () => set(initialState),
    }),
    { name: 'AnalysisStore' }
  )
);
