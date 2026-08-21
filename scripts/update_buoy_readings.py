#!/usr/bin/env python3
"""Extract the latest significant wave height from DHMZ buoy chart PNGs."""

from __future__ import annotations

import argparse
import io
import json
import math
import re
import shutil
import subprocess
import tempfile
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

from PIL import Image, ImageOps


BUOYS = {
    "Kvarner": "https://vrijeme.hr/plutace/plutaca-Kvarner-en.png",
    "Blitvenica": "https://vrijeme.hr/plutace/plutaca-Blitvenica-en.png",
    "Viski_kanal": "https://vrijeme.hr/plutace/plutaca-Viski_kanal-en.png",
    "Palagruza": "https://vrijeme.hr/plutace/plutaca-Palagruza-en.png",
    "Molunat": "https://vrijeme.hr/plutace/plutaca-Molunat-en.png",
}


@dataclass(frozen=True)
class PlotFrame:
    left: int
    right: int
    top: int
    bottom: int


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def group_nearby(values: list[int], maximum_gap: int = 3) -> list[list[int]]:
    groups: list[list[int]] = []
    for value in sorted(values):
        if not groups or value - groups[-1][-1] > maximum_gap:
            groups.append([value])
        else:
            groups[-1].append(value)
    return groups


def longest_run(values: list[int]) -> tuple[int, int]:
    if not values:
        raise ValueError("No plot border pixels found")

    best = (values[0], values[0])
    start = previous = values[0]
    for value in values[1:]:
        if value == previous + 1:
            previous = value
            continue
        if previous - start > best[1] - best[0]:
            best = (start, previous)
        start = previous = value
    if previous - start > best[1] - best[0]:
        best = (start, previous)
    return best


def find_wave_plot(image: Image.Image) -> PlotFrame:
    rgb = image.convert("RGB")
    pixels = rgb.load()
    width, height = rgb.size

    y_start = int(height * 0.18)
    y_end = int(height * 0.27)
    scan_left = int(width * 0.06)
    scan_right = int(width * 0.97)
    required_dark_pixels = int((scan_right - scan_left) * 0.65)

    border_rows: list[int] = []
    for y in range(y_start, y_end):
        dark = sum(
            1
            for x in range(scan_left, scan_right)
            if max(pixels[x, y]) < 70
        )
        if dark >= required_dark_pixels:
            border_rows.append(y)

    row_groups = group_nearby(border_rows)
    if len(row_groups) < 2:
        raise ValueError("Wave-height plot frame was not found")

    top = round(sum(row_groups[0]) / len(row_groups[0]))
    bottom = round(sum(row_groups[-1]) / len(row_groups[-1]))
    border_x = [
        x
        for x in range(scan_left, scan_right)
        if max(pixels[x, top]) < 70
    ]
    left, right = longest_run(border_x)

    if right - left < width * 0.7 or bottom - top < 150:
        raise ValueError("Detected wave-height plot frame has invalid dimensions")
    return PlotFrame(left=left, right=right, top=top, bottom=bottom)


