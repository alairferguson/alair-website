import Link from "next/link";
import { notFound } from "next/navigation";
import Paper from "@/app/components/Paper";
import { getRabbitHole, getRabbitHoleSlugs } from "@/lib/rabbit-holes";

type PageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return getRabbitHoleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const hole = getRabbitHole(slug);
    return {
        title: hole ? `${hole.title} | Rabbit Holes | Alair` : "Rabbit Holes | Alair",
    };
}

export default async function RabbitHolePage({ params }: PageProps) {
    const { slug } = await params;
    const hole = getRabbitHole(slug);

    if (!hole) {
        notFound();
    }

    return (
        <div className="flex min-h-dvh box-border items-center justify-center font-body p-10">
            <main className="flex min-h-full w-full max-w-4xl flex-col items-center justify-between gap-16">
                <Paper showHomeButton homeButtonLink="/#rabbit-holes" landscape>
                    <div className="h-full w-full flex flex-col justify-start items-center gap-4 md:gap-8 min-h-0">
                        <h1 className="text-center font-heading mix-blend-multiply uppercase text-3xl tracking-wide">
                            {hole.title}
                        </h1>

                        <p className="text-xl sm:text-base text-[rgba(0,0,0,0.6)] mix-blend-multiply text-center">
                            Coming soon.
                        </p>

                        <p className="text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply text-left self-start mt-4">
                            <Link
                                href="/#rabbit-holes"
                                className="hover:text-primary hover:decoration-wavy hover:underline decoration-1"
                            >
                                ← Back to Rabbit Holes
                            </Link>
                        </p>
                    </div>
                </Paper>
            </main>
        </div>
    );
}
