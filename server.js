const express = require('express');
const path = require('path');
const cors = require('cors');
const webpush = require('web-push');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PUBLIC_VAPID_KEY = 'BFaVEdgS_InwiflD2C8Fq5VeJI_E57jTjuZg1BM3y3sB20nfNx09S-Fp7-CwOZf7n9tm5MZBHk49z-NO2_YQyeU';
const PRIVATE_VAPID_KEY = '_leeraU5EHnOa74ABK5WJlA91SRWee5WTnvkygHcQms';

webpush.setVapidDetails(
    'mailto:admin@qamariacoffee.com',
    PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY
);

let readyOrders = {};  
let pushRegistry = {}; 

app.get('/api/vapid-public-key', (req, res) => {
    res.json({ publicKey: PUBLIC_VAPID_KEY });
});

app.get('/api/check-status', (req, res) => {
    const loc = String(req.query.loc || '1').trim().toLowerCase();
    const num = String(req.query.num || '').trim();
    const uniqueKey = `${loc}-${num}`;

    if (num && readyOrders[uniqueKey]) {
        delete readyOrders[uniqueKey];
        return res.json({ ready: true });
    }
    res.json({ ready: false });
});

app.post('/api/save-subscription', (req, res) => {
    const loc = String(req.body.location || '1').trim().toLowerCase();
    const num = String(req.body.orderNumber || '').trim();
    const sub = req.body.subscription;

    if (!num || !sub) return res.status(400).json({ success: false });

    pushRegistry[`${loc}-${num}`] = sub;
    console.log(`🔒 Secure Push background link locked for Store #${loc} Order #${num}`);
    res.json({ success: true });
});

app.post('/api/buzz-order', async (req, res) => {
    const loc = String(req.body.location || '1').trim().toLowerCase();
    const num = String(req.body.orderNumber || '').trim();
    const uniqueKey = `${loc}-${num}`;

    readyOrders[uniqueKey] = true;

    const targetSubscription = pushRegistry[uniqueKey];
    if (targetSubscription) {
        // FIX APPIED HERE: Removing hardcoded strings. The payload will now carry just the URL variables
        const payload = JSON.stringify({
            title: '☕ QAMARIA YEMENI COFFEE',
            body: `Your Order #${num} is ready at the counter! 😊`,
            loc: loc,
            num: num
        });

        try {
            await webpush.sendNotification(targetSubscription, payload);
            console.log(`🚀 Background push sent for Order #${num}`);
            delete pushRegistry[uniqueKey];
        } catch (err) {
            console.error("Background push failed:", err);
        }
    }

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Hybrid Web Push Engine Active on port ${PORT}!`);
});
