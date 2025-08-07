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
            include: {
                family: {
                    include: {
                        members: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
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

// Family routes
app.post('/api/families', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if user already belongs to a family
        const existingUser = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { family: true }
        });

        if (existingUser.familyId) {
            return res.status(400).json({
                error: 'You are already part of a family',
                family: existingUser.family
            });
        }

        // Generate unique family code
        const familyCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Create family
        const family = await prisma.family.create({
            data: {
                name,
                familyCode,
                // description field might not exist in your schema
            }
        });

        // Update user to belong to this family as admin
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                familyId: family.id,
                role: 'admin'
            },
            include: { family: true }
        });

        console.log('✅ Family created:', family.name, 'by', updatedUser.name);

        res.status(201).json({
            ...family,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                familyId: updatedUser.familyId,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('❌ Family creation error:', error);
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

// Add these routes to your backend/server.js

// Family validation route (for joining)
app.get('/api/families/validate/:code', authenticateToken, async (req, res) => {
    try {
        const { code } = req.params;

        const family = await prisma.family.findUnique({
            where: { familyCode: code },
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

        res.json({
            id: family.id,
            name: family.name,
            memberCount: family.members.length,
            members: family.members,
            createdAt: family.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to validate family code' });
    }
});

// Join family route
app.post('/api/families/join', authenticateToken, async (req, res) => {
    try {
        const { familyCode } = req.body;

        const family = await prisma.family.findUnique({
            where: { familyCode }
        });

        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        // Update user to belong to this family
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: { familyId: family.id },
            include: { family: true }
        });

        res.json({
            message: 'Successfully joined family',
            user: updatedUser,
            family: family
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join family' });
    }
});

// Get detailed family info with members
app.get('/api/families/:id/details', authenticateToken, async (req, res) => {
    try {
        const family = await prisma.family.findUnique({
            where: { id: req.params.id },
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
        res.status(500).json({ error: 'Failed to fetch family details' });
    }
});

// Send family invitation
app.post('/api/families/:id/invite', authenticateToken, async (req, res) => {
    try {
        const { email } = req.body;
        const { id: familyId } = req.params;

        // Verify user is admin of the family
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { family: true }
        });

        if (!user?.familyId || user.familyId !== familyId || user.role !== 'admin') {
            return res.status(403).json({ error: 'Only family admins can send invitations' });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser?.familyId) {
            return res.status(400).json({ error: 'User is already part of a family' });
        }

        // In a real app, you'd send an email here
        // For now, we'll just log it
        console.log(`📧 Invitation sent to ${email} for family ${user.family.name}`);

        res.json({
            message: 'Invitation sent successfully',
            invitedEmail: email
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send invitation' });
    }
});

// Update member role (admin only)
app.patch('/api/families/:familyId/members/:memberId/role', authenticateToken, async (req, res) => {
    try {
        const { familyId, memberId } = req.params;
        const { role } = req.body;

        // Verify user is admin
        const requestingUser = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (requestingUser?.familyId !== familyId || requestingUser.role !== 'admin') {
            return res.status(403).json({ error: 'Only family admins can change roles' });
        }

        const updatedMember = await prisma.user.update({
            where: { id: memberId, familyId: familyId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        res.json(updatedMember);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update member role' });
    }
});

// Remove family member (admin only)
app.delete('/api/families/:familyId/members/:memberId', authenticateToken, async (req, res) => {
    try {
        const { familyId, memberId } = req.params;

        // Verify user is admin
        const requestingUser = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (requestingUser?.familyId !== familyId || requestingUser.role !== 'admin') {
            return res.status(403).json({ error: 'Only family admins can remove members' });
        }

        // Can't remove yourself
        if (memberId === req.user.userId) {
            return res.status(400).json({ error: 'Cannot remove yourself from the family' });
        }

        // Remove member from family
        await prisma.user.update({
            where: { id: memberId },
            data: { familyId: null, role: 'member' }
        });

        res.json({ message: 'Member removed from family successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

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
                                role: true,
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