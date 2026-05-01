const cds = require('@sap/cds');
const LOG = cds.log('backorder');

module.exports = cds.service.impl(async function () {
    const { BackOrderItems, Customers, ShipTos } = this.entities;

    this.on('searchBackOrders', async (req) => {
        const {
            soldTo,
            shipTo       = [],
            search       = '',
            searchBy     = '',
            fromDate     = '',
            toDate       = '',
            status       = [],
            sort         = 'orderDate',
            dir          = 'desc',
            currentPage  = 0,
            pageSize     = 12,
            orderType    = []
        } = req.data;

        LOG.info(`searchBackOrders called - soldTo: ${soldTo}, searchBy: ${searchBy}, search: ${search}`);

        // Step 1 — find customer by soldTo
        let customer_IDs = [];
        if (soldTo) {
            const customers = await SELECT.from(Customers)
                .where({ soldTo });
            customer_IDs = customers.map(c => c.ID);

        }

        // Step 2 — find shipTo IDs if shipTo array provided
        let shipTo_IDs = [];
        if (shipTo && shipTo.length > 0) {
            const shipTos = await SELECT.from(ShipTos)
                .where({ shipToCode: { in: shipTo } });
            shipTo_IDs = shipTos.map(s => s.ID);
        }

        // Step 3 — fetch all items
        let allItems = await SELECT.from(BackOrderItems);

        // Step 4 — apply filters in JS

        // Filter by customer
        if (customer_IDs.length > 0) {
            allItems = allItems.filter(i =>
                customer_IDs.includes(i.customer_ID)
            );
        }

        // Filter by shipTo
        if (shipTo_IDs.length > 0) {
            allItems = allItems.filter(i =>
                shipTo_IDs.includes(i.shipTo_ID)
            );
        }

        // Filter by search — exact match rules from PDF
        if (search && searchBy) {
            const s = search.toLowerCase();
            allItems = allItems.filter(i => {
                switch (searchBy) {
                    case 'orderNumber':
                        return i.orderNumber === search;
                    case 'invoiceNumber':
                        return i.invoiceNumber === search;
                    case 'poNumber':
                        return i.poNumber?.toLowerCase().includes(s);
                    case 'itemNumber':
                        return i.itemNumber?.toLowerCase().includes(s);
                    default:
                        return true;
                }
            });
        }

        // Filter by date range
        if (fromDate) {
            allItems = allItems.filter(i =>
                i.orderDate && i.orderDate >= fromDate
            );
        }
        if (toDate) {
            allItems = allItems.filter(i =>
                i.orderDate && i.orderDate <= toDate
            );
        }

        // Filter by status array
        if (status && status.length > 0) {
            allItems = allItems.filter(i =>
                status.includes(i.orderStatus)
            );
        }

        // Filter by orderType array
        if (orderType && orderType.length > 0) {
            allItems = allItems.filter(i =>
                orderType.includes(i.orderType)
            );
        }

        // Step 5 — sort
        const sortField = ['orderDate', 'orderNumber', 'itemNumber'].includes(sort)
            ? sort : 'orderDate';

        allItems.sort((a, b) => {
            const valA = a[sortField] || '';
            const valB = b[sortField] || '';
            return dir === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });

        // Step 6 — paginate
        const totalResults = allItems.length;
        const totalPages   = Math.ceil(totalResults / pageSize);
        const offset       = currentPage * pageSize;
        const paginated    = allItems.slice(offset, offset + pageSize);

        LOG.info(`Returning ${paginated.length} of ${totalResults} results`);

        // Step 7 — return matching PDF response structure
        return {
            entries: paginated.map(i => ({
                productCode:    i.productCode,
                quantity:       i.quantity,
                dealerPrice:    i.dealerPrice,
                totalPrice:     i.totalPrice,
                currency:       i.currency,
                erpOrderNumber: i.erpOrderNumber,
                orderDate:      i.orderDate,
                orderStatus:    i.orderStatus
            })),
            currentPage,
            pageSize,
            totalPages,
            totalResults
        };
    });
});