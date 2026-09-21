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

// Health & Root Status
app.get('/', (req, res) => {
    res.json({ message: 'Rail Madad API is running smoothly', status: 'OK' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date() });
});

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
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Database/Server error: ' + error.message });
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

// 9. Chatbot FAQ / Assistance Route
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const query = message.toLowerCase().trim();
    const apiKey = process.env.GEMINI_API_KEY;

    let reply = "";
    let options = [];

    // If Gemini API Key is configured and not default placeholder, attempt AI generation
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
        try {
            const systemInstruction = 
                "You are RailMitra, a helpful, polite, and official digital assistant for Rail Madad (Indian Railways grievance redressal portal). " +
                "Answer passenger queries politely, clearly, and concisely (maximum 2-3 sentences). " +
                "Focus on railway inquiries (e.g., ticket cancellations, TDR, refunds, cleanliness, food e-catering, medical emergency, coach security, helpline 139). " +
                "If the query is completely unrelated to Indian Railways, politely guide them back to railway inquiries.";

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }],
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    generationConfig: {
                        maxOutputTokens: 150,
                        temperature: 0.5
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                reply = reply.trim();
                
                // Dynamically assign options based on keyword check of user query
                if (query.includes('medical') || query.includes('emergency') || query.includes('doctor') || query.includes('hurt') || query.includes('sick')) {
                    options = ["Lodge a Complaint 📝", "Call Help 139 📞", "Back to Menu 🏠"];
                } else if (query.includes('refund') || query.includes('cancel') || query.includes('tdr') || query.includes('money')) {
                    options = ["Track Status 🔍", "Back to Menu 🏠"];
                } else if (query.includes('clean') || query.includes('dirt') || query.includes('toilet') || query.includes('washroom') || query.includes('trash')) {
                    options = ["Lodge a Complaint 📝", "Back to Menu 🏠"];
                } else if (query.includes('food') || query.includes('catering') || query.includes('meal') || query.includes('water')) {
                    options = ["Lodge a Complaint 📝", "Back to Menu 🏠"];
                } else if (query.includes('security') || query.includes('theft') || query.includes('police') || query.includes('rpf') || query.includes('harass')) {
                    options = ["Lodge a Complaint 📝", "Call Help 139 📞", "Back to Menu 🏠"];
                } else {
                    options = ["Lodge a Complaint 📝", "Track Complaint 🔍", "Back to Menu 🏠"];
                }
            } else {
                console.error("Gemini API Error Response:", await response.text());
                throw new Error("Gemini API returned error status");
            }
        } catch (error) {
            console.error("Failed to fetch response from Gemini API, falling back to keywords:", error.message);
        }
    }

    // Fallback: Smart Keyword Matching FAQ (runs if API key is missing or call fails)
    if (!reply) {
        let note = "";
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            note = "\n\n*(Note: AI mode is offline. Add GEMINI_API_KEY to server/.env to enable full AI answers)*";
        }

        if (query.includes('medical') || query.includes('emergency') || query.includes('doctor') || query.includes('hospital') || query.includes('hurt') || query.includes('sick')) {
            reply = "For medical emergencies on-board or at stations, please call 139 immediately to alert the train crew. You can also lodge a complaint under the 'Medical Emergency' category so that the next station's medical team can be notified to assist you on arrival." + note;
            options = ["Lodge a Complaint 📝", "Call Help 139 📞", "Back to Menu 🏠"];
        } else if (query.includes('refund') || query.includes('cancel') || query.includes('tdr') || query.includes('money back') || query.includes('fare')) {
            reply = "To claim a refund for cancelled tickets or train delays of more than 3 hours, you must file a TDR (Ticket Deposit Receipt) through your IRCTC account within the prescribed time limits. For tickets purchased at counters, refunds can be obtained at railway reservation counters." + note;
            options = ["Track Status 🔍", "Back to Menu 🏠"];
        } else if (query.includes('food') || query.includes('catering') || query.includes('meal') || query.includes('water') || query.includes('pantry') || query.includes('lunch') || query.includes('dinner') || query.includes('breakfast')) {
            reply = "You can order meals directly to your train seat using IRCTC's e-Catering services by downloading the 'IRCTC eCatering' app, visiting ecatering.irctc.co.in, or by calling 1323. If you have hygiene or quality issues with the food served on board, you can file a grievance under 'Catering'." + note;
            options = ["Lodge a Complaint 📝", "Back to Menu 🏠"];
        } else if (query.includes('clean') || query.includes('dirt') || query.includes('trash') || query.includes('garbage') || query.includes('toilet') || query.includes('washroom') || query.includes('smell') || query.includes('bed') || query.includes('linen')) {
            reply = "For cleanliness issues inside coaches or toilets, or request for clean linen, please log a complaint under the 'Cleanliness' category. The on-board house keeping staff (OBHS) will be alerted to address your seat/coach at the next available station." + note;
            options = ["Lodge a Complaint 📝", "Back to Menu 🏠"];
        } else if (query.includes('security') || query.includes('theft') || query.includes('rob') || query.includes('fight') || query.includes('harass') || query.includes('police') || query.includes('rpf') || query.includes('grp') || query.includes('harassment') || query.includes('abuse')) {
            reply = "For any security concerns or harassment, contact the Railway Protection Force (RPF) by dialing 139 immediately. You can also file a complaint under the 'Security' category so that security personnel at the next station can check your coach." + note;
            options = ["Lodge a Complaint 📝", "Call Help 139 📞", "Back to Menu 🏠"];
        } else if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('assist') || query.includes('help') || query.includes('who are you') || query.includes('menu')) {
            reply = "Namaste! I am RailMitra, your Rail Madad Chat Assistant. 🚄 I can help you lodge a complaint, track your existing complaint status, or answer common queries. How can I help you today?";
            options = ["Lodge a Complaint 📝", "Track Complaint 🔍", "General FAQs ℹ️"];
        } else if (query.includes('faq') || query.includes('question') || query.includes('info') || query.includes('how to')) {
            reply = "Here are some topics you can ask me about:\n• Medical Emergencies\n• Ticket Refunds & TDR\n• E-Catering / Food ordering\n• Cleanliness & Hygiene\n• Coach Security\n\nOr click below to lodge/track a grievance.";
            options = ["Lodge a Complaint 📝", "Track Complaint 🔍", "Back to Menu 🏠"];
        } else {
            reply = "I'm sorry, I didn't quite catch that. I am here to help you navigate Rail Madad. You can ask me about refunds, medical emergencies, food services, cleanliness, or use the menu options below." + note;
            options = ["Lodge a Complaint 📝", "Track Complaint 🔍", "General FAQs ℹ️"];
        }
    }

    res.json({ reply, options });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
