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

// Utility function to generate unique family code
const generateFamilyCode = async () => {
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        // Generate 8-character alphanumeric code
        code = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Check if code is unique
        const existingFamily = await prisma.family.findUnique({
            where: { familyCode: code }
        });

        if (!existingFamily) {
            isUnique = true;
        }

        attempts++;
    }

    if (!isUnique) {
        throw new Error('Unable to generate unique family code');
    }

    return code;
};

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, phone, familyCode } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Find family if code provided
        let family = null;
        if (familyCode && familyCode.trim()) {
            family = await prisma.family.findUnique({
                where: { familyCode: familyCode.trim().toUpperCase() }
            });

            if (!family) {
                return res.status(400).json({ error: 'Invalid family code' });
            }
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name: name.trim(),
                phone: phone?.trim() || null,
                familyId: family?.id || null
            }
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        console.log('✅ User registered:', user.email, 'Family:', family?.name || 'None');

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                familyId: user.familyId,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                family: {
                    include: {
                        members: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        console.log('✅ User logged in:', user.email, 'Family:', user.family?.name || 'None');

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                familyId: user.familyId,
                role: user.role,
                family: user.family
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Enhanced family creation route
app.post('/api/families', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate input
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Family name is required' });
        }

        if (name.trim().length < 2 || name.trim().length > 50) {
            return res.status(400).json({ error: 'Family name must be between 2 and 50 characters' });
        }

        // Get current user with family info
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { family: true }
        });

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user already belongs to a family
        if (currentUser.familyId) {
            return res.status(409).json({
                error: 'You are already part of a family',
                family: currentUser.family
            });
        }

        // Generate unique family code
        const familyCode = await generateFamilyCode();

        // Create family in transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Create family
            const family = await prisma.family.create({
                data: {
                    name: name.trim(),
                    familyCode,
                }
            });

            // Update user to belong to this family as admin
            const updatedUser = await prisma.user.update({
                where: { id: req.user.userId },
                data: {
                    familyId: family.id,
                    role: 'admin'
                }
            });

            // Return family with member info
            const familyWithMembers = await prisma.family.findUnique({
                where: { id: family.id },
                include: {
                    members: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            createdAt: true
                        }
                    }
                }
            });

            return { family: familyWithMembers, user: updatedUser };
        });

        console.log('✅ Family created:', result.family.name, 'by', currentUser.name);

        res.status(201).json({
            ...result.family,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                familyId: result.user.familyId,
                role: result.user.role
            }
        });
    } catch (error) {
        console.error('❌ Family creation error:', error);

        if (error.message === 'Unable to generate unique family code') {
            return res.status(500).json({ error: 'Unable to generate family code. Please try again.' });
        }

        res.status(500).json({ error: 'Failed to create family' });
    }
});

// Enhanced family validation route
app.get('/api/families/validate/:code', authenticateToken, async (req, res) => {
    try {
        const { code } = req.params;

        if (!code || code.length !== 8) {
            return res.status(400).json({ error: 'Invalid family code format' });
        }

        const family = await prisma.family.findUnique({
            where: { familyCode: code.toUpperCase() },
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        console.log('✅ Family validated:', family.name, 'for user:', req.user.userId);

        res.json({
            id: family.id,
            name: family.name,
            memberCount: family.members.length,
            members: family.members,
            createdAt: family.createdAt
        });
    } catch (error) {
        console.error('❌ Family validation error:', error);
        res.status(500).json({ error: 'Failed to validate family code' });
    }
});

// Enhanced join family route
app.post('/api/families/join', authenticateToken, async (req, res) => {
    try {
        const { familyCode } = req.body;

        if (!familyCode || familyCode.length !== 8) {
            return res.status(400).json({ error: 'Invalid family code' });
        }

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { family: true }
        });

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user already belongs to a family
        if (currentUser.familyId) {
            return res.status(409).json({
                error: 'You are already part of a family',
                family: currentUser.family
            });
        }

        // Find family
        const family = await prisma.family.findUnique({
            where: { familyCode: familyCode.toUpperCase() },
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        // Join family in transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Update user to belong to this family
            const updatedUser = await prisma.user.update({
                where: { id: req.user.userId },
                data: {
                    familyId: family.id,
                    role: 'member'
                }
            });

            // Get updated family with all members
            const updatedFamily = await prisma.family.findUnique({
                where: { id: family.id },
                include: {
                    members: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            createdAt: true
                        }
                    }
                }
            });

            return { family: updatedFamily, user: updatedUser };
        });

        console.log('✅ User joined family:', result.family.name, 'User:', currentUser.name);

        res.json({
            message: 'Successfully joined family',
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                familyId: result.user.familyId,
                role: result.user.role
            },
            family: result.family
        });
    } catch (error) {
        console.error('❌ Join family error:', error);
        res.status(500).json({ error: 'Failed to join family' });
    }
});

// Enhanced get user with family data
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                family: {
                    include: {
                        members: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                role: true,
                                avatarUrl: true,
                                createdAt: true
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                familyId: true,
                family: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user,
            family: user.family
        });
    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Get detailed family info
app.get('/api/families/:id/details', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify user belongs to this family
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user || user.familyId !== id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const family = await prisma.family.findUnique({
            where: { id },
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        avatarUrl: true,
                        createdAt: true,
                        locations: {
                            take: 1,
                            orderBy: { updatedAt: 'desc' },
                            select: {
                                address: true,
                                updatedAt: true
                            }
                        }
                    }
                },
                expenses: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                },
                announcements: {
                    take: 3,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        // Add mock online status and format response
        const formattedMembers = family.members.map(member => ({
            ...member,
            isOnline: Math.random() > 0.3, // Mock online status
            lastSeen: member.locations[0] ?
                formatTimeAgo(member.locations[0].updatedAt) : 'Unknown',
            location: member.locations[0] || null
        }));

        res.json({
            ...family,
            members: formattedMembers
        });
    } catch (error) {
        console.error('❌ Get family details error:', error);
        res.status(500).json({ error: 'Failed to fetch family details' });
    }
});

// Get family members
app.get('/api/families/:id/members', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify user belongs to this family
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user || user.familyId !== id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const members = await prisma.user.findMany({
            where: { familyId: id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                avatarUrl: true,
                createdAt: true
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(members);
    } catch (error) {
        console.error('❌ Get family members error:', error);
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
        console.error('❌ Location update error:', error);
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
        console.error('❌ Create expense error:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user.familyId) {
            return res.status(400).json({ error: 'User must belong to a family' });
        }

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
        console.error('❌ Get expenses error:', error);
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

        if (!user.familyId) {
            return res.status(400).json({ error: 'User must belong to a family' });
        }

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
        console.error('❌ Create recipe error:', error);
        res.status(500).json({ error: 'Failed to create recipe' });
    }
});

// Helper function for time formatting
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinFamily', (familyId) => {
        socket.join(`family-${familyId}`);
        console.log(`User ${socket.id} joined family room: family-${familyId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await prisma.$disconnect();
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;