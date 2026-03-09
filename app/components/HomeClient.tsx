"use client";

import Image from "next/image";
import Link from "next/link";
import Paper from "./Paper";
import { Email } from "./Email";
import type { WritingPost } from "@/lib/writing";
import { formatDateDDMMYYYY, getWritingSections } from "@/lib/writing-display";

type HomeClientProps = {
    writingPosts: WritingPost[];
};

export default function HomeClient({ writingPosts }: HomeClientProps) {
    const scrollTo = (id: string) => () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
                                <button onClick={scrollTo("about")} className="hover:text-primary cursor-pointer">
                                    I. About
                                </button>
                            </li>
                            <li>
                                <button onClick={scrollTo("writing")} className="hover:text-primary cursor-pointer">
                                    II. Writing
                                </button>
                            </li>
                            <li>
                                <span className="line-through text-[rgba(0,0,0,0.6)] cursor-not-allowed">
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
                            className="select-none pointer-events-none w-40 h-40 object-cover corner-bevel"
                            style={{ imageRendering: "crisp-edges" }}
                        />

                        <p className="text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply">
                            I&apos;m an economics, mathematics, and French graduate from Grinnell College currently working in labor and employment consulting. In the past, I focused on consumer success during my time at Chipper Cash, Inc. where I was a Product Analytics intern, and honed my quantitative analytical skills through academic economics research at Grinnell.
                        </p>
                        <p className="text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply">
                            My professional strengths blend technical skills and people-focused work; I like working on complex problems that involve both systems and humans. I&apos;m drawn to fast-paced, mission-driven, humanity-first environments. My paramount passion is sustainability (favorite eco-literature is <em>The Overstory</em> by Richard Powers, <em>The Ministry for the Future</em> by Kim Stanley Robinson, and <em>Braiding Sweetgrass</em> by Robin Wall Kimmerer). Outside of work, I spend my time distance running, backpacking, rock climbing, and creating projects that solve problems and look beautiful.
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

                <Paper id="writing" pageNum="II" showHomeButton landscape>
                    <div className="h-full w-full outline-0 flex flex-col justify-start items-center gap-4 md:gap-8 min-h-0">
                        <h2 className="outline-0 text-center font-heading mix-blend-multiply uppercase text-3xl tracking-wide">
                            Writing
                        </h2>

                        <div className="outline-0 w-full max-w-xl text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply flex flex-col border-t-2 border-primary pt-2">
                            {getWritingSections().map((section) => {
                                const sectionPosts = writingPosts.filter(
                                    (post) => post.section === section.id
                                );
                                if (sectionPosts.length === 0) return null;
                                const [firstPost, ...restPosts] = sectionPosts;
                                const renderPost = (post: (typeof writingPosts)[0], showLabel: boolean) => {
                                    const href = post.isPdf
                                        ? `/writing/${encodeURIComponent(post.slug + ".pdf")}`
                                        : `/writing/${post.slug}`;
                                    const dateStr = post.date ? formatDateDDMMYYYY(post.date) : null;
                                    const linkClass = "hover:text-primary text-right min-w-0";
                                    return (
                                        <div
                                            key={post.slug}
                                            className="grid w-full gap-x-4 items-start"
                                            style={{ gridTemplateColumns: "minmax(0, 1fr) 90px minmax(0, 1fr)" }}
                                        >
                                            <span className="font-medium shrink-0 min-w-0">
                                                {showLabel ? section.label : ""}
                                            </span>
                                            <span className="text-center shrink-0 tabular-nums">
                                                {dateStr ?? "\u00A0"}
                                            </span>
                                            {post.isPdf ? (
                                                <a href={href} className={linkClass}>
                                                    {post.title}
                                                </a>
                                            ) : (
                                                <Link href={href} className={linkClass}>
                                                    {post.title}
                                                </Link>
                                            )}
                                        </div>
                                    );
                                };
                                return (
                                    <div key={section.id} className="flex flex-col">
                                        {renderPost(firstPost, true)}
                                        {restPosts.length > 0 && (
                                            <div className="flex flex-col gap-1 mt-1">
                                                {restPosts.map((post) =>
                                                    renderPost(post, false)
                                                )}
                                            </div>
                                        )}
                                        <div className="border-t-2 border-primary mt-2 pt-2" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Paper>
            </main>
        </div>
    );
}
