export interface Buoy {
    id: string;
    name: string;
    lat: number;
    lon: number;
    mooringDepth: number;
    chartUrl: string;
}

export interface WaveReading {
    waveHeightM: number | null;
    status: 'ok' | 'no-data' | 'error';
}

export interface WaveReadingsPayload {
    generatedAt: string;
    buoys: Record<string, WaveReading>;
}

const chartBaseUrl = 'https://vrijeme.hr/plutace';

// WGS84 positions and mooring depths published for the Croatian state
// meteorological-oceanographic buoy network (Narodne novine 5/2026).
export const buoys: Buoy[] = [
    {
        id: 'Kvarner',
        name: 'Kvarner',
        lat: 44.6916,
        lon: 14.151944,
        mooringDepth: 48.3,
        chartUrl: `${chartBaseUrl}/plutaca-Kvarner-en.png`,
    },
    {
        id: 'Blitvenica',
        name: 'Blitvenica',
        lat: 43.598064,
        lon: 15.569719,
        mooringDepth: 211.3,
        chartUrl: `${chartBaseUrl}/plutaca-Blitvenica-en.png`,
    },
    {
        id: 'Viski_kanal',
        name: 'Viški kanal',
        lat: 43.146294,
        lon: 16.112647,
        mooringDepth: 104.5,
        chartUrl: `${chartBaseUrl}/plutaca-Viski_kanal-en.png`,
    },
    {
        id: 'Palagruza',
        name: 'Palagruža',
        lat: 42.489547,
        lon: 16.401208,
        mooringDepth: 188.5,
        chartUrl: `${chartBaseUrl}/plutaca-Palagruza-en.png`,
    },
    {
        id: 'Molunat',
        name: 'Molunat',
        lat: 42.394317,
        lon: 18.358931,
        mooringDepth: 154,
        chartUrl: `${chartBaseUrl}/plutaca-Molunat-en.png`,
    },
];

export const networkCenter = { lat: 43.45, lon: 16.2 };

export const dhmzSourceUrl =
    'https://meteo.hr/podaci_e.php?section=podaci_vrijeme&param=mop';

export const waveReadingsUrl =
    'https://kikomle.github.io/dhmz-weather-buoys-windy/buoy-readings.json';
