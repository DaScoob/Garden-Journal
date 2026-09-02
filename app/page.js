"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const MONTHS_LONG = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const DEFAULT_CROPS = [
  { id: "tomate", name: "Tomate", icon: "T", color: "#e45d43", sowStart: 2, sowEnd: 4, harvestStart: 7, harvestEnd: 10, spacing: 50, note: "Warm vorziehen, nach den Eisheiligen auspflanzen." },
  { id: "karotte", name: "Karotte", icon: "K", color: "#ef8c32", sowStart: 3, sowEnd: 7, harvestStart: 6, harvestEnd: 11, spacing: 5, note: "Direktsaat in lockeren, steinarmen Boden." },
  { id: "salat", name: "Pflücksalat", icon: "S", color: "#78a95a", sowStart: 3, sowEnd: 8, harvestStart: 5, harvestEnd: 10, spacing: 25, note: "Satzweise säen für eine lange Ernte." },
  { id: "bohne", name: "Buschbohne", icon: "B", color: "#4e8c5b", sowStart: 5, sowEnd: 7, harvestStart: 7, harvestEnd: 10, spacing: 10, note: "Erst in ausreichend erwärmten Boden säen." },
  { id: "zucchini", name: "Zucchini", icon: "Z", color: "#86a638", sowStart: 4, sowEnd: 5, harvestStart: 7, harvestEnd: 10, spacing: 100, note: "Benötigt viel Platz und regelmäßige Ernte." },
  { id: "knoblauch", name: "Knoblauch", icon: "Kn", color: "#8f7b9b", sowStart: 9, sowEnd: 11, harvestStart: 6, harvestEnd: 8, spacing: 12, note: "Herbststeckung ist für kräftige Knollen geeignet." },
  { id: "gruenkohl", name: "Grünkohl", icon: "G", color: "#356f4a", sowStart: 5, sowEnd: 7, harvestStart: 10, harvestEnd: 2, spacing: 50, note: "Winterhart; Ernte nach Bedarf bis ins Frühjahr." },
  { id: "radieschen", name: "Radieschen", icon: "R", color: "#c94d73", sowStart: 3, sowEnd: 9, harvestStart: 4, harvestEnd: 10, spacing: 5, note: "Kurze Kulturzeit, gut als Vor- und Nachkultur." },
];

const cultureProfile = (name, aliases, outdoor, greenhouse, spacing, color) => ({
  name,
  aliases,
  outdoor: { sowStart: outdoor[0], sowEnd: outdoor[1], harvestStart: outdoor[2], harvestEnd: outdoor[3] },
  greenhouse: { sowStart: greenhouse[0], sowEnd: greenhouse[1], harvestStart: greenhouse[2], harvestEnd: greenhouse[3] },
  spacing,
  color,
});

