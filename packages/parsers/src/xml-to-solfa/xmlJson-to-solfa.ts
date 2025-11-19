import { AttributeSnapshot, ProgressReport, TempoInfo, XMLNote } from "../types.js";
import {
  partMap,
  parseXMLMeasureAttributes,
  updateAttributeSnapshot,
  parseXMLNotes,
  hasChanged,
  getText,
  getTextArray,
  simplifyNode,
  detectClosedScore
} from "../utils.js";

const vocalKeys = ["S", "A", "T", "B", "MS", "Bar", "S I", "S II", "S III", "A I", "A II", "A III", "T I", "T II", "T III", "B I", "B II", "B III"];
const longNamesSet = new Set(
  vocalKeys.map(k => partMap[k]?.long.toLowerCase())
)
console.log('Long Names Set:', longNamesSet);

function getKeyByLongName(name: string): string | undefined {
  return Object.entries(partMap).find(([_, v]) => v.long.toLowerCase() === name.toLowerCase())?.[0];
}

interface PartConfig {
  partIndex: number;
  targetVoice: string;
  outputName: string;
}

export function xmlJSONToSolfaParser(xmlJson: Array<any>, onProgress?: (report: ProgressReport) => void) {
  const scorePartwiseContainer = xmlJson.find(elem => elem['score-partwise'])
  if (!scorePartwiseContainer || typeof scorePartwiseContainer !== 'object') {
    onProgress?.({ completedPercentage: 0, error: 'Missing score-partwise element', message: 'Parsing failed' });
    throw new Error('Missing score-partwise element');
  }
  const scorePartwiseData: any[] = scorePartwiseContainer['score-partwise'];

  // --- Extract Metadata ---
  const workContainer = scorePartwiseData.find(elem => elem['work']);
  const workData = workContainer?.['work']?.[0];
  const workTitle = getText(workData?.['work-title']) || 'Untitled';

  const idContainer = scorePartwiseData.find(elem => elem['identification']);
  const identification = idContainer?.['identification']?.[0];
  const creators = getTextArray(identification?.['creator']);
  const rights = getText(identification?.['rights']);

  // --- Extract Part Lists and Data ---
  const partListContainer = scorePartwiseData.find(elem => elem['part-list']);
  const partListArray: any[] = partListContainer?.['part-list'] || [];

  const scoreParts = partListArray
    ?.filter(elem => elem['score-part'])
    .map(elem => simplifyNode(elem['score-part']));

  const partsData = scorePartwiseData.filter(elem => elem['part']);

  if (!scoreParts || !partsData) {
    onProgress?.({ completedPercentage: 0, error: 'Missing parts information', message: 'Parsing failed' });
    throw new Error('Missing parts information');
  }

  const processingConfigs: PartConfig[] = [];

  scoreParts.forEach((part, idx) => {
    const partName = part?.['part-name'];
    if (partName) {
      if (longNamesSet.has(partName.toLowerCase())) {
        const key = getKeyByLongName(partName);
        processingConfigs.push({ partIndex: idx, outputName: key || partName, targetVoice: "1" });
      } else {
        const detectedParts = detectClosedScore(partName);
        if (Array.isArray(detectedParts)) {
          const key1 = detectedParts[0]
          const key2 = detectedParts[1]
          processingConfigs.push({ partIndex: idx, outputName: key1 || partName, targetVoice: "1" });
          processingConfigs.push({ partIndex: idx, outputName: key2 || partName, targetVoice: "2" });
        }
      }
    }
  })

  let initialTempoInfo: TempoInfo | null = null
  const snapshot: AttributeSnapshot = {}
  const seenInitialAttributes = { value: false }

  let solfaStr = '';

  for (let p = 0; p < processingConfigs.length; p++) {
    const config = processingConfigs[p];
    if (!config) continue;

    const rawPartWrapper = partsData[config.partIndex];
    const partMeasures = rawPartWrapper['part'];

    let solfaForPartAccum = config.outputName + '. ';

    let slurState: { [partName: string]: boolean } = {};
    let tieState: { [partName: string]: boolean } = {};

    if (slurState[config.outputName] === undefined) {
      slurState[config.outputName] = false;
    }
    if (tieState[config.outputName] === undefined) {
      tieState[config.outputName] = false;
    }

    for (let m = 0; m < partMeasures.length; m++) {
      const measureEvents = partMeasures[m]?.['measure'];

      const cleanNotes: XMLNote[] = [];
      let currentDynamic: any = null;
      let currentDirectionText: any = null;
      let tempoInfo: TempoInfo | null = null
      let timeChanged = false;
      let keyChanged = false;

      // --- STEP 1: Pre-process the Measure Events ---
      if (Array.isArray(measureEvents)) {
        for (const event of measureEvents) {
          if (event.attributes) {
            const attributes = simplifyNode(event.attributes);
            const parsedAttrs = parseXMLMeasureAttributes(attributes);
            if (parsedAttrs.time) timeChanged = hasChanged(parsedAttrs.time, snapshot.currentTime, ['numerator', 'denominator']);
            if (parsedAttrs.key) keyChanged = hasChanged(parsedAttrs.key, snapshot.currentKey, ['key', 'mode']);
            updateAttributeSnapshot(snapshot, parsedAttrs, seenInitialAttributes);
          }

          if (event.direction) {
            const dir = simplifyNode(event.direction);

            if (dir['direction-type']?.dynamics) {
              currentDynamic = Object.keys(dir['direction-type'].dynamics)[0];
            }
            // (e.g. rit..)
            if (dir['direction-type']?.words) {
              currentDirectionText = dir['direction-type'].words;
            }
            if (dir['direction-type']?.metronome) {
              const metronome = dir['direction-type'].metronome;
              // ensure tempoInfo is initialized before assigning fields
              tempoInfo = {
                beatUnit: metronome['beat-unit'],
                beatUnitDot: metronome['beat-unit-dot'] !== undefined ? true : false,
                perMinute: Number(metronome['per-minute'])
              };
              if (!initialTempoInfo) initialTempoInfo = { ...tempoInfo };
            }
          }

          if (event.note) {
            const noteData = simplifyNode(event.note);
            // if ((m > 13 && m <= 15) && config.outputName === 'T') console.log('Note Data (Measure > 13):', noteData);
            const noteVoice = noteData.voice ? String(noteData.voice) : "1";

            if (noteVoice === config.targetVoice) {
              if (currentDynamic) {
                noteData.dynamic = currentDynamic;
                currentDynamic = null;
              }
              if (currentDirectionText) {
                noteData.directionText = currentDirectionText;
                currentDirectionText = null;
              }
              if (tempoInfo) {
                noteData.tempo = tempoInfo;
                tempoInfo = null;
              }
              cleanNotes.push(noteData);
            }
          }
        }
      }

      let currentSlurState = slurState[config.outputName];
      let currentTieState = tieState[config.outputName];
      const { solfaString, newSlurState, newTieState } = parseXMLNotes(
        cleanNotes,
        snapshot.currentKey!,
        snapshot.currentTime!,
        snapshot.currentDivision!,
        config.outputName,
        currentSlurState!,
        currentTieState!,
        timeChanged,
        keyChanged,
        m // meausure index
      );

      solfaForPartAccum += solfaString + ' | ';
      slurState[config.outputName] = newSlurState;
      tieState[config.outputName] = newTieState;
    }

    solfaStr += solfaForPartAccum + '\n';
  }

  const finalMetadata = {
    title: workTitle,
    composers: creators,
    rights: rights || '',
    initialTempo: initialTempoInfo,
    timeSignature: snapshot.initialTime,
    keySignature: snapshot.initialKey
  };

  return { solfaString: solfaStr.trim(), metadata: finalMetadata };
}
