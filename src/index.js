(async () => {
    const { compareDirectories } = require('./compareDirectories.js');
    const { writeFile } = require('fs/promises');
    const firstPath = process.argv[2];
    const secondPath = process.argv[3];

    if (!firstPath || !secondPath) {
        console.error('Usage: node file-differ.js <path_to_drive_1> <path_to_drive_2>');
        process.exit(1);
    }

    console.log('Comparing directories, please wait...');
    const differences = await compareDirectories(firstPath, secondPath);

    const fileCount = differences.fileDiffs.length;
    const dirCount = differences.directoryDiffs.length;
    const totalDiffs = fileCount + dirCount;

    if (totalDiffs === 0) {
        console.log('\nThe hard drives are identical.');
    } else {
        console.log(`\nFound ${totalDiffs} total differences (${dirCount} directories, ${fileCount} files).`);

        await writeFile('differences.json', JSON.stringify(differences, null, 4), 'utf8');

        console.log('Differences have been written to differences.json');
    }
})();