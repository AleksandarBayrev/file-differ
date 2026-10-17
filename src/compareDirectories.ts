import { readdir, stat as fsStat } from 'fs/promises';
import { join, relative } from 'path';
import { ComparisonResult, TypeMismatchDiff } from './types';

interface FileEntry {
  baseDir: string;
  problem: string | null;
  size: number;
}

async function recurseDirectory(
  dir: string, 
  baseDir = dir, 
  fileMap = new Map<string, FileEntry>()
): Promise<Map<string, FileEntry>> {
    try {
        const files = await readdir(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            try {
                const stat = await fsStat(filePath);
                const relativePath = relative(baseDir, filePath);

                if (stat.isDirectory()) {
                    fileMap.set(relativePath, { baseDir, problem: 'DIRECTORY', size: 0 });
                    await recurseDirectory(filePath, baseDir, fileMap);
                } else {
                    fileMap.set(relativePath, { baseDir, problem: null, size: stat.size });
                }
            } catch (err: any) {
                if (err.code !== 'EPERM' && err.code !== 'EACCES') {
                    console.error(`Error reading stat for ${filePath}:`, err.message);
                }
            }
        }
    } catch (err: any) {
        if (err.code !== 'EPERM' && err.code !== 'EACCES') {
            console.error(`Error reading directory ${dir}:`, err.message);
        }
    }

    return fileMap;
}

async function compareDirectories(dir1: string, dir2: string): Promise<ComparisonResult> {
    console.log(`Scanning Drive 1 (${dir1})...`);
    const files1 = await recurseDirectory(dir1);
    
    console.log(`Scanning Drive 2 (${dir2})...`);
    const files2 = await recurseDirectory(dir2);

    const diffs: ComparisonResult = {
        fileDiffs: [],
        directoryDiffs: []
    };

    for (const [itemPath, entry2] of files2.entries()) {
        const isDir2 = entry2.problem === 'DIRECTORY';
        const drive1FullPath = join(dir1, itemPath);
        const drive2FullPath = join(dir2, itemPath);

        if (!files1.has(itemPath)) {
            // Missing in Drive 1: exists on Drive 2
            const missingDiff = {
                path: itemPath,
                issue: 'MISSING_IN_DRIVE_1' as const,
                basePath: entry2.baseDir,
                drive1Path: drive1FullPath,
                drive2Path: drive2FullPath
            };

            if (isDir2) {
                diffs.directoryDiffs.push(missingDiff);
            } else {
                diffs.fileDiffs.push(missingDiff);
            }
        } else {
            const entry1 = files1.get(itemPath)!;
            const isDir1 = entry1.problem === 'DIRECTORY';
            
            if (isDir1 !== isDir2) {
                const typeMismatchObj: TypeMismatchDiff = {
                    path: itemPath,
                    issue: 'TYPE_MISMATCH',
                    drive1Type: isDir1 ? 'Directory' : 'File',
                    drive2Type: isDir2 ? 'Directory' : 'File',
                    drive1BasePath: entry1.baseDir,
                    drive2BasePath: entry2.baseDir,
                    drive1Path: drive1FullPath,
                    drive2Path: drive2FullPath
                };
                
                diffs.directoryDiffs.push(typeMismatchObj);
                diffs.fileDiffs.push(typeMismatchObj);
            } else if (!isDir1 && !isDir2 && entry1.size !== entry2.size) {
                diffs.fileDiffs.push({
                    path: itemPath,
                    issue: 'DIFFERENT_SIZE',
                    drive1Size: entry1.size,
                    drive2Size: entry2.size,
                    drive1BasePath: entry1.baseDir,
                    drive2BasePath: entry2.baseDir,
                    drive1Path: drive1FullPath,
                    drive2Path: drive2FullPath
                });
            }
        }
    }

    for (const [itemPath, entry1] of files1.entries()) {
        const isDir1 = entry1.problem === 'DIRECTORY';
        
        if (!files2.has(itemPath)) {
            // Missing in Drive 2: exists on Drive 1
            const drive1FullPath = join(dir1, itemPath);
            const drive2FullPath = join(dir2, itemPath);

            const missingDiff = {
                path: itemPath,
                issue: 'MISSING_IN_DRIVE_2' as const,
                basePath: entry1.baseDir,
                drive1Path: drive1FullPath,
                drive2Path: drive2FullPath
            };

            if (isDir1) {
                diffs.directoryDiffs.push(missingDiff);
            } else {
                diffs.fileDiffs.push(missingDiff);
            }
        }
    }

    return diffs;
}

export { compareDirectories };