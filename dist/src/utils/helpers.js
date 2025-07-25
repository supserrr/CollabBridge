"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.generateOTP = exports.maskEmail = exports.isValidEmail = exports.buildPaginationResponse = exports.paginate = exports.calculateDistance = exports.formatCurrency = exports.generateRandomString = exports.generateSlug = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
exports.generateSlug = generateSlug;
const generateRandomString = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateRandomString = generateRandomString;
const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
};
exports.calculateDistance = calculateDistance;
const paginate = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return {
        skip: offset,
        take: limit,
    };
};
exports.paginate = paginate;
const buildPaginationResponse = (data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            pages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
exports.buildPaginationResponse = buildPaginationResponse;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
};
exports.maskEmail = maskEmail;
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += digits[Math.floor(Math.random() * digits.length)];
    }
    return result;
};
exports.generateOTP = generateOTP;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
//# sourceMappingURL=helpers.js.map