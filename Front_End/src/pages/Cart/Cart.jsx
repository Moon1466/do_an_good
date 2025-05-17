import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./Cart.scss";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();

  // Fetch cart items when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const user = JSON.parse(Cookies.get("user"));
        if (!user) {
          setError("Vui lòng đăng nhập để xem giỏ hàng");
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/basket/${user._id || user.username}`);
        if (response.data.success) {
          setCartItems(response.data.data?.items || []);
        }
      } catch (err) {
        setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Calculate subtotal whenever selected items change
  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => {
      const cartItem = cartItems.find((i) => i.productId === item);
      return sum + (cartItem ? cartItem.price * cartItem.quantity : 0);
    }, 0);
    setSubtotal(total);
  }, [selectedItems, cartItems]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map((item) => item.productId));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const user = JSON.parse(Cookies.get("user"));
      const cartItem = cartItems.find((item) => item.productId === productId);

      if (!cartItem) {
        console.error("Không tìm thấy sản phẩm trong giỏ hàng");
        return;
      }

      const response = await axios.post("/api/basket/add", {
        userId: user._id || user.username,
        userName: user.name || user.fullName || user.username,
        userAvatar: user.avatar,
        productId: cartItem.productId,
        productName: cartItem.productName,
        productImage: cartItem.productImage,
        quantity: newQuantity - cartItem.quantity,
        price: cartItem.price,
      });

      if (response.data.success) {
        setCartItems(response.data.data.items);
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Không thể cập nhật số lượng. Vui lòng thử lại sau.");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const user = JSON.parse(Cookies.get("user"));
      if (!user) {
        alert("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      const response = await axios.delete(`/api/basket/${user._id || user.username}/${productId}`);
      if (response.data.success) {
        setCartItems(response.data.data.items);
        // Xóa sản phẩm khỏi danh sách đã chọn nếu có
        setSelectedItems((prev) => prev.filter((id) => id !== productId));
      }
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    // Lưu selectedItems vào sessionStorage trước khi navigate
    sessionStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
    navigate("/payment", { state: { selectedItems } }); // Vẫn truyền qua state phòng trường hợp sessionStorage bị xóa hoặc chặn
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="cart__error">{error}</div>;

  return (
    <section className="cart">
      <div className="container">
        <div className="cart__container">
          {cartItems.length === 0 ? (
            <div className="cart__empty">
              <img src="/src/assets/images/icon/empty.svg" alt="" className="cart__empty-img" />
              <span className="cart__notice">Giỏ hàng của bạn đang trống</span>
            </div>
          ) : (
            <div className="cart__has-product">
              <div className="cart__items">
                <div className="cart__heading">
                  <div className="cart__select-all">
                    <input
                      type="checkbox"
                      className="cart__select-all-checkbox"
                      checked={selectedItems.length === cartItems.length}
                      onChange={handleSelectAll}
                    />
                    <label className="cart__select-all-label">Chọn tất cả</label>
                  </div>
                  <label className="cart__header-quantity">Số lượng</label>
                  <label className="cart__header-total">Thành tiền</label>
                  <label className="cart__header-delete"></label>
                </div>
                <div className="cart__body">
                  <ul className="cart__item-list">
                    {cartItems.map((item) => (
                      <li key={item.productId} className="cart-item">
                        <div className="cart-item__wrapper">
                          <div className="cart-item__selection">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.productId)}
                              onChange={() => handleSelectItem(item.productId)}
                            />
                          </div>
                          <div className="cart-item__img-container">
                            <img src={item.productImage} alt={item.productName} className="cart-item__img" />
                          </div>
                          <div className="cart-item__detail">
                            <h3 className="cart-item__name">{item.productName}</h3>
                            <div className="cart-item__price">{item.price.toLocaleString()} đ</div>
                          </div>
                          <div className="cart-item__quantity">
                            <button onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>+</button>
                          </div>
                          <div className="cart-item__total">{(item.price * item.quantity).toLocaleString()} đ</div>
                          <div className="cart-item__remove">
                            <button onClick={() => handleRemoveItem(item.productId)}>
                              <img src="/src/assets/images/icon/delete.svg" alt="Delete" className="cart-item__icon" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="cart-summary">
                <div className="cart-summary__subtotal">
                  <h3 className="cart-summary__label">Thành tiền</h3>
                  <span className="cart-summary__amout">{subtotal.toLocaleString()} đ</span>
                </div>
                <div className="cart-summary__total">
                  <h3 className="cart-summary__label cart-summary__label--bold">Tổng tiền(Thuế VAT)</h3>
                  <span className="cart-summary__amout cart-summary__amout--bold">
                    {(subtotal * 1.1).toLocaleString()} đ
                  </span>
                </div>
                <div className="cart-summary__action">
                  <button
                    className={`cart-summary__submit ${selectedItems.length === 0 ? "disabled" : ""}`}
                    disabled={selectedItems.length === 0}
                    onClick={handleCheckout}>
                    THANH TOÁN
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Cart;
