import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Complaint = sequelize.define('Complaint', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    mobile: { type: DataTypes.STRING, allowNull: false },
    pnr: { type: DataTypes.STRING, defaultValue: 'N/A' },
    type: { type: DataTypes.STRING, defaultValue: 'Other' },
    description: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Pending' },
    resolution: { type: DataTypes.TEXT },
    assignedTo: { type: DataTypes.STRING },
    assignedRole: { type: DataTypes.STRING }
}, {
    timestamps: true
});

export default Complaint;
