import type { ReactNode } from "react";
import type { MethodologyCopy } from "./content";
import { isDraft, renderInline } from "./ProseSection";

type Props = MethodologyCopy & {
    id?: string;
    /** Full-width content keyed by subsection id, inserted after `slotAfterParagraph`. */
    slots?: Record<string, ReactNode>;
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

export default function MethodologySection({
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
                const slot = slots?.[sub.id];
                const splitAt = sub.slotAfterParagraph;
                const before =
                    splitAt != null
                        ? sub.paragraphs.slice(0, splitAt + 1)
                        : sub.paragraphs;
                const after =
                    splitAt != null ? sub.paragraphs.slice(splitAt + 1) : [];
                /** Keep the list with its intro prose; only defer it past a slot. */
                const listWithBefore = Boolean(sub.list && !slot);
                const listAfterSlot = Boolean(sub.list && slot);

                return (
                    <div className="ipd-subsection" id={sub.id} key={sub.id}>
                        <div className="ipd-prose">
                            <h3>{sub.heading}</h3>
                            {before.map((text, i) =>
                                isDraft(text) ? (
                                    <p
                                        key={i}
                                        className="ipd-draft-note ipd-mono"
                                    >
                                        {text}
                                    </p>
                                ) : (
                                    <p key={i}>
                                        {renderInline(text, `${sub.id}-p${i}`)}
                                    </p>
                                ),
                            )}
                            {listWithBefore &&
                                sub.list &&
                                renderList(sub.list, sub.id)}
                        </div>

                        {slot}

                        {(after.length > 0 || listAfterSlot) && (
                            <div className="ipd-prose">
                                {after.map((text, i) =>
                                    isDraft(text) ? (
                                        <p
                                            key={i}
                                            className="ipd-draft-note ipd-mono"
                                        >
                                            {text}
                                        </p>
                                    ) : (
                                        <p key={i}>
                                            {renderInline(
                                                text,
                                                `${sub.id}-pa${i}`,
                                            )}
                                        </p>
                                    ),
                                )}
                                {listAfterSlot &&
                                    sub.list &&
                                    renderList(sub.list, sub.id)}
                            </div>
                        )}
                    </div>
                );
            })}
        </section>
    );
}
