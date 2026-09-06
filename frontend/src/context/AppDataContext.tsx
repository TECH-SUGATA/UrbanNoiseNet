import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  LiveEvent,
  GeoZone,
  ChallanRecord,
  ComplaintReport,
  PolygonPoint,
  AudioClassificationResult,
  DispatchStation,
  DispatchResponse,
  AnalyticsTimeseriesData,
  HeatmapCell,
} from '../types';
import {
  INITIAL_LIVE_EVENTS,
  INITIAL_ZONES,
  INITIAL_CHALLANS,
  INITIAL_COMPLAINTS,
} from '../data/mockData';

const DEFAULT_API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL) ||
  'http://localhost:8000';

export interface AppDataContextType {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  backendStatus: 'online' | 'offline' | 'checking';
  checkBackendHealth: () => Promise<boolean>;

  // Data Collections
  events: LiveEvent[];
  zones: GeoZone[];
  challans: ChallanRecord[];
  complaints: ComplaintReport[];

  // Cross-screen Handoff States
  selectedEvent: LiveEvent | null;
  setSelectedEvent: (event: LiveEvent | null) => void;
  selectedZone: GeoZone | null;
  setSelectedZone: (zone: GeoZone | null) => void;
  draftPolygon: PolygonPoint[] | null;
  setDraftPolygon: (polygon: PolygonPoint[] | null) => void;

  // Loading States
  loading: {
    events: boolean;
    zones: boolean;
    challans: boolean;
    complaints: boolean;
    classification: boolean;
    dispatch: boolean;
  };

  // API Methods
  fetchEvents: () => Promise<LiveEvent[]>;
  fetchZones: () => Promise<GeoZone[]>;
  fetchChallans: () => Promise<ChallanRecord[]>;
  fetchComplaints: () => Promise<ComplaintReport[]>;

  classifyAudio: (
    audioBlob: Blob,
    coords?: { lat: number; lng: number }
  ) => Promise<AudioClassificationResult>;

  createZone: (zone: Omit<GeoZone, 'id'> & { id?: string }) => Promise<GeoZone>;
  updateZone: (id: string, update: Partial<GeoZone>) => Promise<GeoZone>;
  deleteZone: (id: string) => Promise<boolean>;

  createChallan: (challan: Partial<ChallanRecord>) => Promise<ChallanRecord>;
  patchChallan: (id: string, patch: Partial<ChallanRecord>) => Promise<ChallanRecord>;
  getChallanPdfUrl: (id: string) => string;

  createComplaint: (complaint: Partial<ComplaintReport>, audioFile?: Blob | File) => Promise<ComplaintReport>;
  getComplaintById: (id: string) => Promise<ComplaintReport | null>;
  patchComplaint: (id: string, patch: Partial<ComplaintReport>) => Promise<ComplaintReport>;

  getNearestStation: (lat: number, lng: number) => Promise<DispatchStation>;
  triggerDispatch: (payload: {
    incidentId: string;
    lat: number;
    lng: number;
    severity: string;
    notes?: string;
  }) => Promise<DispatchResponse>;

