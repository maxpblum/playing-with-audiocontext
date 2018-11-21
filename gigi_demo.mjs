import {I, down} from './lib/intervals.mjs';
import N from './lib/pitches.mjs';
import {getTimeAtBeat, times, Note, Simul, Seq, Chunk} from './lib/utils.mjs';
import ChordYeller from './lib/instruments/chord_yeller.mjs';
import Piece from './lib/piece.mjs';

class GigiDemo extends Piece {
  getPalette() {
    return N;
  }

  getInstruments() {
    return {
      chordYellerA: new ChordYeller(3),
      chordYellerB: new ChordYeller(3),
      chordYellerC: new ChordYeller(4),
      chordYellerD: new ChordYeller(4),
    };
  }

  getTimeAtBeat(beat) {
    const tempo = 110;
    return getTimeAtBeat(beat, tempo);
  }

  // {n} will be the output from getPalette().
  // {i} will be the output from getInstruments().
  getScore(n, i) {
    return Chunk({
      duration: 8,
      events: {
        0: Note('chordYellerA', 'yellChord', [n.Db4, n.F4, n.Ab4], 0.5),
        0.75: Note('chordYellerA', 'yellChord', [n.Bb3, n.F4, n.Db5], 0.4),
        1.5: Note('chordYellerC', 'yellChord', [n.Gb2, n.Db4, n.Bb4, n.C5], 2),
        2.5: Note('chordYellerB', 'yellChord', [n.C5, n.F5, n.Bb5], 0.15),
        3.0: Note('chordYellerB', 'yellChord', [n.C5, n.F5, n.Bb5], 0.15),
        3.5: Note('chordYellerB', 'yellChord', [n.C5, n.F5, n.Bb5], 0.15),
        4.0: Note('chordYellerB', 'yellChord', [n.C5, n.F5, n.Bb5], 0.15),
        4.75: Note('chordYellerB', 'yellChord', [n.C5, n.F5, n.Bb5], 0.15),
        5.5: Note('chordYellerB', 'yellChord', [n.C5, n.F5, n.Bb5], 0.15),
        6.5: Note('chordYellerB', 'yellChord', [n.C5, n.F5, n.Bb5], 0.15),
      },
    });
  }
}

const button = window.document.createElement('button');
button.innerText = 'Play';
button.addEventListener('click', () => (new GigiDemo()).schedulePiece());
window.document.body.appendChild(button);
