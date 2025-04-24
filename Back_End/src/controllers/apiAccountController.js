const Account = require('../model/Accounts');
const bcrypt = require('bcrypt');

// Lấy danh sách tài khoản
const getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({});
        res.json({
            success: true,
            accounts: accounts
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách tài khoản'
        });
    }
};

// Lấy thông tin tài khoản theo ID
const getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }
        res.json({
            success: true,
            account: account
        });
    } catch (error) {
        console.error('Error fetching account:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin tài khoản'
        });
    }
};

// Tạo tài khoản mới
const createAccount = async (req, res) => {
    try {
        const { username, email, password, fullName, phone, role } = req.body;
        
        // Kiểm tra username đã tồn tại
        const existingUsername = await Account.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập đã tồn tại'
            });
        }

        // Kiểm tra email đã tồn tại
        const existingEmail = await Account.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo account mới
        const newAccount = new Account({
            username,
            email,
            password: hashedPassword,
            fullName,
            phone,
            role,
            avatar: req.file ? req.file.filename : 'default-avatar.png'
        });

        await newAccount.save();

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản thành công',
            account: {
                username: newAccount.username,
                email: newAccount.email,
                fullName: newAccount.fullName,
                role: newAccount.role
            }
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tạo tài khoản'
        });
    }
};

// Cập nhật tài khoản
const updateAccount = async (req, res) => {
    try {
        const { username, password, email, fullName, phone, role } = req.body;
        const accountId = req.params.id;

        // Kiểm tra tài khoản tồn tại
        const existingAccount = await Account.findById(accountId);
        if (!existingAccount) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }

        // Cập nhật thông tin
        const updateData = {
            username,
            email,
            fullName,
            phone,
            role
        };

        // Chỉ cập nhật mật khẩu nếu có thay đổi
        if (password) {
            updateData.password = password;
        }

        // Cập nhật avatar nếu có file mới
        if (req.file) {
            updateData.avatar = req.file.filename;
        }

        const updatedAccount = await Account.findByIdAndUpdate(
            accountId,
            updateData,
            { new: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật tài khoản thành công',
            account: updatedAccount
        });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật tài khoản'
        });
    }
};

// Xóa tài khoản
const deleteAccount = async (req, res) => {
    try {
        const accountId = req.params.id;
        const deletedAccount = await Account.findByIdAndDelete(accountId);
        
        if (!deletedAccount) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản'
            });
        }

        res.json({
            success: true,
            message: 'Xóa tài khoản thành công'
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa tài khoản'
        });
    }
};

module.exports = {
    getAllAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount
}; 