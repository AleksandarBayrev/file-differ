(async () => {
    const { compareDirectories } = require('./compareDirectories.js');
    const { writeFile } = require('fs/promises');
    const firstPath = process.argv[2];
    const secondPath = process.argv[3];

    if (!firstPath || !secondPath) {
        console.error('Usage: node file-differ.js <path_to_drive_1> <path_to_drive_2>');
        process.exit(1);
    }

    const output = [];

    const differences = await compareDirectories(firstPath, secondPath);

    if (differences.length === 0) {
        console.log('\nThe hard drives are identical.');
    } else {
        console.log(`\nFound ${differences.length} differences:`);
        output.push(`\nFound ${differences.length} differences:`);
        differences.forEach(diff => {
            console.log(diff);
            output.push(diff);
        });
        await writeFile('differences.txt', output.join('\n'), 'utf8');
        console.log('\nDifferences have been written to differences.txt');
    }
})();