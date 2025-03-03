import { faker } from '@faker-js/faker';
import { connectMongo } from './config/connectMongo.js';
import User from './models/users.model.js';
import mongoose from 'mongoose';
import { encode } from './utils/libby.js';

const generateFakeStaff = async (count = 50) => {
    try {
        // Define available roles (excluding Super Admin and Executive)
        const roles = [
            'Customer Support',
            'Sales',
            'Marketing',
            'Content',
            'Accounting'
        ];

        const startDate = new Date('2023-01-01T00:00:00.000Z');
        const endDate = new Date();

        const staffMembers = [];
        for (let i = 0; i < count; i++) {
            // Generate a random password
            const password = await encode('password123'); // Default password for all staff

            const staff = {
                username: faker.internet.userName(),
                password: password,
                role: faker.helpers.arrayElement(roles),
                createdAt: faker.date.between({ from: startDate, to: endDate })
            };
            staffMembers.push(staff);
        }

        return staffMembers;
    } catch (error) {
        console.error('Error generating fake staff:', error);
        process.exit(1);
    }
};

const main = async () => {
    try {
        // Connect to MongoDB
        await connectMongo();

        // Generate 50 fake staff members
        const staffMembers = await generateFakeStaff(50);
        
        // Save to MongoDB
        const savedStaff = await User.insertMany(staffMembers);
        console.log(`Successfully saved ${savedStaff.length} staff members to database`);
        
        // Display the first staff member as example
        console.log('\nExample of saved staff member:');
        console.log(JSON.stringify(savedStaff[0], null, 2));
        
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

main();
