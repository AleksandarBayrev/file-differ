export type DiffIssueType = 
  | 'MISSING_IN_DRIVE_1' 
  | 'MISSING_IN_DRIVE_2' 
  | 'TYPE_MISMATCH' 
  | 'DIFFERENT_SIZE';

export interface BaseDiff {
  path: string;
  issue: DiffIssueType;
  drive1Path: string; // Full absolute path for Drive 1 location
  drive2Path: string; // Full absolute path for Drive 2 location
}

export interface MissingDiff extends BaseDiff {
  issue: 'MISSING_IN_DRIVE_1' | 'MISSING_IN_DRIVE_2';
  basePath: string; // Base directory of the drive where the item actually exists
}

export interface TypeMismatchDiff extends BaseDiff {
  issue: 'TYPE_MISMATCH';
  drive1Type: 'Directory' | 'File';
  drive2Type: 'Directory' | 'File';
  drive1BasePath: string;
  drive2BasePath: string;
}

export interface DifferentSizeDiff extends BaseDiff {
  issue: 'DIFFERENT_SIZE';
  drive1Size: number;
  drive2Size: number;
  drive1BasePath: string;
  drive2BasePath: string;
}

export type FileDiff = MissingDiff | TypeMismatchDiff | DifferentSizeDiff;
export type DirectoryDiff = MissingDiff | TypeMismatchDiff;

export interface ComparisonResult {
  fileDiffs: FileDiff[];
  directoryDiffs: DirectoryDiff[];
}