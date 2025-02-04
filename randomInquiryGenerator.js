import { faker } from '@faker-js/faker'
import { connectMongo } from './config/connectMongo.js'
import Inquiry from './models/inquiries.model.js'
import mongoose from 'mongoose'

const generateFakeInquiries = async (count = 50) => {
    try {
        // Generate a random date between 2022-2024
        const startDate = new Date('2025-02-01T00:00:00.000Z');
        const endDate = new Date('2025-02-31T23:59:59.999Z');
        




        const inquiries = [];
        for (let i = 0; i < count; i++) {
            const inquiry = {
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phoneNumber: faker.phone.number('+1 ###-###-####'),
                companyName: faker.company.name(),
                country: faker.location.country(),
                jobTitle: faker.person.jobTitle(),
                jobDetails: faker.lorem.paragraph(),
                createdAt: faker.date.between({ from: startDate, to: endDate }),
                status: faker.helpers.arrayElement(["pending", "in-progress", "follow-up", "closed"]),
            };
            inquiries.push(inquiry);
        }

        return inquiries;
    } catch (error) {
        console.error('Error generating fake inquiries:', error);
        process.exit(1);
    }
};

const main = async () => {
    try {
        // Connect to MongoDB
        await connectMongo();

        // Generate 50 fake inquiries
        const inquiries = await generateFakeInquiries(50);
        
        // Save to MongoDB
        const savedInquiries = await Inquiry.insertMany(inquiries);
        console.log(`Successfully saved ${savedInquiries.length} inquiries to database`);
        
        // Display the first inquiry as example
        console.log('\nExample of saved inquiry:');
        console.log(JSON.stringify(savedInquiries[0], null, 2));
        
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

main();
