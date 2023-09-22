const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
        });
        console.log("MongoDB Connection Success");
    } catch (err) {
        console.log("MongoDB connection failed");
        process.exit(1);
    }
}

module.exports = connectDB;