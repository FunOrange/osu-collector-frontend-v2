"use client";

import { HeartFill } from "react-bootstrap-icons";

export interface FavouriteButtonProps {
  collection: any;
  iconOnly?: boolean;
}
export default function FavouriteButton({
  collection,
  iconOnly,
}: FavouriteButtonProps) {
  const user = undefined;
  const favourited = false;
  const onClick = () => {};
  const className = !user
    ? "grey-heart-disabled"
    : favourited
    ? "text-red-500"
    : "grey-heart-color";
  return (
    <div className="flex items-center gap-2">
      <HeartFill
        className="transition cursor-pointer text-slate-500 hover:text-slate-400"
        size={18}
        style={{ marginTop: "2px" }}
      />
      <div>{collection?.favourites}</div>
    </div>
  );
}
