import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import Image from "next/image";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import { match } from "ts-pattern";

function ModeCounters({ collection }) {
  return (
    <div className="flex items-center gap-3">
      {(["osu", "taiko", "mania", "fruits"] as const).map((mode) => {
        const nonZero = collection.modes?.[mode] > 0;
        const src = match(mode)
          .with("osu", () => "/icons/mode-osu.png")
          .with("taiko", () => "/icons/mode-taiko.png")
          .with("mania", () => "/icons/mode-mania.png")
          .with("fruits", () => "/icons/mode-catch.png")
          .exhaustive();
        return (
          <div key={mode} className="flex items-center">
            <Image
              src={src}
              width={18}
              height={18}
              alt={mode}
              className={`mr-1 invert`}
              style={{ opacity: nonZero ? 0.9 : 0.2 }}
            />
            <div className={nonZero ? undefined : "text-gray-500"}>
              {collection.modes?.[mode] ?? 0}
            </div>
          </div>
        );
      })}
      {(collection.unsubmittedBeatmapCount > 0 || collection.unknownChecksums?.length > 0) && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center">
                <ExclamationTriangleFill className="mr-1" style={{ color: "#ffd966" }} />
                {(collection.unsubmittedBeatmapCount || 0) +
                  (collection.unknownChecksums?.length || 0)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {collection.unsubmittedBeatmapCount > 0 && (
                <div>{collection.unsubmittedBeatmapCount} unsubmitted</div>
              )}
              {collection.unknownChecksums?.length > 0 && (
                <div>{collection.unknownChecksums.length} processing</div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export default ModeCounters;
