// {tempo} in BPM.
export const getTimeAtBeat = (beat, tempo) => beat * 60 / tempo;

export const arpeggiate = (osc, freqs, beatsPerNote, tempo, startBeat) => {
  freqs.forEach((f, i) => {
    osc.setValueAtTime(
      f, getTimeAtBeat(startBeat + (i * beatsPerNote), tempo));
  });
};

export const times = (count, x) => {
  const output = [];
  for (let i = 0; i < count; i++) {
    output.push(x);
  }
  return output;
};

export const Note = (instrumentName, methodName, data=null, duration=null) => ({
  type: 'note',
  instrumentName,
  methodName,
  data,
  duration,
});

export const Simul = (...args) => ({
  type: 'simul',
  duration: Math.max(...args.map(a => a.duration)),
  events: args,
});

export const Seq = (...args) => ({
  type: 'seq',
  duration: args.reduce((sum, event) => sum + event.duration, 0),
  events: args,
});

export const Chunk = ({duration, events}) => ({
  type: 'chunk',
  duration,
  events,
});
