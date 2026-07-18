"use client";

import { useEffect, useState } from "react";
import type { Spine } from "@/lib/bookshelf-types";
import { SHELF_ROW_COUNT, SPINE_HEIGHT_PX, STACK_PILE_MAX_PX } from "@/lib/bookshelf-types";
import ShelfPlank from "./ShelfPlank";
import SpineView from "./Spine";
import { SHELF_TILT_STYLE, useShelfTilt } from "./useShelfTilt";

type Cluster = {
    id: number;
    kind: "upright" | "stack";
    spines: Spine[];
};

type StackAlign = "start" | "center" | "end";

/** Near-zero so stacks sit snug against neighboring upright books. */
const CLUSTER_GAP_PX = 1;

function groupClusters(spines: Spine[]): Cluster[] {
    const byId = new Map<number, Spine[]>();
    for (const spine of spines) {
        const list = byId.get(spine.clusterId) ?? [];
        list.push(spine);
        byId.set(spine.clusterId, list);
    }

    return Array.from(byId.entries())
        .sort(([a], [b]) => a - b)
        .map(([id, members]) => {
            const ordered = [...members].sort((a, b) => a.clusterPosition - b.clusterPosition);
            const kind = ordered[0]?.role === "stack-base" ? "stack" : "upright";
            return { id, kind, spines: ordered };
        });
}

function asUpright(spines: Spine[], id: number): Cluster {
    return {
        id,
        kind: "upright",
        spines: spines.map((s) => ({ ...s, role: "upright" as const })),
    };
}

function clusterWidth(cluster: Cluster): number {
    if (cluster.kind === "stack") {
        return Math.max(...cluster.spines.map((s) => s.heightPx), SPINE_HEIGHT_PX);
    }
    return cluster.spines.reduce((acc, s) => acc + s.widthPx, 0) + Math.max(0, cluster.spines.length - 1);
}

function rowUsedWidth(clusters: Cluster[]): number {
    if (clusters.length === 0) return 0;
    return (
        clusters.reduce((acc, c) => acc + clusterWidth(c), 0) + CLUSTER_GAP_PX * (clusters.length - 1)
    );
}

/** Keep stacks within upright height; leftover books become uprights. */
function trimStack(cluster: Cluster, overflowId: number): { stack: Cluster; overflow: Cluster | null } {
    // Thinner books first so we can stack more before hitting the height cap.
    const byThickness = [...cluster.spines].sort((a, b) => a.widthPx - b.widthPx);
    const fitted: Spine[] = [];
    let used = 0;
    const overflow: Spine[] = [];

    for (const spine of byThickness) {
        const gap = fitted.length > 0 ? 1 : 0;
        if (used + gap + spine.widthPx > STACK_PILE_MAX_PX) {
            overflow.push(spine);
            continue;
        }
        fitted.push(spine);
        used += gap + spine.widthPx;
    }

    if (fitted.length < 2) {
        return {
            stack: asUpright([...fitted, ...overflow], cluster.id),
            overflow: null,
        };
    }

    return {
        stack: { id: cluster.id, kind: "stack", spines: fitted },
        overflow: overflow.length > 0 ? asUpright(overflow, overflowId) : null,
    };
}

/**
 * Pack as many books as possible into `maxRows` shelves.
 * Rule: horizontal stacks may share a row, but must be separated by vertical books.
 */
function packRows(allSpines: Spine[], capacityPx: number, maxRows: number): Cluster[][] {
    if (allSpines.length === 0 || maxRows <= 0) return [];

    let nextId = 1_000_000;
    const prepared: Cluster[] = [];

    for (const cluster of groupClusters(allSpines)) {
        if (cluster.kind !== "stack") {
            prepared.push(cluster);
            continue;
        }
        const { stack, overflow } = trimStack(cluster, nextId++);
        prepared.push(stack);
        if (overflow) prepared.push(overflow);
    }

    // Never leave two stacks adjacent in the stream.
    const separated: Cluster[] = [];
    for (const cluster of prepared) {
        if (cluster.kind === "stack" && separated[separated.length - 1]?.kind === "stack") {
            separated.push(asUpright(cluster.spines, cluster.id));
        } else {
            separated.push(cluster);
        }
    }

    const rows: Cluster[][] = [];
    let current: Cluster[] = [];
    const unplaced: Spine[] = [];

    const flush = () => {
        if (current.length === 0) return;
        rows.push(current);
        current = [];
    };

    const canFit = (cluster: Cluster) => {
        const gap = current.length > 0 ? CLUSTER_GAP_PX : 0;
        return rowUsedWidth(current) + gap + clusterWidth(cluster) <= capacityPx;
    };

    const appendCluster = (cluster: Cluster) => {
        const last = current[current.length - 1];
        if (cluster.kind === "upright" && last?.kind === "upright") {
            last.spines.push(...cluster.spines);
            return;
        }
        current.push(cluster);
    };

    const placeUprightSpines = (spines: Spine[]) => {
        for (const spine of spines) {
            const single = asUpright([spine], nextId++);
            if (!canFit(single)) {
                if (current.length > 0) {
                    flush();
                    if (rows.length >= maxRows) {
                        unplaced.push(spine);
                        continue;
                    }
                }
                if (!canFit(single)) {
                    unplaced.push(spine);
                    continue;
                }
            }
            appendCluster(single);
        }
    };

    for (const cluster of separated) {
        if (rows.length >= maxRows) {
            unplaced.push(...cluster.spines);
            continue;
        }

        let next = cluster;
        if (next.kind === "stack" && current[current.length - 1]?.kind === "stack") {
            next = asUpright(next.spines, next.id);
        }

        if (canFit(next)) {
            appendCluster(next);
            continue;
        }

        // Doesn't fit as a unit — flush and retry on a new row, or split uprights.
        if (current.length > 0) {
            flush();
            if (rows.length >= maxRows) {
                unplaced.push(...next.spines);
                continue;
            }
        }

        if (next.kind === "stack" && canFit(next)) {
            appendCluster(next);
        } else if (next.kind === "stack") {
            // Stack wider than a full shelf — fall back to uprights.
            placeUprightSpines(next.spines);
        } else {
            placeUprightSpines(next.spines);
        }
    }

    if (current.length > 0 && rows.length < maxRows) flush();

    // Stuff every remaining gap with leftover books (as vertical), maximizing fill.
    const usedIds = new Set(rows.flatMap((r) => r.flatMap((c) => c.spines.map((s) => s.id))));
    const leftover = [
        ...unplaced.filter((s) => !usedIds.has(s.id)),
        ...allSpines.filter((s) => !usedIds.has(s.id) && !unplaced.some((u) => u.id === s.id)),
    ];

    let li = 0;
    for (const row of rows) {
        while (li < leftover.length) {
            const book = leftover[li]!;
            const single = asUpright([book], nextId++);
            const gap = row.length > 0 ? CLUSTER_GAP_PX : 0;
            if (rowUsedWidth(row) + gap + clusterWidth(single) > capacityPx) break;

            const last = row[row.length - 1];
            if (last?.kind === "upright") {
                last.spines.push(single.spines[0]!);
            } else {
                // After a stack is fine — uprights separate stacks.
                row.push(single);
            }
            usedIds.add(book.id);
            li += 1;
        }
    }

    return rows;
}

