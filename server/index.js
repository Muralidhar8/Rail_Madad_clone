import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 5000;

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

// Mock Database
let complaints = [];

// API Endpoints

// 1. Register Complaint
app.post('/api/complaints', upload.single('image'), (req, res) => {
    const { name, mobile, pnr, type, description } = req.body;

    if (!name || !mobile || !pnr || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newComplaint = {
        id: 'REF' + Math.floor(100000 + Math.random() * 900000), // Random 6 digit ID
        name,
        mobile,
        pnr: pnr || 'N/A',
        type: type || 'Other',
        description,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        resolution: null,
        assignedTo: null,
        assignedRole: null
    };

    complaints.push(newComplaint);
    console.log('New Complaint Registered:', newComplaint.id);

    res.status(201).json({
        message: 'Complaint registered successfully',
        id: newComplaint.id
    });
});

// 2. Track Complaint
app.get('/api/complaints/:id', (req, res) => {
    const complaint = complaints.find(c => c.id === req.params.id);

    if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(complaint);
});

// 3. Admin: Get All Complaints
app.get('/api/complaints', (req, res) => {
    res.json(complaints);
});

// 3.1 Passenger: Get My Complaints
app.get('/api/complaints/user/:mobile', (req, res) => {
    const userComplaints = complaints.filter(c => c.mobile === req.params.mobile);
    res.json(userComplaints);
});

// 4. Admin: Update Status/Resolve
app.patch('/api/complaints/:id/status', (req, res) => {
    const { status, resolution } = req.body;
    const complaint = complaints.find(c => c.id === req.params.id);

    if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (resolution) complaint.resolution = resolution;

    res.json({ message: 'Complaint updated', complaint });
});

// 5. Admin: Assign Complaint
app.patch('/api/complaints/:id/assign', (req, res) => {
    const { assignedTo, assignedRole } = req.body;
    const complaint = complaints.find(c => c.id === req.params.id);

    if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
    }

    if (assignedTo && assignedRole) {
        complaint.assignedTo = assignedTo;
        complaint.assignedRole = assignedRole;
        complaint.status = `Assigned to ${assignedRole}`;
    }

    res.json({ message: 'Complaint assigned successfully', complaint });
});

// 6. Admin Login
app.post('/api/auth/admin', (req, res) => {
    const { username, password } = req.body;
    // Dummy credentials
    if (username === 'admin' && password === 'admin123') {
        res.json({ token: 'admin-token', role: 'admin', name: 'Admin User' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// 6. Passenger Login
app.post('/api/auth/passenger', (req, res) => {
    const { mobile } = req.body;
    if (mobile && mobile.length === 10) {
        res.json({ token: 'passenger-token', role: 'passenger', name: 'Passenger ' + mobile.slice(-4), mobile });
    } else {
        res.status(400).json({ error: 'Invalid mobile number' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
