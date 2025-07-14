import express from "express";
import  "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoute.js";
import { Socket, Server } from "socket.io";
//import { use } from "react";

//Create  express  app and  HTTP server
const app =  express();
const server =  http.createServer(app)

//initialize  socketio  server  
export const io =  new Server(server, {
    cors: {origin: "*"}
})

//store  online users
export const userSocketMap = {}; //{userId: socketId}

//socket.io .connectio handler 
io.on("connection", (socket)=> { 
    const userId = socket.handshake.query.userId;
    console.log("User connected ", userId);

    if(userId) userSocketMap[userId] =  socket.id;

    //Emit  online  users  to all connected  clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        
    }) 
})
    

//Middleware set  up  
app.use(express.json({limit: "4mb"}))
app.use(cors());
app.use("/api/messages", messageRouter)

app.use("/api/status", (req, res)=> res.send("Server is Live"))
app.use("/api/auth", userRouter);

// connect  to mongodb
await connectDB();


const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log("Server is  running on  PORT : " + PORT)); 
