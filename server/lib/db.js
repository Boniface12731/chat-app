import mongoose from "mongoose";

//Function to connect the mongoose database 
export const connectDB = async() => {
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/chatapp`)
    } catch (error) {
        console.log(error);    
    }
}