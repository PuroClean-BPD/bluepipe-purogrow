import { calendarDate } from "./owner-rules";

// Staff-only preview grouping: names and slugs only, never contact details or codes.
export const OWNER_GROUPS: { name: string; slugs: string[] }[] = [
  { name: "Christian Carpico", slugs: ["doylestown-pa", "lansdale-pa", "plymouth-meeting-pa"] },
  { name: "Brock Phillips", slugs: ["terre-haute-in"] },
  { name: "Chris Sanford", slugs: ["rhode-island"] },
  { name: "Dennis O'Brien", slugs: ["springfield-va", "sterling-va", "warrenton-va"] },
  { name: "Frank Greenwood", slugs: ["wakefield-ma"] },
  { name: "Jonathan Beever", slugs: ["kingston-ny", "poughkeepsie-ny"] },
  { name: "Josh Nelson", slugs: ["south-reno-nv"] },
  { name: "Jennifer Wine", slugs: ["burlington-wi"] },
  { name: "Kelly Baker", slugs: ["south-asheville-nc"] },
  { name: "Tyler Sunshine", slugs: ["king-of-prussia-pa"] },
  { name: "Lindsay Russell", slugs: ["charleston-sc"] },
  { name: "Michael Keppner", slugs: ["metairie-la"] },
  { name: "Nigel Belgrave", slugs: ["auburn-ma", "natick-ma"] },
  { name: "Nick Ondrejka", slugs: ["san-rafael-ca"] },
  { name: "Osagie Enodunmwenben", slugs: ["appleton-wi"] },
  { name: "Paul Reiss", slugs: ["caseyville-il"] },
  { name: "Steve Marceau", slugs: ["shelby-township-mi"] },
  { name: "Ted Porter", slugs: ["lanham-md"] },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function parts(value: string) {
  const [m, d, y] = calendarDate(value).split("/").map(Number);
  return { m, d, y };
}

export function ownerPeriodLabel(start: string, end: string, version: number) {
  const a = parts(start), b = parts(end);
  const left = `${MONTHS[a.m - 1]} ${a.d}${a.y !== b.y ? `, ${a.y}` : ""}`;
  return `${left} – ${MONTHS[b.m - 1]} ${b.d}, ${b.y} · v${version}`;
}
