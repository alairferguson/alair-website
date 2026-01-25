import { ReactNode } from "react";

interface PaperProps {
    children: ReactNode;
}

export default function Paper({ children }: PaperProps) {
    return (
        <div className="w-full aspect-210/297 bg-[#FDF5E5] shadow-lg text-black p-10 flex flex-col items-center justify-center gap-10">
            {children}
        </div>
    );
}
