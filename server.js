const express = require('express');
const path = require('path');
const os = require('os');
const app = express();
const port = process.env.PORT || 3000;

// Function to get IP addresses
function getIPAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const interfaceName in interfaces) {
        const interface = interfaces[interfaceName];
        for (const address of interface) {
            // Skip internal and non-IPv4 addresses
            if (!address.internal && address.family === 'IPv4') {
                addresses.push(address.address);
            }
        }
    }
    return addresses;
}

// Serve static files from 'public' directory
app.use(express.static('public'));

// Basic route for testing
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log('\nServer is running! Access it at:');
    console.log(`Local:\t\thttp://localhost:${port}`);
    
    const networkIPs = getIPAddresses();
    if (networkIPs.length > 0) {
        console.log('\nNetwork:');
        networkIPs.forEach(ip => {
            console.log(`\t\thttp://${ip}:${port}`);
        });
    }
    console.log('\nPress Ctrl+C to stop the server.');
});
