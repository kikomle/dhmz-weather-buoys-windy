<div class="plugin__mobile-header">
    {title}
</div>

<section class="plugin__content buoy-plugin">
    <div
        class="plugin__title plugin__title--chevron-back"
        on:click={() => bcast.emit('rqstOpen', 'menu')}
    >
        {title}
    </div>

    <div class="intro">
        <div>
            <span class="eyebrow">DHMZ observations</span>
            <p class="intro__copy">
                Live meteorological and oceanographic charts from five Croatian Adriatic buoys.
            </p>
        </div>
        <button class="map-button" type="button" on:click={showAllBuoys} title="Show all buoys">
            <span aria-hidden="true">⌖</span>
            All buoys
        </button>
    </div>

    <div class="station-strip" aria-label="Select a buoy">
        {#each buoys as buoy}
            <button
                class="station-pill"
                class:is-selected={selectedBuoy.id === buoy.id}
                type="button"
                aria-pressed={selectedBuoy.id === buoy.id}
                on:click={() => selectBuoy(buoy)}
            >
                <span class="station-pill__dot" aria-hidden="true"></span>
                <span>{buoy.name}</span>
            </button>
        {/each}
    </div>

    <article class="observation-card">
        <header class="observation-card__header">
            <div>
                <span class="live-label"><span aria-hidden="true"></span> Official chart</span>
                <h2>{selectedBuoy.name}</h2>
                <p>
                    {formatCoordinate(selectedBuoy.lat, 'N', 'S')} ·
                    {formatCoordinate(selectedBuoy.lon, 'E', 'W')} ·
                    {selectedBuoy.mooringDepth.toFixed(1)} m mooring depth
                </p>
            </div>
            <button
                class="refresh-button"
                class:is-loading={imageLoading}
                type="button"
                on:click={refreshData}
                aria-label="Refresh the buoy chart"
                title="Refresh chart"
            >
                ↻
            </button>
        </header>

        <div class="chart-toolbar">
            <span>
                {imageLoading
                    ? 'Loading latest chart…'
                    : viewMode === 'full'
                      ? 'Full size · scroll to explore'
                      : `Checked ${formatCheckedAt(lastChecked)}`}
            </span>
            <div class="view-toggle" aria-label="Chart size">
                <button
                    class:is-active={viewMode === 'fit'}
                    type="button"
                    on:click={() => (viewMode = 'fit')}
                >Fit</button>
                <button
                    class:is-active={viewMode === 'full'}
                    type="button"
                    on:click={() => (viewMode = 'full')}
                >100%</button>
            </div>
        </div>

        <div class="chart-viewport" class:is-full={viewMode === 'full'}>
            {#if chartFailed}
                <div class="chart-error">
                    <span aria-hidden="true">≈</span>
                    <strong>The DHMZ chart could not be loaded.</strong>
                    <p>Try refreshing, or open the source page below.</p>
                </div>
            {/if}
            <img
                class:is-hidden={chartFailed}
                src={chartSrc}
                alt={`Latest DHMZ meteorological and oceanographic observations for ${selectedBuoy.name}`}
                on:load={handleChartLoaded}
                on:error={handleChartError}
            />
        </div>

        <footer class="observation-card__footer">
            <span>Auto-refreshes every 10 minutes</span>
            <a href={selectedBuoy.chartUrl} target="_blank" rel="noreferrer">Open full chart ↗</a>
        </footer>
    </article>

    <div class="notice">
        <span class="notice__icon" aria-hidden="true">i</span>
        <p>
            DHMZ publishes original, uncontrolled measurements. Values may be missing or may
            deviate from actual conditions; do not use this display as the sole source for
            safety-critical decisions.
        </p>
    </div>

    <p class="source-line">
        Data and charts:
        <a href={dhmzSourceUrl} target="_blank" rel="noreferrer">Croatian Meteorological and Hydrological Service (DHMZ) ↗</a>
    </p>
</section>

<script lang="ts">
    import bcast from '@windy/broadcast';
    import { map } from '@windy/map';
    import { onDestroy, onMount } from 'svelte';

    import { buoys, dhmzSourceUrl, networkCenter } from './buoys';
    import config from './pluginConfig';
    import type { Buoy } from './buoys';

    const { title } = config;
    const refreshIntervalMs = 10 * 60 * 1000;
    const checkedAtFormatter = new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    });

    let selectedBuoy = buoys[0];
    let chartVersion = Date.now();
    let chartSrc = '';
    let chartFailed = false;
    let imageLoading = true;
    let lastChecked = new Date();
    let viewMode: 'fit' | 'full' = 'full';
    let refreshTimer: ReturnType<typeof setInterval> | null = null;
    let buoyMarkers: { buoy: Buoy; marker: L.Marker }[] = [];

    $: chartSrc = `${selectedBuoy.chartUrl}?windy-refresh=${chartVersion}`;

    const formatCoordinate = (value: number, positive: string, negative: string) =>
        `${Math.abs(value).toFixed(4)}°${value >= 0 ? positive : negative}`;

    const formatCheckedAt = (date: Date) => checkedAtFormatter.format(date);

    const makeBuoyIcon = (buoy: Buoy, isSelected: boolean) =>
        new L.DivIcon({
            className: `dhmz-buoy-marker${isSelected ? ' is-selected' : ''}`,
            html: `<span class="dhmz-buoy-marker__halo"></span>
                <span class="dhmz-buoy-marker__ring">
                    <span class="dhmz-buoy-marker__core"></span>
                </span>
                <span class="dhmz-buoy-marker__label">
                    <span class="dhmz-buoy-marker__arrow" aria-hidden="true">▲</span>
                    <span>${buoy.name}</span>
                </span>`,
            iconAnchor: [28, 28],
            iconSize: [128, 88],
        });

    const updateMarkerSelection = () => {
        buoyMarkers.forEach(({ buoy, marker }) => {
            marker.setIcon(makeBuoyIcon(buoy, buoy.id === selectedBuoy.id));
        });
    };

    const refreshData = () => {
        chartFailed = false;
        imageLoading = true;
        lastChecked = new Date();
        chartVersion = Date.now();
    };

    const selectBuoy = (buoy: Buoy, focusMap = true) => {
        selectedBuoy = buoy;
        viewMode = 'full';
        updateMarkerSelection();
        refreshData();

        if (focusMap) {
            map.setView({ lat: buoy.lat, lng: buoy.lon }, Math.max(map.getZoom(), 7));
        }
    };

    const showAllBuoys = () => {
        map.setView({ lat: networkCenter.lat, lng: networkCenter.lon }, 6);
    };

    const addBuoyMarkers = () => {
        if (buoyMarkers.length > 0) {
            return;
        }

        buoyMarkers = buoys.map(buoy => {
            const marker = new L.Marker(
                { lat: buoy.lat, lng: buoy.lon },
                {
                    icon: makeBuoyIcon(buoy, buoy.id === selectedBuoy.id),
                    title: `${buoy.name} DHMZ buoy`,
                },
            ).addTo(map);

            marker.on('click', () => selectBuoy(buoy, false));
            return { buoy, marker };
        });
    };

    const removeBuoyMarkers = () => {
        buoyMarkers.forEach(({ marker }) => marker.remove());
        buoyMarkers = [];
    };

    const handleChartLoaded = () => {
        imageLoading = false;
        chartFailed = false;
    };

    const handleChartError = () => {
        imageLoading = false;
        chartFailed = true;
    };

    export const onopen = () => {
        addBuoyMarkers();
        showAllBuoys();
        refreshData();
    };

    onMount(() => {
        refreshTimer = setInterval(refreshData, refreshIntervalMs);
    });

    onDestroy(() => {
        removeBuoyMarkers();

        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    });
