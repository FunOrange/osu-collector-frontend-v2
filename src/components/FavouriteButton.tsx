"use client";
import { useUser } from "@/services/osu-collector-api-hooks";
import { HeartFill } from "react-bootstrap-icons";
import * as api from "@/services/osu-collector-api";
import { assocPath, concat, without } from "ramda";
import { useState } from "react";
import { match } from "ts-pattern";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/shadcn/alert-dialog";
import { cn } from "@/utils/shadcn-utils";
import { buttonVariants } from "@/components/shadcn/button";
import Image from "next/image";
import md5 from "md5";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatQueryParams } from "@/utils/string-utils";

export interface FavouriteButtonProps {
  collection: any;
  variant: "iconOnly" | "fullWidth";
}
export default function FavouriteButton({ collection, variant }: FavouriteButtonProps) {
  const { user, mutate } = useUser();
  const favourited = user?.favourites?.includes(collection.id) ?? false;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hovered, setHovered] = useState(false);
  const heartIconColor = match({ favourited, hovered })
    .with({ favourited: false, hovered: false }, () => "#64748b")
    .with({ favourited: false, hovered: true }, () => "#94a3b8")
    .with({ favourited: true, hovered: false }, () => "#f43f5e")
    .with({ favourited: true, hovered: true }, () => "#fda4af")
    .exhaustive();
  const { bg, fg } = match({ favourited, hovered })
    .with({ favourited: false, hovered: false }, () => ({ bg: "#334155", fg: "#cbd5e1" }))
    .with({ favourited: false, hovered: true }, () => ({ bg: "#475569", fg: "#cbd5e1" }))
    .with({ favourited: true, hovered: false }, () => ({ bg: "#f472b6", fg: "#111827" }))
    .with({ favourited: true, hovered: true }, () => ({ bg: "#f9a8d4", fg: "#111827" }))
    .exhaustive();

  const onClick = async () => {
    if (!user) return;

    if (favourited) {
      await mutate(api.unfavouriteCollection(collection.id) as any, {
        optimisticData: (data) =>
          assocPath(
            ["user", "favourites"],
            without([collection.id], data.user.favourites ?? []),
            data
          ),
        populateCache: false,
      });
    } else {
      await mutate(api.favouriteCollection(collection.id) as any, {
        optimisticData: (data) =>
          assocPath(
            ["user", "favourites"],
            concat([collection.id], data.user.favourites ?? []),
            data
          ),
        populateCache: false,
      });
    }
  };

  const favouriteButton = match(variant)
    .with("iconOnly", () => (
      <div className="flex items-center gap-2">
        <HeartFill
          className="transition cursor-pointer fill-current"
          size={18}
          style={{ marginTop: "2px", color: heartIconColor }}
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
        <div>{collection?.favourites}</div>
      </div>
    ))
    .with("fullWidth", () => (
      <button
        className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600"
        style={{ background: bg, color: fg }}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Favorite{favourited ? "d" : ""} ({collection.favourites})
      </button>
    ))
    .exhaustive();

  if (user) {
    return favouriteButton;
  } else if (!user) {
    const clientId = process.env.NEXT_PUBLIC_OSU_CLIENT_ID;
    const callback = encodeURIComponent(process.env.NEXT_PUBLIC_OSU_OAUTH_CALLBACK);
    const oauthUrl = `https://osu.ppy.sh/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${callback}`;
    const otpLogin = () => {
      const x = md5(Date.now());
      localStorage.setItem("authX", x);
      const oauthUrlWithOtp = `${oauthUrl}&state=${x}`;
      const newWindow = window.open(oauthUrlWithOtp, "_blank", "noopener,noreferrer");
      if (newWindow) newWindow.opener = null;
      router.push(
        "/login/enterOtp?" +
          formatQueryParams({
            redirectTo: pathname + searchParams.toString() ? "?" + searchParams.toString() : "",
          })
      );
    };
    return (
      <>
        <AlertDialog>
          <AlertDialogTrigger asChild>{favouriteButton}</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>You must be logged in to do that</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="flex gap-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <a
                className="flex items-center gap-2 py-1 pl-2 pr-4 font-semibold transition bg-indigo-500 rounded cursor-pointer text-indigo-50 hover:bg-indigo-600"
                {...match(process.env.NODE_ENV)
                  // .with("production", () => ({
                  //   href: oauthUrl,
                  //   target: "_blank",
                  // }))
                  .otherwise(() => ({
                    onClick: otpLogin,
                  }))}
              >
                <Image width={32} height={32} src="/icons/osu-32x32.png" alt="osu!" />
                <div className="whitespace-nowrap">Log in with osu!</div>
              </a>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
}
