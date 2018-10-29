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

export default N;
