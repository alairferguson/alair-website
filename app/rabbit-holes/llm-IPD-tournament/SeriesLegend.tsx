"use client";

import type { Series } from "./types";

type Props = {
    series: Series[];
    /** Hovering/focusing a swatch selects that model's points in the chart above. */
    onHighlight: (id: string | null) => void;
};

/** Color key: color now signifies model across every chart, so each chart that colors by model shows one of these. */
export default function SeriesLegend({ series, onHighlight }: Props) {
    if (!series.length) return null;
    return (
        <div className="ipd-legend ipd-mono" role="list" aria-label="Model color key">
            {series.map((s) => {
                const repId = s.playerIds[0] ?? null;
                return (
                    <button
                        key={s.id}
                        type="button"
                        className="ipd-legend-item"
                        role="listitem"
                        onMouseEnter={() => onHighlight(repId)}
                        onFocus={() => onHighlight(repId)}
                        onMouseLeave={() => onHighlight(null)}
                        onBlur={() => onHighlight(null)}
                    >
                        <span
                            className="ipd-legend-swatch"
                            style={{ background: s.color }}
                            aria-hidden="true"
                        />
                        {s.label}
                    </button>
                );
            })}
        </div>
    );
}
