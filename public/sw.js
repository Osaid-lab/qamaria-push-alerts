self.addEventListener('push', function(event) {
    try {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: 500,
            tag: 'qamaria-order-alert',
            requireInteraction: true
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (err) {
        console.error("Background push processing error:", err);
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
