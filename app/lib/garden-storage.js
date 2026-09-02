import { DEFAULT_CROPS } from "./garden-data.js";
import { normalizeBeds } from "./garden-utils.js";

export const STORAGE_KEY = "gemuesegarten-v1";

export function createInitialGarden() {
  return { beds: [], crops: DEFAULT_CROPS, activeTab: "beete", showSpacing: true };
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
  }));
}