def find_latest_blue_point(image: Image.Image, frame: PlotFrame) -> tuple[int, float] | None:
    pixels = image.convert("RGB").load()
    points_by_x: dict[int, list[int]] = {}

    for x in range(frame.left + 2, frame.right - 1):
        ys: list[int] = []
        for y in range(frame.top + 2, frame.bottom - 1):
            red, green, blue = pixels[x, y]
            if blue > 155 and blue - red > 80 and blue - green > 65:
                ys.append(y)
        if ys:
            points_by_x[x] = ys

    if not points_by_x:
        return None

    latest_x = max(points_by_x)
    latest_pixels: list[int] = []
    for x in range(max(frame.left, latest_x - 3), latest_x + 1):
        latest_pixels.extend(points_by_x.get(x, []))

    latest_pixels.sort()
    median_y = latest_pixels[len(latest_pixels) // 2]
    return latest_x, float(median_y)


def grid_row_candidates(image: Image.Image, frame: PlotFrame) -> list[int]:
    pixels = image.convert("RGB").load()
    span = frame.right - frame.left
    candidates = [frame.top, frame.bottom]

    for y in range(frame.top + 4, frame.bottom - 3):
        neutral = 0
        for x in range(frame.left + 2, frame.right - 1):
            red, green, blue = pixels[x, y]
            if 95 <= red <= 230 and abs(red - green) <= 5 and abs(red - blue) <= 5:
                neutral += 1
        if neutral >= span * 0.34:
            candidates.append(y)

    return [round(sum(group) / len(group)) for group in group_nearby(candidates, 4)]


def ocr_tick(image: Image.Image, frame: PlotFrame, y: int) -> float | None:
    left = max(0, frame.left - 37)
    right = max(left + 1, frame.left - 5)
    top = max(0, y - 11)
    bottom = min(image.height, y + 11)
    crop = image.convert("L").crop((left, top, right, bottom))
    crop = ImageOps.autocontrast(crop).resize((crop.width * 8, crop.height * 8))

    with tempfile.NamedTemporaryFile(suffix=".png") as temporary:
        crop.save(temporary.name)
        result = subprocess.run(
            [
                "tesseract",
                temporary.name,
                "stdout",
                "--psm",
                "7",
                "-c",
                "tessedit_char_whitelist=0123456789.-",
            ],
            check=False,
            capture_output=True,
            text=True,
        )

    match = re.search(r"-?\d+(?:\.\d+)?", result.stdout.replace(" ", ""))
    if not match:
        return None
    value = float(match.group(0))
    return value if 0 <= value <= 25 else None


def fit_axis(points: list[tuple[float, float]]) -> tuple[float, float, int]:
    unique = list(dict.fromkeys(points))
    best: tuple[int, float, float, float] | None = None

    for index, (y1, value1) in enumerate(unique):
        for y2, value2 in unique[index + 1 :]:
            if abs(y2 - y1) < 20:
                continue
            slope = (value2 - value1) / (y2 - y1)
            if not -0.1 < slope < -0.0001:
                continue
            intercept = value1 - slope * y1
            inliers = [
                (y, value)
                for y, value in unique
                if abs((slope * y + intercept) - value) <= 0.08
            ]
            if len(inliers) < 3:
                continue
            y_span = max(y for y, _ in inliers) - min(y for y, _ in inliers)
            score = (len(inliers), y_span)
            if best is None or score > (best[0], best[1]):
                best = (len(inliers), y_span, slope, intercept)

    if best is None:
        raise ValueError(f"Could not calibrate wave-height axis from OCR ticks: {unique}")

    _, _, initial_slope, initial_intercept = best
    inliers = [
        (y, value)
        for y, value in unique
        if abs((initial_slope * y + initial_intercept) - value) <= 0.08
    ]
    mean_y = sum(y for y, _ in inliers) / len(inliers)
    mean_value = sum(value for _, value in inliers) / len(inliers)
    denominator = sum((y - mean_y) ** 2 for y, _ in inliers)
    slope = sum((y - mean_y) * (value - mean_value) for y, value in inliers) / denominator
    intercept = mean_value - slope * mean_y
    return slope, intercept, len(inliers)


def extract_wave_height(image: Image.Image) -> dict[str, object]:
    frame = find_wave_plot(image)
    latest = find_latest_blue_point(image, frame)
    if latest is None:
        return {
            "waveHeightM": None,
            "status": "no-data",
            "confidence": "high",
        }

    ticks = [
        (float(y), value)
        for y in grid_row_candidates(image, frame)
        if (value := ocr_tick(image, frame, y)) is not None
    ]
    slope, intercept, inlier_count = fit_axis(ticks)
    latest_x, latest_y = latest
    wave_height = max(0.0, slope * latest_y + intercept)
    rounded_height = math.floor(wave_height * 10 + 0.5) / 10

    return {
        "waveHeightM": rounded_height,
        "status": "ok",
        "confidence": "high" if inlier_count >= 4 else "medium",
        "latestPointX": latest_x,
    }


def fetch_chart(url: str) -> tuple[Image.Image, str | None]:
    request = urllib.request.Request(url, headers={"User-Agent": "dhmz-windy-buoy-reader/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        image = Image.open(io.BytesIO(response.read())).convert("RGB")
        modified = response.headers.get("Last-Modified")

    if not modified:
        return image, None
    parsed = parsedate_to_datetime(modified).astimezone(timezone.utc)
    return image, parsed.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def fixture_chart(fixtures_dir: Path, buoy_id: str) -> tuple[Image.Image, None]:
    path = fixtures_dir / f"plutaca-{buoy_id}-en.png"
    return Image.open(path).convert("RGB"), None


def update_readings(output: Path, fixtures_dir: Path | None) -> dict[str, object]:
    generated_at = utc_now()
    readings: dict[str, object] = {}

    for buoy_id, source_url in BUOYS.items():
        try:
            image, chart_updated_at = (
                fixture_chart(fixtures_dir, buoy_id)
                if fixtures_dir
                else fetch_chart(source_url)
            )
            reading = extract_wave_height(image)
            reading.update(
                {
                    "sourceUrl": source_url,
                    "chartUpdatedAt": chart_updated_at,
                    "extractedAt": generated_at,
                }
            )
        except Exception as error:  # Keep other stations available when one chart changes.
            reading = {
                "waveHeightM": None,
                "status": "error",
                "confidence": "none",
                "sourceUrl": source_url,
                "chartUpdatedAt": None,
                "extractedAt": generated_at,
                "error": str(error),
            }
        readings[buoy_id] = reading

    payload = {
        "generatedAt": generated_at,
        "method": "latest blue significant-wave-height curve point extracted from the DHMZ chart image",
        "buoys": readings,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--fixtures-dir", type=Path)
    args = parser.parse_args()

    if shutil.which("tesseract") is None:
        raise SystemExit("tesseract is required for wave-height axis calibration")

    payload = update_readings(args.output, args.fixtures_dir)
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
