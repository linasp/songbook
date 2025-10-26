import './App.css';
import { useEffect, useRef, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { searchMatches, stringToPastelColor } from './utils';
import { Chords, Mode, Song } from './types';

function SongTag({ tag }: { tag: string }) {
  return (
    <span className="SongTag" style={{ backgroundColor: stringToPastelColor(tag) }}>
      {tag}
    </span>
  );
}

function SongIndexItem({
  song,
  addFilterTag,
}: {
  song: Song;
  addFilterTag: (tag: string) => void;
}) {
  const tags = song.tags
    ? song.tags.map((tag) => (
        <button key={tag} onClick={() => addFilterTag(tag)}>
          <SongTag tag={tag} />
        </button>
      ))
    : '';
  return (
    <li className="SongIndexItem">
      <span className="SongName">
        <Link to={`songs/${song.id}`}>{song.name}</Link>
      </span>
      <span className="SongArtist">{song.artist}</span>
      <span className="SongTags">{tags}</span>
    </li>
  );
}

export function SongsIndex() {
  const [filterTags, setFilterTags] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  function addFilterTag(tag: string) {
    if (!filterTags.has(tag)) {
      setFilterTags(new Set(filterTags).add(tag));
    }
  }
  function removeFilterTag(tag: string) {
    if (filterTags.has(tag)) {
      let newFilterTags = new Set(filterTags);
      newFilterTags.delete(tag);
      setFilterTags(newFilterTags);
    }
  }
  function updateSearchQuery(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(event.target.value);
  }
  const songs = useLoaderData() as Song[];
  const filters = [...filterTags].map((tag) => (
    <button key={tag} onClick={() => removeFilterTag(tag)}>
      <SongTag tag={tag} />
    </button>
  ));
  const items = [];
  for (let i = 0; i < songs.length; i++) {
    let shouldShow = true;
    // Search match
    if (!searchMatches(searchQuery, songs[i])) {
      shouldShow = false;
    }
    // Filter tags
    filterTags.forEach((tag) => {
      if (!songs[i].tags.includes(tag)) {
        shouldShow = false;
      }
    });
    if (shouldShow) {
      items.push(<SongIndexItem key={songs[i].id} song={songs[i]} addFilterTag={addFilterTag} />);
    }
  }
  return (
    <div className="SongsIndex">
      <div className="Controls">
        <div className="Search">
          <input
            id="songartistquery "
            aria-label="Search songs"
            placeholder="Song name, artist..."
            type="search"
            name="songartistquery"
            onChange={updateSearchQuery}
            value={searchQuery}
          />
        </div>
        <div className="Filters">{filters}</div>
      </div>
      <ul>{items}</ul>
    </div>
  );
}

function ScrollControls() {
  const [scrollSpeed, setScrollSpeed] = useState(0);
  useEffect(() => {
    let interval = setInterval(() => {
      if (scrollSpeed) {
        window.scrollBy(0, scrollSpeed);
      }
    }, 200);
    return () => {
      clearInterval(interval);
    };
  }, [scrollSpeed, setScrollSpeed]);
  return (
    <div className="AutoScroll">
      <button
        onClick={() => {
          setScrollSpeed(0);
          window.scrollTo(0, 0);
        }}
      >
        ⬆️
      </button>
      <button
        onClick={() => {
          setScrollSpeed(0);
        }}
      >
        🛑
      </button>
      <button
        onClick={() => {
          setScrollSpeed(scrollSpeed + 1);
        }}
      >
        ⏬
      </button>
    </div>
  );
}

function ChordDiagram({
  mode,
  chordName,
  fingerArray,
}: {
  mode: Mode;
  chordName: string;
  fingerArray: number[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fretBoardSize = 200;
  const padding = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext('2d')!;
    const fretHeight = 40;
    const numStringsToShow = mode === 'guitar' ? 6 : 4;
    const stringGap = mode === 'guitar' ? 35 : 50;
    const circleRadius = 10;

    // Draw fretboard (6 vertical lines)
    for (let i = 0; i < numStringsToShow; i++) {
      ctx.beginPath();
      ctx.moveTo(i * stringGap + padding, padding);
      ctx.lineTo(i * stringGap + padding, padding + 4 * fretHeight);
      ctx.stroke();
    }

    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(padding, padding + i * fretHeight);
      ctx.lineTo(padding + (numStringsToShow - 1) * stringGap, padding + i * fretHeight);
      ctx.stroke();
    }

    const fingerPositions = fingerArray.map((pos, index) => ({
      string: index + 1,
      fret: pos,
    }));

    fingerPositions.forEach((pos) => {
      if (pos.fret < 1) return;

      const x = (pos.string - 1) * stringGap + padding;
      const y = pos.fret * fretHeight;
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    });
  }, [fingerArray, mode]);

  return (
    <div className="ChordDiagram">
      <h3>{chordName}</h3>
      <canvas ref={canvasRef} width={fretBoardSize + padding} height={fretBoardSize} />
    </div>
  );
}

function ChordDiagrams({ chords, mode }: { chords: Chords; mode: Mode }) {
  return (
    <div className="ChordDiagrams">
      {Object.entries(chords).map(([c, f]) => (
        <ChordDiagram key={c} mode={mode} chordName={c} fingerArray={f} />
      ))}
    </div>
  );
}

function SongChord({ chord }: { chord: string }) {
  return (
    <span className="SongChord" style={{ color: stringToPastelColor(chord) }}>
      {chord}
    </span>
  );
}

function SongLine({ line }: { line: string }) {
  // TODO(linasp): refactor to something more pretty.
  if (!line) {
    return <span className="SongLine SongLineEmpty">&nbsp;</span>;
  }

  const chordRegex = /\[(.*?)\]/g;
  const chords = line.match(chordRegex);
  let parsedLine = [];

  if (!chords) {
    parsedLine = [line];
  } else {
    const parts = line.split(chordRegex);

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Non-chord part
        parsedLine.push(parts[i]);
      } else {
        // Chord part
        const chord = parts[i];
        parsedLine.push(<SongChord key={i} chord={chord} />);
      }
    }
  }

  if (typeof parsedLine[0] === 'string' && parsedLine[0].startsWith('//')) {
    parsedLine[0] = parsedLine[0].replace('//', '').trim();
    return <span className="SongLine SongLineComment">{parsedLine}</span>;
  }
  return <span className="SongLine">{parsedLine}</span>;
}

export function SongPage() {
  const song = useLoaderData() as Song;
  // TODO: refactor tags into a helper element.
  const tags = song.tags ? song.tags.map((tag) => <SongTag key={tag} tag={tag} />) : '';
  return (
    <div>
      <h1>
        <span className="SongName">{song.name}</span>
      </h1>
      <span className="SongArtist">{song.artist}</span>
      <span className="SongTags">{tags}</span>
      <ChordDiagrams mode={song.mode} chords={song.chords} />
      {song.content.map((line, index) => (
        <SongLine key={index} line={line} />
      ))}
      <ScrollControls />
    </div>
  );
}