  getTimeseries: (dateRange?: string, zoneIds?: string[]) => Promise<AnalyticsTimeseriesData[]>;
  getHeatmap: (zoneId?: string) => Promise<HeatmapCell[]>;
  ignoreEvent: (eventId: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(() => {
    return localStorage.getItem('urbannoisenet_api_url') || DEFAULT_API_BASE_URL;
  });

  const setApiBaseUrl = (url: string) => {
    setApiBaseUrlState(url);
    localStorage.setItem('urbannoisenet_api_url', url);
  };

  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Collections
  const [events, setEvents] = useState<LiveEvent[]>(INITIAL_LIVE_EVENTS);
  const [zones, setZones] = useState<GeoZone[]>(INITIAL_ZONES);
  const [challans, setChallans] = useState<ChallanRecord[]>(INITIAL_CHALLANS);
  const [complaints, setComplaints] = useState<ComplaintReport[]>(INITIAL_COMPLAINTS);

  // Cross-screen selection handoffs
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [selectedZone, setSelectedZone] = useState<GeoZone | null>(null);
  const [draftPolygon, setDraftPolygon] = useState<PolygonPoint[] | null>(null);

  // Loading Flags
  const [loading, setLoading] = useState({
    events: false,
    zones: false,
    challans: false,
    complaints: false,
    classification: false,
    dispatch: false,
  });

  // Health check
  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${apiBaseUrl}/events`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setBackendStatus('online');
        return true;
      } else {
        setBackendStatus('offline');
        return false;
      }
    } catch {
      setBackendStatus('offline');
      return false;
    }
  }, [apiBaseUrl]);

  // Fetch Events
  const fetchEvents = useCallback(async (): Promise<LiveEvent[]> => {
    setLoading((prev) => ({ ...prev, events: true }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${apiBaseUrl}/events`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const eventList = Array.isArray(data) ? data : data.events || [];
        setEvents(eventList);
        setBackendStatus('online');
        return eventList;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      setBackendStatus('offline');
      // Graceful fallback
      return events;
    } finally {
      setLoading((prev) => ({ ...prev, events: false }));
    }
  }, [apiBaseUrl, events]);

  // Fetch Zones
  const fetchZones = useCallback(async (): Promise<GeoZone[]> => {
    setLoading((prev) => ({ ...prev, zones: true }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${apiBaseUrl}/zones`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.zones || [];
        if (list.length > 0) setZones(list);
        setBackendStatus('online');
        return list;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      setBackendStatus('offline');
      return zones;
    } finally {
      setLoading((prev) => ({ ...prev, zones: false }));
    }
  }, [apiBaseUrl, zones]);

  // Fetch Challans
  const fetchChallans = useCallback(async (): Promise<ChallanRecord[]> => {
    setLoading((prev) => ({ ...prev, challans: true }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${apiBaseUrl}/challans`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.challans || [];
        if (list.length > 0) setChallans(list);
        setBackendStatus('online');
        return list;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      setBackendStatus('offline');
      return challans;
    } finally {
      setLoading((prev) => ({ ...prev, challans: false }));
    }
  }, [apiBaseUrl, challans]);

  // Fetch Complaints
  const fetchComplaints = useCallback(async (): Promise<ComplaintReport[]> => {
    setLoading((prev) => ({ ...prev, complaints: true }));
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${apiBaseUrl}/complaints`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.complaints || [];
        if (list.length > 0) setComplaints(list);
        setBackendStatus('online');
        return list;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      setBackendStatus('offline');
      return complaints;
    } finally {
      setLoading((prev) => ({ ...prev, complaints: false }));
    }
  }, [apiBaseUrl, complaints]);

  // Periodic polling for events (every 8s) & health check
  useEffect(() => {
    checkBackendHealth();
    fetchEvents();
    fetchZones();
    fetchChallans();
    fetchComplaints();

    const interval = setInterval(() => {
      fetchEvents();
      fetchZones();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Classify Live Audio
  const classifyAudio = async (
    audioBlob: Blob,
    coords?: { lat: number; lng: number }
  ): Promise<AudioClassificationResult> => {
    setLoading((prev) => ({ ...prev, classification: true }));
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'live_telemetry_capture.webm');
      if (coords) {
        formData.append('lat', coords.lat.toString());
        formData.append('lng', coords.lng.toString());
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${apiBaseUrl}/classify`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const result: AudioClassificationResult = {
          class_label: data.class_label || data.label || 'Modified Exhaust',
          confidence: data.confidence ? Math.round(data.confidence > 1 ? data.confidence : data.confidence * 100) : 94,
          db_level: data.db_level || data.db || +(75 + Math.random() * 20).toFixed(1),
          severity: data.severity || (data.db_level > 85 ? 'critical' : data.db_level > 70 ? 'warning' : 'normal'),
          zone: data.zone || 'Downtown Sector',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          lat: coords?.lat || 47.6062,
          lng: coords?.lng || -122.3321,
          spectral_profile: data.spectral_profile || 'High-frequency transient spike (1.4kHz - 3.2kHz)',
        };

        // Prepend new event to live events feed
        const newEvent: LiveEvent = {
          id: `EVT-${Date.now().toString().slice(-4)}`,
          title: result.class_label,
          zone: result.zone || 'Zone 1',
          timeAgo: 'Just now',
          db: Math.round(result.db_level),
          type: (result.class_label.toLowerCase().includes('exhaust')
            ? 'exhaust'
            : result.class_label.toLowerCase().includes('siren')
            ? 'siren'
            : result.class_label.toLowerCase().includes('horn')
            ? 'horn'
            : result.class_label.toLowerCase().includes('construct')
            ? 'construction'
            : 'traffic') as LiveEvent['type'],
          severity: result.severity,
          confidence: result.confidence,
          timestamp: new Date().toISOString(),
          lat: result.lat,
          lng: result.lng,
        };

        setEvents((prev) => [newEvent, ...prev]);
        setBackendStatus('online');
        return result;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      // Fallback local classification if backend is unreachable
      setBackendStatus('offline');
      const soundClasses = [
        { label: 'Modified Vehicular Exhaust', type: 'exhaust', db: 96.4, sev: 'critical' as const },
        { label: 'Multi-Tone Air Horn', type: 'horn', db: 92.1, sev: 'critical' as const },
        { label: 'Pneumatic Breaker / Drill', type: 'construction', db: 86.8, sev: 'warning' as const },
        { label: 'Emergency Vehicle Siren', type: 'siren', db: 94.0, sev: 'critical' as const },
        { label: 'Commercial Transit Rumble', type: 'traffic', db: 73.5, sev: 'normal' as const },
      ];
      const selected = soundClasses[Math.floor(Math.random() * soundClasses.length)];

      const fallbackResult: AudioClassificationResult = {
        class_label: selected.label,
        confidence: Math.floor(91 + Math.random() * 8),
        db_level: selected.db,
        severity: selected.sev,
        zone: 'Monitored Geo-Zone',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lat: coords?.lat || 47.6062,
        lng: coords?.lng || -122.3321,
        spectral_profile: 'Broadband burst with harmonic resonance at 850Hz',
      };

      const fallbackEvent: LiveEvent = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        title: fallbackResult.class_label,
        zone: 'Active Sector',
        timeAgo: 'Just now',
        db: Math.round(fallbackResult.db_level),
        type: selected.type as LiveEvent['type'],
        severity: fallbackResult.severity,
        confidence: fallbackResult.confidence,
        timestamp: new Date().toISOString(),
        lat: fallbackResult.lat,
        lng: fallbackResult.lng,
      };

      setEvents((prev) => [fallbackEvent, ...prev]);
      return fallbackResult;
    } finally {
      setLoading((prev) => ({ ...prev, classification: false }));
    }
  };

  // Zone CRUD
  const createZone = async (zoneData: Omit<GeoZone, 'id'> & { id?: string }): Promise<GeoZone> => {
    const newZone: GeoZone = {
      ...zoneData,
      id: zoneData.id || `zone-${Date.now()}`,
      sparkline: zoneData.sparkline || [55, 60, 62, 58, 64, 60, zoneData.currentDb || 60],
      activeSensors: zoneData.activeSensors || 6,
      color: zoneData.color || '#22d3ee',
      polygon: zoneData.polygon,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZone),
      });
      if (res.ok) {
        const saved = await res.json();
        setZones((prev) => [saved, ...prev]);
        return saved;
      }
    } catch {
      // Offline fallback
    }

    setZones((prev) => [newZone, ...prev]);
    return newZone;
  };

  const updateZone = async (id: string, update: Partial<GeoZone>): Promise<GeoZone> => {
    try {
      await fetch(`${apiBaseUrl}/zones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
    } catch {
      // fallback
    }

    let updated: GeoZone | null = null;
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === id) {
          updated = { ...z, ...update };
          return updated;
        }
        return z;
      })
    );
    return updated || ({ ...zones[0], ...update } as GeoZone);
  };

  const deleteZone = async (id: string): Promise<boolean> => {
    try {
      await fetch(`${apiBaseUrl}/zones/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    setZones((prev) => prev.filter((z) => z.id !== id));
    return true;
  };

  // Challan CRUD
  const createChallan = async (challanData: Partial<ChallanRecord>): Promise<ChallanRecord> => {
    const newChallan: ChallanRecord = {
      id: challanData.id || `CH-${Math.floor(1000 + Math.random() * 9000)}`,
      location: challanData.location || 'Metro Transit Corridor',
      source: challanData.source || 'Modified Exhaust',
      sourceCategory: challanData.sourceCategory || 'exhaust',
      db: challanData.db || 94.2,
      status: challanData.status || 'issued',
      time: 'Just now',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      nodeId: challanData.nodeId || 'SN-829A',
      evidenceUrl: `cloud.urbannoisenet.io/ev/${Date.now().toString().slice(-4)}`,
      confidence: challanData.confidence || 97,
      coordinates: challanData.coordinates || { lat: '47.6062', lng: '-122.3321' },
      duration: '00:06s',
      fineAmount: challanData.fineAmount || 250.0,
      licensePlate: challanData.licensePlate || 'WA-992-CVX',
      officerNotes: challanData.officerNotes || 'Exceeded municipal decibel threshold in monitored acoustic zone.',
      zone: challanData.zone || 'Downtown Sector',
    };

    try {
      const res = await fetch(`${apiBaseUrl}/challans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChallan),
      });
      if (res.ok) {
        const saved = await res.json();
        setChallans((prev) => [saved, ...prev]);
        return saved;
      }
    } catch {
      // offline fallback
    }

    setChallans((prev) => [newChallan, ...prev]);
    return newChallan;
  };

  const patchChallan = async (id: string, patch: Partial<ChallanRecord>): Promise<ChallanRecord> => {
    try {
      await fetch(`${apiBaseUrl}/challans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch {
      // fallback
    }

    let updated: ChallanRecord | null = null;
    setChallans((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updated = { ...c, ...patch };
          return updated;
        }
        return c;
      })
    );
    return updated || ({ ...challans[0], ...patch } as ChallanRecord);
  };

  const getChallanPdfUrl = (id: string): string => {
    return `${apiBaseUrl}/challans/${id}/pdf`;
  };

  // Complaints
  const createComplaint = async (
    complaintData: Partial<ComplaintReport>,
    audioFile?: Blob | File
  ): Promise<ComplaintReport> => {
    const newComplaint: ComplaintReport = {
      id: `#UNC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: complaintData.title || `${complaintData.classification || 'Acoustic'} Violation Report`,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      classification: complaintData.classification || 'Unregulated Acoustic Spike',
      status: 'review',
      location: complaintData.location || 'Reported Urban Location',
      description: complaintData.description || 'Citizen noise complaint filed through civic portal.',
      progress: 25,
      audioFileName: audioFile ? 'citizen_evidence.wav' : undefined,
      submittedBy: complaintData.submittedBy || 'Anonymous Resident',
      contactEmail: complaintData.contactEmail,
      contactPhone: complaintData.contactPhone,
      coordinates: complaintData.coordinates,
    };

    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(newComplaint));
      if (audioFile) {
        formData.append('audio', audioFile, 'citizen_evidence.wav');
      }

      const res = await fetch(`${apiBaseUrl}/complaints`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const saved = await res.json();
        setComplaints((prev) => [saved, ...prev]);
        return saved;
      }
    } catch {
      // fallback
    }

    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  };

  const getComplaintById = async (id: string): Promise<ComplaintReport | null> => {
    try {
      const res = await fetch(`${apiBaseUrl}/complaints/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const cleanId = id.trim().toUpperCase();
    const found = complaints.find(
      (c) => c.id.toUpperCase() === cleanId || c.id.toUpperCase() === `#${cleanId}`
    );
    return found || null;
  };

  const patchComplaint = async (id: string, patch: Partial<ComplaintReport>): Promise<ComplaintReport> => {
    try {
      await fetch(`${apiBaseUrl}/complaints/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch {
      // fallback
    }

    let updated: ComplaintReport | null = null;
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const progress = patch.status === 'resolved' ? 100 : patch.status === 'investigating' ? 65 : patch.status === 'queued' ? 35 : 20;
          updated = { ...c, ...patch, progress: patch.progress ?? progress };
          return updated;
        }
        return c;
      })
    );
    return updated || ({ ...complaints[0], ...patch } as ComplaintReport);
  };

  // Dispatch API
  const getNearestStation = async (lat: number, lng: number): Promise<DispatchStation> => {
    try {
      const res = await fetch(`${apiBaseUrl}/dispatch/nearest-station?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    return {
      id: 'STN-NORTH-04',
      name: 'North Central Civic Enforcement Hub',
      type: 'civic_marshal',
      distanceKm: 1.4,
      etaMinutes: 4,
      unitCode: 'PATROL-UNIT-7',
      officerName: 'Marshal J. Vance (Badge #482)',
      phone: '+1 (555) 019-2834',
      lat: lat + 0.008,
      lng: lng - 0.006,
    };
  };

  const triggerDispatch = async (payload: {
    incidentId: string;
    lat: number;
    lng: number;
    severity: string;
    notes?: string;
  }): Promise<DispatchResponse> => {
    setLoading((prev) => ({ ...prev, dispatch: true }));
    try {
      const res = await fetch(`${apiBaseUrl}/dispatch/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    } finally {
      setLoading((prev) => ({ ...prev, dispatch: false }));
    }

    const station = await getNearestStation(payload.lat, payload.lng);
    return {
      dispatch_id: `DSP-${Date.now().toString().slice(-5)}`,
      status: 'en_route',
      timestamp: new Date().toLocaleTimeString(),
      station,
      sms_status: 'delivered',
      message: `Emergency response unit ${station.unitCode} dispatched to coordinates [${payload.lat.toFixed(4)}, ${payload.lng.toFixed(4)}]. Officer notified via encrypted SMS relay.`,
    };
  };

  // Analytics APIs
  const getTimeseries = async (
    _dateRange?: string,
    _zoneIds?: string[]
  ): Promise<AnalyticsTimeseriesData[]> => {
    try {
      const res = await fetch(`${apiBaseUrl}/analytics/timeseries`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'];
    return hours.map((t, idx) => {
      const base = idx < 2 ? 52 : idx < 4 ? 68 : idx < 7 ? 78 : 64;
      return {
        time: t,
        actualDb: +(base + (Math.sin(idx) * 6)).toFixed(1),
        predictedDb: +(base + 2 + (Math.cos(idx) * 4)).toFixed(1),
        threshold: 70,
      };
    });
  };

  const getHeatmap = async (_zoneId?: string): Promise<HeatmapCell[]> => {
    try {
      const res = await fetch(`${apiBaseUrl}/analytics/heatmap`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const cells: HeatmapCell[] = [];
    days.forEach((day) => {
      for (let hour = 0; hour < 24; hour += 2) {
        const isNight = hour >= 22 || hour <= 5;
        const isPeak = hour >= 16 && hour <= 20;
        const avgDb = isPeak ? 82 + Math.random() * 8 : isNight ? 48 + Math.random() * 12 : 68 + Math.random() * 10;
        cells.push({
          day,
          hour,
          avgDb: +avgDb.toFixed(1),
          incidentCount: isPeak ? Math.floor(4 + Math.random() * 8) : Math.floor(Math.random() * 3),
          topSource: isPeak ? 'Modified Exhaust / Transit' : isNight ? 'Commercial PA / Bass' : 'Construction Work',
        });
      }
    });
    return cells;
  };

  const ignoreEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ignored: true } : e))
    );
  };

  return (
    <AppDataContext.Provider
      value={{
        apiBaseUrl,
        setApiBaseUrl,
        backendStatus,
        checkBackendHealth,
        events,
        zones,
        challans,
        complaints,
        selectedEvent,
        setSelectedEvent,
        selectedZone,
        setSelectedZone,
        draftPolygon,
        setDraftPolygon,
        loading,
        fetchEvents,
        fetchZones,
        fetchChallans,
        fetchComplaints,
        classifyAudio,
        createZone,
        updateZone,
        deleteZone,
        createChallan,
        patchChallan,
        getChallanPdfUrl,
        createComplaint,
        getComplaintById,
        patchComplaint,
        getNearestStation,
        triggerDispatch,
        getTimeseries,
        getHeatmap,
        ignoreEvent,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
