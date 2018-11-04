import {withPolyphony} from './lib/instrument.mjs';
import {I, down} from './lib/intervals.mjs';
import N from './lib/pitches.mjs';
import {getTimeAtBeat, times, Note, Simul, Seq, Chunk} from './lib/utils.mjs';
import Snare from './lib/instruments/snare.mjs';
import Bass from './lib/instruments/bass.mjs';
import Kick from './lib/instruments/kick.mjs';
import Pinger from './lib/instruments/pinger.mjs';
import Piece from './lib/piece.mjs';

class ImaginaryPiece extends Piece {
  getPalette() {
    // Note holder.
    const n = {};

    // Let's do E-flat major, just intonation.

    // Define the middle octave.
    n.eb4 = N.Eb4;
    n.bb4 = n.eb4 * I.P5;
    n.g4  = n.eb4 * I.M3;
    n.ab4 = n.eb4 * I.P4;
    n.f4  = n.eb4 * I.M2;
    n.d4  = n.f4  * down(I.m3);
    n.c4  = n.eb4 * down(I.m3);

    // Dynamically define all other octaves.
    const noteNames = ['eb', 'bb', 'g', 'ab', 'f', 'd', 'c'];
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
      pinger: withPolyphony(Pinger, 4, 'ping'),
      bass:   new Bass(),
      snare:  new Snare(),
      kick:   withPolyphony(Kick, 2, 'kick'),
    };
  }

  getTimeAtBeat(beat) {
    const tempo = 100;
    return getTimeAtBeat(beat, tempo);
  }

  // {n} will be the output from getPallete().
  // {i} will be the output from getInstruments().
  getScore(n, i) {
    const drumGroove = Chunk({
      duration: 2,
      events: {
        0: Note('kick', 'kick'),
        0.5: Note('snare', 'snare'),
        0.83: Note('kick', 'kick'),
        1.33: Note('kick', 'kick'),
        1.5: Note('kick', 'kick'),
        1.5: Note('snare', 'snare'),
      },
    });
    const pings = Chunk({
      duration: 4,
      events: {
        0.37: Note('pinger', 'ping', n.bb4),
        0.54: Note('pinger', 'ping', n.g4),
        0.87: Note('pinger', 'ping', n.bb4),
        1.04: Note('pinger', 'ping', n.f4),
        1.37: Note('pinger', 'ping', n.bb4),
        1.54: Note('pinger', 'ping', n.g4),
        1.87: Note('pinger', 'ping', n.bb4),
        2.04: Note('pinger', 'ping', n.eb4),
      },
    });
    const laterPings = Chunk({
      duration: 4,
      events: {
        0:    Note('pinger', 'ping', n.eb5),
        0.31: Note('pinger', 'ping', n.d5),
        0.54: Note('pinger', 'ping', n.eb5),
        0.83: Note('pinger', 'ping', n.f5),
        1.04: Note('pinger', 'ping', n.eb5),
        1.29: Note('pinger', 'ping', n.f5),
        1.54: Note('pinger', 'ping', n.f5),
        1.65: Note('pinger', 'ping', n.g5),
        2.54: Note('pinger', 'ping', n.eb5),
        2.95: Note('pinger', 'ping', n.bb4),
        3.05: Note('pinger', 'ping', n.c5),
        3.54: Note('pinger', 'ping', n.bb4),
      },
    });
    const bassGroove = Seq(
      Note('bass', 'play', n.eb1, 2),
      Note('bass', 'play', n.g1, 2),
      Note('bass', 'play', n.ab1, 2),
      Note('bass', 'play', n.f1, 2),
    );
    const groove = Simul(
      Seq(...times(2, bassGroove)),
      Seq(...times(8, drumGroove)),
      Seq(pings, pings, laterPings, laterPings),
    );
    return groove;
  }
}

const button = window.document.createElement('button');
button.innerText = 'Play';
button.addEventListener('click', () => (new ImaginaryPiece()).schedulePiece());
window.document.body.appendChild(button);
