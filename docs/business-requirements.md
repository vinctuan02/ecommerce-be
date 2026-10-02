# Danh sách chức năng – E-commerce

> Cập nhật: 2026-10-01
>
> Liệt kê chức năng theo từng phía (khách hàng, quản trị), gom theo màn hình. Chức năng đánh dấu *(mở rộng)* là để làm sau MVP.

## Mục lục

1. [Phía khách hàng (User)](#1-phía-khách-hàng-user)
2. [Phía quản trị (Admin / Staff)](#2-phía-quản-trị-admin--staff)
3. [Hệ thống tự động](#3-hệ-thống-tự-động)
4. [Trạng thái đơn hàng](#4-trạng-thái-đơn-hàng)

---

## 1. Phía khách hàng (User)

Khách chưa đăng nhập (guest) được xem, tìm sản phẩm và thêm vào giỏ. Muốn đặt hàng thì phải đăng nhập.

### 1.1. Tài khoản

- Đăng ký bằng email + mật khẩu
- Xác thực email qua link
- Đăng nhập bằng email + mật khẩu
- Đăng nhập bằng Google
- Quên mật khẩu, đặt lại mật khẩu qua email
- Đăng xuất; đăng xuất khỏi tất cả thiết bị

### 1.2. Trang chủ

- Banner khuyến mãi
- Danh mục nổi bật
- Sản phẩm mới, sản phẩm bán chạy
- Khu flash sale đang diễn ra hoặc sắp diễn ra, có đếm ngược *(mở rộng)*

### 1.3. Danh sách sản phẩm và tìm kiếm

- Thanh tìm kiếm có gợi ý khi gõ
- Xem sản phẩm theo danh mục (danh mục nhiều cấp)
- Lọc theo danh mục, thương hiệu, khoảng giá, số sao, còn hàng
- Sắp xếp: liên quan, mới nhất, bán chạy, giá tăng/giảm
- Phân trang

### 1.4. Chi tiết sản phẩm

- Ảnh sản phẩm (nhiều ảnh, phóng to)
- Tên, giá bán, giá gốc gạch ngang, % giảm
- Chọn biến thể (màu, size...); giá, ảnh và tình trạng còn hàng đổi theo biến thể đang chọn
- Hiển thị còn hàng / hết hàng / sắp hết
- Chọn số lượng, thêm vào giỏ, mua ngay
- Mô tả, thông số sản phẩm
- Số đã bán, điểm đánh giá trung bình
- Danh sách đánh giá, lọc theo số sao *(mở rộng)*
- Sản phẩm liên quan

### 1.5. Giỏ hàng

- Xem các sản phẩm trong giỏ
- Đổi số lượng, đổi biến thể, xóa sản phẩm
- Chọn những sản phẩm muốn thanh toán
- Cảnh báo khi sản phẩm trong giỏ đổi giá, hết hàng hoặc ngừng bán
- Giỏ được giữ lại khi chưa đăng nhập, và gộp vào giỏ của tài khoản khi đăng nhập

### 1.6. Thanh toán (checkout)

- Chọn hoặc thêm địa chỉ giao hàng
- Xem phí vận chuyển
- Nhập hoặc chọn voucher *(mở rộng)*
- Chọn phương thức thanh toán: COD, thanh toán online (VNPay/Momo/Stripe)
- Xem tóm tắt: tạm tính, giảm giá, phí ship, tổng tiền
- Ghi chú cho đơn
- Đặt hàng
- Chuyển sang cổng thanh toán, sau đó về trang kết quả (thành công / thất bại / thử lại)

### 1.7. Đơn hàng của tôi

- Danh sách đơn, lọc theo trạng thái (chờ thanh toán, đang xử lý, đang giao, đã giao, đã hủy...)
- Chi tiết đơn: sản phẩm, địa chỉ, tiền, phương thức thanh toán
- Dòng thời gian trạng thái đơn
- Theo dõi vận chuyển (mã vận đơn, trạng thái giao)
- Thanh toán lại đơn chưa thanh toán
- Hủy đơn khi đơn chưa được đóng gói
- Yêu cầu trả hàng / hoàn tiền trong vòng 7 ngày sau khi nhận hàng *(mở rộng)*
- Mua lại
- Đánh giá sản phẩm sau khi đơn hoàn tất *(mở rộng)*

### 1.8. Tài khoản của tôi

- Hồ sơ: họ tên, SĐT, ngày sinh, ảnh đại diện
- Sổ địa chỉ: thêm, sửa, xóa, đặt địa chỉ mặc định
- Đổi mật khẩu
- Kho voucher của tôi *(mở rộng)*
- Danh sách yêu thích *(mở rộng)*
- Đánh giá của tôi *(mở rộng)*

### 1.9. Thông báo

- Nhận email khi: đăng ký, đặt hàng thành công, thanh toán thành công/thất bại, đơn đang giao, đã giao, bị hủy, đã hoàn tiền
- Chuông thông báo trong web *(mở rộng)*

### 1.10. Flash sale *(mở rộng)*

- Trang flash sale: các khung giờ, đếm ngược
- Giá sale, thanh tiến độ "đã bán x/y"
- Giới hạn số lượng mỗi khách được mua
- Đơn flash sale phải thanh toán trong 5 phút

---

## 2. Phía quản trị (Admin / Staff)

Staff vận hành hằng ngày (sản phẩm, kho, đơn). Admin có toàn quyền, gồm cả nhân viên, khuyến mãi, hoàn tiền và báo cáo.

### 2.1. Dashboard

- Doanh thu, số đơn, giá trị đơn trung bình theo ngày/tuần/tháng
- Biểu đồ doanh thu
- Đơn mới cần xử lý
- Top sản phẩm bán chạy
- Sản phẩm sắp hết hàng
- Tỷ lệ đơn bị hủy

### 2.2. Quản lý danh mục và thương hiệu

- Thêm, sửa, xóa, sắp xếp danh mục (dạng cây, tối đa 3 cấp)
- Ẩn/hiện danh mục
- Thêm, sửa, xóa thương hiệu (tên, logo)

### 2.3. Quản lý sản phẩm

- Danh sách sản phẩm: tìm kiếm, lọc theo danh mục, trạng thái, tồn kho
- Tạo/sửa sản phẩm: tên, mô tả, danh mục, thương hiệu, ảnh, thông số
- Khai báo biến thể (màu, size...), tự sinh danh sách SKU
- Đặt giá bán, giá gốc và mã SKU cho từng biến thể
- Trạng thái: nháp, đang bán, ngừng bán, lưu trữ
- Xem lịch sử thay đổi giá

### 2.4. Quản lý kho

- Xem tồn theo từng SKU: tồn thực tế, đang giữ cho đơn, có thể bán
- Nhập hàng
- Điều chỉnh tồn (kiểm kê, hỏng, mất), bắt buộc ghi lý do
- Lịch sử nhập/xuất/điều chỉnh của từng SKU
- Cấu hình ngưỡng cảnh báo sắp hết hàng

### 2.5. Quản lý đơn hàng

- Danh sách đơn: tìm theo mã đơn/tên/SĐT khách, lọc theo trạng thái, ngày, phương thức thanh toán
- Chi tiết đơn: sản phẩm, khách, địa chỉ, thanh toán, lịch sử trạng thái
- Xác nhận đơn, đóng gói, giao cho vận chuyển, đánh dấu đã giao / giao thất bại
- Hủy đơn (kèm lý do)
- In phiếu giao hàng
- Ghi chú nội bộ trên đơn
- Xuất danh sách đơn ra CSV

### 2.6. Thanh toán và hoàn tiền

- Xem các giao dịch của một đơn (thành công, thất bại, đang chờ)
- Hoàn tiền toàn phần hoặc một phần
- Duyệt / từ chối yêu cầu trả hàng *(mở rộng)*
- Ghi nhận đã thu tiền COD

### 2.7. Quản lý khách hàng

- Danh sách khách: tìm, lọc
- Chi tiết khách: thông tin, địa chỉ, lịch sử đơn, tổng chi tiêu
- Khóa / mở khóa tài khoản

### 2.8. Khuyến mãi *(mở rộng)*

- Tạo voucher: giảm tiền cố định, giảm %, miễn phí ship
- Điều kiện voucher: đơn tối thiểu, áp dụng cho danh mục/sản phẩm, chỉ cho khách mới
- Thời gian hiệu lực, tổng số lượt, số lượt mỗi khách
- Xem thống kê lượt dùng
- Tạo chiến dịch flash sale: khung giờ, chọn SKU, giá sale, số suất, giới hạn mỗi khách
- Theo dõi flash sale theo thời gian thực: đã bán, còn lại

### 2.9. Đánh giá *(mở rộng)*

- Danh sách đánh giá, lọc theo số sao, sản phẩm, trạng thái
- Duyệt / ẩn đánh giá
- Trả lời đánh giá

### 2.10. Nhân viên và phân quyền (chỉ Admin)

- Thêm, sửa, khóa tài khoản nhân viên
- Tạo vai trò, gán quyền cho vai trò (ví dụ: được quản lý sản phẩm, được hoàn tiền)
- Gán vai trò cho nhân viên
- Nhật ký thao tác: ai làm gì, lúc nào

### 2.11. Cấu hình (chỉ Admin)

- Thông tin cửa hàng
- Bảng phí vận chuyển, ngưỡng miễn phí ship
- Thời hạn thanh toán của đơn
- Banner trang chủ
- Template email

---

## 3. Hệ thống tự động

Những việc hệ thống tự làm, không ai thao tác trực tiếp:

- Tự hủy đơn chưa thanh toán sau 15 phút (flash sale: 5 phút) và trả hàng về kho
- Nhận kết quả thanh toán từ cổng thanh toán và cập nhật đơn
- Đối soát các giao dịch thanh toán bị treo
- Tự hoàn tiền nếu tiền về sau khi đơn đã bị hủy
- Tự chuyển đơn sang "hoàn tất" sau 7 ngày kể từ khi giao
- Gửi email thông báo
- Cảnh báo cho admin khi sản phẩm sắp hết hàng
- Cập nhật kết quả tìm kiếm khi sản phẩm, giá hoặc tồn kho thay đổi

---

## 4. Trạng thái đơn hàng

| Trạng thái | Khách thấy | Ý nghĩa |
| --- | --- | --- |
| PENDING_PAYMENT | Chờ thanh toán | Đơn online chưa thanh toán, có hạn thanh toán |
| CONFIRMED | Đã xác nhận | Đã thanh toán, hoặc là đơn COD; chờ shop đóng gói |
| PROCESSING | Đang chuẩn bị hàng | Shop đang đóng gói; khách không hủy được nữa |
| SHIPPING | Đang giao | Đã giao cho đơn vị vận chuyển |
| DELIVERED | Đã giao | Khách đã nhận hàng; còn trong hạn trả hàng |
| COMPLETED | Hoàn tất | Hết hạn trả hàng; khách được đánh giá |
| CANCELLED | Đã hủy | Bị hủy do khách, shop hoặc quá hạn thanh toán |
| RETURNING / RETURNED | Đang hoàn / Đã hoàn | Trả hàng hoặc giao thất bại *(mở rộng)* |

Thứ tự thông thường:

```
Chờ thanh toán → Đã xác nhận → Đang chuẩn bị → Đang giao → Đã giao → Hoàn tất
```

Đơn có thể bị hủy ở bước "Chờ thanh toán" hoặc "Đã xác nhận".
