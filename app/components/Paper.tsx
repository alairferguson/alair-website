import { ReactNode } from "react";

interface PaperProps {
    children: ReactNode;
}

export default function Paper({ children }: PaperProps) {
    return (
        <div className="w-full aspect-210/297 bg-white shadow-lg text-black p-10">
            {children}
        </div>
    );
}
