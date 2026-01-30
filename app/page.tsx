import Image from "next/image";
import Paper from "./components/Paper";
import { Email } from "./components/Email";

export default function Home() {
    return (
        <div className="flex min-h-dvh box-border items-center justify-center font-body p-4 sm:p-16">
            <main className="flex min-h-full w-lg sm:w-2xl flex-col items-center justify-between gap-16">
                <Paper>
                    <div className="h-full w-full grid grid-rows-3 place-items-center">
                        <Image src="/seal.png" alt="Ferguson Seal" width={120} height={120} className="select-none pointer-events-none" />
                        <h1 className="text-center font-heading mix-blend-multiply uppercase">
                            <span className="name-line text-7xl text-primary">Alair </span>
                            <span className="name-line text-3xl tracking-wide">Ferguson </span>
                            <span className="text-3xl tracking-wide">Hautzinger</span>
                        </h1>
                        <ol className="list-none text-xl sm:text-base list-inside text-center text-[rgba(0,0,0,0.85)] mix-blend-multiply">
                            <li><Email /></li>
                            <li><a href="/resume.pdf" className="hover:text-primary">II. Resume</a></li>
                            <li><a href="https://www.linkedin.com/in/alairferguson/" className="hover:text-primary">III. LinkedIn</a></li>
                        </ol>
                    </div>
                </Paper>
            </main>
        </div>
    );
}
