const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {PrismaClient} = require('@prisma/client');
const {z} = require('zod');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

async function registerUser(req, res) {
    try{
        const {email, password} = UserSchema.parse(req.body);
        if ( !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingUser = await prisma.user.findUnique({where: {email}});

        if(existingUser){
            throw new Error('Email already in use');
        }
        
        const user = await prisma.user.create({
            data: {
                email,
                password: await bcrypt.hash(password, 10),
            },
        });

        res.status(201).json({message: 'User created', user});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

async function loginUser(req, res, next) {
    try{
        const {email, password} = UserSchema.parse(req.body);
        const user = await prisma.user.findUnique({where: {email}});

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!user || !passwordMatch)
            throw new Error('Invalid email or password');
        
        const token = jwt.sign({userId: user.id, role: user.role}, JWT_SECRET);
        
        res.status(200).json({message: 'Login successful', token});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

async function protectRoute(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = await prisma.user.findUnique({where: {id: payload.userId}});
        next();
    } catch (error) {
        res.status(401).json({error: error.message});
    }
}

const authorize = (roles) => (req, res, next) => {
    if(!roles.includes(req.user.role)) {
        return res.status(403).json({message: 'Forbidden: Insufficient permissions'});
    }
    next();
};

module.exports = {
    registerUser,
    loginUser,
    protectRoute,
    authorize,
};