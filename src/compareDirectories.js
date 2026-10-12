const { readdirSync, statSync } = require('fs');
const { join, relative } = require('path');

function recurseDirectory(dir, baseDir = dir, fileMap = new Map()) {
    try {
        const files = readdirSync(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            try {
                const stat = statSync(filePath);
                const relativePath = relative(baseDir, filePath);

                if (stat.isDirectory()) {
                    fileMap.set(relativePath, 'DIRECTORY');
                    recurseDirectory(filePath, baseDir, fileMap);
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

function compareDirectories(dir1, dir2) {
    console.log(`Scanning Drive 1 (${dir1})...`);
    const files1 = recurseDirectory(dir1);
    
    console.log(`Scanning Drive 2 (${dir2})...`);
    const files2 = recurseDirectory(dir2);

    const missingOrDifferent = [];

    for (const [itemPath, sizeOrType] of files2.entries()) {
        const type2 = sizeOrType === 'DIRECTORY' ? 'Directory' : 'File';

        if (!files1.has(itemPath)) {
            missingOrDifferent.push(`MISSING in Drive 1: [${type2}] ${itemPath}`);
        } else if (files1.get(itemPath) !== sizeOrType) {
            const val1 = files1.get(itemPath);
            
            if (val1 === 'DIRECTORY' || sizeOrType === 'DIRECTORY') {
                const type1 = val1 === 'DIRECTORY' ? 'Directory' : 'File';
                missingOrDifferent.push(`TYPE MISMATCH: ${itemPath} (Drive 1: ${type1}, Drive 2: ${type2})`);
            } else {
                missingOrDifferent.push(`DIFFERENT SIZE: ${itemPath} (Drive1: ${val1} bytes, Drive2: ${sizeOrType} bytes)`);
            }
        }
    }

    for (const [itemPath, val1] of files1.entries()) {
        if (!files2.has(itemPath)) {
            const type1 = val1 === 'DIRECTORY' ? 'Directory' : 'File';
            missingOrDifferent.push(`ONLY in Drive 1: [${type1}] ${itemPath}`);
        }
    }

    return missingOrDifferent;
}

module.exports = { compareDirectories };