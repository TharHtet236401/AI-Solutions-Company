import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
    },
    category: {
        type: String,
        enum: ['product', 'event', 'team'],
    },

    description: {
        type: String,
    },
    image: {
        type: String,
    },
    poster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Gallery = mongoose.model("Gallery", gallerySchema);

export default Gallery;
