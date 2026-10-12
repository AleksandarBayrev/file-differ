const { readdir, stat: fsStat } = require('fs/promises');
const { join, relative } = require('path');

async function recurseDirectory(dir, baseDir = dir, fileMap = new Map()) {
    try {
        const files = await readdir(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            try {
                const stat = await fsStat(filePath);
                const relativePath = relative(baseDir, filePath);

                if (stat.isDirectory()) {
                    fileMap.set(relativePath, 'DIRECTORY');
                    await recurseDirectory(filePath, baseDir, fileMap);
                } else {
                    fileMap.set(relativePath, stat.size);
                }
            } catch (err) {
                if (err.code !== 'EPERM' && err.code !== 'EACCES') {
                    console.error(`Error reading stat for ${filePath}:`, err.message);
                }
            }
        }
    } catch (err) {
        if (err.code !== 'EPERM' && err.code !== 'EACCES') {
            console.error(`Error reading directory ${dir}:`, err.message);
        }
    }

    return fileMap;
}

async function compareDirectories(dir1, dir2) {
    console.log(`Scanning Drive 1 (${dir1})...`);
    const files1 = await recurseDirectory(dir1);
    
    console.log(`Scanning Drive 2 (${dir2})...`);
    const files2 = await recurseDirectory(dir2);

    const diffs = {
        fileDiffs: [],
        directoryDiffs: []
    };

    const addDiff = (path, isDir, issueObject) => {
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
                    // Type mismatch (One is a file, one is a directory)
                    const issueObj = {
                        issue: 'TYPE_MISMATCH',
                        drive1Type: isDir1 ? 'Directory' : 'File',
                        drive2Type: isDir2 ? 'Directory' : 'File'
                    };
                    
                    // Add to both since it affects a directory in one and a file in the other
                    diffs.directoryDiffs.push({ path: itemPath, ...issueObj });
                    diffs.fileDiffs.push({ path: itemPath, ...issueObj });
                } else {
                    // Both are files, but sizes differ
                    diffs.fileDiffs.push({
                        path: itemPath,
                        issue: 'DIFFERENT_SIZE',
                        drive1Size: sizeOrType1,
                        drive2Size: sizeOrType2
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

module.exports = { compareDirectories };