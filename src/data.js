function convertToID(name) {
  // Helper function to check if a character is a letter or digit
  function isLetterOrDigit(char) {
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

function parseChordString(chordString) {
  // Splitting the string at the '=' sign to get chord name and finger positions
  const [chordName, fingerPositions] = chordString.split('=');

  // Converting the finger positions string into an array of integers
  const fingerArray = fingerPositions.split('').map(char => {
      if (char.toLowerCase() === 'x') {
          return -1; // Representing 'x' as -1 for simplicity
      }
      return parseInt(char, 10);
  });

  return [chordName, fingerArray];
}


export async function loadSongsFromLocal() {
  return (await fetch("/songs.txt")).text();
}

export async function loadSongsFromGoogleDoc() {
  const GOOGLE_DOC_URL = "https://docs.google.com/document/d/e/2PACX-1vTnd3s7w4Fuj-Y7x0LCzxRu0NhDkcritth1LAIITv9j4Gz9NbpO2vW4Py7S2VrRFsD7tlvHBU_Pq_d2/pub";
  const response = await fetch(GOOGLE_DOC_URL);
  const txt = await response.text();
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(txt, 'text/html');
  var output = "";
  for (const p of htmlDoc.getElementsByTagName('p')) {
    output += p.textContent + "\n";
  }
  return output;
}

var songs = null;

export async function loadSongs() {
    if (songs === null) {
      // Only read once and cache the result.
      const content = await loadSongsFromGoogleDoc();
      // TODO: check for error conditions
      console.log(content);
      songs = [];
      var currentSong = null;
      content.split("\n").forEach((line) => {
        if (line.startsWith("SONG:")) {
          // New song
          currentSong = {};
          currentSong.name = line.replace("SONG:", "").trim();
          currentSong.id = convertToID(currentSong.name);
          currentSong.content = [];
          currentSong.chords = new Map();
          currentSong.mode = null;
          currentSong.tags = [];
          songs.push(currentSong);
        } else if (line.startsWith("ARTIST:")) {
          currentSong.artist = line.replace("ARTIST:", "").trim();
        } else if (line.startsWith("MODE:")) {
          currentSong.mode = line.replace("MODE:", "").trim();      
        } else if (line.startsWith("CHORDS:")) {
          line.replace("CHORDS:", "").trim().split(" ").forEach((c) => {
            try {
              const [chordName, fingerArray] = parseChordString(c);
              currentSong.chords[chordName] = fingerArray;
            }
            catch (err) {
              console.log(err);
            }
          });
        } else if (line.startsWith("TAGS:")) {
          currentSong.tags = line.replace("TAGS:", "").trim().split(" "); 
        } else {
          if (currentSong) {
            currentSong.content.push(line.trim());
          }
        }
      });
    }
    return songs;
  }

  export async function loadSongById({params}) {
    const songs = await loadSongs();
    for (var i = 0; i < songs.length; i++) {
        if (songs[i].id === params.songId) {
            return songs[i];
        }
    }
    // Not found
    return null;
  }