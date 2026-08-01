export interface WallpaperFrame {
  id: string;
  label: string;
  time: string; // HH:MM 24-hour
  url: string;
}

export interface FrameSelectionResult {
  lowerFrame: WallpaperFrame;
  upperFrame: WallpaperFrame;
  blend: number;
  nextFrameInTravel: WallpaperFrame;
}

export function parseFrameTimeMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return Math.max(0, Math.min(23, hours)) * 60 + Math.max(0, Math.min(59, minutes));
}

export function selectWallpaperFramesByTime(
  frames: WallpaperFrame[],
  date: Date
): FrameSelectionResult {
  if (!frames || frames.length === 0) {
    const emptyFrame: WallpaperFrame = { id: 'default', label: 'Default', time: '00:00', url: '' };
    return { lowerFrame: emptyFrame, upperFrame: emptyFrame, blend: 0, nextFrameInTravel: emptyFrame };
  }

  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  const parsedFrames = frames.map((f) => ({
    frame: f,
    minutes: parseFrameTimeMinutes(f.time),
  }));

  parsedFrames.sort((a, b) => a.minutes - b.minutes);

  const N = parsedFrames.length;
  const firstMinutes = parsedFrames[0].minutes;
  const lastMinutes = parsedFrames[N - 1].minutes;

  let lowerFrame: WallpaperFrame;
  let upperFrame: WallpaperFrame;
  let nextFrameInTravel: WallpaperFrame;
  let span = 0;
  let elapsed = 0;

  if (currentMinutes >= lastMinutes || currentMinutes < firstMinutes) {
    lowerFrame = parsedFrames[N - 1].frame;
    upperFrame = parsedFrames[0].frame;
    nextFrameInTravel = parsedFrames[1 % N].frame;
    span = (1440 - lastMinutes) + firstMinutes;
    elapsed = currentMinutes >= lastMinutes
      ? currentMinutes - lastMinutes
      : (1440 - lastMinutes) + currentMinutes;
  } else {
    let matchIdx = 0;
    for (let i = 0; i < N - 1; i++) {
      if (parsedFrames[i].minutes <= currentMinutes && currentMinutes < parsedFrames[i + 1].minutes) {
        matchIdx = i;
        break;
      }
    }
    lowerFrame = parsedFrames[matchIdx].frame;
    upperFrame = parsedFrames[matchIdx + 1].frame;
    nextFrameInTravel = parsedFrames[(matchIdx + 2) % N].frame;
    span = parsedFrames[matchIdx + 1].minutes - parsedFrames[matchIdx].minutes;
    elapsed = currentMinutes - parsedFrames[matchIdx].minutes;
  }

  const blend = span > 0 ? Math.max(0, Math.min(1, elapsed / span)) : 0;

  return {
    lowerFrame,
    upperFrame,
    blend,
    nextFrameInTravel,
  };
}
