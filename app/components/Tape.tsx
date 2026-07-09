type TapeProps = {
    position: "top" | "bottom" | "left" | "right";
    size?: string;
    className?: string;
};

export default function Tape({ position, size = "5rem", className }: TapeProps) {
    const isVertical = position === "left" || position === "right";

    const positionClass =
        position === "top"
            ? "-top-2.5 left-1/2 -translate-x-1/2"
            : position === "bottom"
              ? "-bottom-2.5 left-1/2 -translate-x-1/2"
              : position === "left"
                ? "-left-2 top-1/2 -translate-y-1/2"
                : "-right-2 top-1/2 -translate-y-1/2";

    const gradient =
        position === "top"
            ? "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.35) 100%)"
            : position === "bottom"
              ? "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.6) 100%)"
              : position === "left"
                ? "linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.35) 100%)"
                : "linear-gradient(270deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.35) 100%)";

    return (
        <div
            className={`absolute z-10 pointer-events-none opacity-65 ${positionClass} ${className ?? ""}`}
            style={{
                width: isVertical ? "1.5rem" : size,
                height: isVertical ? size : "1.5rem",
                background: gradient,
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
            aria-hidden="true"
        />
    );
}
