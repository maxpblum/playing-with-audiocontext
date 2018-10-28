const chords = [
  [110, 220, 330, 440], // A open-fifth
  [132, 330, 396, 528], // C major
  [ 99, 297, 396, 495], // G major
  [110, 330, 440, 528], // A minor
  [132, 396, 528, 660], // C major (higher voicing)
  [ 99, 396, 495, 594], // G major (higher voicing)
];

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
