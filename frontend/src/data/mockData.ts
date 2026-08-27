import { GeoZone, ChallanRecord, LiveEvent, ComplaintReport, AcousticNode } from '../types';

export const INITIAL_ZONES: GeoZone[] = [
  {
    id: 'zone-1',
    name: 'North Residential',
    description: 'Strict quiet hours enforced (22:00 - 07:00)',
    classification: 'residential',
    status: 'active',
    currentDb: 45.2,
    thresholdDb: 50.0,
    quietHours: '22:00 - 07:00',
    sparkline: [42, 44, 45, 48, 43, 46, 45.2],
    allowExceptions: false,
    activeSensors: 8,
    color: '#8aebff',
  },
  {
    id: 'zone-2',
    name: 'Metro Construction',
    description: 'High tolerance threshold with acoustic baffles',
    classification: 'industrial',
    status: 'active',
    currentDb: 82.7,
    thresholdDb: 85.0,
    quietHours: '19:00 - 06:00',
    sparkline: [78, 85, 89, 81, 84, 88, 82.7],
    allowExceptions: true,
    activeSensors: 14,
    color: '#ffb147',
  },
  {
    id: 'zone-3',
    name: 'East Commercial',
    description: 'Scheduled for weekend night active monitoring',
    classification: 'commercial',
    status: 'inactive',
    currentDb: 62.1,
    thresholdDb: 65.0,
    quietHours: '23:00 - 08:00',
    sparkline: [60, 62, 59, 64, 61, 63, 62.1],
    allowExceptions: true,
    activeSensors: 6,
    color: '#b9c8de',
  },
  {
    id: 'zone-4',
    name: 'Downtown Core',
    description: 'High-density mixed zoning with continuous telemetry',
    classification: 'commercial',
    status: 'active',
    currentDb: 74.8,
    thresholdDb: 70.0,
    quietHours: '00:00 - 06:00',
    sparkline: [71, 75, 79, 82, 76, 73, 74.8],
    allowExceptions: false,
    activeSensors: 22,
    color: '#ffb4ab',
  },
  {
    id: 'zone-5',
    name: 'West End Waterfront',
    description: 'Harbor & tourist promenade noise regulation',
    classification: 'custom',
    status: 'active',
    currentDb: 58.4,
    thresholdDb: 60.0,
    quietHours: '22:00 - 06:00',
    sparkline: [54, 56, 58, 61, 57, 59, 58.4],
    allowExceptions: false,
    activeSensors: 5,
    color: '#2fd9f4',
  }
];

export const INITIAL_CHALLANS: ChallanRecord[] = [
  {
    id: 'CH-9921',
    location: 'Sector 17 Market',
    source: 'Heavy Vehicle',
    sourceCategory: 'vehicle',
    db: 89.4,
    status: 'issued',
    time: '10:42 AM',
    timestamp: '2026-10-24 10:42:15',
    nodeId: 'SN-829A',
    evidenceUrl: 'cloud.urbannoisenet.io/ev/9921',
    confidence: 98,
    coordinates: { lat: '30.7333', lng: '76.7794' },
    duration: '00:04s',
    fineAmount: 250.00,
    licensePlate: 'WA-884-KJZ',
    officerNotes: 'Decibel threshold exceeded by +19.4 dB in residential-adjacent market corridor.'
  },
  {
    id: 'CH-9922',
    location: 'Aerocity Road',
    source: 'Modified Exhaust',
    sourceCategory: 'exhaust',
    db: 102.1,
    status: 'contested',
    time: '09:15 AM',
    timestamp: '2026-10-24 09:15:02',
    nodeId: 'SN-441F',
    evidenceUrl: 'cloud.urbannoisenet.io/ev/9922',
    confidence: 96,
    coordinates: { lat: '40.7128', lng: '-74.0060' },
    duration: '00:08s',
    fineAmount: 500.00,
    licensePlate: 'NY-390-EXH',
    officerNotes: 'Baffling removed, rapid acceleration event causing sudden 102+ dB spike.'
  },
  {
    id: 'CH-9923',
    location: 'Phase 8 Ind Area',
    source: 'Construction',
    sourceCategory: 'construction',
    db: 78.5,
    status: 'pending',
    time: 'Yesterday',
    timestamp: '2026-10-23 16:30:10',
    nodeId: 'SN-102C',
    evidenceUrl: 'cloud.urbannoisenet.io/ev/9923',
    confidence: 94,
    coordinates: { lat: '47.6062', lng: '-122.3321' },
    duration: '01:22m',
    fineAmount: 350.00,
    officerNotes: 'Pneumatic drill operation outside designated sound-mitigation enclosure.'
  },
  {
    id: 'CH-9924',
    location: 'Tribune Chowk',
    source: 'Horn Usage',
    sourceCategory: 'horn',
    db: 95.2,
    status: 'issued',
    time: 'Yesterday',
    timestamp: '2026-10-23 14:18:44',
    nodeId: 'SN-905K',
    evidenceUrl: 'cloud.urbannoisenet.io/ev/9924',
    confidence: 99,
    coordinates: { lat: '30.7046', lng: '76.8010' },
    duration: '00:06s',
    fineAmount: 150.00,
    licensePlate: 'CH-01-AB-2041',
    officerNotes: 'Repeated multi-tone air horn blare within 200m of designated hospital quiet zone.'
  },
  {
    id: 'CH-9925',
    location: 'Pine Street Corridor',
    source: 'Commercial PA Bleed',
    sourceCategory: 'music',
    db: 84.1,
    status: 'issued',
    time: '2 days ago',
    timestamp: '2026-10-22 23:14:00',
    nodeId: 'SN-312X',
    evidenceUrl: 'cloud.urbannoisenet.io/ev/9925',
    confidence: 95,
    coordinates: { lat: '47.6101', lng: '-122.3370' },
    duration: '00:45s',
    fineAmount: 300.00,
    officerNotes: 'External sound system broadcasting promotional music past 23:00 curfew.'
  }
];

