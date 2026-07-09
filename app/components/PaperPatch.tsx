import { ReactNode } from "react";
import PaperTexture from "./PaperTexture";
import Tape from "./Tape";

type PaperPatchProps = {
    children: ReactNode;
    className?: string;
};

export default function PaperPatch({ children, className }: PaperPatchProps) {
    return (
        <div
            className={`relative bg-[#fdf6e6] px-6 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)] ${className ?? ""}`}
        >
            <Tape position="left" size="3rem" />
            <Tape position="right" size="3rem" />

            <div className="relative z-0">{children}</div>
            <PaperTexture />
        </div>
    );
}
