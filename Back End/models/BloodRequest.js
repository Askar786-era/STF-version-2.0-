const mongoose = require('mongoose');
const { encrypt, decrypt, deterministicHash } = require('../utils/crypto');

const bloodRequestSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    familyName: { type: String, default: "" },
    phone: { type: String, default: "" },
    phoneHash: { type: String, index: true },
    socketId: { type: String, default: "" },
    bloodGroup: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    hospital: { type: String, default: "" },
    message: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

bloodRequestSchema.index({ city: 1, state: 1 });

// Encrypt PII fields before saving
bloodRequestSchema.pre('save', async function() {
    if (this.isModified('patientName') && this.patientName) {
        this.patientName = encrypt(this.patientName);
    }
    if (this.isModified('familyName') && this.familyName) {
        this.familyName = encrypt(this.familyName);
    }
    if (this.isModified('phone') && this.phone) {
        this.phoneHash = deterministicHash(this.phone);
        this.phone = encrypt(this.phone);
    }
    if (this.isModified('hospital') && this.hospital) {
        this.hospital = encrypt(this.hospital);
    }
});

// Helper to decrypt all PII fields
bloodRequestSchema.methods.decryptFields = function() {
    return {
        _id: this._id,
        patientName: decrypt(this.patientName),
        familyName: decrypt(this.familyName),
        phone: decrypt(this.phone),
        phoneHash: this.phoneHash,
        socketId: this.socketId,
        bloodGroup: this.bloodGroup,
        city: this.city,
        state: this.state,
        hospital: decrypt(this.hospital),
        message: this.message,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
