import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import Complaint from './models/Complaint.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database & Sync Models
sequelize.authenticate()
    .then(() => {
        console.log('MySQL connected successfully.');
        return sequelize.sync({ force: false });
    })
    .catch(err => {
        console.error('Unable to connect to MySQL:', err);
    });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });

// API Endpoints

// 1. Register Complaint
app.post('/api/complaints', upload.single('image'), async (req, res) => {
    const { name, mobile, pnr, type, description } = req.body;

    if (!name || !mobile || !pnr || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const createdComplaint = await Complaint.create({
            id: 'REF' + Math.floor(100000 + Math.random() * 900000), // Random 6 digit ID
            name,
            mobile,
            pnr: pnr || 'N/A',
            type: type || 'Other',
            description,
            image: req.file ? `/uploads/${req.file.filename}` : null,
            status: 'Pending'
        });

        console.log('New Complaint Registered:', createdComplaint.id);

        res.status(201).json({
            message: 'Complaint registered successfully',
            id: createdComplaint.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error registering complaint' });
    }
});

// 2. Track Complaint
app.get('/api/complaints/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findOne({ where: { id: req.params.id } });

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching complaint' });
    }
});

// 3. Admin: Get All Complaints
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.findAll();
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching complaints' });
    }
});

// 3.1 Passenger: Get My Complaints
app.get('/api/complaints/user/:mobile', async (req, res) => {
    try {
        const userComplaints = await Complaint.findAll({ where: { mobile: req.params.mobile } });
        res.json(userComplaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching user complaints' });
    }
});

// 4. Admin: Update Status/Resolve
app.patch('/api/complaints/:id/status', async (req, res) => {
    const { status, resolution } = req.body;
    try {
        const complaint = await Complaint.findOne({ where: { id: req.params.id } });

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        if (status) complaint.status = status;
        if (resolution) complaint.resolution = resolution;

        await complaint.save();

        res.json({ message: 'Complaint updated', complaint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating complaint' });
    }
});

// 5. Admin: Assign Complaint
app.patch('/api/complaints/:id/assign', async (req, res) => {
    const { assignedTo, assignedRole } = req.body;

    try {
        const complaint = await Complaint.findOne({ where: { id: req.params.id } });

        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        if (assignedTo && assignedRole) {
            complaint.assignedTo = assignedTo;
            complaint.assignedRole = assignedRole;
            complaint.status = `Assigned to ${assignedRole}`;
            await complaint.save();
        }

        res.json({ message: 'Complaint assigned successfully', complaint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error assigning complaint' });
    }
});

// 6. Admin Login
app.post('/api/auth/admin', async (req, res) => {
    const { username, password } = req.body;
    try {
        // First check if it's the default admin (handling cold start if DB is empty?)
        // Or just search DB.
        // Let's seed the default admin if no admins exist?
        // For now, strict DB check.
        // NOTE: Password should be hashed in real app.

        const admin = await User.findOne({ where: { username } });

        if (admin && admin.password === password) {
            res.json({ token: 'admin-token-' + admin.id, role: admin.role, name: admin.name, username: admin.username });
        } else if (username === 'Muralidhar' && password === 'Murali123') {
            // Force create and login for Muralidhar if it doesn't exist yet
            let defaultAdmin = await User.findOne({ where: { username: 'Muralidhar' } });
            if (!defaultAdmin) {
                defaultAdmin = await User.create({
                    username: 'Muralidhar',
                    password: 'Murali123',
                    name: 'Muralidhar (Super Admin)',
                    role: 'admin'
                });
            }
            res.json({ token: 'admin-token-' + defaultAdmin.id, role: defaultAdmin.role, name: defaultAdmin.name, username: defaultAdmin.username });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 7. Register New Admin
app.post('/api/auth/admin/register', async (req, res) => {
    // In real app, verify token.
    const adminUser = req.headers['x-admin-username'];
    if (adminUser !== 'Muralidhar') {
        return res.status(403).json({ error: 'Forbidden: Only main admin can add new admins' });
    }

    const { username, password, name } = req.body;

    if (!username || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const userExists = await User.findOne({ where: { username } });

        if (userExists) {
            return res.status(400).json({ error: 'Admin username already exists' });
        }

        const user = await User.create({
            username,
            password,
            name,
            role: 'admin'
        });

        console.log('New Admin Registered:', username);
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error registering admin' });
    }
});

// 7.1 Get All Admins
app.get('/api/auth/admins', async (req, res) => {
    try {
        const admins = await User.findAll({ attributes: ['id', 'name', 'username', 'role', 'createdAt'] });
        res.json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching admins' });
    }
});

// 7.2 Delete Admin
app.delete('/api/auth/admin/:id', async (req, res) => {
    const adminUser = req.headers['x-admin-username'];
    if (adminUser !== 'Muralidhar') {
        return res.status(403).json({ error: 'Forbidden: Only main admin can delete admins' });
    }

    try {
        const result = await User.destroy({ where: { id: req.params.id } });
        if (result) {
            res.json({ message: 'Admin deleted successfully' });
        } else {
            res.status(404).json({ error: 'Admin not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error deleting admin' });
    }
});

// 8. Passenger Login (Mock)
app.post('/api/auth/passenger', (req, res) => {
    const { mobile, name } = req.body;
    if (mobile && mobile.length === 10) {
        const passengerName = name ? name.trim() : ('Passenger ' + mobile.slice(-4));
        res.json({ token: 'passenger-token', role: 'passenger', name: passengerName, mobile });
    } else {
        res.status(400).json({ error: 'Invalid mobile number' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
