self.addEventListener('push', function(event) {
    try {
        const data = event.data.json();
        
        // FIX APPLIED: Automatically builds the absolute web return path matching your exact online URL link
        const targetHostLink = `${self.location.origin}/customer.html?loc=${data.loc}&num=${data.num}&status=ready`;
        
        const options = {
            body: data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: 500,
            tag: 'qamaria-order-alert',
            data: { url: targetHostLink }, 
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
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus(); 
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
