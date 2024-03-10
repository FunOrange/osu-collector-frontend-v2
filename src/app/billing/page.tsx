import CollectionCard from "@/components/CollectionCard";
import MoreResultsButton from "@/components/MoreResultsButton";
import { Button } from "@/components/shadcn/button";
import Image from "next/image";
import Link from "next/link";
import { Stars } from "react-bootstrap-icons";

interface BillingPageProps {}
export default async function BillingPage({}: BillingPageProps) {
  return (
    <div className="flex justify-center w-full mt-8 mb-16">
      <div className="flex flex-col gap-10">
        <div>
          <div className="mb-1 text-lg text-white">Billing</div>
          <div className="text-sm">
            For inquiries please message FunOrange in the{" "}
            <a href="https://discord.gg/WZMQjwF5Vr" className="text-blue-500">
              osu!Collector discord
            </a>
            . Alternatively you can send an email to{" "}
            <a href="mailto:funorange@osucollector.com" className="text-blue-500">
              funorange@osucollector.com
            </a>
            .
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-full max-w-screen-lg">
            <h1 className="text-2xl">Twitch Sub</h1>
            <div className="text-sm text-slate-400">
              An osu!Collector subscription can be obtained by subbing to FunOrange on Twitch.
              Existing Twitch Prime users can use a <span className="text-white">prime sub</span>{" "}
              for no additional cost.
            </div>
          </div>

          <div className="grid grid-cols-3 px-5 py-6 rounded bg-slate-700 gap-y-5">
            <div>
              <div className="mb-1 text-xs text-slate-400">TWITCH ACCOUNT</div>
              <Button
                size="sm"
                variant="important"
                className="font-bold text-white h-7 bg-cyan-600"
              >
                Link Twitch account
              </Button>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-400">STATUS</div>
              <div className="text-lg">-</div>
            </div>
            <div />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-full max-w-screen-lg">
            <h1 className="text-2xl">PayPal</h1>
          </div>

          <div className="rounded bg-slate-700">
            <div className="border-b border-slate-600">
              <div className="flex items-center justify-between px-5 py-3">
                <div className="text-lg">Current Plan</div>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="important"
                    className="font-bold text-white h-7 bg-cyan-600"
                  >
                    Subscribe
                  </Button>
                  {/* <Button size="sm" className="h-7">
                    Cancel subscription
                  </Button> */}
                </div>
              </div>
            </div>
            <div className="px-5 py-6">
              <div className="grid grid-cols-3 gap-y-5">
                <div>
                  <div className="mb-1 text-xs text-slate-400">STATUS</div>
                  <div className="text-lg">-</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-slate-400">BILLING CYCLE</div>
                  <div className="text-lg">-</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-slate-400">PLAN COST</div>
                  <div className="text-lg">-</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-slate-400">REFERENCE #</div>
                  <div className="text-lg">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-full max-w-screen-lg">
            <h1 className="text-2xl">Credit Card</h1>
            <div className="text-sm text-slate-400">
              Credit card payments are powered by Stripe.
            </div>
          </div>

          <div className="rounded bg-slate-700">
            <div className="border-b border-slate-600">
              <div className="flex items-center justify-between px-5 py-3">
                <div className="text-lg">Current Plan</div>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="important"
                    className="font-bold text-white h-7 bg-cyan-600"
                  >
                    Subscribe
                  </Button>
                  {/* <Button size="sm" className="h-7">
                    Cancel subscription
                  </Button> */}
                </div>
              </div>
            </div>
            <div className="px-5 py-6">
              <div className="grid grid-cols-3 gap-y-5">
                <div>
                  <div className="mb-1 text-xs text-slate-400">STATUS</div>
                  <div className="text-lg">-</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-slate-400">BILLING CYCLE</div>
                  <div className="text-lg">-</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-slate-400">PLAN COST</div>
                  <div className="text-lg">-</div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-slate-400">REFERENCE #</div>
                  <div className="text-lg">-</div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded bg-slate-700">
            <div className="border-b border-slate-600">
              <div className="px-5 py-3 text-lg">Payment Method</div>
            </div>
            <div className="flex justify-between w-full p-5">
              <div className="flex items-start gap-3">
                <Image
                  src="/icons/credit-cards/mastercard.png"
                  alt="mastercard"
                  width={64}
                  height={40}
                />
                <div>
                  <div>Mastercard</div>
                  <div>**** **** **** 4002</div>
                  <div className="text-xs text-slate-400">Expiry on 20/2024</div>
                </div>
              </div>
              <div className="ml-6">
                <Button size="sm">Change</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-full max-w-screen-lg">
            <h1 className="text-2xl">Transactions</h1>
            <div className="text-sm text-slate-400">
              All successful PayPal/credit card payments made through osu!Collector are shown below.
              <br />
              For users who have subscribed through Twitch, please refer to your Twitch dashboard
              for payment history.
            </div>
          </div>

          <div>
            <div className="grid flex-col grid-cols-3 px-5 mb-4 text-sm text-slate-500">
              <div>Date</div>
              <div>Payment Method</div>
              <div>Amount (USD)</div>
            </div>
            <div className="flex flex-col gap-1">
              {new Array(10).fill(0).map((_, i) => (
                <div key={i} className="grid grid-cols-3 px-5 py-3 rounded bg-slate-700">
                  <div>3/9/2024</div>
                  <div>PayPal - funorange42@yahoo.ca</div>
                  <div>$1.99</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
