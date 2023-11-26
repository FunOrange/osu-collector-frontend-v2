import Image from "next/image";
import { match } from "ts-pattern";

function ModeCounters({ collection }) {
  return (
    <div className="flex items-center">
      {(["osu", "taiko", "mania", "fruits"] as const).map((mode) => {
        const nonZero = collection.modes?.[mode] > 0;
        const src = match(mode)
          .with("osu", () => "/icons/mode-osu.png")
          .with("taiko", () => "/icons/mode-taiko.png")
          .with("mania", () => "/icons/mode-mania.png")
          .with("fruits", () => "/icons/mode-catch.png")
          .exhaustive();
        return (
          <div key={mode} className="flex items-center mr-3">
            <Image
              src={src}
              width={18}
              height={18}
              alt={mode}
              className={`mr-1 invert`}
              style={{ opacity: nonZero ? 0.9 : 0.2 }}
            />
            <div className={nonZero ? undefined : "text-gray-500"}>
              {collection.modes[mode] ?? 0}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ModeCounters;
