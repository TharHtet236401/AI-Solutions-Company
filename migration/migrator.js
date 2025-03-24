import fs from 'fs';

import Inquiry from "../models/inquiries.model.js";



export const backup = async () => {
    try {
        const inquiries = await Inquiry.find();
        const file = "./migration/backups/inquiries.json";
        await fs.promises.writeFile(file, JSON.stringify(inquiries, null, 2));
        console.log("Inquiries backup completed");
    } catch (error) {
        console.error("Error during backup:", error);
        throw error;
    }
}


