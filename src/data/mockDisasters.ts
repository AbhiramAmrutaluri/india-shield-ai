export type DisasterType = 'earthquake' | 'flood' | 'fire' | 'cyclone' | 'landslide' | 'accident';
export type SeverityLevel = 'critical' | 'severe' | 'moderate' | 'low';

export interface DisasterEvent {
  id: string;
  type: DisasterType;
  title: string;
  location: string;
  lat: number;
  lng: number;
  severity: SeverityLevel;
  timestamp: Date;
  source: string;
  description: string;
  affectedPeople: number;
  confidence: number;
}

export interface StreamMetric {
  timestamp: string;
  tweets: number;
  weatherAlerts: number;
  newsItems: number;
  processed: number;
}

export const DISASTER_ICONS: Record<DisasterType, string> = {
  earthquake: '🔴',
  flood: '🔵',
  fire: '🟠',
  cyclone: '🟣',
  landslide: '🟤',
  accident: '🟡',
};

export const DISASTER_LABELS: Record<DisasterType, string> = {
  earthquake: 'Earthquake',
  flood: 'Flood',
  fire: 'Fire',
  cyclone: 'Cyclone',
  landslide: 'Landslide',
  accident: 'Accident',
};

export const mockDisasters: DisasterEvent[] = [
  {
    id: 'ev-001',
    type: 'earthquake',
    title: 'M5.2 Earthquake detected near Joshimath',
    location: 'Joshimath, Uttarakhand',
    lat: 30.555,
    lng: 79.566,
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    source: 'USGS Seismic Network',
    description: 'Moderate earthquake detected at 12km depth. Tremors felt across Chamoli district.',
    affectedPeople: 45000,
    confidence: 0.97,
  },
  {
    id: 'ev-002',
    type: 'flood',
    title: 'Severe flooding in Assam — Brahmaputra rising',
    location: 'Kaziranga, Assam',
    lat: 26.58,
    lng: 93.17,
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    source: 'CWC Flood Alert',
    description: 'Brahmaputra river above danger level. Multiple villages submerged.',
    affectedPeople: 120000,
    confidence: 0.94,
  },
  {
    id: 'ev-003',
    type: 'fire',
    title: 'Industrial fire at Bhiwandi warehouse complex',
    location: 'Bhiwandi, Maharashtra',
    lat: 19.296,
    lng: 73.065,
    severity: 'severe',
    timestamp: new Date(Date.now() - 1000 * 60 * 28),
    source: 'Twitter NLP Detection',
    description: 'Major fire reported in textile warehouse area. Fire brigade dispatched.',
    affectedPeople: 3500,
    confidence: 0.89,
  },
  {
    id: 'ev-004',
    type: 'cyclone',
    title: 'Cyclone DANA approaching Odisha coast',
    location: 'Puri, Odisha',
    lat: 19.81,
    lng: 85.83,
    severity: 'severe',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    source: 'IMD Weather Alert',
    description: 'Category 2 cyclone expected to make landfall in 18 hours. Wind speed 120 kmph.',
    affectedPeople: 850000,
    confidence: 0.92,
  },
  {
    id: 'ev-005',
    type: 'landslide',
    title: 'Landslide blocks NH-5 near Shimla',
    location: 'Shimla, Himachal Pradesh',
    lat: 31.105,
    lng: 77.172,
    severity: 'moderate',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    source: 'News API Detection',
    description: 'Heavy rainfall triggered landslide blocking national highway.',
    affectedPeople: 8000,
    confidence: 0.85,
  },
  {
    id: 'ev-006',
    type: 'flood',
    title: 'Urban flooding in Chennai after heavy rainfall',
    location: 'Chennai, Tamil Nadu',
    lat: 13.083,
    lng: 80.27,
    severity: 'moderate',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    source: 'Social Media NLP',
    description: 'Waterlogging reported in 15+ areas. T. Nagar and Velachery worst hit.',
    affectedPeople: 200000,
    confidence: 0.88,
  },
  {
    id: 'ev-007',
    type: 'accident',
    title: 'Multi-vehicle pileup on Delhi-Jaipur Expressway',
    location: 'Gurugram, Haryana',
    lat: 28.459,
    lng: 77.027,
    severity: 'moderate',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    source: 'Twitter NLP Detection',
    description: 'Dense fog caused chain collision involving 12 vehicles.',
    affectedPeople: 150,
    confidence: 0.82,
  },
  {
    id: 'ev-008',
    type: 'earthquake',
    title: 'M3.8 tremor felt in Delhi-NCR',
    location: 'New Delhi',
    lat: 28.614,
    lng: 77.209,
    severity: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    source: 'USGS Seismic Network',
    description: 'Minor earthquake originating from Haryana fault line.',
    affectedPeople: 500000,
    confidence: 0.95,
  },
  {
    id: 'ev-009',
    type: 'fire',
    title: 'Forest fire spreading in Bandipur reserve',
    location: 'Bandipur, Karnataka',
    lat: 11.668,
    lng: 76.633,
    severity: 'severe',
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    source: 'Satellite Detection',
    description: 'Active fire covering 200 hectares. Wildlife at risk.',
    affectedPeople: 1200,
    confidence: 0.91,
  },
  {
    id: 'ev-010',
    type: 'flood',
    title: 'Kerala dam at danger level',
    location: 'Idukki, Kerala',
    lat: 9.849,
    lng: 76.972,
    severity: 'severe',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    source: 'CWC Alert System',
    description: 'Idukki dam water level at 2398ft. Red alert issued for downstream areas.',
    affectedPeople: 95000,
    confidence: 0.96,
  },
];

export const generateStreamMetrics = (): StreamMetric[] => {
  const metrics: StreamMetric[] = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(Date.now() - i * 3600000);
    metrics.push({
      timestamp: `${hour.getHours().toString().padStart(2, '0')}:00`,
      tweets: Math.floor(Math.random() * 5000 + 2000),
      weatherAlerts: Math.floor(Math.random() * 200 + 50),
      newsItems: Math.floor(Math.random() * 800 + 200),
      processed: Math.floor(Math.random() * 6000 + 3000),
    });
  }
  return metrics;
};

export const pipelineStats = {
  kafkaMessagesPerSec: 12847,
  sparkJobsRunning: 8,
  hdfsNodesActive: 12,
  hiveQueriesCompleted: 1456,
  modelAccuracy: 94.7,
  avgLatencyMs: 230,
  totalEventsToday: 847293,
  alertsTriggered: 47,
};
