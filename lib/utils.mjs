// {tempo} in BPM.
export const getTimeAtBeat = (beat, tempo) => beat * 60 / tempo;

export const arpeggiate = (osc, freqs, beatsPerNote, tempo, startBeat) => {
  freqs.forEach((f, i) => {
    osc.setValueAtTime(
      f, getTimeAtBeat(startBeat + (i * beatsPerNote), tempo));
  });
};
