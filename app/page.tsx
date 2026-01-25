import Image from "next/image";
import Paper from "./components/Paper";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans py-32">
            <main className="flex min-h-screen w-full max-w-xl flex-col items-center justify-between gap-16">
                <Paper>
                    <Image src="/seal.png" alt="Ferguson Seal" width={200} height={200} />
                    <h1 className="text-2xl font-heading italic">Alair Ferguson Hautzinger</h1>
                    <ol className="list-none list-inside text-center">
                        <li>I. About</li>
                        <li>II. Writing</li>
                        <li>III. Rabbit Holes</li>
                    </ol>
                </Paper>
            </main>
        </div>
    );
}
