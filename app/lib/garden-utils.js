import { CULTURE_PROFILES } from "./garden-data.js";

export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeRating(value) {
  return clamp(Math.round(Number(value) || 1), 1, 3);
}

export function normalizeCrops(crops) {
  return crops.map((crop) => ({ ...crop, rating: normalizeRating(crop.rating) }));
}

function snapCoordinate(percent, axisLengthCm, gridSizeCm) {
  const positionCm = (clamp(percent) / 100) * axisLengthCm;
  const snappedCm = Math.round(positionCm / gridSizeCm) * gridSizeCm;
  return (clamp(snappedCm, 0, axisLengthCm) / axisLengthCm) * 100;
}

export function snapPositionToGrid(position, bed, gridSizeCm) {
  const lengthCm = Number(bed.length) * 100;
  const widthCm = Number(bed.width) * 100;
  const safeGridSize = Math.max(1, Number(gridSizeCm) || 1);

  if (lengthCm <= 0 || widthCm <= 0) {
    return { x: clamp(position.x), y: clamp(position.y) };
  }

  return {
    x: snapCoordinate(position.x, lengthCm, safeGridSize),
    y: snapCoordinate(position.y, widthCm, safeGridSize),
  };
}

export function monthRange(start, end) {
  if (!start || !end) return [];
  if (start <= end) return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  return [
    ...Array.from({ length: 13 - start }, (_, index) => start + index),
    ...Array.from({ length: end }, (_, index) => index + 1),
  ];
}

export function filterCalendarCrops(crops, beds, filter, currentMonth, bedId = "all") {
  if (filter === "sow") {
    return crops.filter((crop) => monthRange(crop.sowStart, crop.sowEnd).includes(currentMonth));
  }

  if (filter !== "planted") return crops;

  const relevantBeds = bedId === "all" ? beds : beds.filter((bed) => bed.id === bedId);
  const plantedCropIds = new Set(
    relevantBeds.flatMap((bed) => (bed.plantings ?? []).map((planting) => planting.cropId)),
  );

  return crops.filter((crop) => plantedCropIds.has(crop.id));
}

export function normalizeCultureName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u")
    .replace(/[^a-z0-9]/g, "");
}

export function findCultureProfile(value) {
  const normalizedName = normalizeCultureName(value.trim());
  if (!normalizedName) return null;

  return CULTURE_PROFILES.find((profile) =>
    [profile.name, ...profile.aliases].some(
      (candidate) => normalizeCultureName(candidate) === normalizedName,
    ),
  ) ?? null;
}

export function normalizeBeds(beds, idFactory = createId) {
  return beds.map((bed) => {
    const plantings = [];

    for (const planting of bed.plantings ?? []) {
      const isPositioned = Number.isFinite(Number(planting.x)) && Number.isFinite(Number(planting.y));
      const count = isPositioned ? 1 : Math.max(1, Number(planting.count) || 1);

      for (let index = 0; index < count; index += 1) {
        const positionIndex = plantings.length;
        plantings.push({
          id: index === 0 && planting.id ? planting.id : idFactory("pflanze"),
          cropId: planting.cropId,
          date: planting.date || new Date().toISOString().slice(0, 10),
          x: isPositioned ? clamp(Number(planting.x)) : 14 + (positionIndex % 6) * 14,
          y: isPositioned ? clamp(Number(planting.y)) : 18 + (Math.floor(positionIndex / 6) % 4) * 21,
        });
      }
    }

    return { ...bed, plantings };
  });
}