/** Align stack contents toward neighboring uprights; center when in the middle. */
function stackAlignInRow(clusters: Cluster[], stackIndex: number): StackAlign {
    const hasUprightLeft = clusters.slice(0, stackIndex).some((c) => c.kind === "upright");
    const hasUprightRight = clusters.slice(stackIndex + 1).some((c) => c.kind === "upright");

    if (hasUprightLeft && hasUprightRight) return "center";
    if (hasUprightLeft) return "start";
    if (hasUprightRight) return "end";
    return "center";
}

function UprightCluster({ spines }: { spines: Spine[] }) {
    return (
        <div className="flex items-end" style={{ gap: 1 }}>
            {spines.map((spine) => (
                <a
                    key={spine.id}
                    href={spine.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <SpineView spine={spine} orientation="upright" lengthPx={spine.heightPx} />
                </a>
            ))}
        </div>
    );
}

function StackCluster({ spines, align }: { spines: Spine[]; align: StackAlign }) {
    // Already trimmed at pack time; keep tallest → shortest, bottom → top.
    const byHeight = [...spines].sort((a, b) => b.heightPx - a.heightPx);
    const stackLength = Math.max(...byHeight.map((s) => s.heightPx), SPINE_HEIGHT_PX);
    const stackThickness =
        byHeight.reduce((acc, s) => acc + s.widthPx, 0) + Math.max(0, byHeight.length - 1);
    const itemsClass =
        align === "start" ? "items-start" : align === "end" ? "items-end" : "items-center";

    return (
        <div
            className={`flex flex-col-reverse justify-end ${itemsClass}`}
            style={{
                width: stackLength,
                height: stackThickness,
                gap: 1,
            }}
        >
            {byHeight.map((spine) => (
                <a
                    key={spine.id}
                    href={spine.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <SpineView spine={spine} orientation="lying" lengthPx={spine.heightPx} />
                </a>
            ))}
        </div>
    );
}

function ShelfRow({ clusters }: { clusters: Cluster[] }) {
    const rowHeight = Math.max(
        SPINE_HEIGHT_PX,
        ...clusters.flatMap((c) =>
            c.kind === "upright" ? c.spines.map((s) => s.heightPx) : [SPINE_HEIGHT_PX]
        )
    );

    return (
        <div className="relative w-full">
            <div
                className="relative z-[1] flex w-full items-end justify-center px-3"
                style={{ height: rowHeight, gap: CLUSTER_GAP_PX }}
            >
                {clusters.map((cluster, i) =>
                    cluster.kind === "stack" ? (
                        <StackCluster
                            key={cluster.id}
                            spines={cluster.spines}
                            align={stackAlignInRow(clusters, i)}
                        />
                    ) : (
                        <UprightCluster key={cluster.id} spines={cluster.spines} />
                    )
                )}
            </div>
            <ShelfPlank className="relative z-0" />
        </div>
    );
}

type BookshelfProps = {
    spines: Spine[];
};

/**
 * Three-shelf mahogany bookcase. Returns null when there are no spines.
 */
export default function Bookshelf({ spines }: BookshelfProps) {
    const shelfRef = useShelfTilt();
    const [capacity, setCapacity] = useState(720);

    useEffect(() => {
        const el = shelfRef.current;
        if (!el) return;

        const measure = () => {
            const width = el.clientWidth;
            // px-3 on each side (12+12)
            if (width > 0) setCapacity(Math.max(240, width - 24));
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [shelfRef]);

    if (spines.length === 0) return null;

    const rows = packRows(spines, capacity, SHELF_ROW_COUNT);

    return (
        <section
            ref={shelfRef}
            style={SHELF_TILT_STYLE}
            className="w-full max-w-4xl"
            aria-label="Bookshelf"
        >
            <div className="flex w-full flex-col gap-5">
                {rows.map((row, i) => (
                    <ShelfRow key={i} clusters={row} />
                ))}
            </div>
        </section>
    );
}
