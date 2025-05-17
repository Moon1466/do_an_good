import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ProductList.scss";

const ProductList = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 0, name: "Xu hướng theo ngày" },
    { id: 1, name: "Sách HOT - giảm sốc" },
    { id: 2, name: "Ngoại văn" },
  ];

  useEffect(() => {
    // Gọi API lấy danh sách sản phẩm
    axios
      .get("http://localhost:3000/api/products")
      .then((res) => {
        setProducts(res.data.data); // Sửa lại đúng key là data
        setLoading(false);
      })
      .catch((err) => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Đang tải sản phẩm...</div>;

  return (
    <section className="product">
      <div className="container">
        <div className="product__wrapper">
          <div className="product-tab">
            <ul className="product-tab__list">
              {tabs.map((tab) => (
                <li
                  key={tab.id}
                  className={`product-tab__item ${activeTab === tab.id ? "product-tab__item--active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}>
                  {tab.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="product__body">
            <div className="product__show">
              <ul className="product__list">
                {products.map((product) => (
                  <li key={product._id} className="product__item">
                    <Link to={`/product-detail/${product._id}`} className="product__link">
                      <div className="product-review">
                        <img
                          src={product.images && product.images[0]}
                          alt={product.name}
                          className="product-review__img"
                        />
                        <div className="product-review__body">
                          <h3 className="product-review__title">{product.name}</h3>
                          <span className="product-review__price">{product.price} đ</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="product__bottom">
            <Link to="#" className="product__more">
              Xem thêm
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductList;
