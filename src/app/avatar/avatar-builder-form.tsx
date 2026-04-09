"use client";

import { useMemo, useState } from "react";
import { avatarRules } from "@/lib/avatar-rating";
import { saveAvatar } from "./actions";

type AvatarBuilderFormProps = {
  defaultDisplayName: string;
  defaultTeamName: string;
  defaultPace: number;
  defaultAwareness: number;
  defaultRacecraft: number;
  defaultTyreManagement: number;
};

type SliderRowProps = {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  colorClass: string;
  onChange: (next: number) => void;
};

function SliderRow({
  label,
  name,
  value,
  min,
  max,
  colorClass,
  onChange,
}: SliderRowProps) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-semibold text-zinc-200">
          {label}
        </label>
        <span className="rounded-md bg-zinc-900 px-2 py-1 text-sm text-zinc-300">
          {value}
        </span>
      </div>

      <div className="relative">
        <div className="h-2 w-full rounded-full bg-zinc-800" />
        <div
          className={`absolute top-0 h-2 rounded-full transition-all duration-300 ease-out ${colorClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <input
        id={name}
        name={name}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full cursor-pointer accent-red-500"
      />
    </div>
  );
}

export default function AvatarBuilderForm({
  defaultDisplayName,
  defaultTeamName,
  defaultPace,
  defaultAwareness,
  defaultRacecraft,
  defaultTyreManagement,
}: AvatarBuilderFormProps) {
  const teamOptions = [
    "ANDRETTI CADILLAC",
    "ASTON MARTIN ARAMCO",
    "ATLASSIAN WILLIAMS",
    "BMW PETRONAS TEAM",
    "BWT ALPINE",
    "MASTERCARD MCLAREN",
    "PORSCHE RED BULL",
    "RENAULT MSI",
    "REVOLUT AUDI",
    "SCUDERIA FERRARI HP",
    "TGR HAAS",
    "VCA RACING BULLS",
  ];
  const min = avatarRules.min;
  const max = avatarRules.max;

  const initialPace = Math.max(min, Math.min(max, defaultPace || 70));
  const initialAwareness = Math.max(min, Math.min(max, defaultAwareness || 70));
  const initialRacecraft = Math.max(min, Math.min(max, defaultRacecraft || 70));
  const initialTyreManagement = Math.max(
    min,
    Math.min(max, defaultTyreManagement || 70),
  );

  const [pace, setPace] = useState(initialPace);
  const [awareness, setAwareness] = useState(initialAwareness);
  const [racecraft, setRacecraft] = useState(initialRacecraft);
  const [tyreManagement, setTyreManagement] = useState(initialTyreManagement);

  const paceAwarenessPool = useMemo(
    () => initialPace + initialAwareness,
    [initialAwareness, initialPace],
  );
  const racecraftTyrePool = useMemo(
    () => initialRacecraft + initialTyreManagement,
    [initialRacecraft, initialTyreManagement],
  );

  const getBoundedByPool = (value: number, pool: number) => {
    const minAllowed = Math.max(min, pool - max);
    const maxAllowed = Math.min(max, pool - min);
    return Math.max(minAllowed, Math.min(maxAllowed, value));
  };

  const setPaceWithTradeoff = (nextPace: number) => {
    const clampedPace = getBoundedByPool(nextPace, paceAwarenessPool);
    const coupledAwareness = paceAwarenessPool - clampedPace;
    setPace(clampedPace);
    setAwareness(coupledAwareness);
  };

  const setAwarenessWithTradeoff = (nextAwareness: number) => {
    const clampedAwareness = getBoundedByPool(nextAwareness, paceAwarenessPool);
    const coupledPace = paceAwarenessPool - clampedAwareness;
    setAwareness(clampedAwareness);
    setPace(coupledPace);
  };

  const setRacecraftWithTradeoff = (nextRacecraft: number) => {
    const clampedRacecraft = getBoundedByPool(nextRacecraft, racecraftTyrePool);
    const coupledTyre = racecraftTyrePool - clampedRacecraft;
    setRacecraft(clampedRacecraft);
    setTyreManagement(coupledTyre);
  };

  const setTyreWithTradeoff = (nextTyre: number) => {
    const clampedTyre = getBoundedByPool(nextTyre, racecraftTyrePool);
    const coupledRacecraft = racecraftTyrePool - clampedTyre;
    setTyreManagement(clampedTyre);
    setRacecraft(coupledRacecraft);
  };

  return (
    <form action={saveAvatar} className="mt-8 space-y-5 rounded-xl bg-zinc-900 p-6">
      <div>
        <label className="mb-2 block text-sm text-zinc-300">Имя пилота</label>
        <input
          name="displayName"
          defaultValue={defaultDisplayName}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          placeholder="Например: Alex Storm"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-300">Команда</label>
        <select
          name="teamName"
          required
          defaultValue={defaultTeamName || teamOptions[0]}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
        >
          {teamOptions.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </div>

      <SliderRow
        label="Pace (Темп)"
        name="pace"
        value={pace}
        min={min}
        max={max}
        onChange={setPaceWithTradeoff}
        colorClass="bg-red-500"
      />
      <SliderRow
        label="Awareness (Внимательность)"
        name="awareness"
        value={awareness}
        min={min}
        max={max}
        onChange={setAwarenessWithTradeoff}
        colorClass="bg-sky-400"
      />
      <SliderRow
        label="Racecraft (Борьба)"
        name="racecraft"
        value={racecraft}
        min={min}
        max={max}
        onChange={setRacecraftWithTradeoff}
        colorClass="bg-amber-400"
      />
      <SliderRow
        label="Tyre Management (Шины)"
        name="tyreManagement"
        value={tyreManagement}
        min={min}
        max={max}
        onChange={setTyreWithTradeoff}
        colorClass="bg-emerald-400"
      />

      <p className="rounded-md border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-300">
        Trade-off: `Pace` связан с `Awareness`, а `Racecraft` с `Tyre Management`.
        Когда повышаешь один параметр в паре, второй автоматически падает.
      </p>

      <button className="rounded-md bg-red-600 px-5 py-2 font-semibold transition-colors hover:bg-red-500">
        Сохранить аватар
      </button>
    </form>
  );
}
