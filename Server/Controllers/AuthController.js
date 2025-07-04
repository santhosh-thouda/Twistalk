import UserModel from '../Models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// register new users
export const registerUser = async (req, res) => {
    console.log('Register request received:', req.body);
    
    try {
        const { email, password, firstname, lastname } = req.body;

        // Validate required fields
        if (!email || !password || !firstname || !lastname) {
            console.log('Missing required fields:', { email: !!email, password: !!password, firstname: !!firstname, lastname: !!lastname });
            return res.status(400).json({ message: "All fields are required!" });
        }

        // Check if user already exists
        const oldUser = await UserModel.findOne({ email });
        if (oldUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: "This User already exists!" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        
        // Create new user with default images
        const newUser = new UserModel({
            ...req.body,
            password: hashedPass,
            profilePicture: "defaultProfile.png",
            coverPicture: "defaultCover.jpg"
        });

        const user = await newUser.save();
        console.log('User created successfully:', user.email);

        // Generate JWT token
        if (!process.env.JWT_KEY) {
            console.error('JWT_KEY is not set in environment variables');
            return res.status(500).json({ message: "Server configuration error" });
        }

        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY);
        console.log('JWT token generated successfully');

        res.status(200).json({ user, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
}


// Login users
export const loginUser = async (req, res) => {
    console.log('Login request received:', { email: req.body.email });
    
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: "Email and password are required!" });
        }

        const user = await UserModel.findOne({ email: email });

        if (user) {
            const validity = await bcrypt.compare(password, user.password);

            if (!validity) {
                console.log('Invalid password for user:', email);
                res.status(400).json({ message: "Sorry, Please enter the correct email or password!" });
            } else {
                console.log('User logged in successfully:', email);
                
                if (!process.env.JWT_KEY) {
                    console.error('JWT_KEY is not set in environment variables');
                    return res.status(500).json({ message: "Server configuration error" });
                }

                const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY);
                res.status(200).json({ user, token });
            }
        } else {
            console.log('User not found:', email);
            res.status(404).json({ message: "Sorry, Please enter the correct email or password!" });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
}