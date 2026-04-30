using backorder from '../db/schema';

service BackOrderService {

  entity Customers      as projection on backorder.Customer;
  entity ShipTos        as projection on backorder.ShipTo;
  entity BackOrderItems as projection on backorder.BackOrderItem;

  type BackOrderEntry {
    productCode    : String;
    quantity       : Integer;
    dealerPrice    : Decimal;
    totalPrice     : Decimal;
    currency       : String;
    erpOrderNumber : String;
    orderDate      : String;
    orderStatus    : String;
  }

  type BackOrderResponse {
    entries      : many BackOrderEntry;
    currentPage  : Integer;
    pageSize     : Integer;
    totalPages   : Integer;
    totalResults : Integer;
  }

  action searchBackOrders(
    soldTo      : String,
    shipTo      : many String,
    search      : String,
    searchBy    : String,
    fromDate    : String,
    toDate      : String,
    status      : many String,
    sort        : String,
    dir         : String,
    currentPage : Integer,
    pageSize    : Integer,
    orderType   : many String
  ) returns BackOrderResponse;
}