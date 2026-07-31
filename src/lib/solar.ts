import { WallpaperFrame } from '../components/SystemSettingsAppView';

export const TIMEZONE_LATITUDE_MAP: Record<string, number> = {
  // North America
  'America/New_York': 40.71,
  'America/Detroit': 42.33,
  'America/Kentucky/Louisville': 38.25,
  'America/Indiana/Indianapolis': 39.77,
  'America/Chicago': 41.88,
  'America/Menominee': 45.11,
  'America/North_Dakota/Center': 47.11,
  'America/Denver': 39.74,
  'America/Boise': 43.62,
  'America/Phoenix': 33.45,
  'America/Los_Angeles': 34.05,
  'America/Anchorage': 61.22,
  'America/Juneau': 58.30,
  'America/Fairbanks': 64.84,
  'America/Honolulu': 21.31,
  'America/Toronto': 43.65,
  'America/Montreal': 45.50,
  'America/Vancouver': 49.28,
  'America/Edmonton': 53.55,
  'America/Winnipeg': 49.90,
  'America/Halifax': 44.65,
  'America/St_Johns': 47.56,
  'America/Mexico_City': 19.43,
  'America/Cancun': 21.16,
  'America/Monterrey': 25.69,
  'America/Tijuana': 32.53,
  'America/Bogota': 4.71,
  'America/Lima': -12.04,
  'America/Santiago': -33.45,
  'America/Buenos_Aires': -34.60,
  'America/Sao_Paulo': -23.55,
  'America/Caracas': 10.48,

  // Europe
  'Europe/London': 51.51,
  'Europe/Dublin': 53.35,
  'Europe/Lisbon': 38.72,
  'Europe/Paris': 48.86,
  'Europe/Brussels': 50.85,
  'Europe/Amsterdam': 52.37,
  'Europe/Berlin': 52.52,
  'Europe/Prague': 50.08,
  'Europe/Vienna': 48.21,
  'Europe/Rome': 41.90,
  'Europe/Madrid': 40.42,
  'Europe/Zurich': 47.37,
  'Europe/Stockholm': 59.33,
  'Europe/Oslo': 59.91,
  'Europe/Copenhagen': 55.68,
  'Europe/Helsinki': 60.17,
  'Europe/Warsaw': 52.23,
  'Europe/Athens': 37.98,
  'Europe/Bucharest': 44.43,
  'Europe/Kiev': 50.45,
  'Europe/Kyiv': 50.45,
  'Europe/Moscow': 55.75,
  'Europe/Istanbul': 41.01,

  // Asia
  'Asia/Tokyo': 35.68,
  'Asia/Seoul': 37.57,
  'Asia/Shanghai': 31.23,
  'Asia/Chongqing': 29.56,
  'Asia/Hong_Kong': 22.32,
  'Asia/Taipei': 25.03,
  'Asia/Singapore': 1.35,
  'Asia/Bangkok': 13.75,
  'Asia/Jakarta': -6.21,
  'Asia/Manila': 14.60,
  'Asia/Kuala_Lumpur': 3.14,
  'Asia/Ho_Chi_Minh': 10.82,
  'Asia/Kolkata': 22.57,
  'Asia/Calcutta': 22.57,
  'Asia/Dhaka': 23.81,
  'Asia/Karachi': 24.86,
  'Asia/Tashkent': 41.30,
  'Asia/Dubai': 25.20,
  'Asia/Riyadh': 24.71,
  'Asia/Jerusalem': 31.77,
  'Asia/Beirut': 33.89,

  // Australia & Pacific
  'Australia/Sydney': -33.87,
  'Australia/Melbourne': -37.81,
  'Australia/Brisbane': -27.47,
  'Australia/Adelaide': -34.93,
  'Australia/Perth': -31.95,
  'Australia/Darwin': -12.46,
  'Australia/Hobart': -42.88,
  'Pacific/Auckland': -36.85,
  'Pacific/Fiji': -18.14,
  'Pacific/Honolulu': 21.31,

  // Africa & Other
  'Africa/Cairo': 30.04,
  'Africa/Johannesburg': -26.20,
  'Africa/Lagos': 6.52,
  'Africa/Nairobi': -1.29,
  'Africa/Casablanca': 33.57,
  'UTC': 40.0,
  'GMT': 40.0,
};

export interface DerivedLocation {
  timezone: string;
  latitude: number;
  longitude: number;
}

