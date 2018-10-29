import {I, down} from './lib/intervals.mjs';
import N from './lib/pitches.mjs';
import {getTimeAtBeat} from './lib/utils.mjs';

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
    this.gain = ctx.createGain();
    this.gain.connect(destination);

    this.osc = ctx.createOscillator();
    this.osc.type = 'triangle';
    this.osc.frequency.value = 440;
    this.osc.connect(this.gain);
  }

  kick() {
    return (startTime) => {
      this.gain.gain.setTargetAtTime(0.75, startTime, 0.005);
      this.gain.gain.setTargetAtTime(0, startTime + 0.2, 0.03);
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
      kick:   new Kick(),
    };
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
      this.heldNote(i.bass.play(n.eb1), 2, 160),
      this.heldNote(i.bass.play(n.g1), 2, 160),
      this.heldNote(i.bass.play(n.ab1), 2, 160),
      this.heldNote(i.bass.play(n.f1), 2, 160),
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

  heldNote(notePlayer, beats, tempo) {
    // TODO: Somehow modify the heldNote API so tempo fluctuations are possible.
    return Note(
      (startTime) => notePlayer(startTime, startTime + getTimeAtBeat(beats, tempo)),
      beats,
    );
  }

  scheduleEvent(beatsElapsed, event) {
    if (beatsElapsed === null) {
      throw new Exception('Expected a number, found beatsElapsed = null');
    }
    if (event.type === 'note') {
      event.fn(getTimeAtBeat(beatsElapsed, 160));
    } else if (event.type === 'simul') {
      // event is a list of simultaneous events
      event.events.forEach(e => this.scheduleEvent(beatsElapsed, e));
    } else if (event.type === 'seq') {
      // event is a sequence of events
      event.events.reduce((elapsed, ev) => {
        this.scheduleEvent(elapsed, ev);
        return elapsed + ev.duration;
      }, beatsElapsed);
    } else {
      // event is an object with a duration and an events object.
      for (let relativeBeatKey in event.events) {
        const relativeBeat = Number(relativeBeatKey);
        this.scheduleEvent(beatsElapsed + relativeBeat, event.events[relativeBeat]);
      }
    }
  }

  schedulePiece() {
    const ctx = new AudioContext();
    const instruments = this.getInstruments();
    const instrumentList = Object.values(instruments);
    instrumentList.forEach(i => i.initialize(ctx, ctx.destination));
    this.scheduleEvent(0, this.getScore(this.getPalette(), instruments));
    instrumentList.forEach(i => i.start(0));
  }
}

window.piece = new ImaginaryPiece();
