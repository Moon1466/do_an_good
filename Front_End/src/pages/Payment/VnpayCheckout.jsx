import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./VnpayCheckout.scss";

const VnpayCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div>
        <h2>Không tìm thấy thông tin đơn hàng!</h2>
        <button onClick={() => navigate("/payment")}>Quay lại</button>
      </div>
    );
  }

  const handleVnpay = () => {
    window.location.href = "http://sandbox.vnpayment.vn/tryitnow/Home/CreateOrder";
  };

  return (
    <div className="vnpay-checkout">
      <h2>Thanh toán qua VNPAY</h2>
      <div>
        <p>
          <b>Khách hàng:</b> {order.name}
        </p>
        <p>
          <b>Số điện thoại:</b> {order.phone}
        </p>
        <p>
          <b>Địa chỉ:</b> {order.details}, {order.ward}, {order.district}, {order.city}
        </p>
        <p>
          <b>Tổng tiền:</b> {order.total.toLocaleString()} đ
        </p>
      </div>
      <button onClick={handleVnpay} className="vnpay-checkout__button">
        Thanh toán với VNPAY
      </button>
    </div>
  );
};

export default VnpayCheckout;
