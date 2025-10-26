export type Mode = 'guitar' | 'ukulele';
export type Chords = { [chordName: string]: number[] };

export type Song = {
  id: string;
  name: string;
  artist: string;
  chords: Chords;
  tags: string[];
  content: string[];
  mode: Mode;
}