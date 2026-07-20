import type { ProseCopy } from "./content";
import { isDraft, renderInline } from "./ProseSection";

type Props = ProseCopy & {
    id?: string;
    userPromptExamples: Array<{ id: string; label: string; body: string }>;
};

export default function AppendixSection({
    id,
    title,
    dek,
    paragraphs,
    userPromptExamples,
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
            </div>

            <p
                id="appendix-user-prompts"
                className="ipd-kicker ipd-mono ipd-results-label ipd-results-label--spaced"
            >
                User prompt (per turn)
            </p>
            <div className="ipd-prompt-grid">
                {userPromptExamples.map((example) => (
                    <article key={example.id} className="ipd-prompt-card">
                        <h3>{example.label}</h3>
                        <pre className="ipd-mono">{example.body}</pre>
                    </article>
                ))}
            </div>
        </section>
    );
}
