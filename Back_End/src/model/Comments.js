const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  reviews: [{
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    likes: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Thông tin sản phẩm khi comment được tạo
  productInfo: {
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  // Thông tin người dùng khi comment được tạo
  userInfo: {
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Middleware để tự động cập nhật thông tin sản phẩm và người dùng trước khi lưu
commentSchema.pre('save', async function(next) {
  try {
    // Nếu đây là comment mới hoặc product/user đã thay đổi
    if (this.isNew || this.isModified('product') || this.isModified('user')) {
      const [product, user] = await Promise.all([
        mongoose.model('Product').findById(this.product),
        mongoose.model('Account').findById(this.user)
      ]);

      if (product) {
        this.productInfo = {
          name: product.name,
          image: product.images[0] // Lấy ảnh đầu tiên của sản phẩm
        };
      }

      if (user) {
        this.userInfo = {
          name: user.fullName,
          avatar: user.avatar
        };
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức để thêm review mới
commentSchema.methods.addReview = function(rating, comment) {
  this.reviews.push({
    rating,
    comment,
    createdAt: new Date()
  });
  return this.save();
};

// Phương thức để like một review
commentSchema.methods.likeReview = function(reviewId) {
  const review = this.reviews.id(reviewId);
  if (review) {
    review.likes += 1;
    return this.save();
  }
  return Promise.reject(new Error('Review không tồn tại'));
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
