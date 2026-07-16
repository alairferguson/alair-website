import type { ReactNode } from "react";
import type { MethodologyCopy } from "./content";
import { isDraft, renderInline } from "./ProseSection";

type Props = MethodologyCopy & {
    id?: string;
    /** Full-width content keyed by subsection id, inserted after `slotAfterParagraph`. */
    slots?: Record<string, ReactNode>;
};

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
                const after = splitAt != null ? sub.paragraphs.slice(splitAt + 1) : [];

                return (
                    <div className="ipd-subsection" id={sub.id} key={sub.id}>
                        <div className="ipd-prose">
                            <h3>{sub.heading}</h3>
                            {before.map((text, i) =>
                                isDraft(text) ? (
                                    <p key={i} className="ipd-draft-note ipd-mono">
                                        {text}
                                    </p>
                                ) : (
                                    <p key={i}>
                                        {renderInline(text, `${sub.id}-p${i}`)}
                                    </p>
                                ),
                            )}
                        </div>

                        {slot}

                        {(after.length > 0 || sub.list) && (
                            <div className="ipd-prose">
                                {after.map((text, i) =>
                                    isDraft(text) ? (
                                        <p key={i} className="ipd-draft-note ipd-mono">
                                            {text}
                                        </p>
                                    ) : (
                                        <p key={i}>
                                            {renderInline(text, `${sub.id}-pa${i}`)}
                                        </p>
                                    ),
                                )}
                                {sub.list && (
                                    <ul>
                                        {sub.list.map((text, i) =>
                                            isDraft(text) ? (
                                                <li
                                                    key={i}
                                                    className="ipd-draft-note ipd-mono"
                                                >
                                                    {text}
                                                </li>
                                            ) : (
                                                <li key={i}>
                                                    {renderInline(
                                                        text,
                                                        `${sub.id}-l${i}`,
                                                    )}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </section>
    );
}
