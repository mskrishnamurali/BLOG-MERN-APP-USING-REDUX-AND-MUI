const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to MongoDB Database ${mongoose.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error}`.bgRed.white);
    }
};

module.exports = connectDB;
