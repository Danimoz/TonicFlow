import { AttributeSnapshot, ProgressReport, XMLNote } from "../types.js";
import { 
  extractXMLTempoInfo, 
  partMap, 
  parseXMLMeasureAttributes, 
  updateAtrributeSnapshot, 
  toArray, 
  parseXMLNotes, 
  hasChanged, 
  getText, 
  getTextArray,
  simplifyNode
} from "../utils.js";

const vocalKeys =  ["S", "A", "T", "B", "MS", "Bar", "S I", "S II", "S III", "A I", "A II", "A III", "T I", "T II", "T III", "B I", "B II", "B III"];
const longNamesSet = new Set(
  vocalKeys.map(k => partMap[k]?.long.toLowerCase())
)
function getKeyByLongName(name: string): string | undefined {
  return Object.entries(partMap).find(([_, v]) => v.long.toLowerCase() === name.toLowerCase())?.[0];
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
    .map(elem => elem['score-part']?.[0])

  const partsData = scorePartwiseData.filter(elem => elem['part']);
  
  if (!scoreParts || !partsData) {
    onProgress?.({ completedPercentage: 0, error: 'Missing parts information', message: 'Parsing failed' });
    throw new Error('Missing parts information');
  }

  const partsToUseSet = new Set<number>();
  const partsToUseNames: string[] = [];

  if (scoreParts) {
    scoreParts.forEach((part, idx) => {
      const partName = getText(part?.['part-name'])
      if (partName && longNamesSet.has(partName.toLowerCase())){
        partsToUseSet.add(idx);
        partsToUseNames.push(getKeyByLongName(partName) || '')
      }
    })
  }

  const filteredPartsData = partsData?.filter((_, idx) => partsToUseSet.has(idx));
  
  const snapshot: AttributeSnapshot = {}
  const seenInitialAttributes = { value: false }
  
  let solfaStr = '';

  for (let p = 0; p < filteredPartsData.length; p++) {
    const part: any[] = filteredPartsData[p]['part'];

    const solfaForPart = partsToUseNames[p] + '. ';
    let slurState : { [partName: string] : boolean} = {};
    let tieState : { [partName: string] : boolean} = {};
    let solfaForPartAccum = solfaForPart;

    if (slurState[partsToUseNames[p]!] === undefined) {
      slurState[partsToUseNames[p]!] = false;
    }
    if (tieState[partsToUseNames[p]!] === undefined) {
      tieState[partsToUseNames[p]!] = false;
    }
    
    for (let m = 0; m < part.length; m++) {
      const measureEvents = part[m]['measure'];
      const cleanNotes: XMLNote[] = [];
      let currentDynamic: any = null;
      let timeChanged = false;
      let keyChanged = false;

      // --- STEP 1: Pre-process the Measure Events ---
      if (Array.isArray(measureEvents)){
        for (const event of measureEvents) {
          if (event.attributes){
            const attributes = simplifyNode(event.attributes);
            const parsedAttrs = parseXMLMeasureAttributes(attributes);
            if (parsedAttrs.time) timeChanged = hasChanged(parsedAttrs.time, snapshot.currentTime, ['numerator', 'denominator']);
            if (parsedAttrs.key) keyChanged = hasChanged(parsedAttrs.key, snapshot.currentKey, ['key', 'mode']);
            updateAtrributeSnapshot(snapshot, parsedAttrs, seenInitialAttributes);
          }

          if (event.direction){
            const dir = simplifyNode(event.direction);
            if (dir['direction-type']?.dynamics) {
              currentDynamic = Object.keys(dir['direction-type'].dynamics)[0];
            }
          }

          if (event.note){
            const noteData = simplifyNode(event.note);
            noteData.dynamic = currentDynamic;
            cleanNotes.push(noteData);
          }

          // Handle Polyphony Later sha

        }
      }

      let currentSlurState = slurState[partsToUseNames[p]!];
      let currentTieState = tieState[partsToUseNames[p]!];
      const { solfaString, newSlurState, newTieState } = parseXMLNotes(
        cleanNotes,
        snapshot.currentKey!,
        snapshot.currentTime!,
        snapshot.currentDivision!,
        partsToUseNames[p]!,
        currentSlurState!,
        currentTieState!,
        timeChanged,
        keyChanged,
        m // meausure index
      );

      solfaForPartAccum += solfaString + ' | ';
      slurState[partsToUseNames[p]!] = newSlurState;
      tieState[partsToUseNames[p]!] = newTieState;
    }

    solfaStr += solfaForPartAccum;
    if (p > 0) {
      solfaStr += '\n';
    }
  }

  return solfaStr;
}
