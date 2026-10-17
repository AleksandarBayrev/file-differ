import { readdir, stat as fsStat } from 'fs/promises';
import { join, relative } from 'path';
import { ComparisonResult, TypeMismatchDiff } from './types';

async function recurseDirectory(
  dir: string, 
  baseDir = dir, 
  fileMap = new Map<string, string | number>()
): Promise<Map<string, string | number>> {
    try {
        const files = await readdir(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            try {
                const stat = await fsStat(filePath);
                const relativePath = relative(baseDir, filePath);

                if (stat.isDirectory()) {
                    fileMap.set(join(baseDir, relativePath), 'DIRECTORY');
                    await recurseDirectory(filePath, baseDir, fileMap);
                } else {
                    fileMap.set(join(baseDir, relativePath), stat.size);
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

    const addDiff = (
      path: string, 
      isDir: boolean, 
      issueObject: { issue: 'MISSING_IN_DRIVE_1' | 'MISSING_IN_DRIVE_2' }
    ) => {
        if (isDir) {
            diffs.directoryDiffs.push({ path, ...issueObject });
        } else {
            diffs.fileDiffs.push({ path, ...issueObject });
        }
    };

    for (const [itemPath, sizeOrType2] of files2.entries()) {
        const isDir2 = sizeOrType2 === 'DIRECTORY';

        if (!files1.has(itemPath)) {
            addDiff(itemPath, isDir2, { issue: 'MISSING_IN_DRIVE_1' });
        } else {
            const sizeOrType1 = files1.get(itemPath);
            
            if (sizeOrType1 !== sizeOrType2) {
                const isDir1 = sizeOrType1 === 'DIRECTORY';
                
                if (isDir1 || isDir2) {
                    const issueObj: Omit<TypeMismatchDiff, 'path'> = {
                        issue: 'TYPE_MISMATCH',
                        drive1Type: isDir1 ? 'Directory' : 'File',
                        drive2Type: isDir2 ? 'Directory' : 'File'
                    };
                    
                    diffs.directoryDiffs.push({ path: itemPath, ...issueObj });
                    diffs.fileDiffs.push({ path: itemPath, ...issueObj });
                } else {
                    diffs.fileDiffs.push({
                        path: itemPath,
                        issue: 'DIFFERENT_SIZE',
                        drive1Size: sizeOrType1 as number,
                        drive2Size: sizeOrType2 as number
                    });
                }
            }
        }
    }

    for (const [itemPath, sizeOrType1] of files1.entries()) {
        const isDir1 = sizeOrType1 === 'DIRECTORY';
        
        if (!files2.has(itemPath)) {
            addDiff(itemPath, isDir1, { issue: 'MISSING_IN_DRIVE_2' });
        }
    }

    return diffs;
}

export { compareDirectories };