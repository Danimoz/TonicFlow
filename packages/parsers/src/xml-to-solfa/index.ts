import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { ProgressReport } from "../types.js";
import { xmlJSONToSolfaParser } from "./xmlJson-to-solfa.js";

export async function xmlToSolfa(xml: File, onProgress?: (report: ProgressReport) => void) {
  try {
    const extension = xml.name.split('.').pop()?.toLowerCase();
    if (extension === 'mxl') {
      onProgress?.({ message: 'Decompressing MXL file...', completedPercentage: 10 });
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(xml);
      onProgress?.({ message: 'File decompressed.', completedPercentage: 30 });

      const xmlFiles = Object.keys(loadedZip.files).filter(filename => {
        const isNotDir = !loadedZip.files[filename]?.dir;
        const isXml = filename.toLowerCase().endsWith('.xml') || filename.toLowerCase().endsWith('.musicxml');
        const isNotMimeType = filename.toLowerCase() !== 'mimetype';
        const isNotMeta = !filename.toLowerCase().startsWith('meta-inf/')
        return isNotDir && isXml && isNotMimeType && isNotMeta;
      })
      if (xmlFiles.length === 0) {
        throw new Error('No XML file found inside the MXL archive.');
      }
      const xmlFileName = xmlFiles[0];
      const xmlContent = (xmlFileName && loadedZip.files[xmlFileName]) && await loadedZip.files[xmlFileName].async('text');
      await parseMusicXMLToJSON(xmlContent || '', onProgress);
    } else if (['xml', 'musicxml'].includes(extension || '')) {
      const xmlContent = await xml.text();
      await parseMusicXMLToJSON(xmlContent, onProgress);
    }

    onProgress?.({ message: 'Processing complete!', completedPercentage: 100 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    onProgress?.({ message: 'Error during processing', completedPercentage: 100, error: errorMessage });
  }
}

async function parseMusicXMLToJSON(xmlData: string, onProgress?: (report: ProgressReport) => void) {
  onProgress?.({ message: 'Parsing MusicXML...', completedPercentage: 40 });
  
  const parser = new XMLParser({ preserveOrder: true });
  const jsonData = parser.parse(xmlData);
  console.log(jsonData);
  const solfaData = xmlJSONToSolfaParser(jsonData, onProgress);
  onProgress?.({ message: 'Finalizing structure...', completedPercentage: 90 });
  console.log('Solfa Data:', solfaData);
}