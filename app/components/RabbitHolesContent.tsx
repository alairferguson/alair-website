import GraphPaper from "./GraphPaper";
import PaperPatch from "./PaperPatch";
import PhotoStack from "./PhotoStack";
import { RABBIT_HOLES } from "@/lib/rabbit-holes";

export default function RabbitHolesContent() {
    return (
        <div className="h-full w-full flex flex-col justify-start items-center min-h-0">
            <GraphPaper className="flex-1 w-full h-full">
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
