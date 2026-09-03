import assert from "node:assert/strict";
import test from "node:test";

import { clamp, filterCalendarCrops, findCultureProfile, getGroupBounds, getGroupMemberIds, getSpacingOverlapIds, monthRange, normalizeBeds, normalizeCrops, normalizeGroups, normalizeRating, snapPositionToGrid, snapPositionToGroupGrid, splitPathCells } from "../app/lib/garden-utils.js";
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

test("groups retain valid unique members and use their own grid", () => {
  const plantings = [{ id: "a", cropId: "tomate", x: 10, y: 10 }, { id: "b", cropId: "salat", x: 30, y: 30 }];
  const [group] = normalizeGroups([{ id: "g", plantingIds: ["a", "b", "missing"], gridSizeCm: 25 }], plantings);
  assert.deepEqual(group.members, [{ type: "planting", id: "a" }, { type: "planting", id: "b" }]);
  assert.deepEqual(getGroupMemberIds(group, "planting"), ["a", "b"]);
  assert.deepEqual(snapPositionToGroupGrid({ x: 24, y: 26 }, group, { length: 2, width: 1 }, 25), { x: 22.5, y: 35 });
  assert.deepEqual(
    getGroupBounds(group, plantings, [], [{ id: "tomate", spacing: 40 }, { id: "salat", spacing: 20 }], { length: 2, width: 1 }),
    { left: 0, top: 0, right: 35, bottom: 40, width: 35, height: 40 },
  );
});

test("path cells form separate four-directional path elements", () => {
  let nextId = 0;
  const paths = splitPathCells([
    { column: 0, row: 0 },
    { column: 1, row: 0 },
    { column: 3, row: 2 },
  ], 20, { length: 1, width: 1 }, () => `weg-${++nextId}`);
  assert.equal(paths.length, 2);
  assert.deepEqual(paths[0].cells, [{ column: 0, row: 0 }, { column: 1, row: 0 }]);
  assert.deepEqual(paths[1].cells, [{ column: 0, row: 0 }]);
});

test("groups can contain plants and paths", () => {
  const plantings = [{ id: "pflanze", cropId: "tomate", x: 50, y: 50 }];
  const paths = [{ id: "weg", cellSizeCm: 20, originX: 0, originY: 0, cells: [{ column: 0, row: 0 }] }];
  const [group] = normalizeGroups([{ id: "gruppe", members: [{ type: "planting", id: "pflanze" }, { type: "path", id: "weg" }] }], plantings, paths);
  assert.deepEqual(group.members, [{ type: "planting", id: "pflanze" }, { type: "path", id: "weg" }]);
});

test("spacing overlaps are reported only between moving and stationary plants", () => {
  const crops = [{ id: "tomate", spacing: 40 }];
  const bed = { length: 2, width: 1 };
  const plantings = [
    { id: "a", cropId: "tomate", x: 20, y: 50 },
    { id: "b", cropId: "tomate", x: 35, y: 50 },
    { id: "c", cropId: "tomate", x: 90, y: 50 },
  ];
  assert.deepEqual(getSpacingOverlapIds(plantings, crops, bed, ["a"]), ["a", "b"]);
  assert.deepEqual(getSpacingOverlapIds(plantings, crops, bed, ["a", "b"]), []);
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
  values.set(STORAGE_KEY, JSON.stringify({
    beds: [{ id: "alt", width: 1, length: 2, plantings: [] }],
    crops: [{ id: "tomate" }],
    showSpacing: false,
    showGrid: true,
    gridSizeCm: 25,
  }));
  assert.deepEqual(
    Object.fromEntries(Object.entries(loadGarden(storage).beds[0]).filter(([key]) => ["showSpacing", "showGrid", "gridSizeCm"].includes(key))),
    { showSpacing: false, showGrid: true, gridSizeCm: 25 },
  );
  saveGarden(storage, { beds: [{ id: "beet-1", showSpacing: false, showGrid: true, gridSizeCm: 25 }], crops: [], spacingTransparency: 100, activeTab: "kalender" });
  assert.deepEqual(JSON.parse(values.get(STORAGE_KEY)), {
    beds: [{ id: "beet-1", showSpacing: false, showGrid: true, gridSizeCm: 25 }],
    crops: [],
    spacingTransparency: 100,
  });
});
