"use client";

import { ReactNode, useEffect, useRef } from "react";
import PaperTexture from "./PaperTexture";
import Tape from "./Tape";

const GRID_SIZE = 24;

type GraphPaperProps = {
    children: ReactNode;
    className?: string;
};

export default function GraphPaper({ children, className }: GraphPaperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const paperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const paper = paperRef.current;
        if (!container || !paper) return;

        const snapToGrid = () => {
            const { width, height } = container.getBoundingClientRect();
            const w = Math.max(GRID_SIZE, Math.floor(width / GRID_SIZE) * GRID_SIZE);
            const h = Math.max(GRID_SIZE, Math.floor(height / GRID_SIZE) * GRID_SIZE);
            paper.style.width = `${w}px`;
            paper.style.height = `${h}px`;
        };

        snapToGrid();
        const observer = new ResizeObserver(snapToGrid);
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center justify-center min-h-0 ${className ?? ""}`}
        >
            <div ref={paperRef} className="relative graph-paper">
                <PaperTexture />

                <div className="relative z-[1] h-full w-full">{children}</div>

                <Tape position="top" />
                <Tape position="bottom" />
            </div>
        </div>
    );
}
