const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadAndSaveFile(url) {
    try {
        const response = await axios.get(url, { responseType: 'stream' });
        const fileName = path.basename(url);
        const filePath = path.join(__dirname, '../..', 'public', fileName);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
}

module.exports = {
    downloadAndSaveFile,
};
