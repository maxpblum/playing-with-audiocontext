import {Note} from './utils.mjs';

export default class {
  getPalette() { return null; }
  getInstruments() { return null; }
  getTimeAtBeat() {
    throw new Error('Piece subclass must implement getTimeAtBeat.');
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
    } else if (event.type === 'chunk') {
      // event is an object with a duration and an events object.
      for (let relativeBeatKey in event.events) {
        const relativeBeat = Number(relativeBeatKey);
        this.scheduleEvent(beatsElapsed + relativeBeat, event.events[relativeBeat], schedule);
      }
    } else {
      throw new Error('Event is not valid: ', event);
    }
  }

  schedulePiece() {
    const ctx = new AudioContext();
    const instruments = this.getInstruments();
    const instrumentList = Object.values(instruments);
    instrumentList.forEach(i => i.initialize(ctx, ctx.destination));
    const schedule = [];

    const score = this.getScore(this.getPalette(), instruments);
    const duration = score.duration;
    this.scheduleEvent(0, this.getScore(this.getPalette(), instruments), schedule);

    // Guarantee that all events will be called in chronological order.
    // This will help with instruments that need to handle events in order.
    schedule.sort((eventA, eventB) => eventA.startTime - eventB.startTime);
    schedule.forEach(({fn, startTime}) => fn(startTime));

    instrumentList.forEach(i => {
      i.start(0)
      i.stop(this.getTimeAtBeat(duration));
    });
  }
}
