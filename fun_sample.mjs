import {I, down} from './lib/intervals.mjs';
import N from './lib/pitches.mjs';
import {ChordYeller} from './lib/instruments/chord_yeller.mjs';
import {Twinkler} from './lib/instruments/twinkler.mjs';
import {NoiseBass} from './lib/instruments/noise_bass.mjs';
import Piece from './lib/piece.mjs';
import {getTimeAtBeat, Chunk, Seq, Simul, Note} from './lib/utils.mjs';

class FunSamplePiece extends Piece {
  getTimeAtBeat(beat) {
    const tempo = 140;
    return getTimeAtBeat(beat, tempo);
  }

  getPalette() {
    // Define a local "palette" of pitches using just intonation.
    // Not necessary, just more fun than ET.
    const n = {};
    n.a2 = N.A2;
    n.a3 = N.A3;
    n.a4 = N.A4;
    n.c3 = n.a2 * I.m3;
    n.c5 = n.c3 * 2 * I.P8;
    n.e4 = n.a3 * I.P5;
    n.e5 = n.e4 * I.P8;
    n.g2 = n.c3 * down(I.P4);
    n.g4 = n.g2 * 2 * I.P8;
    n.g5 = n.g4 * I.P8;
    n.g6 = n.g5 * I.P8;
    n.b4 = n.g4 * I.M3;;
    n.b5 = n.b4 * I.P8;
    n.d4 = n.g4 * down(I.P4);
    n.d5 = n.d4 * I.P8;
    n.d6 = n.d5 * I.P8;

    n.chords = [
      [n.a2, n.a3, n.e4, n.a4], // A open fifth
      [n.c3, n.e4, n.g4, n.c5], // C major
      [n.g2, n.d4, n.g4, n.b4], // G major
      [n.a2, n.e4, n.a4, n.c5], // A minor
      [n.c3, n.g4, n.c5, n.e5], // C major (higher voicing)
      [n.g2, n.g4, n.b4, n.d5], // G major (higher voicing)
    ];

    // Define bass pitches
    n.a1 = n.a2 * down(I.P8);
    n.c2 = n.c3 * down(I.P8);
    n.g1 = n.g2 * down(I.P8);

    return n;
  }

  getInstruments() {
    return {
      twinkler: new Twinkler(),
      chordYeller: new ChordYeller(4),
      noiseBass: new NoiseBass(),
    };
  }

  getScore(n, i) {
    const funRhythm = [[0, 0.6], [0.667, 0.13], [1, 0.13], [1.333, 0.13], [1.667, 0.13]];
    const spondee = [[0, 0.6], [1, 0.6]];

    const chordWithRhythm = (chord, rhythm) => {
      const events = {};
      rhythm.forEach(([start, duration]) => {
        events[start] = Note('chordYeller', 'yellChord', chord, duration);
      });
      return Chunk({duration: 2, events});
    };

    const twinkleNotes = [n.g6, n.d6, n.b5, n.g5, n.d5, n.b4, n.d6, n.b5, n.g5, n.d5, n.b4, n.g4];
    const twinkleArpeggio = Note('twinkler', 'arpeggiate', twinkleNotes, 2);

    const chordGroove = Seq(
      chordWithRhythm(n.chords[0], funRhythm),
      chordWithRhythm(n.chords[0], funRhythm),
      chordWithRhythm(n.chords[1], funRhythm),
      chordWithRhythm(n.chords[2], spondee),
      chordWithRhythm(n.chords[3], funRhythm),
      chordWithRhythm(n.chords[3], funRhythm),
      chordWithRhythm(n.chords[4], funRhythm),
      chordWithRhythm(n.chords[5], spondee),
    );

    const bassGroove = Seq(
      Note('noiseBass', 'play', n.a1, 4),
      Note('noiseBass', 'play', n.c2, 2),
      Note('noiseBass', 'play', n.g1, 2),
    );

    return Simul(
      Seq(chordGroove, chordGroove),
      Chunk({
        duration: 32,
        events: {
          16: bassGroove,
          24: bassGroove,
          30: twinkleArpeggio,
        },
      }),
    );
  }
}

const button = window.document.createElement('button');
button.innerText = 'Play';
button.addEventListener('click', () => (new FunSamplePiece()).schedulePiece());
window.document.body.appendChild(button);
