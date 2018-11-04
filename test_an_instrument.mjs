import Piece from './lib/piece.mjs';
import {I, down} from './lib/intervals.mjs';
import N from './lib/pitches.mjs';
import {Seq, Simul, Chunk, Note, getTimeAtBeat} from './lib/utils.mjs';

const doc = window.document;

// Taken from https://stackoverflow.com/questions/3445276/smart-text-area-auto-indent
const addSmartIndent = (elementId) => {
  doc.getElementById(elementId).addEventListener('keyup', function(v){
    if(v.keyCode != 13 || v.shiftKey || v.ctrlKey || v.altKey || v.metaKey)
      return;
    var val = this.value, pos = this.selectionStart;
    var line = val.slice(val.lastIndexOf('\n', pos - 2) + 1, pos - 1);
    var indent = /^\s*/.exec(line)[0];
    if(!indent) return;
    var st = this.scrollTop;
    this.value = val.slice(0, pos) + indent + val.slice(this.selectionEnd);
    this.selectionStart = this.selectionEnd = pos + indent.length;
    this.scrollTop = st;
  }, false);
};

addSmartIndent('instrumentCode');
addSmartIndent('eventCode');

const wrapInstrument = (code) => {
  return 'window.TestInstrument = (() => ( ' + code + ' ))();';
};

const wrapEvent = (code) => {
  const externsList = [
    'Seq', 'Simul', 'Chunk', 'Note', 'I', 'N',
  ];
  const externsString = externsList.join(', ');
  return 'window.testEvent = (test) => ((' + externsString + ') => ( ' + code + ' ))(' + externsString + ');';
};

const start = (e) => {
  e.preventDefault();
  eval(wrapInstrument(doc.getElementById('instrumentCode').value));
  eval(wrapEvent(doc.getElementById('eventCode').value));

  const TestInstrument = window.TestInstrument;
  const testEvent = window.testEvent;

  let continuing = true;

  class TestPiece extends Piece {
    getTimeAtBeat(beat) {
      return getTimeAtBeat(beat, 120);
    }

    getInstruments() {
      return {
        test: new TestInstrument(),
      };
    }

    getScore(_, i) {
      return testEvent();
    }
  }

  doc.getElementById('testForm').removeEventListener('submit', start);
  doc.getElementById('submit').value = 'Stop';

  const stop = (e) => {
    e.preventDefault();
    continuing = false;
    doc.getElementById('testForm').removeEventListener('submit', stop);
    doc.getElementById('testForm').addEventListener('submit', start);
    doc.getElementById('submit').value = 'Test';
  };

  doc.getElementById('testForm').addEventListener('submit', stop);

  const playAndRepeat = () => {
    (new TestPiece()).schedulePiece().then(() => {
      if (continuing) {
        setTimeout(playAndRepeat, 1000);
      }
    });
  };

  playAndRepeat();
};

doc.getElementById('testForm').addEventListener('submit', start);

const defaultInstrument =
  'class {\n' +
  '  initialize(audioContext, destination) {\n' +
  '    this.gain = audioContext.createGain();\n' +
  '    this.gain.gain.value = 0;\n' +
  '    this.gain.connect(destination);\n' +
  '    this.osc = audioContext.createOscillator();\n' +
  '    this.osc.connect(this.gain);\n' +
  '  }\n' +
  '\n' +
  '  play({startTime, stopTime, data}) {\n' +
  '    this.osc.frequency.setValueAtTime(data, startTime);\n' +
  '    this.gain.gain.setTargetAtTime(0.5, startTime, 0.03);\n' +
  '    this.gain.gain.setTargetAtTime(0,    stopTime, 0.03);\n' +
  '  }\n' +
  '\n' +
  '  start(time) {\n' +
  '    this.osc.start(time);\n' +
  '  }\n' +
  '\n' +
  '  stop(time) {\n' +
  '    this.osc.stop(time);\n' +
  '  }\n' +
  '}';

const defaultEvent =
  'Note(\n' +
  '  \'test\', // don\'t change this\n' +
  '  \'play\', // this method must exist in the above class\n' +
  '  220,    // optional. this is passed to that method as the data argument, can be anything\n' +
  '  2,      // optional. duration, in beats. will be used to calculate the stopTime argument,\n' +
  '          // which will be null if this argument is absent.\n' +
  ')';

doc.getElementById('instrumentCode').value = defaultInstrument;
doc.getElementById('eventCode').value = defaultEvent;
