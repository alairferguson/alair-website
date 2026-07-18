"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import Paper from "./Paper";
import { Email } from "./Email";
import RabbitHolesContent from "./RabbitHolesContent";
import Bookshelf from "./bookshelf/Bookshelf";
import type { Spine } from "@/lib/bookshelf-types";
import type { WritingPost } from "@/lib/writing";
import { formatDateDDMMYYYY, getWritingSections } from "@/lib/writing-display";

type HomeClientProps = {
    writingPosts: WritingPost[];
    spines: Spine[];
};

const linkHoverClass = "hover:text-primary hover:decoration-wavy hover:underline decoration-1";

export default function HomeClient({ writingPosts, spines }: HomeClientProps) {
    const scrollTo = (id: string) => () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (!hash) return;
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    return (
        <div className="flex min-h-dvh box-border items-center justify-center font-body p-10 max-md:p-6 max-sm:p-4">
            <main className="flex min-h-full w-full max-w-4xl flex-col items-center justify-between gap-16 max-md:gap-12 max-sm:gap-10">
                <Paper>
                    <div className="h-full w-full grid grid-rows-3 place-items-center">
                        <Image
                            src="/seal.png"
                            alt="Ferguson Seal"
                            width={120}
                            height={120}
                            className="select-none pointer-events-none max-sm:w-20 max-sm:h-20"
                        />
                        <h1 className="text-center font-heading mix-blend-multiply uppercase">
                            <span className="name-line text-7xl max-sm:text-[2.75rem] max-sm:leading-none text-primary">Alair </span>
                            <span className="name-line text-3xl max-sm:text-2xl tracking-wide">Ferguson </span>
                            <span className="text-3xl max-sm:text-2xl tracking-wide">Hautzinger</span>
                        </h1>
                        <ol className="list-none text-xl sm:text-base list-inside text-center text-[rgba(0,0,0,0.85)] mix-blend-multiply">
                            <li>
                                <button onClick={scrollTo("about")} className={linkHoverClass + " cursor-pointer"}>
                                    I. About
                                </button>
                            </li>
                            <li>
                                <button onClick={scrollTo("writing")} className={linkHoverClass + " cursor-pointer"}>
                                    II. Writing
                                </button>
                            </li>
                            <li>
                                <button onClick={scrollTo("rabbit-holes")} className={linkHoverClass + " cursor-pointer"}>
                                    III. Rabbit holes
                                </button>
                            </li>
                        </ol>
                    </div>
                </Paper>

                <Paper id="about" pageNum="I" showHomeButton landscape>
                    <div className="h-full max-lg:h-auto w-full flex flex-col min-h-0">
                        <h2 className="text-center font-heading mix-blend-multiply uppercase text-3xl max-sm:text-2xl tracking-wide shrink-0">
                            About
                        </h2>

                        <div className="flex-1 flex flex-col justify-center min-h-0 pb-12">
                            <div className="w-full flex flex-col gap-4">
                                <div className="w-full overflow-hidden">
                                    <Image
                                        src="/alair.jpg"
                                        alt="Alair"
                                        width={487}
                                        height={487}
                                        quality={100}
                                        unoptimized
                                        className="select-none pointer-events-none float-left mr-5 mb-3 sm:mr-6 sm:mb-4 w-32 h-32 sm:w-40 sm:h-40 object-cover corner-bevel"
                                        style={{ imageRendering: "crisp-edges" }}
                                    />

                                    <div className="space-y-4 text-xl sm:text-base leading-relaxed text-[rgba(0,0,0,0.85)] mix-blend-multiply">
                                        <p>
                                            I&apos;m an economics, mathematics, and French graduate from Grinnell College currently working in labor and employment consulting. In the past, I focused on consumer success during my time at Chipper Cash, Inc. where I was a Product Analytics intern, and honed my quantitative analytical skills through academic economics research at Grinnell.
                                        </p>
                                        <p>
                                            My professional strengths blend technical skills and people-focused work; I like working on complex problems that involve both systems and humans. I&apos;m drawn to fast-paced, mission-driven, humanity-first environments. My paramount passion is sustainability (favorite eco-literature is <em>The Overstory</em> by Richard Powers, <em>The Ministry for the Future</em> by Kim Stanley Robinson, and <em>Braiding Sweetgrass</em> by Robin Wall Kimmerer). Outside of work, I spend my time distance running, backpacking, rock climbing, and creating projects that solve problems and look beautiful.
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply text-left">
                                    <a href="/resume.pdf" className={linkHoverClass}>Resume</a>
                                    {" / "}
                                    <a href="https://www.linkedin.com/in/alairferguson/" className={linkHoverClass}>LinkedIn</a>
                                    {" / "}
                                    <Email />
                                </p>
                            </div>
                        </div>
                    </div>
                </Paper>

                <Paper id="writing" pageNum="II" showHomeButton landscape>
                    <div className="h-full max-lg:h-auto w-full outline-0 flex flex-col justify-start items-center gap-4 md:gap-8 min-h-0">
                        <h2 className="outline-0 text-center font-heading mix-blend-multiply uppercase text-3xl max-sm:text-2xl tracking-wide">
                            Writing
                        </h2>

                        <div className="outline-0 w-full text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply flex flex-col border-t border-primary/50 pt-2">
                            {getWritingSections().map((section) => {
                                const sectionPosts = writingPosts.filter(
                                    (post) => post.section === section.id
                                );
                                if (sectionPosts.length === 0) return null;
                                const [firstPost, ...restPosts] = sectionPosts;
                                const renderPost = (post: (typeof writingPosts)[0], showLabel: boolean) => {
                                    const href = `/writing/${post.slug}`;
                                    const dateStr = post.date ? formatDateDDMMYYYY(post.date) : null;
                                    return (
                                        <div key={post.slug} className="w-full">
                                            {/* Mobile: stacked entry */}
                                            <Link
                                                href={href}
                                                className={`flex flex-col gap-0.5 py-2 lg:hidden ${linkHoverClass}`}
                                            >
                                                {showLabel && (
                                                    <span className="font-medium text-primary/80">
                                                        {section.label}
                                                    </span>
                                                )}
                                                <span className="min-w-0">{post.title}</span>
                                                {dateStr && (
                                                    <span className="tabular-nums text-sm text-[rgba(0,0,0,0.55)]">
                                                        {dateStr}
                                                    </span>
                                                )}
                                            </Link>

                                            {/* Desktop: original 3-column grid */}
                                            <div
                                                className="hidden lg:grid w-full gap-x-4 items-start"
                                                style={{ gridTemplateColumns: "1fr auto 1fr" }}
                                            >
                                                <span className="font-medium shrink-0 min-w-0">
                                                    {showLabel ? section.label : ""}
                                                </span>
                                                <Link
                                                    href={href}
                                                    className="contents hover:text-primary group hover:decoration-wavy hover:underline decoration-1"
                                                >
                                                    <span className="text-center shrink-0 tabular-nums min-w-0 group-hover:decoration-wavy group-hover:underline decoration-1">
                                                        {dateStr ?? "\u00A0"}
                                                    </span>
                                                    <span className="text-right min-w-0 group-hover:decoration-wavy group-hover:underline decoration-1">
                                                        {post.title}
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                };
                                return (
                                    <div key={section.id} className="flex flex-col">
                                        {renderPost(firstPost, true)}
                                        {restPosts.length > 0 && (
                                            <div className="flex flex-col gap-1 mt-1 max-lg:mt-0 max-lg:gap-0">
                                                {restPosts.map((post) =>
                                                    renderPost(post, false)
                                                )}
                                            </div>
                                        )}
                                        <div className="border-t border-primary/50 mt-2 pt-2" />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-auto w-full text-left self-start flex flex-col gap-1.5">
                            <h3 className="text-base sm:text-sm uppercase tracking-widest text-[rgba(0,0,0,0.75)] mix-blend-multiply">
                                AI-Use Statement
                            </h3>
                            <p className="text-xs sm:text-[0.7rem] leading-relaxed text-[rgba(0,0,0,0.8)] mix-blend-multiply not-italic">
                                In creating this personal website, I collaborated with Cursor and Claude to assist with web development and technical expertise. No written prose on the website or linked from the website was generated with AI.
                            </p>
                        </div>
                    </div>
                </Paper>

                <Bookshelf spines={spines} />

                <Paper id="rabbit-holes" pageNum="III" showHomeButton landscape>
                    <RabbitHolesContent />
                </Paper>
            </main>
        </div>
    );
}
