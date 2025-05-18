import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import axios from "axios";
import "./ProductDetail.scss";
import Cookies from "js-cookie";

const ProductDetail = () => {
  // Hỗ trợ cả id và slug
  const { id, slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryBreadcrumbs, setCategoryBreadcrumbs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(true);

  // Thêm state để theo dõi thông tin rating từ CommentSection
  const [productRating, setProductRating] = useState({
    avgRating: 0,
    totalReviews: 0,
  });

  // Callback để nhận thông tin rating từ CommentSection
  const updateProductRating = React.useCallback((avgRating, totalReviews) => {
    // Sử dụng hàm setter của useState để tránh phụ thuộc vào productRating hiện tại
    setProductRating((prev) => {
      // Nếu không có thay đổi thực sự, trả về đúng object cũ để tránh re-render
      if (prev.avgRating === avgRating && prev.totalReviews === totalReviews) {
        return prev;
      }
      return { avgRating, totalReviews };
    });
  }, []);

  // Memoize các handler để giảm re-render
  const handleIncrease = React.useCallback(() => {
    if (quantity < (product?.stock || 1)) {
      setQuantity((prev) => prev + 1);
    }
  }, [quantity, product]);

  const handleDecrease = React.useCallback(() => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }, [quantity]);

  const handleAddToCart = React.useCallback(async () => {
    let user = null;
    try {
      user = JSON.parse(Cookies.get("user"));
    } catch (e) {
      alert("Không thể đọc thông tin người dùng. Vui lòng đăng nhập lại!");
      return;
    }
    if (!user || !(user._id || user.username) || !(user.name || user.fullName) || !user.avatar) {
      alert("Thiếu thông tin người dùng. Vui lòng đăng nhập lại!");
      return;
    }
    const apiUrl = "/api/basket/add";
    await axios.post(apiUrl, {
      userId: user._id || user.username,
      userName: user.name || user.fullName || user.username,
      userAvatar: user.avatar,
      productId: product._id,
      productName: product.name,
      productImage: product.images[0],
      quantity,
      price: product.price,
    });
    alert("Đã thêm vào giỏ hàng!");
  }, [product, quantity]);

  // Memoize breadcrumbItems để tránh tính lại không cần thiết
  const breadcrumbItems = React.useMemo(() => {
    if (!product) return [];
    return [
      ...categoryBreadcrumbs.map((cat) => ({
        name: cat.name,
        path: `/category/${cat.slug}`,
      })),
      { name: product?.name },
    ];
  }, [categoryBreadcrumbs, product]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        let response;
        if (id) {
          response = await axios.get(`/api/products/${id}`);
        } else if (slug) {
          response = await axios.get(`/api/products/slug/${slug}`);
        } else {
          setError("Không có id hoặc slug sản phẩm.");
          setLoading(false);
          return;
        }
        if (response.data && response.data.success && response.data.data) {
          setProduct(response.data.data);
          setCategoryBreadcrumbs(response.data.categoryBreadcrumbs || []);
        } else {
          setError("Không tìm thấy sản phẩm hoặc dữ liệu trả về không hợp lệ.");
        }
      } catch (error) {
        setError("Lỗi khi lấy dữ liệu sản phẩm: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    // Kiểm tra đăng nhập
    const userCookie = Cookies.get("user");
    setIsLoggedIn(!!userCookie);

    const checkCanReview = async () => {
      setLoadingCheck(true);
      try {
        const user = JSON.parse(Cookies.get("user"));
        if (!user || !user.email) {
          setCanReview(false);
          setLoadingCheck(false);
          return;
        }
        // 1. Lấy tất cả đơn hàng (không filter userId)
        const ordersRes = await axios.get(`/api/orders`);
        const allOrders = ordersRes.data.data || [];
        // 2. Lọc đơn hàng có email trùng với user
        const orders = allOrders.filter((order) => order.customer && order.customer.email === user.email);

        // 3. Kiểm tra có đơn hàng đã xác nhận và chứa sản phẩm này không
        const hasPurchased = orders.some(
          (order) =>
            order.status === "Đã xác nhận" && order.products.some((p) => p.productId?.toString() === id?.toString())
        );

        if (!hasPurchased) {
          setCanReview(false);
          setLoadingCheck(false);
          return;
        }
        // 4. Lấy tất cả comment của sản phẩm
        const commentsRes = await axios.get(`/api/comments/${id}`);
        const comments = commentsRes.data.comments || [];

        // 5. Kiểm tra user đã từng bình luận chưa (theo email hoặc fullName)
        // const hasReviewed = comments.some((c) => c.userEmail === user.email || c.userName === user.fullName);
        // setCanReview(!hasReviewed);
        setCanReview(true);
      } catch (e) {
        console.error("Error in checkCanReview", e);
        setCanReview(false);
      }
      setLoadingCheck(false);
    };

    if (id) {
      checkCanReview();
    }
  }, [id, slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!product) return <div>Product not found</div>;

  // Đặt ngoài cùng file và sử dụng React.memo để tránh render không cần thiết
  const ReviewModal = React.memo(
    ({ showModal, setShowModal, rating, setRating, comment, setComment, handleSubmitReview, loading }) => {
      if (!showModal) return null;

      const handleClose = () => {
        setShowModal(false);
      };

      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Viết đánh giá sản phẩm</h3>
              <button onClick={handleClose}>&times;</button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="rating-input">
                <label>Đánh giá của bạn:</label>
                <div className="stars" style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        cursor: "pointer",
                        fontSize: 28,
                        color: rating >= star ? "#FFD700" : "#ccc",
                        transition: "color 0.2s",
                      }}
                      onClick={() => setRating(star)}
                      role="button"
                      aria-label={`Đánh giá ${star} sao`}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="comment-input">
                <label>Nhận xét của bạn:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                  required
                  style={{ width: "100%", minHeight: 80, resize: "vertical" }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleClose}>
                  Hủy
                </button>
                <button type="submit" disabled={loading || !rating || !comment}>
                  {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }
  );

  const CommentSection = React.memo(({ id, canReview, loadingCheck, onRatingUpdate }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [rating, setRating] = React.useState(0);
    const [comment, setComment] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    // Quản lý state reviews trong component con
    const [localReviews, setLocalReviews] = React.useState([]);

    // Sử dụng useRef để lưu giá trị trước đó
    const previousValuesRef = React.useRef({ avgRating: 0, reviewCount: 0 });

    // Tính toán avg rating trong CommentSection
    const avgRating = React.useMemo(() => {
      return localReviews.length > 0
        ? (localReviews.reduce((acc, review) => acc + review.rating, 0) / localReviews.length).toFixed(1)
        : "0";
    }, [localReviews]);

    // Cập nhật thông tin rating cho component cha - CHỈ khi localReviews thay đổi
    React.useEffect(() => {
      // Rất quan trọng: chỉ gọi onRatingUpdate một lần sau khi fetch reviews
      if (onRatingUpdate && localReviews.length > 0) {
        const currentAvg = parseFloat(avgRating);
        const currentCount = localReviews.length;

        // Chỉ cập nhật khi thực sự có thay đổi
        if (
          previousValuesRef.current.avgRating !== currentAvg ||
          previousValuesRef.current.reviewCount !== currentCount
        ) {
          // Cập nhật giá trị tham chiếu
          previousValuesRef.current = { avgRating: currentAvg, reviewCount: currentCount };

          // Thông báo lên component cha
          onRatingUpdate(currentAvg, currentCount);
        }
      }
    }, [localReviews, avgRating, onRatingUpdate]);

    // Sử dụng useCallback để hàm này không bị tạo lại mỗi khi component re-render
    const fetchReviews = React.useCallback(async () => {
      try {
        const response = await axios.get(`/api/comments/${id}`);
        if (response.data.success) {
          setLocalReviews(response.data.comments || []);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    }, [id]);

    // Chỉ fetch reviews một lần khi id thay đổi hoặc fetchReviews thay đổi
    React.useEffect(() => {
      if (id) {
        fetchReviews();
      }
    }, [id, fetchReviews]);

    const handleSubmitReview = React.useCallback(
      async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          const user = JSON.parse(Cookies.get("user"));
          if (!user || !user.email) {
            alert("Vui lòng đăng nhập để gửi đánh giá!");
            setLoading(false);
            return;
          }
          if (!rating || rating < 1 || rating > 5) {
            alert("Vui lòng chọn số sao từ 1-5!");
            setLoading(false);
            return;
          }
          if (!comment || comment.trim().length === 0) {
            alert("Vui lòng nhập nội dung đánh giá!");
            setLoading(false);
            return;
          }
          const productIdToSend = id;
          if (!productIdToSend) {
            alert("Không xác định được sản phẩm!");
            setLoading(false);
            return;
          }
          const response = await axios.post(
            `/api/comments/${productIdToSend}`,
            {
              userId: user.email,
              rating,
              comment,
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("token")}`,
              },
            }
          );
          if (response.data.success) {
            setShowModal(false);
            setRating(0);
            setComment("");
            fetchReviews();
          } else {
            alert(response.data.message || "Không thể gửi bình luận");
          }
        } catch (error) {
          alert(error.response?.data?.message || "Không thể gửi bình luận");
          console.error("Error submitting review:", error);
        } finally {
          setLoading(false);
        }
      },
      [comment, fetchReviews, id, rating]
    );

    // Sử dụng useCallback cho handler bấm nút để tránh tạo hàm mới mỗi lần render
    const handleOpenModal = React.useCallback(() => {
      setShowModal(true);
    }, []);

    return (
      <section className="comment">
        <div className="container">
          <div className="comment__wrapper">
            <div className="comment__heading">Đánh giá sản phẩm</div>
            {/* Top */}
            <div className="comment__top">
              <div className="comment-rating">
                <div className="comment-rating__score-detail">
                  <div className="comment-rating__score">
                    <span className="comment-rating__value">
                      {localReviews.length > 0
                        ? (localReviews.reduce((acc, review) => acc + review.rating, 0) / localReviews.length).toFixed(
                            1
                          )
                        : "0"}
                    </span>
                    <span className="comment-rating__max">/5</span>
                  </div>
                  <div className="comment-rating__stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <img key={i} src="/src/assets/images/icon/star.svg" alt="" className="pd-dt-info__rating-star" />
                    ))}
                  </div>
                  <span className="comment-rating__count">({localReviews.length} đánh giá)</span>
                </div>
                <div className="comment-rating__bars">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = localReviews.filter((r) => r.rating === star).length;
                    const percentage = localReviews.length > 0 ? (count / localReviews.length) * 100 : 0;
                    return (
                      <div className="comment-rating__bar" key={star}>
                        <span className="comment-rating__label">{star} sao</span>
                        <div className="comment-rating__progress-bar">
                          <div
                            className="comment-rating__progress"
                            style={{ width: `${percentage}%`, background: "#FFD600" }}></div>
                        </div>
                        <span className="comment-rating__percentage">{`${Math.round(percentage)}%`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="comment-reviews">
                {loadingCheck ? (
                  <span>Đang kiểm tra quyền bình luận...</span>
                ) : canReview ? (
                  <button className="comment-reviews__btn" onClick={handleOpenModal}>
                    Viết bình luận
                  </button>
                ) : (
                  <span className="comment-reviews__label">Bạn cần mua sản phẩm để được đánh giá</span>
                )}
              </div>
            </div>
            {/* Body */}
            <div className="comment__body">
              {/* Tabs */}
              <div className="comment__tabs">
                <ul className="comment__list">
                  <li className="comment__item comment__item--active">Mới nhất</li>
                  <li className="comment__item">Yêu thích nhất</li>
                </ul>
              </div>
              {/* Content */}
              <div className="comment-content">
                <ul className="comment-content__list">
                  {localReviews.map((review, idx) => (
                    <li className="comment-content__item" key={idx}>
                      <div className="comment-content__left">
                        <span className="comment-content__name">{review.userName}</span>
                        <span className="comment-content__date">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="comment-content__right">
                        <div className="comment-content__rating">
                          {[1, 2, 3, 4, 5].map((star, i) => (
                            <img
                              key={i}
                              src="/src/assets/images/icon/star.svg"
                              alt=""
                              className="comment-content__star"
                              style={{
                                filter:
                                  star <= review.rating
                                    ? "grayscale(0%) brightness(1) sepia(1) hue-rotate(-20deg) saturate(5) brightness(1.2)"
                                    : "grayscale(100%) brightness(1.5)",
                              }}
                            />
                          ))}
                        </div>
                        <div className="comment-content__body">{review.comment}</div>
                        <div className="comment-content__footer">
                          <button className="comment-content__like">
                            <img src="/src/assets/images/icon/like.svg" alt="" />
                            Thích ({review.likes || 0})
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ReviewModal
          showModal={showModal}
          setShowModal={setShowModal}
          rating={rating}
          setRating={setRating}
          comment={comment}
          setComment={setComment}
          handleSubmitReview={handleSubmitReview}
          loading={loading}
        />
      </section>
    );
  });

  // Không cần biến avg nữa vì nó được tính trong CommentSection

  return (
    <div className="product-detail-wrapper">
      {/* Breadcrumb luôn hiển thị, nếu có dữ liệu category */}
      {product && <Breadcrumb items={breadcrumbItems} />}
      <div className="container">
        <section className="pd-dt">
          <form method="post" className="pd-dt__form">
            <div className="pd-dt__essential">
              {/* Left */}
              <div className="pd-dt__media">
                <div className="pd-dt__media-container">
                  {/* Review */}
                  <div className="pd-dt__product-image-img">
                    <div className="pd-dt__container-primary">
                      <img
                        src={product?.images?.[0] || "/assets/images/book/combo-20102022001.webp"}
                        alt={product?.name}
                        className="pd-dt__img-primary"
                        id="imgProduct"
                      />
                    </div>
                    <ul className="pd-dt__img-list">
                      {product?.subImages?.slice(0, 3).map((img, idx) => (
                        <li className="pd-dt__img-item" key={idx}>
                          <img src={img} alt={product?.name} className="pd-dt__img-sub" />
                        </li>
                      ))}
                      {product?.subImages?.length > 4 && (
                        <li className="pd-dt__img-item" key="more">
                          <div className="pd-dt__img-more">+{product.subImages.length - 3}</div>
                        </li>
                      )}
                      {product?.subImages?.length === 4 && (
                        <li className="pd-dt__img-item" key={3}>
                          <img src={product.subImages[3]} alt={product?.name} className="pd-dt__img-sub" />
                        </li>
                      )}
                    </ul>
                  </div>
                  {/* BTN */}
                  <div className="pd-dt__act">
                    <button type="button" className="pd-dt__add-cart" onClick={handleAddToCart}>
                      Thêm vào giỏ hàng
                    </button>
                    <a className="pd-dt__buy">Mua ngay</a>
                  </div>
                  {/* Policy */}
                  <div className="pd-dt-policy">
                    <h4 className="pd-dt-policy__title">Chính sách ưu đãi</h4>
                    {[
                      {
                        icon: "/src/assets/images/icon/ico_truck_v2.webp",
                        title: "Thời gian giao hàng:",
                        desc: "Giao nhanh và uy tín",
                      },
                      {
                        icon: "/src/assets/images/icon/ico_transfer_v2.webp",
                        title: "Chính sách đổi trả:",
                        desc: "Đổi trả miễn phí toàn quốc",
                      },
                      {
                        icon: "/src/assets/images/icon/ico_shop_v2.webp",
                        title: "Chính sách khách sỉ:",
                        desc: "Ưu đãi khi mua số lượng lớn",
                      },
                    ].map((item, i) => (
                      <div className="pd-dt-policy__note" key={i}>
                        <div className="pd-dt-policy__left">
                          <img src={item.icon} alt="" className="pd-dt-policy__icon" />
                          <span className="pd-dt-policy__bold">{item.title}</span>
                        </div>
                        <div className="pd-dt-policy__right">
                          <span>{item.desc}</span>
                          <img src="/assets/images/icon/arrow_right.svg" alt="" className="pd-dt-policy__arrow" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="pd-dt__content">
                {/* Info */}
                <div className="pd-dt-info">
                  {/* Heading */}
                  <h2 className="pd-dt-info__heading" id="nameProduct">
                    {product?.name}
                  </h2>
                  {/* Details */}
                  <div className="pd-dt-info__details">
                    <ul className="pd-dt-info__list">
                      {product?.supplier && product.supplier !== "Đang cập nhật" && (
                        <li className="pd-dt-info__item">
                          Nhà cung cấp: <span className="pd-dt-info__bold">{product.supplier}</span>
                        </li>
                      )}
                      {product?.publisher && product.publisher !== "Đang cập nhật" && (
                        <li className="pd-dt-info__item">
                          Nhà xuất bản: <span className="pd-dt-info__bold">{product.publisher}</span>
                        </li>
                      )}
                      {product?.author && product.author !== "Đang cập nhật" && (
                        <li className="pd-dt-info__item">
                          Tác giả: <span className="pd-dt-info__bold">{product.author}</span>
                        </li>
                      )}
                      {product?.type && product.type !== "Đang cập nhật" && (
                        <li className="pd-dt-info__item">
                          Thể loại: <span className="pd-dt-info__bold">{product.type}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  {/* Rating */}
                  <div className="pd-dt-info__rating">
                    {/* Star */}
                    <div className="pd-dt-info__rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => {
                        let percent = 0;
                        if (star <= Math.floor(productRating.avgRating)) {
                          percent = 100;
                        } else if (
                          star === Math.floor(productRating.avgRating) + 1 &&
                          productRating.avgRating % 1 !== 0
                        ) {
                          percent = (productRating.avgRating % 1) * 100;
                        }
                        return (
                          <span
                            key={star}
                            style={{
                              display: "inline-block",
                              width: 24,
                              height: 24,
                              background: percent
                                ? `linear-gradient(90deg, #FFD700 ${percent}%, #ccc ${percent}%)`
                                : "#ccc",
                              WebkitMask: "url(/src/assets/images/icon/star.svg) no-repeat center / contain",
                              mask: "url(/src/assets/images/icon/star.svg) no-repeat center / contain",
                              marginRight: 2,
                            }}
                          />
                        );
                      })}
                    </div>
                    {/* Comment */}
                    <span className="pd-dt-info__comment">({productRating.totalReviews} đánh giá)</span>
                    {/* Quantity */}
                    <div className="pd-dt-info__quantity">
                      <p>Đã bán</p>
                      <span className="pd-dt-info__quantity-sale">{product?.sold || 0}</span>
                    </div>
                  </div>
                  {/* Price */}
                  <div className="pd-dt-info__price">
                    <div className="pd-dt-info__price-current" id="priceValue">
                      {product?.price ? product.price.toLocaleString() + " đ" : "Đang cập nhật"}
                    </div>
                  </div>
                </div>
                {/* Quantity */}
                <div className="pd-dt-qtt">
                  <div className="pd-dt-qtt__span">Số lượng</div>
                  <div className="pd-dt-qtt__act">
                    <button
                      type="button"
                      className="pd-dt-qtt__click"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}>
                      <img
                        src="/src/assets/images/icon/minus.webp"
                        alt=""
                        className="pd-dt-qtt__act-btn"
                        style={{ height: "2px" }}
                      />
                    </button>
                    <span className="pd-dt-qtt__number" id="productValue">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="pd-dt-qtt__click"
                      onClick={handleIncrease}
                      disabled={quantity >= (product?.stock || 1)}>
                      <img src="/src/assets/images/icon/plus.webp" alt="" className="pd-dt-qtt__act-btn" />
                    </button>
                  </div>
                </div>
                {/* Details */}
                <div className="pd-dt-detail">
                  <h3 className="pd-dt-detail__title">Thông tin chi tiết</h3>
                  <table className="pd-dt-detail__table">
                    <colgroup>
                      <col width="25%" />
                      <col />
                    </colgroup>
                    <tbody>
                      <tr>
                        <th className="pd-dt-detail__heading">Mã hàng</th>
                        <td>{product?._id}</td>
                      </tr>
                      {/* Thêm các dòng chi tiết khác nếu cần */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
      {/* Tách biệt CommentSection thành một phần riêng biệt để tránh lỗi cấu trúc DOM */}
      <CommentSection id={id} canReview={canReview} loadingCheck={loadingCheck} onRatingUpdate={updateProductRating} />
    </div>
  );
};

export default ProductDetail;
