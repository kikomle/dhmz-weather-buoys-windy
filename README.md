# Croatian Met-ocean Buoys for Windy

A private Windy.com plugin that places Croatia's five state met-ocean buoys on the map and displays their latest official DHMZ observation charts.

## Load in Windy

Open [Windy developer mode](https://www.windy.com/developer-mode) and load:

```text
https://cdn.jsdelivr.net/gh/kikomle/dhmz-weather-buoys-windy@main/dist/plugin.js
```

The URL is served from this public GitHub repository through jsDelivr, so no local server or tunnel is required.

## What it includes

- Map markers for Kvarner, Blitvenica, Viški kanal, Palagruža, and Molunat
- Official DHMZ chart products for wind, waves, air, visibility, pressure, radiation, and sea measurements
- One-click station selection and map centering
- Fit-to-panel and full-resolution chart modes
- Manual refresh and automatic refresh every 10 minutes
- Mobile and desktop Windy layouts
- DHMZ attribution and measurement-quality warning

## Data integration

DHMZ currently publishes the public buoy observations as generated PNG chart products rather than a JSON API. This plugin loads those official images directly from `https://vrijeme.hr/plutace/`; it does not scrape values from the graphics and it does not need a proxy or API key.

Buoy positions and mooring depths are WGS84 values published for the state network in *Narodne novine* 5/2026. The observation charts and their interpretation remain the responsibility of DHMZ.

## Run locally

```sh
npm install
npm start
```

Then:

1. Open `https://localhost:9999/plugin.js` and accept the local development certificate.
2. Open `https://www.windy.com/developer-mode`.
3. Load `https://localhost:9999/plugin.js`.

## Build

```sh
npm run build
```

The upload-ready output is written to `dist/`. The plugin is marked `private: true` in `src/pluginConfig.ts`; confirm DHMZ reuse/redistribution terms before changing it to a public Windy plugin.

## Sources

- [DHMZ met-ocean buoy observations](https://meteo.hr/podaci_e.php?section=podaci_vrijeme&param=mop)
- [Windy Plugins documentation](https://docs.windy-plugins.com/)
- [Croatian state station network, Narodne novine 5/2026](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_01_5_30.html)
