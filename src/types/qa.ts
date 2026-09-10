export interface CheckResult {
  checkId: string;
  name: string;
  passed: boolean;
  score?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface QAReport {
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  checks: CheckResult[];
  timestamp: string;
}

export type RepairActionType =
  | "rerender_text"
  | "adjust_layout"
  | "regenerate_background"
  | "regenerate_subject"
  | "recompile_spec";

export interface RepairAction {
  type: RepairActionType;
  target?: string;
  reason: string;
  suggestedPatch?: Record<string, unknown>;
}

export interface RepairPlan {
  feasible: boolean;
  actions: RepairAction[];
  summary: string;
}
