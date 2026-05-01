const cds  = require('@sap/cds');
const cors = require('cors');

const corsOptions = {
    origin:         'https://994ae882trial-dev-backorder-history-app.cfapps.us10-001.hana.ondemand.com',
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

cds.on('bootstrap', app => {
    app.use(cors(corsOptions));
});

module.exports = cds.server;