import natural from 'natural';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Go up one directory from 'training' folder to project root
const projectRoot = path.join(__dirname, '..');

// Initialize classifier
const classifier = new natural.BayesClassifier();

try {
    // Read the company QA data from the correct path
    const qaData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'chatbot/company_qa.json'), 'utf8'));
    console.log('Training data loaded successfully!');
    console.log(`Loaded ${qaData.length} QA pairs`);

    // Train classifier
    qaData.forEach(item => {
        // Train with main question
        classifier.addDocument(item.question, item.category);
        
        // Train with additional patterns
        if (item.patterns) {
            item.patterns.forEach(pattern => {
                classifier.addDocument(pattern, item.category);
            });
        }
    });

    // Train the classifier
    classifier.train();

    // Save the trained classifier
    classifier.save('classifier.json', (err) => {
        if (err) {
            console.error('Error saving classifier:', err);
        } else {
            console.log('Classifier trained and saved successfully!');
        }
    });
} catch (error) {
    console.error('Error loading training data:', error);
}