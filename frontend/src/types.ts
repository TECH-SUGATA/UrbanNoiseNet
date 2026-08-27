export type TabType = 'dashboard' | 'zones' | 'challans' | 'dispatch' | 'complaints' | 'analytics';

export type AppRoute =
  | '/'
  | '/zones'
  | '/challans'
  | '/dispatch'
  | '/complaints-inbox'
  | '/analytics'
  | '/settings'
  | '/complaints'
  | '/login';

export interface PolygonPoint {
  x: number; // percentage or relative x (0-100)
  y: number; // percentage or relative y (0-100)
}

export interface AcousticNode {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  currentDb: number;
  peakDb: number;
  status: 'normal' | 'warning' | 'critical';
  dominantFrequency: string;
  lastUpdated: string;
  category: string;
}

export interface GeoZone {
  id: string;
  name: string;
  description: string;
  classification: 'residential' | 'commercial' | 'industrial' | 'custom';
  status: 'active' | 'inactive';
  currentDb: number;
  thresholdDb: number;
  quietHours: string;
  sparkline: number[];
  allowExceptions: boolean;
  activeSensors: number;
  color: string;
  polygon?: PolygonPoint[];
}

export interface ChallanRecord {
  id: string;
  location: string;
  source: string;
  sourceCategory: 'vehicle' | 'exhaust' | 'construction' | 'horn' | 'industrial' | 'music';
  db: number;
  status: 'issued' | 'contested' | 'pending' | 'resolved';
  time: string;
  timestamp: string;
  nodeId: string;
  evidenceUrl: string;
  confidence: number;
  coordinates: {
    lat: string;
    lng: string;
  };
  duration: string;
  fineAmount: number;
  licensePlate?: string;
  officerNotes?: string;
  zone?: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  zone: string;
  timeAgo: string;
  db: number;
  type: 'siren' | 'construction' | 'traffic' | 'exhaust' | 'industrial' | 'horn' | 'other';
  severity: 'critical' | 'warning' | 'normal';
  lat?: number;
  lng?: number;
  confidence?: number;
  timestamp?: string;
  evidenceUrl?: string;
  ignored?: boolean;
}

export interface ComplaintReport {
  id: string;
  title: string;
  timestamp: string;
  classification: string;
  status: 'review' | 'queued' | 'resolved' | 'investigating';
  location: string;
  description: string;
  progress: number;
  audioFileName?: string;
  submittedBy?: string;
  contactEmail?: string;
  contactPhone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  officerNotes?: string;
}

export interface AudioClassificationResult {
  class_label: string;
  confidence: number;
  db_level: number;
  severity: 'critical' | 'warning' | 'normal';
  zone?: string;
  timestamp?: string;
  lat?: number;
  lng?: number;
  spectral_profile?: string;
}

export interface DispatchStation {
  id: string;
  name: string;
  type: 'police' | 'civic_marshal' | 'traffic_patrol';
  distanceKm: number;
  etaMinutes: number;
  unitCode: string;
  officerName: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface DispatchResponse {
  dispatch_id: string;
  status: 'dispatched' | 'en_route' | 'acknowledged';
  timestamp: string;
  station: DispatchStation;
  sms_status: 'delivered' | 'sent';
  message: string;
}

export interface AnalyticsTimeseriesData {
  time: string;
  actualDb: number;
  predictedDb: number;
  threshold: number;
}

export interface HeatmapCell {
  day: string; // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  hour: number; // 0 - 23
  avgDb: number;
  incidentCount: number;
  topSource: string;
}

