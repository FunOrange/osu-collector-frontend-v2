"use client";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Tournament } from "@/entities/Tournament";
import * as api from "@/services/osu-collector-api";
import { useEffect, useState } from "react";
import mappoolTemplate from "@/app/tournaments/upload/mappoolTemplate";
import Image from "next/image";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";

interface TournamentsPageProps {
  tournament?: Tournament;
}
export default function TournamentsPage({ tournament }: TournamentsPageProps) {
  const title = tournament ? "Edit tournament" : "Create tournament";

  const [organizer, setOrganizer] = useState("");
  const [organizers, setOrganizers] = useState([]);
  const [mappoolText, setMappoolText] = useState(tournament === null ? "" : mappoolTemplate);
  const addOrganizer = () => {
    setOrganizer("");
    const organizerId = Number(organizer);
    if (!organizers.includes(organizerId)) {
      setOrganizers((organizers) => organizers.concat(organizerId));
    }
  };

  useEffect(() => {
    const tournamentDraft = JSON.parse(localStorage.getItem("Create Tournament Draft"));
    if (tournamentDraft?.organizers) setOrganizers(tournamentDraft?.organizers);
    if (tournamentDraft?.mappoolText) setMappoolText(tournamentDraft?.mappoolText);
  }, []);

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-screen-lg p-4 m-5 rounded bg-slate-700 md:p-7">
        <h1 className="mb-6 text-3xl">{title}</h1>

        <div className="flex flex-col mb-6 gap-y-4">
          <div>
            <Label htmlFor="tournament-name">Tournament name</Label>
            <Input
              className="border-transparent focus:border-transparent focus:ring-0"
              type="text"
              id="tournament-name"
            />
          </div>

          <div>
            <Label htmlFor="tournament-link">Tournament forum post URL </Label>
            <Input
              type="text"
              id="tournament-link"
              placeholder="https://osu.ppy.sh/community/forums/topics/..."
            />
          </div>

          <div>
            <Label htmlFor="banner-url">
              Banner URL{" "}
              <span className="text-sm text-slate-500">only https://i.ppy.sh allowed</span>
            </Label>
            <Input type="text" id="banner-url" placeholder="https://i.ppy.sh/..." />
            <div className="text-sm text-slate-500">
              You can get the banner URL by going to the tournament forum page, right clicking the
              banner image, and clicking &quot;Copy image address&quot;
            </div>
          </div>

          <div>
            <Label htmlFor="mappool-download-url">
              Mappool Download URL <span className="text-sm text-slate-500">Optional</span>
            </Label>
            <Input type="text" id="mappool-download-url" />
          </div>

          <div>
            <div className="pb-1">Tournament Organizers</div>
            <div className="flex">
              <div className="flex mr-4">
                <Input
                  disabled
                  value="https://osu.ppy.sh/users/"
                  className="w-[185px] pr-0 border-none rounded-none rounded-s rounded-e-0"
                />
                <Input
                  placeholder="123456"
                  value={organizer}
                  className="z-10 w-20 rounded-none"
                  // onKeyPress={organizerKeyPress}
                  // onChange={(e) => {
                  //   const value = e.target.value.trim();
                  //   setOrganizer(value);
                  //   if (value === "" || /^\d+$/.test(value)) {
                  //     setOrganizerError("");
                  //   } else {
                  //     setOrganizerError("Invalid user ID");
                  //   }
                  // }}
                />
                <Button
                  // disabled={organizerError}
                  className="rounded-none rounded-e rounded-s-0"
                  onClick={addOrganizer}
                >
                  Add
                </Button>
                {/* <Form.Control.Feedback type="invalid">
                  <span style={{ paddingLeft: 208 }}>{organizerError}</span>
                </Form.Control.Feedback> */}
              </div>
              {organizers.map((organizerId) => (
                <div className="flex mr-2" key={organizerId}>
                  <div
                    onClick={() =>
                      setOrganizers((organizers) => organizers.filter((id) => id !== organizerId))
                    }
                    className="w-9"
                  >
                    <Image
                      unoptimized
                      src={`https://a.ppy.sh/${organizerId}`}
                      alt="User profile picture"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-500">
              Optional: Organizers have permission to make changes to this tournament
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              // value={value}
              // onChange={(e) => setUserInput(e.target.value)}
              autoFocus
              style={{ minHeight: "100px" }}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-2xl">Mappool</h2>
          <div className="text-sm text-slate-500">
            A mappool template is provided below. Please modify it to include the maps in the
            tournament.
          </div>
          <Textarea
            rows={mappoolText.split(/\r\n|\r|\n/).length}
            value={mappoolText}
            // onChange={(e) => setUserInput(e.target.value)}
            autoFocus
            style={{ minHeight: "100px" }}
          />
        </div>
      </div>
    </div>
  );
}
