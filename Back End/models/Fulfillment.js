const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/crypto');

const fulfillmentSchema = new mongoose.Schema({
    donorName: { type: String, required: true },
    donorPhone: { type: String, required: true },
    donorEmail: { type: String, required: true },
    unitsRequired: { type: Number, required: true },
    bloodRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
    createdAt: { type: Date, default: Date.now }
});

// Pre-save to encrypt PII
fulfillmentSchema.pre('save', async function() {
    if (this.isModified('donorName') && this.donorName) {
        this.donorName = encrypt(this.donorName);
    }
    if (this.isModified('donorPhone') && this.donorPhone) {
        this.donorPhone = encrypt(this.donorPhone);
    }
    if (this.isModified('donorEmail') && this.donorEmail) {
        this.donorEmail = encrypt(this.donorEmail);
    }
});

// Decrypt fields
fulfillmentSchema.methods.decryptFields = function() {
    return {
        _id: this._id,
        donorName: decrypt(this.donorName),
        donorPhone: decrypt(this.donorPhone),
        donorEmail: decrypt(this.donorEmail),
        unitsRequired: this.unitsRequired,
        bloodRequest: this.bloodRequest,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('Fulfillment', fulfillmentSchema);
