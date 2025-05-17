import React from "react";
import "./Profile.scss";

const Profile = () => {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar">
          <img src="/avatar-default.png" alt="User Avatar" />
        </div>
        <div className="user-info">
          <h2>Meo Meo</h2>
          <span className="badge">Thành viên Bạc</span>
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-stats">
          <div>
            <span>F-Point hiện có</span>
            <strong>0</strong>
          </div>
          <div>
            <span>Freeshop hiện có</span>
            <strong>0 lần</strong>
          </div>
          <div>
            <span>Số đơn hàng</span>
            <strong>0</strong>
          </div>
        </div>
        <div className="profile-details">
          <h3>Hồ sơ cá nhân</h3>
          <form>
            <label>Họ và tên</label>
            <input type="text" value="Meo Meo" readOnly />
            <label>Số điện thoại</label>
            <input type="text" value="0398895474" readOnly />
            <label>Email</label>
            <input type="email" value="meomeo@email.com" readOnly />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
