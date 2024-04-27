import { DEFAULT_STYLES, VIDEOS } from '@/utils/videoGenerator/constants';

/* eslint-disable max-lines */

export const getNormalizedIntervals = (start, end) => {
  const FRAMES = 30;
  const normalizedStart = (start / 1000) * FRAMES;
  const normalizedEnd = (end / 1000) * FRAMES;
  const durationInFrames = normalizedEnd - normalizedStart;

  return {
    start: Math.ceil(normalizedStart),
    durationInFrames: Math.ceil(durationInFrames),
  };
};

export const getBackgroundWithOpacity = (colorObj, newAlpha) => {
  const rgbaRegex = /rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),([0-1](\.\d+)?)\)/g;
  const colorString = colorObj.background;
  const modifiedString = colorString.replace(rgbaRegex, (match, red, green, blue, alpha) => {
    const modifiedAlpha = newAlpha !== undefined ? newAlpha : alpha;
    return `rgba(${red},${green},${blue},${modifiedAlpha})`;
  });

  return { ...colorObj, background: modifiedString };
};

export const getNormalizedTimestamps = (audio) => {
  const result = [];
  for (let i = 0; i < audio.verseTimings.length; i += 1) {
    const currentVerse = audio.verseTimings[i];
    result.push(getNormalizedIntervals(currentVerse.timestampFrom, currentVerse.timestampTo));
  }
  return result;
};

export const getVideoById = (id) => {
  const videoObj = VIDEOS[id];
  if (!videoObj) {
    return null;
  }
  return videoObj;
};

export const getVideosArray = () => {
  const flattenObject = (obj) => {
    const result = [];

    Object.entries(obj).forEach(([key, value]) => {
      result.push({ ...(value as any), id: parseInt(key, 10) });
    });

    return result;
  };

  return flattenObject(VIDEOS);
};

export const getBackgroundWithOpacityById = (id, opacity) => {
  const colors = getAllBackgrounds(opacity);
  return colors.find((c) => c.id === id);
};

export const getAllBackgrounds = (alpha = '0.8') => {
  return [
    {
      id: 1,
      background: `linear-gradient(0deg, rgba(229,227,255,${alpha}) 0%, rgba(230,246,235,${alpha}) 50%, rgba(215,249,255,${alpha}) 100%)`,
    },
    {
      id: 2,
      background: `linear-gradient(0deg, rgba(244,255,227,${alpha}) 0%, rgba(255,229,215,${alpha}) 100%)`,
    },
    {
      id: 3,
      background: `linear-gradient(330deg, rgba(202,166,255,${alpha}) 0%, rgba(152,255,148,${alpha}) 100%)`,
    },
    {
      id: 4,
      background: `linear-gradient(to bottom,rgba(219, 225, 111, ${alpha}), rgba(248, 119, 40, ${alpha}))`,
    },
    {
      id: 5,
      background: `linear-gradient(to bottom,rgba(157, 106, 32, ${alpha}),rgba(68, 155, 169, ${alpha}))`,
    },
    {
      id: 6,
      background: `linear-gradient(to bottom,rgba(144, 240, 134, ${alpha}),rgba(232, 60, 194, ${alpha}))`,
    },
    {
      id: 7,
      background: `linear-gradient(to top,rgba(111, 62, 26, ${alpha}),rgba(6, 81, 104, ${alpha}))`,
    },
    {
      id: 8,
      background: `linear-gradient(to top,rgba(103, 243, 206, ${alpha}),rgba(16, 125, 64, ${alpha}))`,
    },
  ];
};

export const getStyles = (dimensions) => {
  return {
    ...DEFAULT_STYLES,
    minWidth: dimensions === 'landscape' ? '60%' : '80%',
    minHeight: dimensions === 'landscape' ? '50%' : '25%',
  };
};

export const stls = getStyles('landscape');

export const validateVerseRange = (from = 1, to, versesCount) => {
  const verseTo = to || versesCount;
  return from <= verseTo && from <= versesCount && verseTo <= versesCount;
};

export const getTrimmedAudio = (audio, from, to) => {
  if (!from?.trim?.() && !to?.trim?.()) {
    return audio;
  }

  const verseFrom = parseInt(from, 10);
  const verseTo = parseInt(to || audio.verseTimings.length, 10); // user provided value or end of surah

  const isRangeValid = validateVerseRange(from, to, audio.verseTimings.length);

  if (!isRangeValid) {
    return audio;
  }

  // when we modify full audio to get specific ranges, 'from' ayah
  // e.g. 255 from full verses array becomes the 0 index in the new
  // array. Similarly, to becomes how many more verses we want after.
  const actualFrom = verseFrom <= 1 ? 1 : verseFrom;
  const actualTo = verseTo - verseFrom;

  const removedAudio = audio.verseTimings.slice(0, actualFrom - 1);
  const removedDuration = removedAudio.reduce(
    (acc, obj) => acc + (obj.duration >= 0 ? obj.duration : -1 * obj.duration),
    0,
  );

  const res = audio;
  res.verseTimings = res.verseTimings.slice(actualFrom - 1);
  if (to) {
    res.verseTimings = res.verseTimings.slice(0, actualTo + 1);
  }
  res.duration = res.verseTimings.reduce(
    (acc, obj) => acc + (obj.duration >= 0 ? obj.duration : -1 * obj.duration),
    0,
  );
  res.verseTimings = res.verseTimings.map((timing) => {
    return {
      ...timing,
      normalizedStart: timing.timestampFrom,
      normalizedEnd: timing.timestampTo,
      timestampFrom: timing.timestampFrom - removedDuration,
      timestampTo: timing.timestampTo - removedDuration,
    };
  });

  return res;
};