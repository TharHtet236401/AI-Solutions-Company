import { faker } from "@faker-js/faker";

const generateFakeBlogs = (count = 1) => {
    try {
        let blog;
        const categories = [
            "AI Trends",
            "Machine Learning",
            "AI Solutions",
            "Data Analytics",
            "Security",
        ];

        for (let i = 0; i < count; i++) {
            blog = {
                title: faker.lorem.sentence(),
                content: faker.lorem.paragraphs(5),
                category: faker.helpers.arrayElement(categories),
                createdAt: faker.date.between({ 
                    from: '2024-01-01T00:00:00.000Z', 
                    to: '2024-03-15T00:00:00.000Z' 
                }),
                updatedAt: faker.date.recent()
            }
        }
        return blog;
    } catch (error) {
        console.error("Error generating fake blogs:", error);
        return [];
    }
};

// Generate and log example blogs
console.log(JSON.stringify(generateFakeBlogs(), null, 2));

// Example usage:
// const blogs = generateFakeBlogs(50); // Get 50 fake blogs
// const blogs = generateFakeBlogs(); // Get default 50 fake blogs
