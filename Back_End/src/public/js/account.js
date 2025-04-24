document.addEventListener('DOMContentLoaded', function() {
    // Lấy các elements
    const addAccountBtn = document.getElementById('addaccount');
    const addModal = document.getElementById('modal_addAccount');
    const editModal = document.getElementById('modal_editAccount');
    const closeAddModal = document.getElementById('closeAddModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const addForm = document.getElementById('addAccountForm');
    const editForm = document.getElementById('editAccountForm');
    const previewAddAvatar = document.getElementById('previewAddAvatar');
    const previewEditAvatar = document.getElementById('previewEditAvatar');
    const defaultAvatarSrc = 'images/logo/logo_user_empty.png';

    // Kiểm tra xem các elements có tồn tại không
    if (!addAccountBtn || !addModal || !editModal || !closeAddModal || !closeEditModal || !addForm || !editForm) {
        console.error('Không tìm thấy một hoặc nhiều elements cần thiết');
        return;
    }

    // Mở modal thêm mới
    addAccountBtn.addEventListener('click', () => {
        addForm.reset();
        previewAddAvatar.src = defaultAvatarSrc;
        addModal.style.display = 'flex';
        addModal.classList.add('show');
    });

    // Mở modal sửa
    document.querySelectorAll('.account__edit-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const accountId = this.dataset.id;
            await openEditModal(accountId);
        });
    });

    // Đóng modal thêm mới
    closeAddModal.addEventListener('click', () => {
        addModal.style.display = 'none';
        addModal.classList.remove('show');
        addForm.reset();
        previewAddAvatar.src = defaultAvatarSrc;
    });

    // Đóng modal sửa
    closeEditModal.addEventListener('click', () => {
        editModal.style.display = 'none';
        editModal.classList.remove('show');
        editForm.reset();
        previewEditAvatar.src = defaultAvatarSrc;
    });

    // Đóng modal khi click ra ngoài
    window.addEventListener('click', (event) => {
        if (event.target === addModal) {
            addModal.style.display = 'none';
            addModal.classList.remove('show');
            addForm.reset();
            previewAddAvatar.src = defaultAvatarSrc;
        }
        if (event.target === editModal) {
            editModal.style.display = 'none';
            editModal.classList.remove('show');
            editForm.reset();
            previewEditAvatar.src = defaultAvatarSrc;
        }
    });

    // Preview ảnh đại diện cho modal thêm mới
    const addAvatarInput = addForm.querySelector('input[name="avatar"]');
    if (addAvatarInput) {
        addAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewAddAvatar.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                previewAddAvatar.src = defaultAvatarSrc;
            }
        });
    }

    // Preview ảnh đại diện cho modal sửa
    const editAvatarInput = editForm.querySelector('input[name="avatar"]');
    if (editAvatarInput) {
        editAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewEditAvatar.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                previewEditAvatar.src = defaultAvatarSrc;
            }
        });
    }

    // Xử lý form thêm mới
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(addForm);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (!password) {
                alert('Vui lòng nhập mật khẩu!');
                return;
            }

            if (password !== confirmPassword) {
                alert('Mật khẩu không khớp!');
                return;
            }

            if (password.length < 6) {
                alert('Mật khẩu phải có ít nhất 6 ký tự!');
                return;
            }

            const response = await fetch('/api/account/create', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('Tạo tài khoản thành công!');
                addModal.style.display = 'none';
                addModal.classList.remove('show');
                addForm.reset();
                previewAddAvatar.src = defaultAvatarSrc;
                window.location.reload();
            } else {
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra');
        }
    });

    // Xử lý form sửa
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(editForm);
            const accountId = formData.get('accountId');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (password || confirmPassword) {
                if (password !== confirmPassword) {
                    alert('Mật khẩu mới không khớp!');
                    return;
                }

                if (password.length < 6) {
                    alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
                    return;
                }
            } else {
                // Nếu không nhập mật khẩu mới, xóa các trường mật khẩu khỏi formData
                formData.delete('password');
                formData.delete('confirmPassword');
            }

            const response = await fetch(`/api/accounts/${accountId}`, {
                method: 'PUT',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('Cập nhật tài khoản thành công!');
                editModal.style.display = 'none';
                editModal.classList.remove('show');
                editForm.reset();
                previewEditAvatar.src = defaultAvatarSrc;
                window.location.reload();
            } else {
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra');
        }
    });

    // Xử lý xóa tài khoản
    document.querySelectorAll('.account__delete-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const accountId = this.dataset.id;
            
            if (confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) {
                try {
                    const response = await fetch(`/api/accounts/${accountId}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        alert('Xóa tài khoản thành công');
                        this.closest('.account__item').remove();
                    } else {
                        alert(data.message || 'Có lỗi xảy ra khi xóa tài khoản');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Có lỗi xảy ra khi xóa tài khoản');
                }
            }
        });
    });

    // Hàm mở modal sửa và điền thông tin
    async function openEditModal(accountId) {
        try {
            const response = await fetch(`/api/accounts/${accountId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (!data.success || !data.account) {
                throw new Error('Không thể lấy thông tin tài khoản');
            }

            const account = data.account;
            document.getElementById('editAccountId').value = accountId;
            
            // Điền thông tin vào form
            editForm.querySelector('[name="username"]').value = account.username || '';
            editForm.querySelector('[name="email"]').value = account.email || '';
            editForm.querySelector('[name="fullName"]').value = account.fullName || '';
            editForm.querySelector('[name="phone"]').value = account.phone || '';
            
            // Reset trường password
            editForm.querySelector('[name="password"]').value = '';
            editForm.querySelector('[name="confirmPassword"]').value = '';
            
            // Hiển thị avatar
            previewEditAvatar.src = account.avatar ? `/images/uploads/${account.avatar}` : defaultAvatarSrc;
            
            // Hiển thị modal
            editModal.style.display = 'flex';
            editModal.classList.add('show');
        } catch (error) {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi lấy thông tin tài khoản: ' + error.message);
        }
    }
}); 