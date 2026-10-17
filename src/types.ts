export type DiffIssueType = 
  | 'MISSING_IN_DRIVE_1' 
  | 'MISSING_IN_DRIVE_2' 
  | 'TYPE_MISMATCH' 
  | 'DIFFERENT_SIZE';

export interface BaseDiff {
  path: string;
  issue: DiffIssueType;
}

export interface MissingDiff extends BaseDiff {
  issue: 'MISSING_IN_DRIVE_1' | 'MISSING_IN_DRIVE_2';
}

export interface TypeMismatchDiff extends BaseDiff {
  issue: 'TYPE_MISMATCH';
  drive1Type: 'Directory' | 'File';
  drive2Type: 'Directory' | 'File';
}

export interface DifferentSizeDiff extends BaseDiff {
  issue: 'DIFFERENT_SIZE';
  drive1Size: number;
  drive2Size: number;
}

export type FileDiff = MissingDiff | TypeMismatchDiff | DifferentSizeDiff;
export type DirectoryDiff = MissingDiff | TypeMismatchDiff;

export interface ComparisonResult {
  fileDiffs: FileDiff[];
  directoryDiffs: DirectoryDiff[];
}