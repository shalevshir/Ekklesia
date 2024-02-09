import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function downloadAndSaveFile(url: string): Promise<string>{
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

export { downloadAndSaveFile }
