import {I, down} from './lib/intervals.mjs';
import N from './lib/pitches.mjs';
import {getTimeAtBeat, times, Note, Simul, Seq, Chunk} from './lib/utils.mjs';
import ChordYeller from './lib/instruments/chord_yeller.mjs';
import Piece from './lib/piece.mjs';

class SlowArpeggios extends Piece {
  getPalette() {
    // Note holder.
    const n = {};

    // Let's do D minor/dorian, just intonation.

    // Define the middle octave.
    n.d4 = N.D4;
    n.a4 = n.d4 * I.P5;
    n.f4 = n.a4 * down(I.M3);
    n.c4 = n.f4 * down(I.P4);
    n.e4 = n.c4 * I.M3;
    n.g4 = n.c4 * I.P5;
    n.b4 = n.g4 * I.M3;

    // Dynamically define all other octaves.
    const noteNames = ['d', 'e', 'f', 'g', 'a', 'b', 'c'];
    [3, 2, 1].forEach(octave => {
      noteNames.forEach(noteName => {
        n[noteName + octave] = n[noteName + (octave + 1)] * down(I.P8);
      });
    });
    [5, 6, 7, 8].forEach(octave => {
      noteNames.forEach(noteName => {
        n[noteName + octave] = n[noteName + (octave - 1)] * I.P8;
      });
    });

    return n;
  }

  getInstruments() {
    return {
      chordYeller: new ChordYeller(2),
      chordEcho: new ChordYeller(2),
      singer: new ChordYeller(1),
      singerEcho: new ChordYeller(1),
    };
  }

  getTimeAtBeat(beat) {
    const tempo = 110;
    return getTimeAtBeat(beat, tempo);
  }

  // {n} will be the output from getPallete().
  // {i} will be the output from getInstruments().
  getScore(n, i) {
    const risingPairs = Seq(
      ...([[n.a2, n.f3], [n.d3, n.a3], [n.f3, n.d4], [n.a3, n.f4]
    ].map(chord => Note('chordYeller', 'yellChord', chord, 2))));
    const otherNotes = Seq(
      ...([[n.d3], [n.e3], [n.c3], [n.g3]
    ].map(chord => Note('singer', 'yellChord', chord, 1))));

    const echoPairs = Seq(
      ...([[n.a3, n.f4], [n.d4, n.a4], [n.f4, n.d5], [n.a4, n.f5]
    ].map(chord => Note('chordEcho', 'yellChord', chord, 2))));
    const echoNotes = Seq(
      ...([[n.e5, 0.5], [n.d4, 0.5], [n.g5, 1], [n.c5, 0.5], [n.b3, 0.5], [n.g4, 1]
    ].map(([note, dur]) => Note('singerEcho', 'yellChord', [note], dur))));
    const oneBeatRest = Chunk({duration: 1, events: {}});

    const mainLoop = Simul(risingPairs, Seq(otherNotes, otherNotes))
    return Seq(
      ...(times(2, risingPairs)),
      ...(times(2, mainLoop)),
      Simul(
        ...(times(2, mainLoop)),
        Seq(oneBeatRest, echoPairs, echoPairs),
        Seq(...(times(4, oneBeatRest)), echoNotes, echoNotes, echoNotes),
      ),
    );
  }
}

const button = window.document.createElement('button');
button.innerText = 'Play';
button.addEventListener('click', () => (new SlowArpeggios()).schedulePiece());
window.document.body.appendChild(button);
