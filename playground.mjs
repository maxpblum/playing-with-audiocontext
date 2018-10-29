import Instrument from './lib/instrument.mjs';
import N from './lib/pitches.mjs';
import OscillatorGroup from './lib/oscillator_group.mjs';
import {arpeggiate, getTimeAtBeat} from './lib/utils.mjs';
import {I, down} from './lib/intervals.mjs';

const runMusic = () => {
  // Define a local "palette" of pitches using just intonation.
  // Not necessary, just more fun than ET.
  const a2 = N.A2;
  const a3 = N.A3;
  const a4 = N.A4;
  const c3 = a2 * I.m3;
  const c5 = c3 * 2 * I.P8;
  const e4 = a3 * I.P5;
  const e5 = e4 * I.P8;
  const g2 = c3 * down(I.P4);
  const g4 = g2 * 2 * I.P8;
  const g5 = g4 * I.P8;
  const g6 = g5 * I.P8;
  const b4 = g4 * I.M3;;
  const b5 = b4 * I.P8;
  const d4 = g4 * down(I.P4);
  const d5 = d4 * I.P8;
  const d6 = d5 * I.P8;

  const chords = [
    [a2, a3, e4, a4], // A open fifth
    [c3, e4, g4, c5], // C major
    [g2, d4, g4, b4], // G major
    [a2, e4, a4, c5], // A minor
    [c3, g4, c5, e5], // C major (higher voicing)
    [g2, g4, b4, d5], // G major (higher voicing)
  ];

  const ctx = new AudioContext();
  const oscs = new OscillatorGroup(ctx, 4);

  const gn = ctx.createGain();
  gn.connect(ctx.destination);

  oscs.setType('triangle');
  oscs.connect(gn);
  oscs.start(0);
  [0, 4, 6, 8, 12, 14].forEach((beat, i) => {
    oscs.setChordAtTime(chords[i], getTimeAtBeat(beat, 140));
  });
  [0, 4, 6, 8, 12, 14].forEach((beat, i) => {
    oscs.setChordAtTime(chords[i], getTimeAtBeat(beat + 16, 140));
  });
  oscs.stop(getTimeAtBeat(32, 140));

  // Play a chord by flipping the gain on at a set beat, for a set number of beats.
  // (The pitches will be whatever the oscillators are set to at that time.)
  const hit = (startBeat, length) => {
    gn.gain.setTargetAtTime(0.5, getTimeAtBeat(startBeat,          140), 0.002);
    gn.gain.setTargetAtTime(  0, getTimeAtBeat(startBeat + length, 140), 0.002);
  };

  // A two-beat-long fun triplet rhythm.
  const severalHits = (startBeat) => {
    hit(startBeat + 0, 0.6);
    hit(startBeat + 0.667, 0.13);
    hit(startBeat + 1, 0.13);
    hit(startBeat + 1.333, 0.13);
    hit(startBeat + 1.667, 0.13);
  };

  // A spondee. To change it up.
  const twoLongerHits = (startBeat) => {
    hit(startBeat + 0, 0.6);
    hit(startBeat + 1, 0.6);
  };

  // A four-measure rhythm (in 2/4).
  const repeatingGroove = (startBeat) => {
    severalHits(startBeat + 0);
    severalHits(startBeat + 2);
    severalHits(startBeat + 4);
    twoLongerHits(startBeat + 6);
  };

  repeatingGroove(0);
  repeatingGroove(8);
  repeatingGroove(16);
  repeatingGroove(24);

  // Bass.
  const bass = new Instrument(ctx, 'triangle', [1, 0.75, 0.5, 0.25, 0.15, 0.15]);
  bass.connect(ctx.destination);

  // Define bass pitches
  const a1 = a2 * down(I.P8);
  const c2 = c3 * down(I.P8);
  const g1 = g2 * down(I.P8);
  bass.setValueAtTime(a1, getTimeAtBeat(16, 140));
  bass.setValueAtTime(c2, getTimeAtBeat(20, 140));
  bass.setValueAtTime(g1, getTimeAtBeat(22, 140));
  bass.setValueAtTime(a1, getTimeAtBeat(24, 140));
  bass.setValueAtTime(c2, getTimeAtBeat(28, 140));
  bass.setValueAtTime(g1, getTimeAtBeat(30, 140));

  bass.start(getTimeAtBeat(16, 140));
  bass.stop(getTimeAtBeat(32, 140));

  const arpeggioRow = [g6, d6, b5, g5, d5, b4, d6, b5, g5, d5, b4, g4];
  const arpeggioOsc = ctx.createOscillator();
  arpeggioOsc.type = 'triangle';
  const arpeggioGain = ctx.createGain();
  arpeggioGain.connect(ctx.destination);
  arpeggioOsc.connect(arpeggioGain);
  arpeggioGain.gain.value = 0.6;
  arpeggioOsc.start(getTimeAtBeat(30, 140));
  arpeggiate(arpeggioOsc.frequency, arpeggioRow, (1/6), 140, 30);
  arpeggioOsc.stop(getTimeAtBeat(32, 140));
};

const button = window.document.createElement('button');
button.innerText = 'Play';
button.addEventListener('click', runMusic);
window.document.body.appendChild(button);
