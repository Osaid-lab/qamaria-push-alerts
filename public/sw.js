self.addEventListener('push', function(event) {
    try {
        const data = event.data.json();
        
        // Dynamically builds the exact return URL based on where the app is hosted
        const trackingUrl = `${self.location.origin}/customer.html?loc=${data.loc}&num=${data.num}&status=ready`;
        
        const options = {
            body: data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: 500,
            tag: 'qamaria-order-alert',
            data: { url: trackingUrl }, // Attaches the dynamic return web path cleanly
            requireInteraction: true
        };
        event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (err) {}
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Check if the user already has your cafe page sitting open in a tab
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus(); // Jump straight back into that open window tab
                }
            }
            // If they closed the browser completely, open a fresh window straight to the green receipt card
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
