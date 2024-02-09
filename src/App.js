import './App.css';
import { useEffect, useRef, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { searchMatches, stringToPastelColor } from "./utils";

function SongTag({tag}) {
  return <span className="SongTag" style={{backgroundColor: stringToPastelColor(tag)}}>{tag}</span>;
}

function SongIndexItem({song, addFilterTag}) {
  const tags = song.tags ? song.tags.map((tag) => 
    <button key={tag} onClick={() => addFilterTag(tag)}>
      <SongTag tag={tag} />
    </button>) : "";
  return (
    <li className="SongIndexItem">
      <span className="SongName"><Link to={`songs/${song.id}`}>{song.name}</Link></span>
      <span className="SongArtist">{song.artist}</span>
      <span className="SongTags">{tags}</span>
    </li>
  );
}

export function SongsIndex() {
  const [filterTags, setFilterTags] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  function addFilterTag(tag) {
    if (!filterTags.has(tag)) {
      setFilterTags(new Set(filterTags).add(tag));
    }
  }
  function removeFilterTag(tag) {
    if (filterTags.has(tag)) {
      let newFilterTags = new Set(filterTags);
      newFilterTags.delete(tag);
      setFilterTags(newFilterTags);
    }
  }
  function updateSearchQuery(event) {
    setSearchQuery(event.target.value);
  }
  const songs = useLoaderData();
  const filters = [...filterTags].map(tag =>
    <button key={tag} onClick={() => removeFilterTag(tag)}>
      <SongTag tag={tag} />
    </button>
  );
  const items = [];
  for (let i = 0; i < songs.length; i++) {
    let shouldShow = true;
    // Search match
    if (!searchMatches(searchQuery, songs[i])) {
      shouldShow = false;
    }
    // Filter tags
    filterTags.forEach(tag => {
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
      <div className='Controls'>
        <div className='Search'>
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
        <div className='Filters'>
          {filters}
        </div>
      </div>
      <ul>
        {items}
      </ul>
    </div>
  );
}

function ScrollControls() {
  const [scrollSpeed, setScrollSpeed] = useState(0);
  useEffect(() => {
    let interval = setInterval(() => {if (scrollSpeed) { window.scrollBy(0, scrollSpeed) }}, 200);
    return () => {
      clearInterval(interval);
  	};
  }, [scrollSpeed, setScrollSpeed]);
  return (
    <div className='AutoScroll'>
        <button onClick={() => { setScrollSpeed(0); window.scrollTo(0, 0) }}>⬆️</button>
        <button onClick={() => { setScrollSpeed(0) }}>⏹</button>
        <button onClick={() => { setScrollSpeed(scrollSpeed + 1) }}>⏬</button>
    </div>
  );
}

function ChordDiagram(chordName, fingerArray) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const fretWidth = 40;
    const stringGap = 30;
    const circleRadius = 10;

    // Draw fretboard (6 vertical lines)
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(i * stringGap + 20, 20);
      ctx.lineTo(i * stringGap + 20, 20 + 4 * fretWidth);
      ctx.stroke();
    }

    // Draw frets (5 horizontal)
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(20, 20 + i * fretWidth);
      ctx.lineTo(20 + 5 * stringGap, 20 + i * fretWidth);
      ctx.stroke();
    }

    // Drawing fingers for C major chord
    // The positions are based on a typical C major fingering on a guitar
    const fingerPositions = [
      { string: 5, fret: 3 },  // 3rd fret, A string (C note)
      { string: 4, fret: 2 },  // 2nd fret, D string (E note)
      { string: 2, fret: 1 }   // 1st fret, B string (C note)
    ];

    fingerPositions.forEach(pos => {
      const x = (6 - pos.string + 1) * stringGap - circleRadius;
      const y = pos.fret * fretWidth;
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    });
  }, []);

  return (
    <div className='ChordDiagram'>
      <p>Booboo</p>
      <h3>{chordName}</h3>
      <canvas ref={canvasRef} width={200} height={200} />
    </div>
  );
}

function ChordDiagrams({chords}) {
  console.log(chords);
  return (
    <div className='ChordDiagrams'>
      {Array.from(chords).map(([c, f]) => <ChordDiagram key={c} chordName={c} fingerArray={f} />)}
    </div>
  );
}

function SongChord({chord}) {
  return <span className='SongChord' style={{color: stringToPastelColor(chord)}}>{chord}</span>;
}

function SongLine({line}) {
  // TODO(linasp): refactor to something more pretty.
  if (!line) {
    return (<span className='SongLine SongLineEmpty'>&nbsp;</span>);
  }

  const chordRegex = /\[(.*?)\]/g;
  const chords = line.match(chordRegex);
  var parsedLine = [];

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

  if (parsedLine[0].startsWith('//')) {
    parsedLine[0] = parsedLine[0].replace("//", "").trim();
    return (<span className='SongLine SongLineComment'>{parsedLine}</span>);
  }
  return (<span className='SongLine'>{parsedLine}</span>)
}

export function Song() {
  const song = useLoaderData();
  // TODO: refactor tags into a helper element.
  const tags = song.tags ? song.tags.map((tag) => <SongTag key={tag} tag={tag} />) : "";
  return (
    <div>
      <h1>
        <span className="SongName">{song.name}</span>
      </h1>
      <span className="SongArtist">{song.artist}</span>
      <span className="SongTags">{tags}</span>
      <ChordDiagrams chords={song.chords} />
      {/* TODO(linasp): add unique key here */}
      {song.content.map(line => <SongLine line={line} />)}
      <ScrollControls />
    </div>
  );
}