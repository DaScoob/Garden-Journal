import assert from "node:assert/strict";
import test from "node:test";

import { clamp, filterCalendarCrops, findCultureProfile, monthRange, normalizeBeds, normalizeCrops, normalizeRating, snapPositionToGrid } from "../app/lib/garden-utils.js";
import { loadGarden, saveGarden, STORAGE_KEY } from "../app/lib/garden-storage.js";

test("monthRange returns a range within one year", () => {
  assert.deepEqual(monthRange(3, 6), [3, 4, 5, 6]);
});

test("monthRange handles ranges across the year boundary", () => {
  assert.deepEqual(monthRange(10, 2), [10, 11, 12, 1, 2]);
});

test("filterCalendarCrops filters planted cultures by a selected bed", () => {
  const crops = [
    { id: "tomate", sowStart: 2, sowEnd: 4 },
    { id: "karotte", sowStart: 3, sowEnd: 7 },
    { id: "kohl", sowStart: 5, sowEnd: 6 },
  ];
  const beds = [
    { id: "hochbeet", plantings: [{ cropId: "tomate" }, { cropId: "tomate" }] },
    { id: "sonnenbeet", plantings: [{ cropId: "karotte" }] },
  ];

  assert.deepEqual(filterCalendarCrops(crops, beds, "planted", 3).map((crop) => crop.id), ["tomate", "karotte"]);
  assert.deepEqual(filterCalendarCrops(crops, beds, "planted", 3, "hochbeet").map((crop) => crop.id), ["tomate"]);
  assert.deepEqual(filterCalendarCrops(crops, beds, "sow", 3, "hochbeet").map((crop) => crop.id), ["tomate", "karotte"]);
});

test("findCultureProfile matches aliases without accents", () => {
  assert.equal(findCultureProfile("  moehren ")?.name, "Karotte");
  assert.equal(findCultureProfile("unbekannt"), null);
});

test("clamp limits values to the bed canvas", () => {
  assert.equal(clamp(-2), 0);
  assert.equal(clamp(42), 42);
  assert.equal(clamp(102), 100);
});

test("culture ratings are normalized to one through three stars", () => {
  assert.equal(normalizeRating(0), 1);
  assert.equal(normalizeRating(2.4), 2);
  assert.equal(normalizeRating(7), 3);
  assert.deepEqual(normalizeCrops([{ id: "tomate" }]), [{ id: "tomate", rating: 1 }]);
});

test("snapPositionToGrid uses physically square centimeter cells", () => {
  assert.deepEqual(
    snapPositionToGrid({ x: 47, y: 48 }, { length: 3, width: 1.2 }, 20),
    { x: 46.666666666666664, y: 50 },
  );
});

test("normalizeBeds expands legacy planting counts", () => {
  let nextId = 0;
  const [bed] = normalizeBeds([
    { id: "beet-1", plantings: [{ id: "alt", cropId: "tomate", count: 2, date: "2026-04-01" }] },
  ], () => `neu-${++nextId}`);

  assert.equal(bed.plantings.length, 2);
  assert.equal(bed.plantings[0].id, "alt");
  assert.equal(bed.plantings[1].id, "neu-1");
});

test("garden storage falls back safely and persists only durable state", () => {
  const values = new Map([[STORAGE_KEY, "invalid json"]]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  assert.deepEqual(loadGarden(storage).beds, []);
  saveGarden(storage, { beds: [{ id: "beet-1" }], crops: [], showSpacing: false, spacingTransparency: 100, showGrid: true, gridSizeCm: 25, activeTab: "kalender" });
  assert.deepEqual(JSON.parse(values.get(STORAGE_KEY)), {
    beds: [{ id: "beet-1" }],
    crops: [],
    showSpacing: false,
    spacingTransparency: 100,
    showGrid: true,
    gridSizeCm: 25,
  });
});
