import N from './lib/pitches.mjs';
import {getTimeAtBeat, times, Note, Simul, Seq, Chunk} from './lib/utils.mjs';
import Swell from './lib/instruments/swell.mjs';
import Piece from './lib/piece.mjs';

class SwellsPiece extends Piece {
  getPalette() {  /* just use ET */ return N; }

  getInstruments() {
    return {
      swell: new Swell(4),
    };
  }

  getTimeAtBeat(beat) {
    const tempo = 100;
    return getTimeAtBeat(beat, tempo);
  }

  // {n} will be the output from getPallete().
  // {i} will be the output from getInstruments().
  getScore(n, i) {
    return Note('swell', 'play', [n.A3, n['C#4'], n.E4, n['G#4']], 2);
  }
}

const button = window.document.createElement('button');
button.innerText = 'Play';
button.addEventListener('click', () => (new SwellsPiece()).schedulePiece());
window.document.body.appendChild(button);
