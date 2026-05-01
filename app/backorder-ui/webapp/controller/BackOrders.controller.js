sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("backorder.app.backorderui.controller.BackOrders", {

        onInit: function () {
            this.getView().setModel(new JSONModel({
                entries:      [],
                currentPage:  0,
                pageSize:     12,
                totalPages:   0,
                totalResults: 0
            }), "results");

            this._currentPage = 0;
        },

        onSearch: function () {
            this._currentPage = 0;
            this._executeSearch();
        },

        onReset: function () {
            this.byId("soldToInput").setValue("");
            this.byId("searchInput").setValue("");
            this.byId("searchBySelect").setSelectedKey("");
            this.byId("sortSelect").setSelectedKey("orderDate");
            this.byId("dirSelect").setSelectedKey("desc");
            this.byId("fromDatePicker").setValue("");
            this.byId("toDatePicker").setValue("");
            this.byId("pageSizeInput").setValue(12);
            this._currentPage = 0;

            this.getView().setModel(new JSONModel({
                entries:      [],
                currentPage:  0,
                pageSize:     12,
                totalPages:   0,
                totalResults: 0
            }), "results");

            MessageToast.show("Filters reset");
        },

        onNextPage: function () {
            this._currentPage++;
            this._executeSearch();
        },

        onPrevPage: function () {
            if (this._currentPage > 0) {
                this._currentPage--;
                this._executeSearch();
            }
        },

        _executeSearch: async function () {
            const soldTo   = this.byId("soldToInput").getValue();
            const search   = this.byId("searchInput").getValue();
            const searchBy = this.byId("searchBySelect").getSelectedKey();
            const sort     = this.byId("sortSelect").getSelectedKey();
            const dir      = this.byId("dirSelect").getSelectedKey();
            const fromDate = this.byId("fromDatePicker").getValue();
            const toDate   = this.byId("toDatePicker").getValue();
            const pageSize = parseInt(this.byId("pageSizeInput").getValue());

            if (!soldTo) {
                MessageBox.warning("Please enter a Sold To customer number");
                return;
            }

            const body = {
                soldTo,
                shipTo:      [],
                search,
                searchBy,
                fromDate,
                toDate,
                status:      [],
                sort,
                dir,
                currentPage: this._currentPage,
                pageSize,
                orderType:   []
            };

            try {
                const res = await fetch("/odata/v4/back-order/searchBackOrders", {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify(body)
                });

                if (!res.ok) {
                    const err = await res.json();
                    MessageBox.error("Search failed: " + (err.error?.message || "Unknown error"));
                    return;
                }

                const data = await res.json();
                const result = data.value || data;

                this.getView().setModel(new JSONModel({
                    entries:      result.entries      || [],
                    currentPage:  result.currentPage  ?? 0,
                    pageSize:     result.pageSize      ?? 12,
                    totalPages:   result.totalPages    ?? 0,
                    totalResults: result.totalResults  ?? 0
                }), "results");

                if (result.totalResults === 0) {
                    MessageToast.show("No results found");
                } else {
                    MessageToast.show(`Found ${result.totalResults} result(s)`);
                }

            } catch (err) {
                MessageBox.error("Search failed: " + err.message);
            }
        },

        onItemPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oCtx  = oItem.getBindingContext("results");
            const item  = oCtx.getObject();

            MessageBox.information(
                "Product Code: " + item.productCode + "\n" +
                "ERP Order No: " + item.erpOrderNumber + "\n" +
                "Order Date: "   + item.orderDate + "\n" +
                "Quantity: "     + item.quantity + "\n" +
                "Dealer Price: " + item.dealerPrice + " " + item.currency + "\n" +
                "Total Price: "  + item.totalPrice + " " + item.currency + "\n" +
                "Status: "       + item.orderStatus,
                { title: "BackOrder Item Details" }
            );
        }
    });
});