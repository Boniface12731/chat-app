import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils";
import User from "../models/User";
import cloudinary from "../lib/cloudinary";

//controller  Sign  up  new  user 
export const signup  = async (req, res) => {
    const {fullnName, email, password, bio } =  req.body;
    try {
        if(!fullnName || !email || !password || !bio){
            return res.json({success:false, message:"Missing Details"})
        }
        const user = await UserActivation.findOne({email});

        if(user){
            return res.json({success:false, message :"Account already exists"})
        }

        const  salt = await bcrypt .genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await user.create({
            fullnName,
            email,
            password: hashedPassword,
            bio,
        });

        const token = generateToken(newUser._id)
        res.json({success: true, userData: newUser, token, message: "Account Created  Successfully"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}


//controller  to  login user 
export const login  =  async(req, res) => {
    try {
        const {email, password} =  req.body;
        const userData = await User.findOne({email});
        const isPasswordCorrect =  await bcrypt.compare(password, userData.password); 

        if(!isPasswordCorrect){
            return res.json({success:false, message: "Invalid credentials"});
        }

        const token = generateToken(userData._id)
        res.json({success: true, userData, token, message: "Login Successful"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
} 

//Controller to check if  user  is  aunthenticated 
export const checkAuth =  (req, res)=> {
    res.json({success:true, user: req.user});
}

//conroller to  update user profile details
export const updateProfile = async(req, res)=> {
    try {
        const {profilePic, bio, fullName} = req.body;
        const userId = req.user._id;
        let updatedUser; 

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName},
            {new:true});
        }
        else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.
                secure_url, bio, fullName}, {new: true});
        }
        res.json({success:true, user:updatedUser})
    } catch (error) {
        console.log(error.message);  
        res.json({success:false, message: error.message})
    }
}