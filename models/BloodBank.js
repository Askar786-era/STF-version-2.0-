const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt, deterministicHash } = require('../utils/crypto');

const inventoryItemSchema = new mongoose.Schema({
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: { type: Number, default: 0, min: 0 },
    available: { type: Boolean, default: true }
}, { _id: false });

const bloodBankSchema = new mongoose.Schema({
    bankName:  { type: String, required: true },
    district:  { type: String, required: true, index: true },
    state:     { type: String, required: true, index: true },
    phone:     { type: String, required: true },
    phoneHash: { type: String, index: true },
    address:   { type: String, default: '' },
    password:  { type: String, required: true },
    inventory: { type: [inventoryItemSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
});

bloodBankSchema.index({ district: 1, state: 1 });

// Hash password and encrypt PII before saving
bloodBankSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    if (this.isModified('phone') && this.phone) {
        this.phoneHash = deterministicHash(this.phone);
        this.phone = encrypt(this.phone);
    }
    if (this.isModified('address') && this.address) {
        this.address = encrypt(this.address);
    }
});

// Helper to decrypt fields
bloodBankSchema.methods.decryptFields = function() {
    return {
        _id: this._id,
        bankName: this.bankName,
        district: this.district,
        state: this.state,
        phone: decrypt(this.phone),
        phoneHash: this.phoneHash,
        address: decrypt(this.address),
        inventory: this.inventory,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('BloodBank', bloodBankSchema);
