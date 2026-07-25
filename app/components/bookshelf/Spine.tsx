import Image from "next/image";
import type { CSSProperties } from "react";
import type { Spine as SpineData } from "@/lib/bookshelf-types";
import { authorFontSizePx, SPINE_HEIGHT_PX, titleFontSizePx } from "@/lib/bookshelf-types";

type SpineProps = {
    spine: SpineData;
    orientation: "upright" | "lying";
    /** Book "height" along the long axis — upright height, or lying length. */
    lengthPx?: number;
};

/**
 * One book spine, always authored upright: padded full cover, title and author
 * on separate vertical lines. Lying books rotate −90° so the cover sits on the
 * left and the text reads left-to-right.
 */
export default function Spine({
    spine,
    orientation,
    lengthPx = spine.heightPx || SPINE_HEIGHT_PX,
}: SpineProps) {
    const textColor = spine.textColor === "dark" ? "rgba(30,18,10,0.92)" : "rgba(255,248,235,0.95)";
    // Cover is a clamped book-like rectangle (see sizeForSpineText); the text block
    // below it is exactly its own content's height. Whatever spine height is left
    // over becomes a spacer above the cover, so neither one ever has to stretch.
    const coverH = spine.coverHeightPx;
    // Source Serif stays legible a touch larger than Gimlet did.
    const fontSize = titleFontSizePx(spine.widthPx);
    // Stacked rings rather than a real border, so framing doesn't consume layout space
    // (usually one color; Slouching Towards Bethlehem's three-stripe title gets three).
    // 2px steps make each ring clearly a *border*, not a hairline — hugging the art
    // directly, since the cover has zero padding and fully fills its box (object-cover).
    const coverBorderShadow = spine.borderColors.map((c, i) => `0 0 0 ${(i + 1) * 2}px ${c}`).join(", ");

    const verticalText: CSSProperties = {
        writingMode: "vertical-rl",
        // "mixed" leaves punctuation like apostrophes upright per Unicode's vertical-orientation
        // table, so they look sideways next to rotated letters — "sideways" rotates everything uniformly.
        textOrientation: "sideways",
        color: textColor,
        fontSize,
        fontFamily: "var(--font-spine), ui-serif, Georgia, serif",
        fontStyle: "normal",
        fontWeight: 500,
        lineHeight: 1.2,
        letterSpacing: "0.01em",
    };

    const box = (
        <div
            className="relative flex flex-col overflow-hidden select-none"
            style={{
                width: spine.widthPx,
                height: lengthPx,
                backgroundColor: spine.color,
                boxShadow:
                    "inset 1px 0 0 rgba(255,255,255,0.14), inset -1px 0 0 rgba(0,0,0,0.22), 1px 0 2px rgba(0,0,0,0.18)",
            }}
            title={`${spine.title} — ${spine.author}`}
        >
            {/* Blank space above the cover — absorbs whatever this spine's random extra
                height doesn't need, so the cover and text block never have to stretch. */}
            <div className="flex-1" />

            {/* Cover art, full-bleed (object-cover, zero padding) so its hand-picked
                border hugs real artwork on all four sides, not empty letterboxing. */}
            {spine.coverUrl ? (
                <div className="relative w-full shrink-0" style={{ height: coverH, boxShadow: coverBorderShadow }}>
                    <Image
                        src={spine.coverUrl}
                        alt=""
                        fill
                        sizes={`${spine.widthPx}px`}
                        className="object-cover object-center"
                        unoptimized
                    />
                </div>
            ) : null}

            {/* Title + author, sized to exactly fit their own content — never more —
                with a fixed gap between them and to the far edge (bottom → right when lying). */}
            <div
                className="relative flex shrink-0 flex-col items-center justify-end gap-1.5 overflow-hidden px-[3px] py-1.5"
                style={{ height: spine.textBlockHeightPx }}
            >
                <div className="max-h-[58%] overflow-hidden font-medium" style={verticalText}>
                    {spine.title}
                </div>
                {spine.author ? (
                    <div
                        className="max-h-[38%] overflow-hidden opacity-80"
                        style={{ ...verticalText, fontWeight: 400, fontSize: authorFontSizePx(fontSize) }}
                    >
                        {spine.author}
                    </div>
                ) : null}
            </div>
        </div>
    );

    if (orientation === "lying") {
        // −90° puts the cover (authored at the "top") on the left so titles read L→R.
        return (
            <div className="relative" style={{ width: lengthPx, height: spine.widthPx }}>
                <div
                    className="absolute"
                    style={{
                        width: spine.widthPx,
                        height: lengthPx,
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%) rotate(-90deg)",
                    }}
                >
                    {box}
                </div>
            </div>
        );
    }

    return box;
}
