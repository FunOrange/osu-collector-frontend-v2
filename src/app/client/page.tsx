import CollectionCard from "@/components/CollectionCard";
import { Button } from "@/components/shadcn/button";
import {
  getMetadata,
  getPopularCollections,
  getRecentCollections,
} from "@/services/osu-collector-api";
import Image from "next/image";
import Link from "next/link";
import { Discord, Fire, HeartFill, Stars, Twitch } from "react-bootstrap-icons";

export default async function DesktopClientPage() {
  return (
    <div className="flex flex-col gap-12">
      <div className="w-full py-20 text-4xl text-center bg-black">
        Support us to gain access to these features!
      </div>

      <div className="flex justify-center w-full py-16">
        <div className="flex items-center justify-center w-full gap-16">
          <div className="max-w-xl text-center">
            <div className="text-4xl font-semibold text-slate-50">Download entire collections</div>
            <div className="mb-4 text-lg text-slate-400">osu!Collector Desktop feature</div>
            <div className="text-lg text-slate-400">
              Download all the beatmaps in a collection with one click.
            </div>
            <div className="text-lg text-slate-400">
              Downloads are hosted on our own servers.
              <br />
              No rate limits, stupid fast download speeds.
            </div>
          </div>
          <Image width={624} height={455} src="/images/downloads.png" alt="Download collections" />
        </div>
      </div>

      <div className="flex justify-center w-full py-16">
        <div className="flex items-center justify-center w-full gap-16">
          <Image width={624} height={345} src="/images/import.png" alt="Download collections" />
          <div className="max-w-xl text-center">
            <div className="text-4xl font-semibold text-slate-50">Import collections</div>
            <div className="mb-4 text-lg text-slate-400">osu!Collector Desktop feature</div>
            <div className="text-lg text-slate-400">
              Directly add collections to osu! with the click of a button
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center w-full py-16">
        <div className="flex items-center justify-center w-full gap-24">
          <div className="max-w-xl text-center">
            <div className="mb-2 text-4xl font-semibold text-slate-50 whitespace-nowrap">
              Offload server costs
            </div>
            <div className="text-lg text-slate-400 ">
              I had to find some way to monetize this project so that it could continue running on
              its own. I figured something in similar vein to osu! supporter would be the best
              approach. Any support you give us is greatly appreciated!
            </div>
          </div>
          <HeartFill className="text-pink-500" style={{ width: "250px", height: "300px" }} />
        </div>
      </div>

      <div className="flex flex-col items-center w-full gap-8 py-16 bg-slate-800">
        <div className="w-full max-w-6xl p-6 rounded bg-slate-700">
          <div className="mb-2">
            <div className="text-2xl font-semibold text-slate-50 whitespace-nowrap">
              Download osu!Collector Desktop
            </div>
            <div className="text-pink-400">Thank you for supporting us! You are awesome.</div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-slate-800" variant="important">
              Windows 64-bit
            </Button>
            <Button className="bg-slate-800" variant="important">
              Linux x64 .deb
            </Button>
          </div>
        </div>

        <div className="w-full max-w-6xl p-6 rounded">
          <h2 className="text-2xl text-center">Two ways to support us!</h2>
          <div className="mb-2 text-center">
            Please note that supporting us with both methods at the same time{" "}
            <b>will not extend your supporter status!</b> Please use only one method.
          </div>

          <div className="grid w-full grid-cols-2 gap-2">
            <div className="w-full p-6 rounded bg-slate-700">
              <div className="text-xl">
                Option 1: <span className="italic">free with Twitch Prime</span>
                <Twitch className="inline ml-2 text-purple-500" size={24} />
              </div>
            </div>

            <div className="w-full p-6 rounded bg-slate-700">
              <div className="text-xl">Option 2: PayPal or credit card</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
