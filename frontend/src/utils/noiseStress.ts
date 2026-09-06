import { GeoZone } from '../types';

export type StressRiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface NoiseStressIndex {
  score: number;
  level: StressRiskLevel;
  color: string;
  noiseComponent: number;
  exposureComponent: number;
  environmentComponent: number;
  sourceComponent: number;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export const getStressRiskLevel = (score: number): StressRiskLevel => {
  if (score < 0.25) return 'Low';
  if (score < 0.5) return 'Moderate';
  if (score < 0.75) return 'High';
  return 'Very High';
};

export const getStressRiskColor = (level: StressRiskLevel) => {
  if (level === 'Low') return '#34d399';
  if (level === 'Moderate') return '#fbbf24';
  if (level === 'High') return '#fb923c';
  return '#fb7185';
};

export const calculateNoiseStressIndex = ({
  db,
  exposureMinutes = 45,
  hour = new Date().getHours(),
  sourceSeverity = 0.5,
}: {
  db: number;
  exposureMinutes?: number;
  hour?: number;
  sourceSeverity?: number;
}): NoiseStressIndex => {
  const noiseComponent = clamp((db - 40) / 65);
  const exposureComponent = clamp(exposureMinutes / 180);
  const environmentComponent = hour >= 22 || hour < 7 ? 1 : hour >= 18 ? 0.72 : 0.42;
  const sourceComponent = clamp(sourceSeverity);
  const score = Number(
    (0.45 * noiseComponent + 0.25 * exposureComponent + 0.15 * environmentComponent + 0.15 * sourceComponent).toFixed(2),
  );
  const level = getStressRiskLevel(score);

  return {
    score,
    level,
    color: getStressRiskColor(level),
    noiseComponent,
    exposureComponent,
    environmentComponent,
    sourceComponent,
  };
};

export const getZoneStressIndex = (zone: GeoZone, hour = new Date().getHours()) =>
  calculateNoiseStressIndex({
    db: zone.currentDb,
    exposureMinutes: zone.currentDb >= zone.thresholdDb ? 90 : 45,
    hour,
    sourceSeverity: zone.classification === 'industrial' ? 0.85 : zone.classification === 'commercial' ? 0.65 : 0.4,
  });

export const getQuietRoute = (zones: GeoZone[]) =>
  [...zones]
    .sort((a, b) => getZoneStressIndex(a).score - getZoneStressIndex(b).score)
    .slice(0, 3);