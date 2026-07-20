import type { ReactNode } from "react";
import type { SlottedCopy } from "./content";
import { isDraft, renderInline } from "./ProseSection";

type Props = Omit<SlottedCopy, "subsections"> & {
    id?: string;
    subsections: SlottedCopy["subsections"];
    /**
     * Full-width content keyed by subsection id. A single node is inserted
     * after `slotAfterParagraph`; an array is paired with an array of indices.
     */
    slots?: Record<string, ReactNode | ReactNode[]>;
};

function renderList(items: string[], keyPrefix: string) {
    return (
        <ul>
            {items.map((text, i) =>
                isDraft(text) ? (
                    <li key={i} className="ipd-draft-note ipd-mono">
                        {text}
                    </li>
                ) : (
                    <li key={i}>{renderInline(text, `${keyPrefix}-l${i}`)}</li>
                ),
            )}
        </ul>
    );
}

function renderParagraph(text: string, key: string | number, keyPrefix: string) {
    if (isDraft(text)) {
        return (
            <p key={key} className="ipd-draft-note ipd-mono">
                {text}
            </p>
        );
    }

    const heading = text.match(/^##\s+(.+)$/);
    if (heading) {
        return (
            <h4 key={key}>{renderInline(heading[1], `${keyPrefix}-h`)}</h4>
        );
    }

    return <p key={key}>{renderInline(text, keyPrefix)}</p>;
}

function asArray<T>(value: T | T[] | undefined): T[] {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
}

export default function SlottedSection({
    id,
    title,
    dek,
    subsections,
    slots,
}: Props) {
    return (
        <section
            className="ipd-section ipd-section--numbered"
            id={id}
            aria-label={title}
        >
            <div className="ipd-section-head">
                <div>
                    <h2>{title}</h2>
                    {dek && <p>{dek}</p>}
                </div>
            </div>

            {subsections.map((sub) => {
                const slotNodes = asArray(slots?.[sub.id]);
                const insertAfter = asArray(sub.slotAfterParagraph);
                const insertions = new Map<number, ReactNode>();
                insertAfter.forEach((index, i) => {
                    if (slotNodes[i] != null) {
                        insertions.set(index, slotNodes[i]);
                    }
                });

                const segments: Array<
                    | { type: "prose"; paragraphs: string[]; startIndex: number }
                    | { type: "slot"; node: ReactNode }
                > = [];
                let proseStart = 0;
                let proseBuf: string[] = [];

                function flushProse() {
                    if (proseBuf.length === 0 && segments.length > 0) return;
                    segments.push({
                        type: "prose",
                        paragraphs: proseBuf,
                        startIndex: proseStart,
                    });
                    proseBuf = [];
                }

                sub.paragraphs.forEach((text, i) => {
                    if (proseBuf.length === 0) proseStart = i;
                    proseBuf.push(text);
                    if (insertions.has(i)) {
                        flushProse();
                        segments.push({
                            type: "slot",
                            node: insertions.get(i),
                        });
                    }
                });
                flushProse();

                const hasSlot = slotNodes.length > 0;
                const listWithBefore = Boolean(sub.list && !hasSlot);
                const listAfterSlot = Boolean(sub.list && hasSlot);

                return (
                    <div className="ipd-subsection" id={sub.id} key={sub.id}>
                        {segments.map((segment, segIndex) => {
                            if (segment.type === "slot") {
                                return (
                                    <div
                                        className="ipd-slot"
                                        key={`slot-${segIndex}`}
                                    >
                                        {segment.node}
                                    </div>
                                );
                            }

                            const showHeading = segIndex === 0 && sub.heading;
                            const showList =
                                listWithBefore &&
                                segIndex === 0 &&
                                Boolean(sub.list);

                            if (
                                !showHeading &&
                                segment.paragraphs.length === 0 &&
                                !showList
                            ) {
                                return null;
                            }

                            return (
                                <div
                                    className="ipd-prose"
                                    key={`prose-${segIndex}`}
                                >
                                    {showHeading && <h3>{sub.heading}</h3>}
                                    {segment.paragraphs.map((text, i) =>
                                        renderParagraph(
                                            text,
                                            i,
                                            `${sub.id}-p${segment.startIndex + i}`,
                                        ),
                                    )}
                                    {showList &&
                                        sub.list &&
                                        renderList(sub.list, sub.id)}
                                </div>
                            );
                        })}
                        {listAfterSlot && sub.list && (
                            <div className="ipd-prose">
                                {renderList(sub.list, sub.id)}
                            </div>
                        )}
                    </div>
                );
            })}
        </section>
    );
}
