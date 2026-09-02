import assert from "node:assert/strict";
import test from "node:test";

import { clamp, findCultureProfile, monthRange, normalizeBeds } from "../app/lib/garden-utils.js";
import { loadGarden, saveGarden, STORAGE_KEY } from "../app/lib/garden-storage.js";

test("monthRange returns a range within one year", () => {
  assert.deepEqual(monthRange(3, 6), [3, 4, 5, 6]);
});

test("monthRange handles ranges across the year boundary", () => {
  assert.deepEqual(monthRange(10, 2), [10, 11, 12, 1, 2]);
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
  saveGarden(storage, { beds: [{ id: "beet-1" }], crops: [], showSpacing: false, activeTab: "kalender" });
  assert.deepEqual(JSON.parse(values.get(STORAGE_KEY)), {
    beds: [{ id: "beet-1" }],
    crops: [],
    showSpacing: false,
  });
});
