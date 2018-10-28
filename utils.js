// {tempo} in BPM.
getTimeAtBeat = (beat, tempo) => beat * 60 / tempo;

arpeggiate = (osc, freqs, beatsPerNote, tempo, startBeat) => {
  freqs.forEach((f, i) => {
    osc.setValueAtTime(
      f, getTimeAtBeat(startBeat + (i * beatsPerNote), tempo));
  });
};
