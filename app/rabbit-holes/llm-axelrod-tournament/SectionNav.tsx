"use client";

import { useEffect, useMemo, useState } from "react";

export type NavItem = {
    id: string;
    label: string;
};

type Props = {
    items: NavItem[];
};

function scrollToId(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
    });
    history.replaceState(null, "", `#${id}`);
}

export default function SectionNav({ items }: Props) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const ids = useMemo(() => items.map((item) => item.id), [items]);

    /**
     * Scrollspy: the active entry is the last section whose top has crossed a
     * line a third of the way down the viewport. Reading `ids` in document
     * order means the loop settles on the right one without any sorting.
     */
    useEffect(() => {
        let frame = 0;

        function update() {
            frame = 0;
            const line = window.innerHeight * 0.33;
            let current: string | null = null;
            for (const id of ids) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= line) current = id;
            }
            // The last section is usually too short to reach the line, so pin
            // it once the page can't scroll any further.
            const atBottom =
                window.scrollY + window.innerHeight >=
                document.documentElement.scrollHeight - 2;
            if (atBottom) current = ids[ids.length - 1] ?? current;
            setActiveId(current);
        }

        function schedule() {
            if (frame) return;
            frame = window.requestAnimationFrame(update);
        }

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        return () => {
            if (frame) window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, [ids]);

    return (
        <nav className="ipd-rail" aria-label="Report sections">
            <ol className="ipd-rail-list">
                {items.map((item, i) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className={
                                activeId === item.id
                                    ? "ipd-rail-link is-active"
                                    : "ipd-rail-link"
                            }
                            aria-current={
                                activeId === item.id ? "true" : undefined
                            }
                            onClick={(event) => {
                                event.preventDefault();
                                scrollToId(item.id);
                            }}
                        >
                            <span className="ipd-rail-num ipd-mono">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span>{item.label}</span>
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
