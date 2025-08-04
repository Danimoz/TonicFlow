import { Project, ProjectVersion } from "@/app/(dashboard)/types";
import Dexie, { EntityTable } from "dexie";


export class TonicFlowDatabase extends Dexie {
  projects!: EntityTable<Project, 'id'>;
  projectVersions!: EntityTable<ProjectVersion, 'id'>;

  constructor() {
    super('TonicFlowDB')
    this.version(1).stores({
      projects: 'id, title, subTitle, composer, arranger, keySignature, timeSignature, yearOfComposition, tempo, userId, createdAt, updatedAt',
      projectVersions: 'id, projectId, notationContent, versionType, createdAt, updatedAt'
    });
  }
}

export const db = new TonicFlowDatabase();