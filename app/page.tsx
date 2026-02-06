"use client";

import Image from "next/image";
import Paper from "./components/Paper";
import { Email } from "./components/Email";

export default function Home() {

    const scrollToAbout = () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

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
                            <li>
                                <button onClick={scrollToAbout} className="hover:text-primary cursor-pointer">
                                    I. About
                                </button>
                            </li>
                            <li>
                                <span className="line-through opacity-50 cursor-not-allowed">
                                    II. Writing
                                </span>
                            </li>
                            <li>
                                <span className="line-through opacity-50 cursor-not-allowed">
                                    III. Rabbit holes
                                </span>
                            </li>
                        </ol>
                    </div>
                </Paper>

                <Paper id="about" pageNum="I" showHomeButton>
                    <div className="h-full w-full flex flex-col justify-center items-center gap-6 sm:gap-8 outline-4 outline-green-500">
                        <h2 className="text-center font-heading mix-blend-multiply uppercase text-3xl tracking-wide">
                            About
                        </h2>

                        {/* Medium image */}
                        <Image
                            src="/alair.jpg"
                            alt="Alair"
                            width={487}
                            height={487}
                            quality={100}
                            unoptimized
                            className="select-none pointer-events-none w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-sm"
                            style={{ imageRendering: 'crisp-edges' }}
                        />

                        <p className="text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply leading-relaxed mt-2">
                            I studied economics, mathematics, and French at Grinnell College.
                            My interests center on incentives, decision-making, and how institutions
                            and systems function in real settings. I am drawn to work that values clear
                            thinking, quantitative rigor, and practical judgment, and I tend to focus
                            on problems where analysis directly informs action.
                        </p>

                        <p className="text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply text-left self-start">
                            <a href="/resume.pdf" className="hover:text-primary">Resume</a>
                            {" / "}
                            <a href="https://www.linkedin.com/in/alairferguson/" className="hover:text-primary">LinkedIn</a>
                            {" / "}
                            <Email />
                        </p>
                    </div>
                </Paper>
            </main>
        </div>
    );
}