export function getDerivedLocation(): DerivedLocation {
  let timezone = 'America/New_York';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  } catch (err) {
    timezone = 'America/New_York';
  }

  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60;
  const longitude = offsetHours * 15;

  const latitude = TIMEZONE_LATITUDE_MAP[timezone] ?? 40.0;

  return { timezone, latitude, longitude };
}

export interface SolarPosition {
  elevation: number;
  phase: 'rising' | 'falling';
}

export function calculateSolarPosition(date: Date, latitude: number, longitude: number): SolarPosition {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Fractional year in radians
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);

  // Equation of time in minutes
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Solar time in minutes
  const timeOffset = eqtime + 4 * longitude;
  const utcMinutes = utcHours * 60;
  let solarTimeMinutes = utcMinutes + timeOffset;

  solarTimeMinutes = ((solarTimeMinutes % 1440) + 1440) % 1440;

  // Hour angle in degrees (0 at 12:00 PM solar time = 720 minutes)
  const haDeg = (solarTimeMinutes - 720) / 4;
  const haRad = (haDeg * Math.PI) / 180;

  const latRad = (latitude * Math.PI) / 180;

  // Solar elevation
  const sinElevation = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
  const clampedSin = Math.max(-1, Math.min(1, sinElevation));
  const elevationDeg = (Math.asin(clampedSin) * 180) / Math.PI;

  const phase: 'rising' | 'falling' = haDeg < 0 ? 'rising' : 'falling';

  return {
    elevation: elevationDeg,
    phase,
  };
}

export interface FrameSelectionResult {
  lowerFrame: WallpaperFrame;
  upperFrame: WallpaperFrame;
  blend: number;
  nextFrameInTravel?: WallpaperFrame;
}

export function selectWallpaperFrames(
  frames: WallpaperFrame[],
  elevation: number,
  phase: 'rising' | 'falling'
): FrameSelectionResult {
  if (!frames || frames.length === 0) {
    const fallback: WallpaperFrame = {
      id: 'default',
      label: 'Default',
      elevation: 0,
      phase: 'any',
      url: '',
    };
    return { lowerFrame: fallback, upperFrame: fallback, blend: 0 };
  }

  // 1. Filter wallpaperFrames to entries whose phase matches current phase or is "any"
  const matchingFrames = frames.filter((f) => f.phase === phase || f.phase === 'any');

  // 2. Sort ascending by elevation
  const sorted = [...matchingFrames].sort((a, b) => a.elevation - b.elevation);

  if (sorted.length === 0) {
    return { lowerFrame: frames[0], upperFrame: frames[0], blend: 0 };
  }

  if (sorted.length === 1) {
    return { lowerFrame: sorted[0], upperFrame: sorted[0], blend: 0 };
  }

  const minFrame = sorted[0];
  const maxFrame = sorted[sorted.length - 1];

  // 5. If current elevation is below lowest or above highest available frame, render extreme frame at full opacity
  if (elevation <= minFrame.elevation) {
    const nextFrame = phase === 'rising' ? sorted[1] : undefined;
    return {
      lowerFrame: minFrame,
      upperFrame: minFrame,
      blend: 0,
      nextFrameInTravel: nextFrame,
    };
  }

  if (elevation >= maxFrame.elevation) {
    const nextFrame = phase === 'falling' ? sorted[sorted.length - 2] : undefined;
    return {
      lowerFrame: maxFrame,
      upperFrame: maxFrame,
      blend: 1,
      nextFrameInTravel: nextFrame,
    };
  }

  // 3. Find the two frames bracketing current elevation
  let lowerIdx = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].elevation <= elevation && elevation <= sorted[i + 1].elevation) {
      lowerIdx = i;
      break;
    }
  }

  const lowerFrame = sorted[lowerIdx];
  const upperFrame = sorted[lowerIdx + 1];

  // 4. Blend is normalized position of current elevation between those two, 0 to 1
  const span = upperFrame.elevation - lowerFrame.elevation;
  const blend = span > 0 ? (elevation - lowerFrame.elevation) / span : 0;

  let nextFrameInTravel: WallpaperFrame | undefined;
  if (phase === 'rising') {
    if (lowerIdx + 2 < sorted.length) {
      nextFrameInTravel = sorted[lowerIdx + 2];
    }
  } else {
    if (lowerIdx - 1 >= 0) {
      nextFrameInTravel = sorted[lowerIdx - 1];
    }
  }

  return {
    lowerFrame,
    upperFrame,
    blend: Math.max(0, Math.min(1, blend)),
    nextFrameInTravel,
  };
}
