"use client";
import UploadCollectionModal from "@/components/UploadCollectionModal";
import YouMustBeLoggedIn from "@/components/YouMustBeLoggedIn";
import { Button } from "@/components/shadcn/button";
import { useUser } from "@/services/osu-collector-api-hooks";
import { CloudUploadFill } from "react-bootstrap-icons";

export interface UploadButtonProps {}
export default function UploadButton({}: UploadButtonProps) {
  const { user } = useUser();
  if (!user) {
    return (
      <YouMustBeLoggedIn>
        <Button variant="important" className="gap-2">
          <CloudUploadFill size={20} className="mt-1" />
          Upload
        </Button>
      </YouMustBeLoggedIn>
    );
  } else if (user) {
    return (
      <UploadCollectionModal>
        <Button variant="important" className="gap-2">
          <CloudUploadFill size={20} className="mt-1" />
          Upload
        </Button>
      </UploadCollectionModal>
    );
  }
}
