import { apiFetch } from '@/lib/apiClient';

export interface PointsRule {
  id: string;
  label: string;
  placementMin: number;
  placementMax: number;
  points: number;
  sortOrder: number;
}

export function getScoringRules(): Promise<PointsRule[]> {
  return apiFetch<PointsRule[]>('/scoring-rules');
}

export function updateScoringRules(
  rules: Omit<PointsRule, 'id'>[],
): Promise<PointsRule[]> {
  return apiFetch<PointsRule[]>('/scoring-rules', { method: 'PUT', body: { rules } });
}

export function resetScoringRules(): Promise<PointsRule[]> {
  return apiFetch<PointsRule[]>('/scoring-rules', { method: 'DELETE' });
}

export function recalculateAll(): Promise<{ updated: number; tournaments: number }> {
  return apiFetch<{ updated: number; tournaments: number }>('/scoring-rules/recalculate', {
    method: 'POST',
    body: {},
  });
}
