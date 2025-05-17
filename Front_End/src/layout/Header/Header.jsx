import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaBell, FaShoppingCart, FaUser } from "react-icons/fa";
import { IoApps } from "react-icons/io5";
import AuthModal from "../../components/Modal/AuthModal";
import Cookies from "js-cookie";

import "./Header.scss";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Kiểm tra cookie khi component mount
    const userCookie = Cookies.get("user");
    if (userCookie) {
      const user = JSON.parse(decodeURIComponent(userCookie));
      setUserInfo(user);
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleLoginSuccess = (userData) => {
    setUserInfo(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    Cookies.remove("user");
    setUserInfo(null);
    setIsLoggedIn(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(true);
  };

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header id="header" className="header">
      {/* Link test chuyển hướng profile */}
      <div style={{ position: "absolute", top: 0, left: 0, zIndex: 9999, background: "#fff" }}>
        <Link to="/profile" style={{ color: "red", fontWeight: "bold", padding: 8, display: "inline-block" }}>
          Test Profile
        </Link>
      </div>
      <div className="container">
        <div className="header__inner">
          <Link to="/" className="logo">
            <img src="/assets/images/icon/fahasa-logo.webp" alt="Fahasa Logo" className="logo__icon" />
          </Link>
          <div className="search">
            <form onSubmit={handleSearch} className="search__form">
              <input
                type="text"
                className="search__input"
                placeholder="Tìm kiếm sản phẩm mong muốn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn search__btn">
                <FaSearch className="search__icon" />
              </button>
            </form>
          </div>
          <div className="header-act">
            <div className="header-act__control">
              {/* Notice */}
              <div className="header-act__border">
                <Link to="/notifications" className="header-act__notice">
                  <FaBell className="header-act__img" />
                  <div className="notice-dropdown">
                    <div className="notice-dropdown__wrapper">
                      <div className="notice-dropdown__heading">
                        <FaBell className="notice-dropdown__icon" />
                        <h3 className="notice-dropdown__title">Thông báo</h3>
                      </div>
                      <div className="notice-dropdown__body">
                        <div className="notice-dropdown__notice-no-empty">
                          <span className="notice-dropdown__label">Hiện bạn chưa có thông báo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              {/* Cart */}
              <div className="header-act__border">
                <Link to="/cart" className="header-act__cart">
                  <FaShoppingCart className="header-act__img" />
                  <div className="cart-dropdown">
                    <div className="cart-dropdown__wrapper">
                      <div className="cart-dropdown__heading">
                        <FaShoppingCart className="cart-dropdown__icon" />
                        <h3 className="cart-dropdown__title">Giỏ hàng</h3>
                      </div>
                      <div className="cart-dropdown__body">
                        <div className="cart-dropdown__notice-no-empty">
                          <span className="cart-dropdown__label">Hiện bạn chưa có sản phẩm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            <div className="header-act__account">
              {!isLoggedIn ? (
                <div className="header-act__border" onClick={handleAuthClick}>
                  <button className="header-act__auth-btn">
                    <FaUser className="header-act__img" />
                  </button>
                </div>
              ) : (
                <div className="header-act__border" onClick={handleAvatarClick} style={{ position: "relative" }}>
                  <img
                    src={
                      userInfo && userInfo.avatar
                        ? userInfo.avatar
                        : "https://res.cloudinary.com/dcqyuixqu/image/upload/v1745775273/logo_user_empty_a971qi.png"
                    }
                    alt="User Avatar"
                    className="header-act__img"
                  />
                  {isDropdownOpen && (
                    <div
                      className="user-dropdown"
                      ref={dropdownRef}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}>
                      <ul className="user-dropdown__list">
                        <li
                          className="user-dropdown__item"
                          onClick={() => {
                            console.log("Chuyển hướng trang cá nhân");
                            setIsDropdownOpen(false);
                          }}>
                          <Link to="/profile" style={{ color: "inherit", textDecoration: "none" }}>
                            Trang cá nhân
                          </Link>
                        </li>
                        <li className="user-dropdown__item" onClick={handleLogout}>
                          Đăng xuất
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} onLoginSuccess={handleLoginSuccess} />
    </header>
  );
};

export default Header;
