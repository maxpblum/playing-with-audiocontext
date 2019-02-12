import N from './lib/pitches.mjs';
import {getTimeAtBeat, times, Note, Simul, Seq, Chunk} from './lib/utils.mjs';
import Swell from './lib/instruments/swell.mjs';
import Piece from './lib/piece.mjs';

class SwellsPiece extends Piece {
  getPalette() {  /* just use ET */ return N; }

  getInstruments() {
    return {
      swellA: new Swell(4, 'sawtooth'),
      swellB: new Swell(4, 'sawtooth'),
    };
  }

  getTimeAtBeat(beat) {
    const tempo = 80;
    return getTimeAtBeat(beat, tempo);
  }

  getScore(n, i) {
    // 5-beat swell, 4-beat chunk. Have to be careful with timing.
    const chunk = (note) => Chunk({duration: 4, events: {0: note}});
    const alternateChordsSequence = (chords) => {
      let nextSwell = 'swellA';
      let totalLength = 0;
      const chunks = [];
      chords.forEach(chord => {
        chunks.push(chunk(Note(nextSwell, 'play', chord, 5)));
        nextSwell = (nextSwell === 'swellA') ? 'swellB' : 'swellA';
        totalLength += 4;
      });
      return Chunk({
        duration: totalLength + 1,
        events: {0: Seq(...chunks)},
      });
    };
    return alternateChordsSequence([
      [n.A2,     n.A3,     n['C#4'], n.E4    ],
      [n['C#3'], n['G#3'], n['C#4'], n.F4    ],
      [n['F#2'], n.A3,     n['C#4'], n['F#4']],
      [n.Bb2,    n.D4,     n.F4,     n.Bb4   ],
      [n.Eb2,    n.G3,     n.Eb4,    n.Bb4   ],
      [n.B2,     n.A3,     n.D4,     n['F#4']],
      [n.E2,     n.B3,     n.E4,     n['G#4']],
      [n.Bb2,    n.F3,     n.Bb3,    n.D4    ],
      [n.Eb2,    n.G3,     n.Bb3,    n.Eb4   ],
      [n.Gb2,    n.Db3,    n.Gb3,    n.Bb3   ],
      [n.Db3,    n.Ab3,    n.Db4,    n.F4    ],
      [n.F2,     n.Ab3,    n.A3,     n.F4    ],
      [n.Ab2,    n.Gb3,    n.C4,     n.F4    ],
      [n.E3,     n.Db4,    n.Gb4,    n.Bb4   ],
      [n.F3,     n.Db4,    n.F4,     n.Bb4   ],
      [n.G3,     n.Bb3,    n.E4,     n.C5    ],
      [n.A3,     n.Db4,    n.Eb4,    n.F4    ],
      [n.F2,     n.Db3,    n.A3,     n.F4    ],
    ]);
  }
}

const button = window.document.createElement('button');
button.innerText = 'Play';
button.addEventListener('click', () => (new SwellsPiece()).schedulePiece());
window.document.body.appendChild(button);