</script>

<style lang="less">
    .buoy-plugin {
        --navy: #0a2638;
        --navy-soft: #163d53;
        --sea: #0d8aa5;
        --aqua: #8ee3e8;
        --foam: #eef9f8;
        --signal: #ffd747;
        --ink-muted: #5f717a;
        --line: #d9e5e8;
        color: var(--navy);
        padding-bottom: 24px;
    }

    .intro {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        margin: 18px 0 16px;

        &__copy {
            max-width: 310px;
            margin: 5px 0 0;
            color: var(--ink-muted);
            font-size: 14px;
            line-height: 1.45;
        }
    }

    .eyebrow {
        color: var(--sea);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.11em;
        text-transform: uppercase;
    }

    .map-button,
    .refresh-button,
    .station-pill,
    .view-toggle button {
        border: 0;
        font: inherit;
        cursor: pointer;
    }

    .map-button {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
        border: 1px solid var(--line);
        border-radius: 9px;
        background: white;
        color: var(--navy-soft);
        font-size: 12px;
        font-weight: 600;

        &:hover {
            border-color: var(--sea);
        }
    }

    .station-strip {
        display: flex;
        gap: 7px;
        margin: 0 -10px 16px;
        padding: 1px 10px 8px;
        overflow-x: auto;
        scrollbar-width: thin;
    }

    .station-pill {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        gap: 7px;
        min-height: 36px;
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: #f7fafb;
        color: var(--navy-soft);
        font-size: 12px;
        font-weight: 600;

        &__dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #9cabb1;
        }

        &:hover {
            border-color: #9ec9d2;
            background: white;
        }

        &.is-selected {
            border-color: var(--navy);
            background: var(--navy);
            color: white;

            .station-pill__dot {
                background: var(--signal);
                box-shadow: 0 0 0 3px rgba(255, 215, 71, 0.18);
            }
        }
    }

    .observation-card {
        overflow: hidden;
        border: 1px solid #ccdde1;
        border-radius: 14px;
        background: white;
        box-shadow: 0 8px 25px rgba(10, 38, 56, 0.09);

        &__header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding: 16px 16px 13px;
            background: linear-gradient(145deg, #f8fcfc 0%, #eaf7f7 100%);

            h2 {
                margin: 4px 0 3px;
                color: var(--navy);
                font-size: 23px;
                font-weight: 650;
                line-height: 1.15;
            }

            p {
                margin: 0;
                color: var(--ink-muted);
                font-size: 11px;
                line-height: 1.45;
            }
        }

        &__footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 11px 14px;
            border-top: 1px solid var(--line);
            color: var(--ink-muted);
            font-size: 11px;

            a {
                color: var(--sea);
                font-weight: 700;
                text-decoration: none;
            }
        }
    }

    .live-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--sea);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;

        span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #35b779;
            box-shadow: 0 0 0 3px rgba(53, 183, 121, 0.15);
        }
    }

    .refresh-button {
        display: grid;
        flex: 0 0 34px;
        width: 34px;
        height: 34px;
        place-items: center;
        border: 1px solid #c9dfe2;
        border-radius: 50%;
        background: white;
        color: var(--sea);
        font-size: 22px;
        line-height: 1;

        &:hover {
            border-color: var(--sea);
        }

        &.is-loading {
            animation: spin 1s linear infinite;
        }
    }

    .chart-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 38px;
        padding: 0 12px 0 14px;
        border-top: 1px solid rgba(204, 221, 225, 0.7);
        border-bottom: 1px solid var(--line);
        color: var(--ink-muted);
        font-size: 11px;
    }

    .view-toggle {
        display: inline-flex;
        padding: 2px;
        border-radius: 7px;
        background: #e7eff1;

        button {
            padding: 4px 7px;
            border-radius: 5px;
            background: transparent;
            color: var(--ink-muted);
            font-size: 10px;

            &.is-active {
                background: white;
                color: var(--navy);
                box-shadow: 0 1px 3px rgba(10, 38, 56, 0.15);
            }
        }
    }

    .chart-viewport {
        position: relative;
        min-height: 300px;
        max-height: min(70vh, 760px);
        overflow: auto;
        overscroll-behavior: contain;
        scrollbar-color: #72aebc #e7f0f2;
        scrollbar-width: auto;
        background:
            linear-gradient(90deg, rgba(220, 235, 237, 0.3) 1px, transparent 1px) 0 0 / 18px 18px,
            linear-gradient(rgba(220, 235, 237, 0.3) 1px, transparent 1px) 0 0 / 18px 18px,
            #fbfdfd;

        img {
            display: block;
            width: 100%;
            height: auto;
            background: white;
        }

        &.is-full img {
            width: 997px;
            max-width: none;
        }

        img.is-hidden {
            display: none;
        }
    }

    .chart-error {
        display: flex;
        min-height: 180px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        color: var(--ink-muted);
        text-align: center;

        > span {
            display: grid;
            width: 45px;
            height: 45px;
            margin-bottom: 12px;
            place-items: center;
            border-radius: 50%;
            background: #dff2f3;
            color: var(--sea);
            font-size: 26px;
        }

        strong {
            color: var(--navy);
        }

        p {
            margin: 5px 0 0;
            font-size: 12px;
        }
    }

    .notice {
        display: flex;
        gap: 10px;
        margin-top: 14px;
        padding: 12px 13px;
        border: 1px solid #efd989;
        border-radius: 10px;
        background: #fff9df;

        &__icon {
            display: grid;
            flex: 0 0 20px;
            width: 20px;
            height: 20px;
            place-items: center;
            border-radius: 50%;
            background: var(--signal);
            color: #4c4000;
            font-size: 12px;
            font-weight: 800;
        }

        p {
            margin: 0;
            color: #635923;
            font-size: 11px;
            line-height: 1.5;
        }
    }

    .source-line {
        margin: 14px 2px 0;
        color: var(--ink-muted);
        font-size: 11px;
        line-height: 1.45;

        a {
            color: var(--sea);
            font-weight: 600;
            text-decoration: none;
        }
    }

    :global(.dhmz-buoy-marker) {
        position: relative;
        width: 128px !important;
        height: 88px !important;
        border: 0;
        background: transparent;
        filter: drop-shadow(0 5px 8px rgba(7, 45, 65, 0.26));
    }

    :global(.dhmz-buoy-marker__halo) {
        position: absolute;
        top: -7px;
        left: -7px;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: rgba(99, 219, 119, 0.24);
        animation: buoy-pulse 2.5s ease-out infinite;
    }

    :global(.dhmz-buoy-marker__ring) {
        position: absolute;
        top: 0;
        left: 0;
        width: 56px;
        height: 56px;
        box-sizing: border-box;
        border: 2px solid rgba(255, 255, 255, 0.92);
        border-radius: 50%;
        background: repeating-conic-gradient(
            from -8deg,
            #63dd67 0deg 14deg,
            #1a9b55 14deg 20deg
        );
        box-shadow:
            0 3px 12px rgba(7, 45, 65, 0.4),
            inset 0 0 0 1px rgba(6, 100, 74, 0.3);
        transition: transform 0.18s ease;

        &::before {
            position: absolute;
            inset: 10px;
            border-radius: 50%;
            background: white;
            content: '';
        }
    }

    :global(.dhmz-buoy-marker__core) {
        position: absolute;
        inset: 15px;
        border: 3px solid #2b8aae;
        border-radius: 50%;
        background: #ecfbff;
        box-shadow: inset 0 0 0 2px white;
    }

    :global(.dhmz-buoy-marker__label) {
        position: absolute;
        top: 49px;
        left: 18px;
        display: inline-flex;
        min-width: 88px;
        min-height: 36px;
        box-sizing: border-box;
        align-items: center;
        gap: 6px;
        padding: 6px 10px 6px 9px;
        border: 2px solid rgba(255, 255, 255, 0.72);
        border-radius: 12px;
        background: linear-gradient(145deg, #2f8daf, #237495);
        color: white;
        font-size: 13px;
        font-weight: 750;
        line-height: 1;
        text-shadow: 0 1px 1px rgba(7, 45, 65, 0.28);
        white-space: nowrap;
        transition:
            background 0.18s ease,
            transform 0.18s ease;
    }

    :global(.dhmz-buoy-marker__arrow) {
        color: #d9fbff;
        font-size: 12px;
        transform: rotate(24deg);
    }

    :global(.dhmz-buoy-marker:hover .dhmz-buoy-marker__ring),
    :global(.dhmz-buoy-marker.is-selected .dhmz-buoy-marker__ring) {
        transform: scale(1.1);
    }

    :global(.dhmz-buoy-marker:hover .dhmz-buoy-marker__label),
    :global(.dhmz-buoy-marker.is-selected .dhmz-buoy-marker__label) {
        background: linear-gradient(145deg, #127f9d, #0a607d);
        transform: translateY(3px) scale(1.04);
    }

    :global(.dhmz-buoy-marker.is-selected .dhmz-buoy-marker__halo) {
        background: rgba(142, 227, 232, 0.35);
        animation-duration: 1.6s;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes buoy-pulse {
        0% {
            opacity: 0.9;
            transform: scale(0.75);
        }
        70%,
        100% {
            opacity: 0;
            transform: scale(1.4);
        }
    }

    @media (max-width: 430px) {
        .intro {
            margin-top: 14px;
        }

        .observation-card {
            border-radius: 12px;
        }

        .chart-viewport {
            min-height: 280px;
            max-height: 65vh;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .refresh-button.is-loading,
        :global(.dhmz-buoy-marker__halo) {
            animation: none;
        }
    }
</style>
