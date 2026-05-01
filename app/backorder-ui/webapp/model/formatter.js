sap.ui.define([], function () {
    "use strict";

    return {
        formatDate: function (sDate) {
            if (!sDate) return "--";
            const oDate = new Date(sDate);
            return oDate.toLocaleDateString("en-GB", {
                day:   "2-digit",
                month: "short",
                year:  "numeric"
            });
        },

        formatDateTime: function (sDate) {
            if (!sDate) return "--";
            const oDate = new Date(sDate);
            return oDate.toLocaleDateString("en-GB", {
                day:   "2-digit",
                month: "short",
                year:  "numeric",
                hour:  "2-digit",
                minute:"2-digit"
            });
        }
    };
});