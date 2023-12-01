"use client";
import { useUser } from "@/services/osu-collector-api-hooks";
import { HeartFill } from "react-bootstrap-icons";
import * as api from "@/services/osu-collector-api";
import { assocPath, concat, without } from "ramda";
import { useState } from "react";
import { match } from "ts-pattern";

export interface FavouriteButtonProps {
  collection: any;
  variant: "iconOnly" | "fullWidth";
}
export default function FavouriteButton({ collection, variant }: FavouriteButtonProps) {
  const { user, mutate } = useUser();
  const favourited = user?.favourites?.includes(collection.id) ?? false;

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

  if (variant === "iconOnly") {
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
  } else if (variant === "fullWidth") {
    return (
      <button
        className="w-full p-3 text-center transition rounded bg-slate-700 hover:shadow-xl hover:bg-slate-600"
        style={{ background: bg, color: fg }}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Favorite{favourited ? "d" : ""} ({collection.favourites})
      </button>
    );
  }
}
