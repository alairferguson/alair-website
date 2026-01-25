import Image from "next/image";
import Paper from "./components/Paper";

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans py-32">
            <main className="flex min-h-screen w-full max-w-xl flex-col items-center justify-between gap-16">
                <Paper>
                    <h1>Alair Ferguson Hautzinger</h1>
                    <p>
                        Email: alair@alairfergusonhautzinger.com
                        Phone: +1 (555) 555-5555
                        Website: https://alairfergusonhautzinger.com
                    </p>
                </Paper>
                <Paper>
                    <h1>About</h1>
                    <p>
                        Alair Ferguson Hautzinger is a software engineer and entrepreneur. He is the founder and CEO of Alair Ferguson Hautzinger. He is a software engineer and entrepreneur. He is the founder and CEO of Alair Ferguson Hautzinger. He is a software engineer and entrepreneur. He is the founder and CEO of Alair Ferguson Hautzinger.
                    </p>
                </Paper>
                <Paper>
                    <h1>Writing</h1>
                    <p>
                        How to build a website from scratch.
                        On fashion and stuff
                        On the future of work
                        On the future of work
                        On the future of work
                    </p>
                </Paper>
            </main>
        </div>
    );
}