const CULTURE_PROFILES = [
  cultureProfile("Artischocke", ["Artischocken"], [2, 4, 8, 10], [1, 3, 6, 11], 90, "#65866a"),
  cultureProfile("Aubergine", ["Eierfrucht"], [1, 3, 7, 10], [1, 2, 5, 11], 60, "#765777"),
  cultureProfile("Blumenkohl", [], [2, 6, 6, 10], [1, 7, 5, 11], 50, "#9a9f78"),
  cultureProfile("Brokkoli", ["Broccoli"], [2, 7, 6, 10], [1, 7, 5, 11], 50, "#3f7650"),
  cultureProfile("Buschbohne", ["Buschbohnen", "Bohne", "Bohnen"], [5, 7, 7, 10], [4, 7, 6, 11], 10, "#4e8c5b"),
  cultureProfile("Chili", ["Chilischote", "Peperoni"], [1, 3, 7, 10], [1, 2, 5, 11], 45, "#c8493f"),
  cultureProfile("Erbse", ["Erbsen", "Markerbse", "Zuckererbse"], [3, 6, 5, 8], [2, 5, 4, 8], 5, "#6d9b52"),
  cultureProfile("Feldsalat", ["Rapunzel"], [7, 9, 9, 3], [8, 11, 10, 4], 10, "#4f7955"),
  cultureProfile("Fenchel", ["Knollenfenchel"], [4, 7, 7, 10], [3, 8, 6, 11], 30, "#79a37c"),
  cultureProfile("Grünkohl", ["Braunkohl"], [5, 7, 10, 2], [4, 7, 9, 3], 50, "#356f4a"),
  cultureProfile("Gurke", ["Gurken", "Salatgurke", "Einlegegurke"], [4, 6, 7, 9], [3, 5, 5, 10], 40, "#5d9252"),
  cultureProfile("Karotte", ["Karotten", "Möhre", "Möhren"], [3, 7, 6, 11], [2, 8, 5, 12], 5, "#ef8c32"),
  cultureProfile("Kartoffel", ["Kartoffeln"], [3, 5, 6, 10], [2, 4, 5, 9], 35, "#a58a57"),
  cultureProfile("Knoblauch", [], [9, 11, 6, 8], [9, 11, 5, 7], 12, "#8f7b9b"),
  cultureProfile("Kohlrabi", [], [2, 7, 5, 10], [1, 9, 3, 12], 25, "#75916f"),
  cultureProfile("Kopfsalat", ["Salat", "Eissalat"], [2, 7, 5, 10], [1, 9, 3, 11], 30, "#78a95a"),
  cultureProfile("Kürbis", ["Kuerbis", "Speisekürbis", "Hokkaido"], [4, 5, 8, 10], [3, 4, 7, 10], 120, "#d77f37"),
  cultureProfile("Lauch", ["Porree"], [1, 5, 7, 3], [1, 4, 6, 3], 15, "#4f8063"),
  cultureProfile("Mais", ["Zuckermais"], [4, 5, 8, 10], [3, 4, 7, 10], 25, "#c9a947"),
  cultureProfile("Mangold", ["Stielmangold"], [4, 7, 6, 11], [2, 8, 5, 12], 30, "#b24757"),
  cultureProfile("Pak Choi", ["Pakchoi", "Senfkohl"], [7, 9, 9, 11], [2, 10, 4, 12], 25, "#5d8759"),
  cultureProfile("Paprika", ["Gemüsepaprika"], [1, 3, 7, 10], [1, 2, 5, 11], 45, "#d75a3b"),
  cultureProfile("Pastinake", ["Pastinaken"], [3, 5, 9, 2], [2, 4, 8, 2], 10, "#b7a675"),
  cultureProfile("Pflücksalat", ["Pfluecksalat", "Schnittsalat"], [3, 8, 5, 10], [1, 10, 3, 12], 25, "#78a95a"),
  cultureProfile("Radieschen", ["Radies"], [3, 9, 4, 10], [1, 11, 2, 12], 5, "#c94d73"),
  cultureProfile("Rosenkohl", [], [2, 4, 9, 2], [1, 3, 8, 2], 50, "#50764e"),
  cultureProfile("Rote Bete", ["Rote Beete", "Randen"], [4, 7, 7, 11], [3, 7, 6, 12], 10, "#9a3e55"),
  cultureProfile("Rucola", ["Rauke"], [3, 9, 4, 11], [1, 11, 2, 12], 10, "#648b4d"),
  cultureProfile("Sellerie", ["Knollensellerie", "Staudensellerie"], [2, 3, 8, 10], [1, 3, 7, 11], 40, "#7f9665"),
  cultureProfile("Spinat", [], [2, 4, 4, 6], [1, 4, 3, 6], 10, "#3f7951"),
  cultureProfile("Stangenbohne", ["Stangenbohnen"], [5, 7, 7, 10], [4, 7, 6, 11], 15, "#477c54"),
  cultureProfile("Süßkartoffel", ["Suesskartoffel", "Batate"], [2, 4, 9, 10], [1, 3, 8, 11], 35, "#b86e48"),
  cultureProfile("Tomate", ["Tomaten"], [2, 4, 7, 10], [1, 3, 5, 11], 50, "#e45d43"),
  cultureProfile("Topinambur", [], [3, 4, 10, 2], [2, 4, 9, 2], 40, "#b58a46"),
  cultureProfile("Weißkohl", ["Weisskohl", "Kappes"], [2, 5, 7, 11], [1, 4, 5, 11], 50, "#779176"),
  cultureProfile("Zucchini", [], [4, 5, 6, 10], [3, 4, 5, 11], 100, "#86a638"),
  cultureProfile("Zwiebel", ["Zwiebeln", "Speisezwiebel"], [2, 4, 8, 9], [1, 3, 6, 9], 10, "#b2965b"),
];

