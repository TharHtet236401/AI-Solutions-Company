import { faker } from '@faker-js/faker'

const generateFakeInquiries = async (count = 50) => {
    try {
        const inquiry = {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phoneNumber: faker.phone.number(),
            companyName: faker.company.name(),
            country: faker.location.country(),
            jobTitle: faker.person.jobTitle(),
            jobDetails: faker.lorem.paragraph(),
            status: 'pending',
        };
        return inquiry;
    } catch (error) {
        console.error('Error generating fake inquiries:', error);
        process.exit(1);
    }
};

const main = async () => {
    try {
        const answer = await generateFakeInquiries(1);
        const stringifiedAnswer = JSON.stringify(answer, null, 2);
        console.log(stringifiedAnswer);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

main();
