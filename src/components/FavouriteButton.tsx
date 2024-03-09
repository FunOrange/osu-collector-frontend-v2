"use client";
import { useUser } from "@/services/osu-collector-api-hooks";
import { HeartFill } from "react-bootstrap-icons";
import * as api from "@/services/osu-collector-api";
import { assocPath, concat, without } from "ramda";
import { useState } from "react";
import { match } from "ts-pattern";
import md5 from "md5";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatQueryParams } from "@/utils/string-utils";
import YouMustBeLoggedIn from "@/components/YouMustBeLoggedIn";
import { Collection } from "@/entities/Collection";
import { Tournament } from "@/entities/Tournament";

export type FavouriteButtonProps = {
  collection?: Collection;
  tournament?: Tournament;
  variant: "iconOnly" | "fullWidth";
};
export default function FavouriteButton({ collection, tournament, variant }: FavouriteButtonProps) {
  const { user, mutate } = useUser();
  const favourited = user?.favourites?.includes(collection.id) ?? false;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hovered, setHovered] = useState(false);

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
    .with("iconOnly", () => {
      const heartIconColor = match({ favourited, hovered })
        .with({ favourited: false, hovered: false }, () => "#64748b")
        .with({ favourited: false, hovered: true }, () => "#94a3b8")
        .with({ favourited: true, hovered: false }, () => "#f43f5e")
        .with({ favourited: true, hovered: true }, () => "#fda4af")
        .exhaustive();
      return (
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
      );
    })
    .with("fullWidth", () => {
      const { bg, fg } = match({ favourited, hovered })
        .with({ favourited: false, hovered: false }, () => ({ bg: "#334155", fg: "#cbd5e1" }))
        .with({ favourited: false, hovered: true }, () => ({ bg: "#db2777", fg: "#cbd5e1" }))
        .with({ favourited: true, hovered: false }, () => ({ bg: "#f472b6", fg: "#111827" }))
        .with({ favourited: true, hovered: true }, () => ({ bg: "#f9a8d4", fg: "#111827" }))
        .exhaustive();
      return (
        <button
          className="w-full p-3 text-center transition rounded hover:shadow-xl"
          style={{ background: bg, color: fg }}
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Favorite{favourited ? "d" : ""} ({collection.favourites})
        </button>
      );
    })
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
    return <YouMustBeLoggedIn>{favouriteButton}</YouMustBeLoggedIn>;
  }
}