function normalizeCultureName(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findCultureProfile(value) {
  const normalized = normalizeCultureName(value.trim());
  if (!normalized) return null;
  return CULTURE_PROFILES.find((profile) => [profile.name, ...profile.aliases].some((name) => normalizeCultureName(name) === normalized)) || null;
}

const EMPTY_BED = { name: "", width: 1.2, length: 3 };
const EMPTY_CROP = { name: "", icon: "", color: "#56845f", growingProfile: "outdoor", sowStart: 3, sowEnd: 5, harvestStart: 6, harvestEnd: 9, spacing: 30, note: "" };

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function normalizeBeds(beds) {
  return beds.map((bed) => {
    const plantings = [];
    (bed.plantings || []).forEach((planting) => {
      const alreadyPositioned = Number.isFinite(Number(planting.x)) && Number.isFinite(Number(planting.y));
      const count = alreadyPositioned ? 1 : Math.max(1, Number(planting.count) || 1);

      for (let index = 0; index < count; index += 1) {
        const positionIndex = plantings.length;
        plantings.push({
          id: index === 0 && planting.id ? planting.id : uid("pflanze"),
          cropId: planting.cropId,
          date: planting.date || new Date().toISOString().slice(0, 10),
          x: alreadyPositioned ? clamp(Number(planting.x)) : 14 + (positionIndex % 6) * 14,
          y: alreadyPositioned ? clamp(Number(planting.y)) : 18 + (Math.floor(positionIndex / 6) % 4) * 21,
        });
      }
    });
    return { ...bed, plantings };
  });
}

function monthRange(start, end) {
  if (!start || !end) return [];
  if (start <= end) return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return [...Array.from({ length: 13 - start }, (_, i) => start + i), ...Array.from({ length: end }, (_, i) => i + 1)];
}

function loadGarden() {
  if (typeof window === "undefined") return { beds: [], crops: DEFAULT_CROPS, activeTab: "beete", showSpacing: true };
  try {
    const raw = window.localStorage.getItem("gemuesegarten-v1");
    if (!raw) return { beds: [], crops: DEFAULT_CROPS, activeTab: "beete", showSpacing: true };
    const parsed = JSON.parse(raw);
    return {
      beds: Array.isArray(parsed.beds) ? normalizeBeds(parsed.beds) : [],
      crops: Array.isArray(parsed.crops) && parsed.crops.length ? parsed.crops : DEFAULT_CROPS,
      activeTab: "beete",
      showSpacing: parsed.showSpacing !== false,
    };
  } catch {
    return { beds: [], crops: DEFAULT_CROPS, activeTab: "beete", showSpacing: true };
  }
}

export default function GardenApp() {
  const [state, setState] = useState({ beds: [], crops: DEFAULT_CROPS, activeTab: "beete", showSpacing: true });
  const [ready, setReady] = useState(false);
  const [bedDraft, setBedDraft] = useState(EMPTY_BED);
  const [cropDraft, setCropDraft] = useState(EMPTY_CROP);
  const [phaseStatus, setPhaseStatus] = useState({ type: "idle" });
  const [editingCrop, setEditingCrop] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [cropSearch, setCropSearch] = useState("");
  const [calendarFilter, setCalendarFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const importRef = useRef(null);
  const movingPlantRef = useRef(null);

  useEffect(() => {
    setState(loadGarden());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("gemuesegarten-v1", JSON.stringify({ beds: state.beds, crops: state.crops, showSpacing: state.showSpacing }));
  }, [state.beds, state.crops, state.showSpacing, ready]);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const plantedCount = state.beds.reduce((sum, bed) => sum + (bed.plantings?.length || 0), 0);
  const plantedCropIds = new Set(state.beds.flatMap((bed) => (bed.plantings || []).map((p) => p.cropId)));
  const currentMonth = new Date().getMonth() + 1;
  const harvestNow = state.crops.filter((crop) => plantedCropIds.has(crop.id) && monthRange(crop.harvestStart, crop.harvestEnd).includes(currentMonth));

  const filteredCrops = useMemo(() => {
    const q = cropSearch.trim().toLowerCase();
    return q ? state.crops.filter((crop) => `${crop.name} ${crop.note}`.toLowerCase().includes(q)) : state.crops;
  }, [state.crops, cropSearch]);

  const calendarCrops = useMemo(() => {
    if (calendarFilter === "planted") return state.crops.filter((crop) => plantedCropIds.has(crop.id));
    if (calendarFilter === "sow") return state.crops.filter((crop) => monthRange(crop.sowStart, crop.sowEnd).includes(currentMonth));
    return state.crops;
  }, [state.crops, state.beds, calendarFilter]);

  const addBed = (event) => {
    event.preventDefault();
    if (!bedDraft.name.trim()) return flash("Ein Beetname fehlt.");
    setState((prev) => ({
      ...prev,
      beds: [...prev.beds, { id: uid("beet"), name: bedDraft.name.trim(), width: Number(bedDraft.width), length: Number(bedDraft.length), plantings: [] }],
    }));
    setBedDraft(EMPTY_BED);
    flash("Beet angelegt.");
  };

  const deleteBed = (bedId) => {
    setState((prev) => ({ ...prev, beds: prev.beds.filter((bed) => bed.id !== bedId) }));
    setSelectedPlant((current) => current?.bedId === bedId ? null : current);
    flash("Beet entfernt.");
  };

  const addPlantAt = (bedId, cropId, position) => {
    const bed = state.beds.find((item) => item.id === bedId);
    const crop = state.crops.find((item) => item.id === cropId);
    if (!bed || !crop) return;
    const nextIndex = (bed.plantings || []).length;
    const planting = {
      id: uid("pflanze"),
      cropId,
      date: new Date().toISOString().slice(0, 10),
      x: clamp(position?.x ?? 16 + (nextIndex % 5) * 17),
      y: clamp(position?.y ?? 20 + (Math.floor(nextIndex / 5) % 4) * 20),
    };
    setState((prev) => ({
      ...prev,
      beds: prev.beds.map((bed) => bed.id === bedId ? { ...bed, plantings: [...(bed.plantings || []), planting] } : bed),
    }));
    setSelectedPlant({ bedId, plantingId: planting.id });
    flash(`${crop.name} platziert.`);
  };

  const removePlanting = (bedId, plantingId) => {
    setState((prev) => ({
      ...prev,
      beds: prev.beds.map((bed) => bed.id === bedId ? { ...bed, plantings: (bed.plantings || []).filter((item) => item.id !== plantingId) } : bed),
    }));
    setSelectedPlant((current) => current?.plantingId === plantingId ? null : current);
    flash("Pflanze entfernt.");
  };

  const movePlanting = (bedId, plantingId, x, y) => {
    setState((prev) => ({
      ...prev,
      beds: prev.beds.map((bed) => bed.id === bedId ? {
        ...bed,
        plantings: (bed.plantings || []).map((item) => item.id === plantingId ? { ...item, x: clamp(x), y: clamp(y) } : item),
      } : bed),
    }));
  };

  const positionFromPointer = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleBedDrop = (event, bedId) => {
    event.preventDefault();
    const cropId = event.dataTransfer.getData("application/x-garden-crop") || event.dataTransfer.getData("text/plain");
    if (!state.crops.some((crop) => crop.id === cropId)) return;
    addPlantAt(bedId, cropId, positionFromPointer(event, event.currentTarget));
  };

  const beginPlantMove = (event, bedId, plantingId) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    movingPlantRef.current = { bedId, plantingId, moved: false };
    setSelectedPlant({ bedId, plantingId });
  };

  const continuePlantMove = (event, bedId, plantingId) => {
    const moving = movingPlantRef.current;
    if (!moving || moving.bedId !== bedId || moving.plantingId !== plantingId) return;
    const canvas = event.currentTarget.closest(".bed-visual");
    if (!canvas) return;
    const position = positionFromPointer(event, canvas);
    moving.moved = true;
    movePlanting(bedId, plantingId, position.x, position.y);
  };

  const finishPlantMove = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    movingPlantRef.current = null;
  };

  const nudgePlant = (event, bedId, planting) => {
    const amount = event.shiftKey ? 5 : 1;
    const offsets = {
      ArrowLeft: [-amount, 0],
      ArrowRight: [amount, 0],
      ArrowUp: [0, -amount],
      ArrowDown: [0, amount],
    };
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removePlanting(bedId, planting.id);
      return;
    }
    if (!offsets[event.key]) return;
    event.preventDefault();
    movePlanting(bedId, planting.id, Number(planting.x) + offsets[event.key][0], Number(planting.y) + offsets[event.key][1]);
  };

  const applyCultureProfile = (profile, growingProfile, name) => {
    const timing = profile[growingProfile] || profile.outdoor;
    setCropDraft((prev) => ({
      ...prev,
      name: name ?? prev.name,
      growingProfile,
      ...timing,
      spacing: profile.spacing,
      color: profile.color,
      icon: profile.name.slice(0, 2),
    }));
    setPhaseStatus({ type: "auto", profileName: profile.name });
  };

  const handleCropNameChange = (value) => {
    const profile = findCultureProfile(value);
    if (profile) {
      applyCultureProfile(profile, cropDraft.growingProfile || "outdoor", value);
      return;
    }
    setCropDraft((prev) => ({ ...prev, name: value }));
    setPhaseStatus({ type: value.trim().length >= 3 ? "unknown" : "idle" });
  };

  const handleGrowingProfileChange = (growingProfile) => {
    const profile = findCultureProfile(cropDraft.name);
    if (profile) {
      applyCultureProfile(profile, growingProfile);
      return;
    }
    setCropDraft((prev) => ({ ...prev, growingProfile }));
    setPhaseStatus({ type: cropDraft.name.trim() ? "unknown" : "idle" });
  };

  const updateManualPhase = (field, value) => {
    setCropDraft((prev) => ({ ...prev, [field]: value }));
    setPhaseStatus((prev) => ({ ...prev, type: "manual" }));
  };

  const saveCrop = (event) => {
    event.preventDefault();
    if (!cropDraft.name.trim()) return flash("Ein Kulturname fehlt.");
    const crop = {
      ...cropDraft,
      id: editingCrop || uid("kultur"),
      name: cropDraft.name.trim(),
      icon: cropDraft.icon.trim() || cropDraft.name.trim().slice(0, 2),
      sowStart: Number(cropDraft.sowStart),
      sowEnd: Number(cropDraft.sowEnd),
      harvestStart: Number(cropDraft.harvestStart),
      harvestEnd: Number(cropDraft.harvestEnd),
      spacing: Math.max(1, Number(cropDraft.spacing) || 1),
    };
    setState((prev) => ({
      ...prev,
      crops: editingCrop ? prev.crops.map((item) => item.id === editingCrop ? crop : item) : [...prev.crops, crop],
    }));
    setCropDraft(EMPTY_CROP);
    setPhaseStatus({ type: "idle" });
    setEditingCrop(null);
    flash(editingCrop ? "Kultur aktualisiert." : "Kultur angelegt.");
  };

  const beginEditCrop = (crop) => {
    setEditingCrop(crop.id);
    setCropDraft({ ...crop, growingProfile: crop.growingProfile || "outdoor" });
    setPhaseStatus({ type: "existing", profileName: findCultureProfile(crop.name)?.name });
    document.getElementById("kultur-formular")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const deleteCrop = (cropId) => {
    setState((prev) => ({
      ...prev,
      crops: prev.crops.filter((crop) => crop.id !== cropId),
      beds: prev.beds.map((bed) => ({ ...bed, plantings: (bed.plantings || []).filter((item) => item.cropId !== cropId) })),
    }));
    setSelectedPlant(null);
    flash("Kultur und zugehörige Einträge entfernt.");
  };

  const exportGarden = () => {
    const blob = new Blob([JSON.stringify({ beds: state.beds, crops: state.crops, showSpacing: state.showSpacing }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gemuesegarten-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    flash("Sicherung exportiert.");
  };

  const importGarden = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.beds) || !Array.isArray(data.crops)) throw new Error("invalid");
      setState((prev) => ({ ...prev, beds: normalizeBeds(data.beds), crops: data.crops, showSpacing: data.showSpacing !== false }));
      setSelectedPlant(null);
      flash("Sicherung importiert.");
    } catch {
      flash("Diese Datei ist keine gültige Gartensicherung.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><span>✦</span></div>
          <div><p>Gartenjournal</p><h1>Mein Gemüsegarten</h1></div>
        </div>
        <div className="header-actions">
          <button className="button ghost compact" onClick={() => importRef.current?.click()}>Import</button>
          <button className="button secondary compact" onClick={exportGarden}>Sichern</button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={importGarden} />
        </div>
      </header>

      <section className="overview" aria-label="Gartenübersicht">
        <div className="overview-copy">
          <span className="eyebrow">Saison {new Date().getFullYear()}</span>
          <h2>Planen, pflanzen,<br /><em>ernten.</em></h2>
          <p>Beete strukturieren, Kulturen verwalten und den richtigen Zeitpunkt im Blick behalten.</p>
        </div>
        <div className="season-card">
          <div className="season-heading"><span>Aktueller Monat</span><strong>{MONTHS_LONG[currentMonth - 1]}</strong></div>
          <div className="season-stats">
            <div><b>{state.beds.length}</b><span>Beete</span></div>
            <div><b>{plantedCount}</b><span>Pflanzungen</span></div>
            <div><b>{harvestNow.length}</b><span>jetzt erntereif</span></div>
          </div>
          <div className="season-track"><span style={{ width: `${(currentMonth / 12) * 100}%` }} /></div>
        </div>
      </section>

      <nav className="tabs" aria-label="Bereiche">
        {[
          ["beete", "Beetplanung", state.beds.length],
          ["kalender", "Pflanzkalender", null],
          ["kulturen", "Kulturen", state.crops.length],
        ].map(([id, label, count]) => (
          <button key={id} className={state.activeTab === id ? "active" : ""} onClick={() => setState((prev) => ({ ...prev, activeTab: id }))}>
            {label}{count !== null && <span>{count}</span>}
          </button>
        ))}
      </nav>

      {state.activeTab === "beete" && (
        <section className="workspace" aria-labelledby="beete-title">
          <div className="section-heading">
            <div><span className="section-kicker">Flächen</span><h2 id="beete-title">Beetplanung</h2></div>
            <div className="bed-heading-tools">
              <p>Pflanzen einzeln ins Beet ziehen und an ihrer späteren Position ablegen.</p>
              <label className="distance-toggle">
                <input type="checkbox" checked={state.showSpacing} onChange={(event) => setState((prev) => ({ ...prev, showSpacing: event.target.checked }))} />
                <span aria-hidden="true"><i /></span>
                <b>Pflanzabstände</b>
              </label>
            </div>
          </div>

          <form className="inline-form" onSubmit={addBed}>
            <label className="grow"><span>Beetname</span><input value={bedDraft.name} onChange={(e) => setBedDraft({ ...bedDraft, name: e.target.value })} placeholder="z. B. Sonnenbeet" /></label>
            <label><span>Breite (m)</span><input type="number" min="0.2" step="0.1" value={bedDraft.width} onChange={(e) => setBedDraft({ ...bedDraft, width: e.target.value })} /></label>
            <label><span>Länge (m)</span><input type="number" min="0.2" step="0.1" value={bedDraft.length} onChange={(e) => setBedDraft({ ...bedDraft, length: e.target.value })} /></label>
            <button className="button primary" type="submit"><span>＋</span> Beet anlegen</button>
          </form>

          {state.beds.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration" aria-hidden="true"><i /><i /><i /><i /><span>✦</span></div>
              <h3>Noch ist alles möglich.</h3>
              <p>Mit dem ersten Beet beginnt die Planung. Name und Maße genügen für den Start.</p>
              <button className="text-button" onClick={() => document.querySelector(".inline-form input")?.focus()}>Erstes Beet anlegen <span>→</span></button>
            </div>
          ) : (
            <div className="bed-grid">
              {state.beds.map((bed) => {
                const selected = selectedPlant?.bedId === bed.id ? (bed.plantings || []).find((planting) => planting.id === selectedPlant.plantingId) : null;
                const selectedCrop = selected ? state.crops.find((crop) => crop.id === selected.cropId) : null;
                const bedLengthCm = Number(bed.length) * 100;
                const bedWidthCm = Number(bed.width) * 100;
                const bedRatio = Number(bed.length) / Number(bed.width);

                return (
                  <article className="bed-card" key={bed.id}>
                    <div className="bed-card-head">
                      <div><span>{bed.width} × {bed.length} m · {(bed.width * bed.length).toFixed(1)} m²</span><h3>{bed.name}</h3></div>
                      <button className="icon-button" type="button" title="Beet entfernen" aria-label={`${bed.name} entfernen`} onClick={() => deleteBed(bed.id)}>×</button>
                    </div>

                    <div className="bed-editor">
                      <aside className="plant-palette" aria-label={`Pflanzen für ${bed.name}`}>
                        <div className="palette-head"><b>Pflanzen</b><span>Ziehen oder antippen</span></div>
                        <div className="palette-list">
                          {state.crops.map((crop) => (
                            <button
                              type="button"
                              className="palette-crop"
                              key={crop.id}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = "copy";
                                event.dataTransfer.setData("application/x-garden-crop", crop.id);
                                event.dataTransfer.setData("text/plain", crop.id);
                              }}
                              onClick={() => addPlantAt(bed.id, crop.id)}
                              title={`${crop.name} ins Beet setzen`}
                            >
                              <i style={{ background: crop.color }}>{crop.icon}</i>
                              <span><b>{crop.name}</b><small>{crop.spacing} cm Abstand</small></span>
                              <em aria-hidden="true">⠿</em>
                            </button>
                          ))}
                        </div>
                      </aside>

                      <div className="bed-canvas-panel">
                        <div className="bed-scale"><span>↔ Länge {bed.length} m</span><span>↕ Breite {bed.width} m</span></div>
                        <div className="bed-scroll">
                          <div
                            className="bed-visual"
                            style={{
                              aspectRatio: `${bed.length} / ${bed.width}`,
                              minWidth: `${Math.max(520, bedRatio * 250)}px`,
                            }}
                            onDragOver={(event) => {
                              event.preventDefault();
                              event.dataTransfer.dropEffect = "copy";
                            }}
                            onDrop={(event) => handleBedDrop(event, bed.id)}
                          >
                            {(bed.plantings || []).length === 0 && <span className="bed-empty">Pflanze hier ablegen</span>}

                            {state.showSpacing && (
                              <svg className="distance-layer" viewBox={`0 0 ${bedLengthCm} ${bedWidthCm}`} preserveAspectRatio="none" aria-hidden="true">
                                {(bed.plantings || []).map((planting) => {
                                  const crop = state.crops.find((item) => item.id === planting.cropId);
                                  if (!crop) return null;
                                  return (
                                    <circle
                                      key={planting.id}
                                      cx={(Number(planting.x) / 100) * bedLengthCm}
                                      cy={(Number(planting.y) / 100) * bedWidthCm}
                                      r={Math.max(0.5, Number(crop.spacing) / 2)}
                                      className={selected?.id === planting.id ? "selected" : ""}
                                      style={{ "--crop": crop.color }}
                                      vectorEffect="non-scaling-stroke"
                                    />
                                  );
                                })}
                              </svg>
                            )}

                            {(bed.plantings || []).map((planting) => {
                              const crop = state.crops.find((item) => item.id === planting.cropId);
                              if (!crop) return null;
                              return (
                                <button
                                  type="button"
                                  key={planting.id}
                                  className={`plant-instance ${selected?.id === planting.id ? "selected" : ""}`}
                                  style={{ left: `${planting.x}%`, top: `${planting.y}%`, "--crop": crop.color }}
                                  onPointerDown={(event) => beginPlantMove(event, bed.id, planting.id)}
                                  onPointerMove={(event) => continuePlantMove(event, bed.id, planting.id)}
                                  onPointerUp={finishPlantMove}
                                  onPointerCancel={finishPlantMove}
                                  onKeyDown={(event) => nudgePlant(event, bed.id, planting)}
                                  onClick={() => setSelectedPlant({ bedId: bed.id, plantingId: planting.id })}
                                  aria-label={`${crop.name} bei ${Math.round(planting.x)} Prozent Länge und ${Math.round(planting.y)} Prozent Breite`}
                                  title={`${crop.name} · ${crop.spacing} cm Pflanzabstand`}
                                >
                                  <span className="plant-marker">{crop.icon}</span>
                                  <span className="plant-name">{crop.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bed-selection" aria-live="polite">
                          {selected && selectedCrop ? (
                            <>
                              <i style={{ background: selectedCrop.color }}>{selectedCrop.icon}</i>
                              <span><b>{selectedCrop.name}</b><small>{((selected.x / 100) * Number(bed.length)).toFixed(2)} m längs · {((selected.y / 100) * Number(bed.width)).toFixed(2)} m quer</small></span>
                              <button type="button" onClick={() => removePlanting(bed.id, selected.id)}>Entfernen</button>
                            </>
                          ) : (
                            <span className="selection-hint">Pflanzen lassen sich ziehen; mit den Pfeiltasten ist eine genaue Positionierung möglich.</span>
                          )}
                          <strong>{(bed.plantings || []).length} {(bed.plantings || []).length === 1 ? "Pflanze" : "Pflanzen"}</strong>
                        </div>
                        {state.showSpacing && <p className="distance-note">Die gestrichelten Kreise berühren sich beim empfohlenen Pflanzabstand.</p>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {state.activeTab === "kalender" && (
        <section className="workspace" aria-labelledby="kalender-title">
          <div className="section-heading calendar-heading">
            <div><span className="section-kicker">Jahreslauf</span><h2 id="kalender-title">Pflanz- &amp; Erntekalender</h2></div>
            <div className="segmented">
              {[['all', 'Alle'], ['planted', 'Im Beet'], ['sow', 'Jetzt säen']].map(([value, label]) => <button key={value} className={calendarFilter === value ? "active" : ""} onClick={() => setCalendarFilter(value)}>{label}</button>)}
            </div>
          </div>
          <div className="legend"><span><i className="sow-dot" /> Aussaat &amp; Pflanzung</span><span><i className="harvest-dot" /> Erntefenster</span><span className="today-key"><i /> Aktueller Monat</span></div>
          <div className="calendar-board">
            <div className="calendar-months"><span>Kultur</span>{MONTHS.map((month, index) => <b key={month} className={index + 1 === currentMonth ? "current" : ""}>{month}</b>)}</div>
            {calendarCrops.map((crop) => (
              <div className="calendar-row" key={crop.id}>
                <div className="crop-label"><i style={{ background: crop.color }}>{crop.icon}</i><span>{crop.name}</span></div>
                {MONTHS.map((_, index) => {
                  const month = index + 1;
                  const sow = monthRange(crop.sowStart, crop.sowEnd).includes(month);
                  const harvest = monthRange(crop.harvestStart, crop.harvestEnd).includes(month);
                  return <div key={month} className={`month-cell ${month === currentMonth ? "current" : ""}`} title={`${MONTHS_LONG[index]}: ${sow ? "Aussaat " : ""}${harvest ? "Ernte" : ""}`}><span className={sow ? "sow active" : "sow"} /><span className={harvest ? "harvest active" : "harvest"} /></div>;
                })}
              </div>
            ))}
            {calendarCrops.length === 0 && <div className="calendar-empty">Für diesen Filter sind noch keine Kulturen vorhanden.</div>}
          </div>
        </section>
      )}

      {state.activeTab === "kulturen" && (
        <section className="workspace" aria-labelledby="kulturen-title">
          <div className="section-heading cultures-heading">
            <div><span className="section-kicker">Bibliothek</span><h2 id="kulturen-title">Kulturen verwalten</h2></div>
            <label className="search"><span aria-hidden="true">⌕</span><input value={cropSearch} onChange={(e) => setCropSearch(e.target.value)} placeholder="Kultur suchen" /></label>
          </div>
          <div className="cultures-layout">
            <div className="culture-list">
              {filteredCrops.map((crop) => (
                <article className="culture-card" key={crop.id}>
                  <div className="culture-icon" style={{ background: crop.color }}>{crop.icon}</div>
                  <div className="culture-info">
                    <h3>{crop.name}</h3>
                    <p>{crop.note || "Keine Notiz hinterlegt."}</p>
                    <div className="culture-meta"><span>{crop.growingProfile === "greenhouse" ? "Gewächshaus" : "Freiland"}</span><span>Aussaat {MONTHS[crop.sowStart - 1]}–{MONTHS[crop.sowEnd - 1]}</span><span>Ernte {MONTHS[crop.harvestStart - 1]}–{MONTHS[crop.harvestEnd - 1]}</span><span>{crop.spacing} cm Abstand</span></div>
                  </div>
                  <div className="card-actions"><button onClick={() => beginEditCrop(crop)}>Bearbeiten</button><button className="danger" onClick={() => deleteCrop(crop.id)}>Löschen</button></div>
                </article>
              ))}
            </div>
            <form id="kultur-formular" className="crop-form" onSubmit={saveCrop}>
              <div className="form-head"><span className="section-kicker">{editingCrop ? "Änderung" : "Neue Kultur"}</span><h3>{editingCrop ? cropDraft.name : "Eigene Kultur anlegen"}</h3></div>
              <div className="field-pair">
                <label><span>Name</span><input list="culture-profile-suggestions" value={cropDraft.name} onChange={(e) => handleCropNameChange(e.target.value)} placeholder="z. B. Mangold" autoComplete="off" /></label>
                <label className="short-field"><span>Kürzel</span><input maxLength="3" value={cropDraft.icon} onChange={(e) => setCropDraft({ ...cropDraft, icon: e.target.value })} placeholder="Ma" /></label>
              </div>
              <datalist id="culture-profile-suggestions">{CULTURE_PROFILES.map((profile) => <option key={profile.name} value={profile.name} />)}</datalist>
              <div className="growing-mode">
                <span>Anbauart</span>
                <div>
                  <button type="button" className={cropDraft.growingProfile !== "greenhouse" ? "active" : ""} onClick={() => handleGrowingProfileChange("outdoor")}>Freiland</button>
                  <button type="button" className={cropDraft.growingProfile === "greenhouse" ? "active" : ""} onClick={() => handleGrowingProfileChange("greenhouse")}>Gewächshaus</button>
                </div>
              </div>
              <div className={`phase-advice ${phaseStatus.type}`}>
                <div>
                  <b>{phaseStatus.type === "auto" ? "✓ Zeitfenster automatisch bestimmt" : phaseStatus.type === "manual" ? "Manuell angepasst" : phaseStatus.type === "unknown" ? "Kein Kulturprofil erkannt" : phaseStatus.type === "existing" ? "Gespeicherte Zeitfenster" : "Automatische Phasenbestimmung"}</b>
                  <span>{phaseStatus.type === "auto" ? `${phaseStatus.profileName} · ${cropDraft.growingProfile === "greenhouse" ? "Gewächshaus" : "Freiland"}` : phaseStatus.type === "manual" ? "Die automatisch gesetzten Werte wurden individuell verändert." : phaseStatus.type === "unknown" ? "Ein Name aus der Vorschlagsliste kann automatisch ausgewertet werden; die Monatsfelder bleiben frei bearbeitbar." : phaseStatus.type === "existing" ? "Die vorhandenen Werte werden erst nach einer Änderung oder Neuberechnung ersetzt." : `${CULTURE_PROFILES.length} Gemüseprofile stehen für Freiland und Gewächshaus bereit.`}</span>
                </div>
                {(phaseStatus.type === "manual" || phaseStatus.type === "existing") && findCultureProfile(cropDraft.name) && <button type="button" onClick={() => applyCultureProfile(findCultureProfile(cropDraft.name), cropDraft.growingProfile || "outdoor")}>Neu bestimmen</button>}
              </div>
              <label><span>Farbe</span><div className="color-input"><input type="color" value={cropDraft.color} onChange={(e) => setCropDraft({ ...cropDraft, color: e.target.value })} /><code>{cropDraft.color}</code></div></label>
              <div className="month-fields">
                <fieldset><legend>Aussaat</legend><MonthSelect value={cropDraft.sowStart} onChange={(value) => updateManualPhase("sowStart", value)} /><span>bis</span><MonthSelect value={cropDraft.sowEnd} onChange={(value) => updateManualPhase("sowEnd", value)} /></fieldset>
                <fieldset><legend>Ernte</legend><MonthSelect value={cropDraft.harvestStart} onChange={(value) => updateManualPhase("harvestStart", value)} /><span>bis</span><MonthSelect value={cropDraft.harvestEnd} onChange={(value) => updateManualPhase("harvestEnd", value)} /></fieldset>
              </div>
              <p className="phase-note">Richtwerte für ein gemäßigtes mitteleuropäisches Klima. Sorte, Frostlage und aktuelles Wetter können Abweichungen erfordern.</p>
              <label><span>Pflanzabstand (cm)</span><input type="number" min="1" value={cropDraft.spacing} onChange={(e) => setCropDraft({ ...cropDraft, spacing: e.target.value })} /></label>
              <label><span>Notiz</span><textarea rows="3" value={cropDraft.note} onChange={(e) => setCropDraft({ ...cropDraft, note: e.target.value })} placeholder="Standort, Pflege oder Besonderheiten" /></label>
              <div className="form-buttons">
                {editingCrop && <button type="button" className="button ghost" onClick={() => { setEditingCrop(null); setCropDraft(EMPTY_CROP); setPhaseStatus({ type: "idle" }); }}>Abbrechen</button>}
                <button type="submit" className="button primary">{editingCrop ? "Änderungen speichern" : "Kultur hinzufügen"}</button>
              </div>
            </form>
          </div>
        </section>
      )}

      <footer><span>Mein Gemüsegarten</span><p>Alle Daten bleiben in diesem Browser gespeichert.</p><span>Version 1.2</span></footer>
      {notice && <div className="toast" role="status">✓ {notice}</div>}
    </main>
  );
}

function MonthSelect({ value, onChange }) {
  return <select value={value} onChange={(e) => onChange(Number(e.target.value))}>{MONTHS_LONG.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>;
}
