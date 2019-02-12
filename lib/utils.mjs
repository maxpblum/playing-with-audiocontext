// {tempo} in BPM.
export const getTimeAtBeat = (beat, tempo) => beat * 60 / tempo;

export const arpeggiate = (osc, freqs, beatsPerNote, tempo, startBeat) => {
  freqs.forEach((f, i) => {
    osc.setValueAtTime(
      f, getTimeAtBeat(startBeat + (i * beatsPerNote), tempo));
  });
};

export const timesWithConstructor = (count, cons) => {
  const output = [];
  for (let i = 0; i < count; i++) {
    output.push(cons());
  }
  return output;
};

export const times = (count, x) => timesWithConstructor(count, () => x);

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
