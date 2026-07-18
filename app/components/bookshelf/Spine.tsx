import Image from "next/image";
import type { CSSProperties } from "react";
import type { Spine as SpineData } from "@/lib/bookshelf-types";
import { SPINE_HEIGHT_PX } from "@/lib/bookshelf-types";

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
    const coverPad = Math.max(3, Math.round(spine.widthPx * 0.12));
    const coverH = Math.round(lengthPx * 0.28);
    // Source Serif stays legible a touch larger than Gimlet did.
    const fontSize = Math.max(10, Math.min(12, spine.widthPx * 0.22));

    const verticalText: CSSProperties = {
        writingMode: "vertical-rl",
        textOrientation: "mixed",
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
            {/* Full cover, centered with padding */}
            {spine.coverUrl ? (
                <div
                    className="relative w-full shrink-0"
                    style={{ height: coverH, padding: coverPad }}
                >
                    <div className="relative h-full w-full">
                        <Image
                            src={spine.coverUrl}
                            alt=""
                            fill
                            sizes={`${Math.max(24, spine.widthPx - coverPad * 2)}px`}
                            className="object-contain object-center"
                            unoptimized
                        />
                    </div>
                </div>
            ) : null}

            {/* Title and author on separate vertical lines */}
            <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 overflow-hidden px-[3px] py-1.5">
                <div className="max-h-[58%] overflow-hidden font-medium" style={verticalText}>
                    {spine.title}
                </div>
                {spine.author ? (
                    <div
                        className="max-h-[38%] overflow-hidden opacity-80"
                        style={{ ...verticalText, fontWeight: 400, fontSize: Math.max(9, fontSize - 1) }}
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
