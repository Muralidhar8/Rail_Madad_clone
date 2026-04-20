import sequelize from './config/db.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import fs from 'fs';

async function showData() {
  try {
    await sequelize.authenticate();
    
    const users = await User.findAll();
    const complaints = await Complaint.findAll();
    
    const data = {
      users: users,
      complaints: complaints
    };
    
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    process.exit(0);
  }
}

showData();
