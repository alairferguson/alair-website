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
        <div className="flex min-h-dvh box-border items-center justify-center font-body p-10">
            <main className="flex min-h-full w-full max-w-4xl flex-col items-center justify-between gap-16">
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

                <Paper id="about" pageNum="I" showHomeButton landscape>

                    <div className="h-full w-full outline-0 outline-green-500 flex flex-col justify-start items-center gap-4 md:gap-8 min-h-0">
                        <h2 className="text-center font-heading mix-blend-multiply uppercase text-3xl tracking-wide">
                            About
                        </h2>

                        <Image
                            src="/alair.jpg"
                            alt="Alair"
                            width={487}
                            height={487}
                            quality={100}
                            unoptimized
                            className="select-none pointer-events-none w-40 h-40 object-cover rounded-sm"
                            style={{ imageRendering: 'crisp-edges' }}
                        />

                        <p className="text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply leading-relaxed mt-2">
                            I’m an economics, mathematics, and French graduate from Grinnell College currently working in labor and employment consulting. In the past, I have interned at Chipper Cash, Inc. and worked in academic economics research at Grinnell.

                            <br /><br />

                            My professional strengths blend technical skills and people-focused work; I like working on complex problems that involve both systems and humans. I’m drawn to fast-paced, mission-driven, humanity-first environments. Outside of work, I spend my time distance running, backpacking, rock climbing, and creating projects that solve problems and look beautiful.

                            {/* <br /><br />

                            I grew up in Colorado, and have lived around the world. Learn more about my background through the mountains that etched the landscapes of my life. */}
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
        </div >
    );
}
