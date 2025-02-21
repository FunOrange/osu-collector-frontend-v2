import { Tournament } from '@/entities/Tournament';

export const mappoolTemplate = `# Lines beginning with '#' are ignored

# ⚠️ Make sure links are in order 
# eg. from top to bottom these are: NM1, NM2, NM3, NM4

[qualifiers.NM]
https://osu.ppy.sh/beatmapsets/1598211#osu/3264035
https://osu.ppy.sh/beatmapsets/1257558#osu/2613136
https://osu.ppy.sh/beatmapsets/1537691#osu/3144020
https://osu.ppy.sh/beatmapsets/1306570#osu/2823535

# ⚠️ You can also provide beatmap IDs instead of the full URL
# https://osu.ppy.sh/beatmapsets/1306570#osu/2823535 👈 only the last number!!!

[qualifiers.HD]
3263097
3263174

[qualifiers.HR]



[qualifiers.DT]



[qualifiers.FM]


# ⚠️ Feel free to add or remove sections as you please


[round of 16.NM]





[round of 16.HD]



[round of 16.HR]



[round of 16.DT]




[round of 16.FM]



[round of 16.TB]




[quarterfinals.NM]







[quarterfinals.HD]




[quarterfinals.HR]




[quarterfinals.DT]





[quarterfinals.FM]




[quarterfinals.TB]




[semifinals.NM]







[semifinals.HD]




[semifinals.HR]




[semifinals.DT]





[semifinals.FM]




[semifinals.TB]




[finals.NM]







[finals.HD]




[finals.HR]




[finals.DT]





[finals.FM]




[finals.TB]


[grand finals.NM]







[grand finals.HD]




[grand finals.HR]




[grand finals.DT]





[grand finals.FM]




[grand finals.TB]
`;

export function parseMappool(text: string) {
  const lines = text
    .split('\n')
    .filter((line) => line.trim().length > 0) // filter blank lines
    .filter((line) => !/^#/.test(line)); // filter comments

  const sectionRegex = /^\s*\[(.+)\.(.+)\]\s*$/;
  const urlRegex1 = /^https:\/\/osu\.ppy\.sh\/beatmapsets\/.+\/(\d+)/;
  const urlRegex2 = /^https:\/\/osu\.ppy\.sh\/b\/(\d+)/;
  const urlRegex3 = /^https:\/\/osu\.ppy\.sh\/beatmaps\/(\d+)/;
  const beatmapIdRegex = /^(\d+)\s*$/;

  const rounds = [];
  let roundString = null;
  let modString = null;
  for (const line of lines) {
    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      roundString = sectionMatch[1];
      modString = sectionMatch[2];
      continue;
    }

    const beatmapId =
      line.match(urlRegex1)?.[1] ||
      line.match(urlRegex2)?.[1] ||
      line.match(urlRegex3)?.[1] ||
      line.match(beatmapIdRegex)?.[1] ||
      null;

    if (beatmapId && roundString && modString) {
      // add round to mappool if it hasn't been added yet
      let roundIndex = rounds.findIndex((_round) => _round.round === roundString);
      if (roundIndex < 0) {
        roundIndex = rounds.length;
        rounds.push({
          round: roundString,
          mods: [],
        });
      }

      // add round.mod to mappool if it hasn't been added yet
      const round = rounds[roundIndex];
      let modIndex = round.mods.findIndex((_mod) => _mod.mod === modString);
      if (modIndex < 0) {
        modIndex = round.mods.length;
        round.mods.push({
          mod: modString,
          maps: [],
        });
      }

      // add beatmap to mappool
      // @ts-ignore
      rounds[roundIndex].mods[modIndex].maps.push(Number(beatmapId));
      continue;
    }

    // line doesn't match any pattern
    return { rounds: null, error: { line } };
  }
  return { rounds: rounds, error: null };
}

export function getMappoolTextFromTournament(tournament: Tournament) {
  const lines = [];
  for (const round of tournament.rounds) {
    for (const mod of round.mods) {
      const section = `[${round.round}.${mod.mod}]`;
      lines.push(section);
      for (const map of mod.maps) {
        lines.push(`https://osu.ppy.sh/beatmaps/${map.id}`);
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}
