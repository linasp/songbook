import { Song } from './types';

function convertToID(name: string) {
  // Helper function to check if a character is a letter or digit
  function isLetterOrDigit(char: string) {
    return /[a-zA-Z0-9]/.test(char);
  }

  let id = '';
  let previousCharIsDash = false;

  for (let i = 0; i < name.length; i++) {
    const char = name[i];

    if (isLetterOrDigit(char)) {
      // For uppercase letters, convert to lowercase
      if (/[A-Z]/.test(char)) {
        id += char.toLowerCase();
        previousCharIsDash = false;
      } else {
        id += char;
        previousCharIsDash = false;
      }
    } else {
      // For non-letter or non-digit characters
      if (!previousCharIsDash) {
        id += '-';
        previousCharIsDash = true;
      }
    }
  }

  // Remove any trailing dashes
  id = id.replace(/-+$/, '');

  return id;
}

function parseChordString(chordString: string): [string, number[]] {
  // Splitting the string at the '=' sign to get chord name and finger positions
  const [chordName, fingerPositions] = chordString.split('=');

  // Converting the finger positions string into an array of integers
  const fingerArray = fingerPositions.split('').map((char) => {
    if (char.toLowerCase() === 'x') {
      return -1; // Representing 'x' as -1 for simplicity
    }
    return parseInt(char, 10);
  });

  return [chordName, fingerArray];
}

export async function loadSongsFromGoogleDoc() {
  const GOOGLE_DOC_URL =
    'https://docs.google.com/document/d/e/2PACX-1vTnd3s7w4Fuj-Y7x0LCzxRu0NhDkcritth1LAIITv9j4Gz9NbpO2vW4Py7S2VrRFsD7tlvHBU_Pq_d2/pub';
  const response = await fetch(GOOGLE_DOC_URL);
  const txt = await response.text();
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(txt, 'text/html');
  let output = '';
  for (const p of htmlDoc.getElementsByTagName('p')) {
    output += p.textContent + '\n';
  }
  return output;
}

let didLoadSongs = false;
const songs: Song[] = [];

export async function loadSongs() {
  if (!didLoadSongs) {
    // Only read once and cache the result.
    const content = await loadSongsFromGoogleDoc();
    let currentSong = {} as Song;
    content.split('\n').forEach((line) => {
      if (line.startsWith('SONG:')) {
        // New song
        currentSong = {} as Song;
        currentSong.name = line.replace('SONG:', '').trim();
        currentSong.id = convertToID(currentSong.name);
        currentSong.content = [];
        currentSong.chords = {};
        currentSong.mode = 'guitar';
        currentSong.tags = [];
        songs.push(currentSong);
      } else if (line.startsWith('ARTIST:')) {
        currentSong.artist = line.replace('ARTIST:', '').trim();
      } else if (line.startsWith('MODE:')) {
        currentSong.mode = line.replace('MODE:', '').trim() as 'guitar' | 'ukulele';
      } else if (line.startsWith('CHORDS:')) {
        line
          .replace('CHORDS:', '')
          .trim()
          .split(' ')
          .forEach((c) => {
            try {
              const [chordName, fingerArray] = parseChordString(c);
              currentSong.chords[chordName] = fingerArray;
            } catch (err) {
              console.error(err);
            }
          });
      } else if (line.startsWith('TAGS:')) {
        currentSong.tags = line.replace('TAGS:', '').trim().split(' ');
      } else {
        if (currentSong) {
          currentSong.content.push(line.trim());
        }
      }
    });
    songs.sort((a, b) => a.name.localeCompare(b.name));
    didLoadSongs = true;
  }

  return songs;
}

export async function loadSongById({ params }: { params: any }) {
  const songs = await loadSongs();
  for (let i = 0; i < songs.length; i++) {
    if (songs[i].id === params.songId) {
      return songs[i];
    }
  }
  // Not found
  return null;
}
