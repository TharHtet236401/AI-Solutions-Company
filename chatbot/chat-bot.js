import express from 'express';
import natural from 'natural';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Initialize intent patterns
const intents = {
    greeting: {
        patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'],
        responses: ['Hello! How can I help you?', 'Hi there! What can I do for you?']
    },
    goodbye: {
        patterns: ['bye', 'goodbye', 'see you', 'see you later', 'good night'],
        responses: ['Goodbye!', 'Have a great day!', 'See you later!']
    },
    // Add more intents as needed
};

// Function to load and process company data
function loadCompanyData() {
    try {
        const dataPath = path.join(__dirname, 'company_qa.json');
        
        if (!fs.existsSync(dataPath)) {
            console.error('Training data file not found:', dataPath);
            return false;
        }

        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        if (!Array.isArray(data) || data.length === 0) {
            console.error('Training data is empty or invalid');
            return false;
        }

        // Train the classifier with all patterns for each category
        data.forEach(qa => {
            if (qa.patterns && Array.isArray(qa.patterns)) {
                qa.patterns.forEach(pattern => {
                    classifier.addDocument(pattern, qa.category);
                });
                
                // Add the main question as well
                classifier.addDocument(qa.question, qa.category);
                
                // Store in intents for fallback
                intents[qa.category] = {
                    patterns: [...qa.patterns, qa.question],
                    responses: [qa.answer]
                };
            }
        });

        classifier.train();
        console.log('Classifier trained successfully with', Object.keys(intents).length, 'intents');
        return true;
    } catch (error) {
        console.error('Error loading company data:', error);
        return false;
    }
}

// Make sure classifier is trained before handling requests
const isClassifierTrained = loadCompanyData();

// Function to find the best response
function findBestResponse(message) {
    try {
        // Tokenize and normalize input
        const tokens = tokenizer.tokenize(message.toLowerCase());
        
        // Check if classifier has been trained
        try {
            if (classifier.getClassifications().length > 0) {
                const category = classifier.classify(message);
                if (intents[category]) {
                    const responses = intents[category].responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        } catch (classifierError) {
            console.log('Classifier not trained, falling back to pattern matching');
        }

        // Fallback to token matching if classification fails
        let bestMatch = {
            intent: null,
            score: 0
        };

        // Compare tokens with each intent's patterns
        Object.entries(intents).forEach(([intent, data]) => {
            data.patterns.forEach(pattern => {
                const patternTokens = tokenizer.tokenize(pattern.toLowerCase());
                let matchScore = 0;
                
                tokens.forEach(token => {
                    if (patternTokens.includes(token)) {
                        matchScore++;
                    }
                });

                const score = matchScore / Math.max(tokens.length, patternTokens.length);
                if (score > bestMatch.score) {
                    bestMatch = { intent, score };
                }
            });
        });

        if (bestMatch.score > 0.3) { // Threshold for matching
            const responses = intents[bestMatch.intent].responses;
            return responses[Math.floor(Math.random() * responses.length)];
        }

        return "I'm not sure how to respond to that. Could you please rephrase your question?";
    } catch (error) {
        console.error('Error in findBestResponse:', error);
        return "I apologize, but I encountered an error processing your message.";
    }
}

// Chat endpoint
export const chat = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = findBestResponse(message);
        res.json({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};

export default chat;
