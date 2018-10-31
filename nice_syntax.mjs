import {I, down} from './lib/intervals.mjs';
import N from './lib/pitches.mjs';
import {getTimeAtBeat} from './lib/utils.mjs';
import Instrument from './lib/instrument.mjs';

const Note = (fn, duration=null) => ({
  type: 'note',
  fn: fn,
  duration,
});

const Simul = (...args) => ({
  type: 'simul',
  duration: Math.max(...args.map(a => a.duration)),
  events: args,
});

const Seq = (...args) => ({
  type: 'seq',
  duration: args.reduce((sum, event) => sum + event.duration, 0),
  events: args,
});

const Chunk = ({duration, events}) => ({
  type: 'chunk',
  duration,
  events,
});

class Piece {}

class Pinger {}
class Snare {}

class Bass {
  initialize(ctx, destination) {
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);

    this.osc = ctx.createOscillator();
    this.osc.type = 'triangle';
    this.osc.connect(this.gain);

    this.instrument = this.osc.frequency;
  }

  play(pitch) {
    return (startTime, stopTime) => {
      this.instrument.setValueAtTime(pitch, startTime);
      this.gain.gain.setTargetAtTime(1, startTime, 0.02);
      this.gain.gain.setTargetAtTime(0, stopTime, 0.02);
    };
  }

  start(time) {
    this.osc.start(time);
  }

  stop(time) {
    this.osc.stop(time);
    this.gain.stop(time);
  }
}

class Kick {
  initialize(ctx, destination) {
    this.frequencyStart = 55;

    this.gain = ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(destination);

    this.inst = new Instrument(ctx, 'sine',
      [0.7, 0.5, 0.1, 0.1, 0.1, 0.1, 0.05, 0.05, 0.05, 0.005]);
    this.inst.setValue(this.frequencyStart);
    this.inst.connect(this.gain);
  }

  kick() {
    return (startTime) => {
      this.inst.setValueAtTime(this.frequencyStart, startTime);
      this.inst.setValueAtTime(this.frequencyStart, startTime + 0.03);
      this.gain.gain.setValueAtTime(0, startTime);
      this.gain.gain.linearRampToValueAtTime(0.75, startTime + 0.01, 0.005);
      this.gain.gain.linearRampToValueAtTime(0, startTime + 0.12);
      this.inst.exponentialRampToValueAtTime(this.frequencyStart * 0.6, startTime + 0.12);
    };
  }

  start(time) {
    this.inst.start(time);
  }

  stop(time) {
    this.inst.stop(time);
    this.gain.stop(time);
  }
}

class PolyphonicKick {
  constructor(polyphony) {
    this.polyphony = polyphony;
  }

  initialize(ctx, destination) {
    this.kicks = [];
    for (let i = 0; i < this.polyphony; i++) {
      this.kicks.push(new Kick());
    }
    this.kicks.forEach(k => k.initialize(ctx, destination));
    this.nextKick = 0;
  }

  kick() {
    return (startTime) => {
      this.kicks[this.nextKick].kick()(startTime);
      this.nextKick = (this.nextKick + 1) % this.kicks.length;
    };
  }

  start(time) {
    this.kicks.forEach(k => k.start(time));
  }

  stop(time) {
    this.kicks.forEach(k => k.stop(time));
  }
}

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
      // pinger: new Pinger(),
      bass:   new Bass(),
      // snare:  new Snare(),
      kick:   new PolyphonicKick(2),
    };
  }

  getTimeAtBeat(beat) {
    const tempo = 100;
    return getTimeAtBeat(beat, tempo);
  }

  // {n} will be the output from getPallete().
  // {i} will be the output from getInstruments().
  getScore(n, i) {
    const kickGroove = Chunk({
      duration: 2,
      events: {
        0: Note(i.kick.kick()),
        0.83: Note(i.kick.kick()),
        1.33: Note(i.kick.kick()),
        1.5: Note(i.kick.kick()),
      },
    });
    const bassGroove = Seq(
      this.heldNote(i.bass.play(n.eb1), 2),
      this.heldNote(i.bass.play(n.g1), 2),
      this.heldNote(i.bass.play(n.ab1), 2),
      this.heldNote(i.bass.play(n.f1), 2),
    );
    const groove = Simul(
        bassGroove,
        Seq(
            kickGroove,
            kickGroove,
            kickGroove,
            kickGroove,
        ),
    );
    return groove;
  }

  heldNote(notePlayer, beats) {
    // TODO: Somehow modify the heldNote API so tempo fluctuations are possible.
    return Note(
      (startTime) => notePlayer(startTime, startTime + this.getTimeAtBeat(beats)),
      beats,
    );
  }

  scheduleEvent(beatsElapsed, event, schedule) {
    if (beatsElapsed === null) {
      throw new Exception('Expected a number, found beatsElapsed = null');
    }
    if (event.type === 'note') {
      const startTime = this.getTimeAtBeat(beatsElapsed);
      schedule.push({fn: event.fn, startTime});
    } else if (event.type === 'simul') {
      // event is a list of simultaneous events
      event.events.forEach(e => this.scheduleEvent(beatsElapsed, e, schedule));
    } else if (event.type === 'seq') {
      // event is a sequence of events
      event.events.reduce((elapsed, ev) => {
        this.scheduleEvent(elapsed, ev, schedule);
        return elapsed + ev.duration;
      }, beatsElapsed);
    } else {
      // event is an object with a duration and an events object.
      for (let relativeBeatKey in event.events) {
        const relativeBeat = Number(relativeBeatKey);
        this.scheduleEvent(beatsElapsed + relativeBeat, event.events[relativeBeat], schedule);
      }
    }
  }

  schedulePiece() {
    const ctx = new AudioContext();
    const instruments = this.getInstruments();
    const instrumentList = Object.values(instruments);
    instrumentList.forEach(i => i.initialize(ctx, ctx.destination));
    const schedule = [];
    this.scheduleEvent(0, this.getScore(this.getPalette(), instruments), schedule);

    // Guarantee that all events will be called in chronological order.
    // This will help with instruments that need to handle events in order.
    schedule.sort((timeA, timeB) => timeA - timeB);
    schedule.forEach(({fn, startTime}) => fn(startTime));

    instrumentList.forEach(i => i.start(0));
  }
}

window.piece = new ImaginaryPiece();
