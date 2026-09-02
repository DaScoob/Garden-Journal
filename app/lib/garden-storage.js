import { DEFAULT_CROPS } from "./garden-data.js";
import { normalizeBeds } from "./garden-utils.js";

export const STORAGE_KEY = "gemuesegarten-v1";

export function createInitialGarden() {
  return { beds: [], crops: DEFAULT_CROPS, activeTab: "beete", showSpacing: true, showGrid: false, gridSizeCm: 20 };
}

export function loadGarden(storage = globalThis.localStorage) {
  if (!storage) return createInitialGarden();

  try {
    const rawGarden = storage.getItem(STORAGE_KEY);
    if (!rawGarden) return createInitialGarden();

    const parsedGarden = JSON.parse(rawGarden);
    return {
      beds: Array.isArray(parsedGarden.beds) ? normalizeBeds(parsedGarden.beds) : [],
      crops: Array.isArray(parsedGarden.crops) && parsedGarden.crops.length ? parsedGarden.crops : DEFAULT_CROPS,
      activeTab: "beete",
      showSpacing: parsedGarden.showSpacing !== false,
      showGrid: parsedGarden.showGrid === true,
      gridSizeCm: Math.min(100, Math.max(5, Number(parsedGarden.gridSizeCm) || 20)),
    };
  } catch {
    return createInitialGarden();
  }
}

export function saveGarden(storage, garden) {
  storage.setItem(STORAGE_KEY, JSON.stringify({
    beds: garden.beds,
    crops: garden.crops,
    showSpacing: garden.showSpacing,
    showGrid: garden.showGrid,
    gridSizeCm: garden.gridSizeCm,
  }));
}
