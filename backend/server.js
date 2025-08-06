const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"]
    }
});

const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, phone, familyCode } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find or create family
        let family = null;
        if (familyCode) {
            family = await prisma.family.findUnique({
                where: { familyCode }
            });

            if (!family) {
                return res.status(400).json({ error: 'Invalid family code' });
            }
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                familyId: family?.id
            }
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                familyId: user.familyId
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { family: true }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                familyId: user.familyId,
                family: user.family
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Family routes
app.post('/api/families', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const familyCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        const family = await prisma.family.create({
            data: {
                name,
                familyCode
            }
        });

        // Update user to belong to this family
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { familyId: family.id, role: 'admin' }
        });

        res.status(201).json(family);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create family' });
    }
});

app.get('/api/families/:id/members', authenticateToken, async (req, res) => {
    try {
        const members = await prisma.user.findMany({
            where: { familyId: req.params.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                avatarUrl: true,
                createdAt: true
            }
        });

        res.json(members);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch family members' });
    }
});

// Location routes
app.post('/api/locations', authenticateToken, async (req, res) => {
    try {
        const { latitude, longitude, address } = req.body;

        const location = await prisma.userLocation.upsert({
            where: { userId: req.user.userId },
            update: { latitude, longitude, address },
            create: {
                userId: req.user.userId,
                latitude,
                longitude,
                address
            }
        });

        // Emit to family members
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { family: { include: { members: true } } }
        });

        if (user.family) {
            io.to(`family-${user.family.id}`).emit('locationUpdate', {
                userId: req.user.userId,
                userName: user.name,
                latitude,
                longitude,
                address
            });
        }

        res.json(location);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update location' });
    }
});

// Expense routes
app.post('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const { amount, description, category, splits } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user.familyId) {
            return res.status(400).json({ error: 'User must belong to a family' });
        }

        const expense = await prisma.expense.create({
            data: {
                familyId: user.familyId,
                paidById: req.user.userId,
                amount,
                description,
                category,
                splits: {
                    create: splits.map(split => ({
                        userId: split.userId,
                        amount: split.amount
                    }))
                }
            },
            include: {
                paidBy: true,
                splits: {
                    include: { user: true }
                }
            }
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        const expenses = await prisma.expense.findMany({
            where: { familyId: user.familyId },
            include: {
                paidBy: true,
                splits: {
                    include: { user: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Recipe routes
app.post('/api/recipes', authenticateToken, async (req, res) => {
    try {
        const { title, description, prepTime, cookTime, servings, ingredients, instructions, imageUrl } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        const recipe = await prisma.recipe.create({
            data: {
                familyId: user.familyId,
                createdById: req.user.userId,
                title,
                description,
                prepTime,
                cookTime,
                servings,
                ingredients,
                instructions,
                imageUrl
            },
            include: {
                createdBy: true
            }
        });

        res.status(201).json(recipe);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create recipe' });
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinFamily', (familyId) => {
        socket.join(`family-${familyId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;