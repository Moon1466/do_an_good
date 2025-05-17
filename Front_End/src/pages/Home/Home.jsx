import React from "react";
import ProductList from "../../components/Product/ProductList";
import "./Home.scss";

const Home = () => {
  return (
    <div className="home">
      {/* Các component khác nếu có */}
      <ProductList />
    </div>
  );
};

export default Home;
