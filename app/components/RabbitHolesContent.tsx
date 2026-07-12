import GraphPaper from "./GraphPaper";
import PaperPatch from "./PaperPatch";
import PaperTexture from "./PaperTexture";
import PhotoStack from "./PhotoStack";
import Tape from "./Tape";
import { RABBIT_HOLES } from "@/lib/rabbit-holes";

export default function RabbitHolesContent() {
    return (
        <div className="h-full max-lg:h-auto w-full flex flex-col justify-start items-center min-h-0">
            {/* Mobile: content-sized graph paper so stacks never clip */}
            <div className="relative w-full graph-paper lg:hidden overflow-hidden">
                <PaperTexture />
                <Tape position="top" size="4rem" />
                <Tape position="bottom" size="4rem" />

                <div className="relative z-[1] flex flex-col items-center gap-8 px-4 py-8">
                    <PaperPatch>
                        <h2 className="text-center font-heading mix-blend-multiply uppercase text-2xl tracking-wide">
                            Rabbit Holes
                        </h2>
                    </PaperPatch>
                    {RABBIT_HOLES.map((hole) => (
                        <PhotoStack
                            key={hole.slug}
                            slug={hole.slug}
                            title={hole.title}
                            images={hole.images}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop: original snapped graph paper with absolute scatter */}
            <GraphPaper className="hidden lg:flex flex-1 w-full h-full">
                <div className="relative h-full w-full">
                    <div className="relative z-[1] flex justify-center pt-8">
                        <PaperPatch>
                            <h2 className="text-center font-heading mix-blend-multiply uppercase text-3xl tracking-wide whitespace-nowrap">
                                Rabbit Holes
                            </h2>
                        </PaperPatch>
                    </div>

                    <div className="absolute inset-0 z-[2]">
                        {RABBIT_HOLES.map((hole) => (
                            <PhotoStack
                                key={hole.slug}
                                slug={hole.slug}
                                title={hole.title}
                                images={hole.images}
                                className="absolute"
                                style={hole.position}
                            />
                        ))}
                    </div>
                </div>
            </GraphPaper>
        </div>
    );
}
