const express = require('express');
const path = require('path');
const cors = require('cors');
const webpush = require('web-push');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Hardcoded Permanent Cryptographic VAPID Keys
const PUBLIC_VAPID_KEY = 'BFaVEdgS_InwiflD2C8Fq5VeJI_E57jTjuZg1BM3y3sB20nfNx09S-Fp7-CwOZf7n9tm5MZBHk49z-NO2_YQyeU';
const PRIVATE_VAPID_KEY = '_leeraU5EHnOa74ABK5WJlA91SRWee5WTnvkygHcQms';

webpush.setVapidDetails(
    'mailto:admin@qamariacoffee.com',
    PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY
);

// Database memory layout tracking active push subscriptions: { "store-orderNum": subscriptionObject }
let pushRegistry = {};

// 1. Endpoint to hand over the public key to customer phones
app.get('/api/vapid-public-key', (req, res) => {
    res.json({ publicKey: PUBLIC_VAPID_KEY });
});

// 2. Endpoint to save a phone's background subscription data token
app.post('/api/save-subscription', (req, res) => {
    const loc = String(req.body.location || '1').trim().toLowerCase();
    const num = String(req.body.orderNumber || '').trim();
    const sub = req.body.subscription;

    if (!num || !sub) return res.status(400).json({ success: false });

    pushRegistry[`${loc}-${num}`] = sub;
    console.log(`🔒 Secure Push background link locked for Store #${loc} Order #${num}`);
    res.json({ success: true });
});

// 3. Barista clicks buzz -> Fires a true background pop-up payload out to Apple/Google networks
app.post('/api/buzz-order', async (req, res) => {
    const loc = String(req.body.location || '1').trim().toLowerCase();
    const num = String(req.body.orderNumber || '').trim();
    const uniqueKey = `${loc}-${num}`;

    const targetSubscription = pushRegistry[uniqueKey];

    if (!targetSubscription) {
        return res.status(404).json({ success: false, error: 'Customer device offline or not registered.' });
    }

    const payload = JSON.stringify({
        title: '☕ QAMARIA YEMENI COFFEE',
        body: `Your Order #${num} is ready at the counter! 😊`,
        orderNumber: num
    });

    try {
        await webpush.sendNotification(targetSubscription, payload);
        console.log(`🚀 True Background Web Push Notification fired out for Order #${num}`);
        delete pushRegistry[uniqueKey]; // Clear device memory space
        res.json({ success: true });
    } catch (err) {
        console.error("Push delivery dropped:", err);
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Qamaria Web Push Engine Active on port ${PORT}!`);
});
