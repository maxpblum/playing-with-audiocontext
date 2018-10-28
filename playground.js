// Define some useful just intervals. Not equal temperament.
const I = {};
const down = (interval) => 1 / interval;
I.P8 = 2.0;
I.P5  = 3.0 * down(I.P8);
I.P4 = 2.0 * down(I.P5);
I.M3 = 5.0 * down(2 * I.P8);
I.m3 = I.P5 * down(I.M3);
I.M6 = 2.0 * down(I.m3);
I.m6 = 2.0 * down(I.M3);

// A major second based specifically on V / V.
I.M2 = I.P5 * I.P5 * down(I.P8);
// A minor second based on the difference between I.M2 and I.m3.
I.m2 = I.m3 / I.M2;

// A minor seventh based on IV / IV.
I.m7 = I.P4 * I.P4;
// A major seventh based on the third of V.
I.M7 = I.P5 * I.M3;

// In MIDI numbers, concert A is 69.
const CONCERT_A_MIDI_NUMBER = 69;

const up_semitones = (freq, n) => freq * Math.pow(2, (n / 12));
const midi_freq = (midiNumber) => up_semitones(440, midiNumber - CONCERT_A_MIDI_NUMBER);

const _noteNames = [
  ['C'],
  ['C#', 'Db'],
  ['D'],
  ['D#', 'Eb'],
  ['E'],
  ['F'],
  ['F#', 'Gb'],
  ['G'],
  ['G#', 'Ab'],
  ['A'],
  ['A#', 'Bb'],
  ['B'],
];

// Define the equal-temperament notes.
const N = {}
_noteNames.forEach((equiv_names, i) => {
  // The first that appears is C, which is concert A - 9 semitones.
  const midiNumber = CONCERT_A_MIDI_NUMBER - 9 + i;
  equiv_names.forEach(name => {
    N[name + '4'] = midi_freq(midiNumber);
    [3, 2, 1].forEach(octave => {
      N[name + octave] = N[name + (octave + 1)] / 2.0;
    });
    [5, 6, 7, 8].forEach(octave => {
      N[name + octave] = N[name + (octave - 1)] * 2.0;
    });
  });
});

const chords = (() => {
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
  const b4 = g4 * I.M3;;
  const d4 = g4 * down(I.P4);
  const d5 = d4 * I.P8;

  return [
    [a2, a3, e4, a4], // A open fifth
    [c3, e4, g4, c5], // C major
    [g2, d4, g4, b4], // G major
    [a2, e4, a4, c5], // A minor
    [c3, g4, c5, e5], // C major (higher voicing)
    [g2, g4, b4, d5], // G major (higher voicing)
  ];
})();

// {tempo} in BPM.
const getTimeAtBeat = (beat, tempo) => beat * 60 / tempo;

const runMusic = () => {
  const ctx = new AudioContext();
  const oscs = chords[0].map(() => ctx.createOscillator());

  const gn = ctx.createGain();
  gn.connect(ctx.destination);
  oscs.forEach((o, i) => {
    o.type = 'triangle';
    o.connect(gn);
    o.start(0);
    o.frequency.setValueAtTime(chords[0][i], getTimeAtBeat(0, 140));
    o.frequency.setValueAtTime(chords[1][i], getTimeAtBeat(4, 140));
    o.frequency.setValueAtTime(chords[2][i], getTimeAtBeat(6, 140));
    o.frequency.setValueAtTime(chords[3][i], getTimeAtBeat(8, 140));
    o.frequency.setValueAtTime(chords[4][i], getTimeAtBeat(12, 140));
    o.frequency.setValueAtTime(chords[5][i], getTimeAtBeat(14, 140));
    o.stop(getTimeAtBeat(16, 140));
  });

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

  // Do that rhythm twice.
  repeatingGroove(0);
  repeatingGroove(8);
};

const button = window.document.createElement('button');
button.innerText = 'Play';
button.addEventListener('click', runMusic);
window.document.body.appendChild(button);
