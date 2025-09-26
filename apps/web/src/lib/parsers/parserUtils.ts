export const partMap: { [key: string]: { long: string; short: string } } = {
  S: { long: "Soprano", short: "S" },
  A: { long: "Alto", short: "A" },
  T: { long: "Tenor", short: "T" },
  B: { long: "Bass", short: "B" },
  S1: { long: "Soprano 1", short: "SI" },
  S2: { long: "Soprano 2", short: "SII" },
  S3: { long: "Soprano 3", short: "SIII" },
  MS: { long: "Mezzo-Soprano", short: "MS" },
  A1: { long: "Alto 1", short: "A I." },
  A2: { long: "Alto 2", short: "A II." },
  A3: { long: "Alto 3", short: "A III." },
  T1: { long: "Tenor 1", short: "T I." },
  T2: { long: "Tenor 2", short: "T II." },
  T3: { long: "Tenor 3", short: "T III." },
  B1: { long: "Bass 1", short: "B I." },
  B2: { long: "Bass 2", short: "B II." },
  B3: { long: "Bass 3", short: "B III." },
  Bar: { long: "Baritone", short: "Bar." },
  Vln: { long: "Violin", short: "Vln." },
  Vln1: { long: "Violin 1", short: "Vln I." },
  Vln2: { long: "Violin 2", short: "Vln II." },
  Vla: { long: "Viola", short: "Vla." },
  Vc: { long: "Cello", short: "Vc." },
  Cb: { long: "Bass", short: "Cb." },
  Fl: { long: "Flute", short: "Fl." },
  Ob: { long: "Oboe", short: "Ob." },
  Cl: { long: "Clarinet", short: "Cl." },
  Bsn: { long: "Bassoon", short: "Bsn." },
  Hn: { long: "Horn", short: "Hn." },
  Tpt: { long: "Trumpet", short: "Tpt." },
  Tbn: { long: "Trombone", short: "Tbn." },
  Euph: { long: "Euphonium", short: "Euph." },
  Tuba: { long: "Tuba", short: "Tuba." },
  Perc: { long: "Percussion", short: "Perc." },
  Hp: { long: "Harp", short: "Hp." },
  Pno: { long: "Piano", short: "Pno." },
  Org: { long: "Organ", short: "Org." },
  Gtr: { long: "Guitar", short: "Gtr." },
  ElGtr: { long: "Electric Guitar", short: "ElGtr." },
  BsGtr: { long: "Bass Guitar", short: "BsGtr." },
  Drms: { long: "Drums", short: "Drms." }
}


export const getOctaveNumber = (note: string): number => {
  let octave = 0
  const octaveChar = note.slice(-1);
  if (["″", "²"].includes(octaveChar)) octave = 2;
  else if (["'", "’"].includes(octaveChar)) octave = 1;
  else if (["ₗ"].includes(octaveChar)) octave = -1;
  else if (["₂"].includes(octaveChar)) octave = -2;

  return octave;
}