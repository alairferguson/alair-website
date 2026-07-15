import type { ReactNode } from "react";
import type { ProseCopy } from "./content";

type Props = ProseCopy & {
    id?: string;
    children?: ReactNode;
};

function isDraft(text: string): boolean {
    const trimmed = text.trim();
    return trimmed.startsWith("[") && trimmed.endsWith("]");
}

export default function ProseSection({
    id,
    title,
    dek,
    paragraphs,
    list,
    children,
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
            <div className="ipd-prose">
                {paragraphs.map((text, i) =>
                    isDraft(text) ? (
                        <p key={i} className="ipd-draft-note ipd-mono">
                            {text}
                        </p>
                    ) : (
                        <p key={i}>{text}</p>
                    ),
                )}
                {list && (
                    <ul>
                        {list.map((text, i) =>
                            isDraft(text) ? (
                                <li key={i} className="ipd-draft-note ipd-mono">
                                    {text}
                                </li>
                            ) : (
                                <li key={i}>{text}</li>
                            ),
                        )}
                    </ul>
                )}
            </div>
            {children}
        </section>
    );
}
