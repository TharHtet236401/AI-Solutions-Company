import fs from 'fs';
import db from "../utils/dbs.js";


const writeFile = async (file, data) => {
    await fs.promises.writeFile(file, JSON.stringify(data, null, 2));
}

const storage =  (file)=>{
    return `./migration/backups/${file}.json` // extracting the file path
}

const checkBackupExists = (file) => {
    try {
        return fs.existsSync(storage(file));
    } catch (error) {
        return false;
    }
}

export const migrator= async (db,file) => {
    try {
        if (checkBackupExists(file)) {
            console.log(`${file} backup already exists, skipping...`);
            return;
        }
        const data = await db.find();
        // Ensure backup directory exists
        fs.mkdirSync('./migration/backups', { recursive: true });
        await writeFile(storage(file), data);
        console.log(`${file} backup completed`);
    } catch (error) {
        console.error("Error during backup:", error); 
        throw error;
    }
}



export const backup = async () => {
    await migrator(db.inquiries, "inquiries");
    await migrator(db.blogs, "blogs");
    await migrator(db.gallery, "gallery");
    await migrator(db.users, "users");
}

// backup();

