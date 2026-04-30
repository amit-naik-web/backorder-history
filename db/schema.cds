namespace backorder;

entity Customer {
  key ID        : UUID;
  soldTo        : String(50);
  name          : String(100);
  shipTos       : Composition of many ShipTo on shipTos.customer = $self;
}

entity ShipTo {
  key ID          : UUID;
  customer        : Association to Customer;
  shipToCode      : String(50);
  name            : String(100);
}

entity BackOrderItem {
  key ID            : UUID;
  customer          : Association to Customer;
  shipTo            : Association to ShipTo;
  productCode       : String(255);
  quantity          : Integer;
  dealerPrice       : Decimal(10,2);
  totalPrice        : Decimal(10,2);
  currency          : String(5);
  erpOrderNumber    : String(50);
  orderNumber       : String(50);
  invoiceNumber     : String(50);
  poNumber          : String(50);
  itemNumber        : String(50);
  orderDate         : DateTime;
  orderStatus       : String(10);
  orderType         : String(10);
}