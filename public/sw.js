self.addEventListener('push', function(event) {
    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: 500,
            tag: 'qamaria-order-alert',
            data: { url: data.url }, // Embeds the direct deep target link route
            requireInteraction: true
        };
        event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (err) {}
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // Dynamically forces the phone browser window to open exactly onto the specific store's green receipt card
    const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
    event.waitUntil(clients.openWindow(targetUrl));
});
