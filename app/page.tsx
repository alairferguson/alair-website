import Image from "next/image";
import Paper from "./components/Paper";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-body py-32">
            <main className="flex min-h-screen w-full max-w-xl flex-col items-center justify-between gap-16">
                <Paper>
                    <Image src="/seal.png" alt="Ferguson Seal" width={200} height={200} />
                    <h1 className="text-center font-heading">
                        <span className="block text-7xl italic text-[#910A07]">ALAIR</span>
                        <span className="block text-3xl tracking-wide not-italic">FERGUSON</span>
                        <span className="block text-3xl tracking-wide not-italic">HAUTZINGER</span>
                    </h1>
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
