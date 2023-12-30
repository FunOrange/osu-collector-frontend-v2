import { Uploader } from "@/entities/Uploader";

export interface Tournament {
  id: number;
  name: string;
  description: string;
  uploader: Uploader;
  banner: string;
  dateUploaded:
    | string
    | {
        _seconds: number;
        _nanoseconds: number;
      };
}