export const INITIAL_LIVE_EVENTS: LiveEvent[] = [
  {
    id: 'EVT-01',
    title: 'Siren',
    zone: 'Zone 1',
    timeAgo: '5m ago',
    db: 92,
    type: 'siren',
    severity: 'critical'
  },
  {
    id: 'EVT-02',
    title: 'Construction',
    zone: 'Zone 4',
    timeAgo: '2m ago',
    db: 85,
    type: 'construction',
    severity: 'warning'
  },
  {
    id: 'EVT-03',
    title: 'Traffic',
    zone: 'Zone 2',
    timeAgo: '12m ago',
    db: 72,
    type: 'traffic',
    severity: 'normal'
  },
  {
    id: 'EVT-04',
    title: 'Modified Exhaust',
    zone: 'Zone 3',
    timeAgo: '18m ago',
    db: 98,
    type: 'exhaust',
    severity: 'critical'
  },
  {
    id: 'EVT-05',
    title: 'Air Horn Spike',
    zone: 'Zone 1',
    timeAgo: '25m ago',
    db: 94,
    type: 'horn',
    severity: 'critical'
  }
];

export const INITIAL_COMPLAINTS: ComplaintReport[] = [
  {
    id: '#NX-882',
    title: 'Industrial Operation Override',
    timestamp: 'Oct 24, 23:45',
    classification: 'Heavy Industrial Operation',
    status: 'review',
    location: 'Sector 4, Main Artery',
    description: 'Compressor discharge venting repeatedly every 3 minutes with sharp 85dB pressure release.',
    progress: 50,
    audioFileName: 'compressor_burst_raw.wav'
  },
  {
    id: '#NX-885',
    title: 'Unidentified Sub-Bass Resonance',
    timestamp: 'Oct 25, 02:12',
    classification: 'Unidentified Acoustic Event',
    status: 'queued',
    location: 'North Lynnwood District',
    description: 'Low frequency continuous drone (around 45Hz) penetrating residential double-glazing.',
    progress: 25,
    audioFileName: 'low_freq_drone.flac'
  },
  {
    id: '#NX-790',
    title: 'Vehicular Exhaust Mod',
    timestamp: 'Oct 22, 18:30',
    classification: 'Unregulated Vehicular Mod',
    status: 'resolved',
    location: 'Aerocity Flyover',
    description: 'Motorcycle club drag launch triggering automatic decibel sensor warnings.',
    progress: 100
  }
];

export const ACOUSTIC_NODES: AcousticNode[] = [
  {
    id: 'SN-829A',
    name: 'Sector 17 Hub Sensor',
    location: 'Market Plaza North',
    lat: 30.7333,
    lng: 76.7794,
    currentDb: 89.4,
    peakDb: 96.2,
    status: 'critical',
    dominantFrequency: '1.2 kHz',
    lastUpdated: '1s ago',
    category: 'Commercial Transit'
  },
  {
    id: 'SN-441F',
    name: 'Aerocity Main Sensor',
    location: 'Airport Expressway Km 4',
    lat: 40.7128,
    lng: -74.0060,
    currentDb: 102.1,
    peakDb: 104.8,
    status: 'critical',
    dominantFrequency: '380 Hz',
    lastUpdated: 'Just now',
    category: 'Highway / Transit'
  },
  {
    id: 'SN-102C',
    name: 'Phase 8 Boundary Mic',
    location: 'Industrial Gate 3',
    lat: 47.6062,
    lng: -122.3321,
    currentDb: 78.5,
    peakDb: 84.0,
    status: 'warning',
    dominantFrequency: '850 Hz',
    lastUpdated: '4s ago',
    category: 'Industrial'
  },
  {
    id: 'SN-905K',
    name: 'Tribune Chowk Acoustic Array',
    location: 'Hospital Quiet Sector Gate',
    lat: 30.7046,
    lng: 76.8010,
    currentDb: 68.2,
    peakDb: 95.2,
    status: 'normal',
    dominantFrequency: '2.4 kHz',
    lastUpdated: '2s ago',
    category: 'Quiet Buffer'
  }
];
