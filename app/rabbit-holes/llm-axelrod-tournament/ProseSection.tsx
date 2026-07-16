import type { ReactNode } from "react";
import type { ProseCopy } from "./content";

type Props = ProseCopy & {
    id?: string;
    children?: ReactNode;
};

export function isDraft(text: string): boolean {
    const trimmed = text.trim();
    return trimmed.startsWith("[") && trimmed.endsWith("]");
}

/**
 * Render inline markdown: `[label](url)` links, `**bold**`, and `*italics*`.
 * Links are matched first so brackets inside URLs never become emphasis.
 */
export function renderInline(text: string, keyPrefix = "n"): ReactNode[] {
    const nodes: ReactNode[] = [];
    const linkPattern = /\[([^\]]+)\]\(((?:https?:\/\/|#)[^)\s]+)\)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = linkPattern.exec(text)) !== null) {
        if (match.index > last) {
            nodes.push(
                ...renderEmphasis(text.slice(last, match.index), `${keyPrefix}-t${key}`),
            );
        }
        const href = match[2];
        const isAnchor = href.startsWith("#");
        nodes.push(
            <a
                key={`${keyPrefix}-a${key++}`}
                href={href}
                target={isAnchor ? undefined : "_blank"}
                rel={isAnchor ? undefined : "noopener noreferrer"}
                className="ipd-prose-link"
                onClick={
                    isAnchor
                        ? (e) => {
                              const scrollTarget = document.querySelector(href);
                              if (!scrollTarget) return;
                              e.preventDefault();
                              scrollTarget.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                              });
                          }
                        : undefined
                }
            >
                {match[1]}
            </a>,
        );
        last = match.index + match[0].length;
    }

    if (last < text.length) {
        nodes.push(...renderEmphasis(text.slice(last), `${keyPrefix}-t${key}`));
    }

    return nodes;
}

function renderEmphasis(text: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    // Bold first so `**name**` is not eaten by the italic matcher.
    const boldPattern = /\*\*([^*]+)\*\*/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = boldPattern.exec(text)) !== null) {
        if (match.index > last) {
            nodes.push(
                ...renderItalics(text.slice(last, match.index), `${keyPrefix}-i${key}`),
            );
        }
        nodes.push(<strong key={`${keyPrefix}-b${key++}`}>{match[1]}</strong>);
        last = match.index + match[0].length;
    }

    if (last < text.length) {
        nodes.push(...renderItalics(text.slice(last), `${keyPrefix}-i${key}`));
    }

    return nodes;
}

function renderItalics(text: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    const pattern = /\*([^*]+)\*/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) {
            nodes.push(text.slice(last, match.index));
        }
        nodes.push(<em key={`${keyPrefix}-e${key++}`}>{match[1]}</em>);
        last = match.index + match[0].length;
    }

    if (last < text.length) {
        nodes.push(text.slice(last));
    }

    return nodes;
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
                        <p key={i}>{renderInline(text, `p${i}`)}</p>
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
                                <li key={i}>{renderInline(text, `l${i}`)}</li>
                            ),
                        )}
                    </ul>
                )}
            </div>
            {children}
        </section>
    );
}
