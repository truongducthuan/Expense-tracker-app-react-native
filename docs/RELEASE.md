# Phát hành lên App Store và Google Play

Ghi lại đúng trạng thái hiện tại: phần nào trong code đã xong, phần nào chỉ bạn
làm được (vì cần tài khoản Apple/Google của bạn), và những chỗ có nguy cơ bị
reviewer trả về.

## 1. Vì sao phải nâng Expo SDK

Hai cái chặn cứng, không liên quan gì tới metadata:

| | Yêu cầu hiện hành | SDK 49 cho ra | SDK 57 cho ra |
|---|---|---|---|
| Google Play | target API 36, từ 31/08/2026 | API 33 → từ chối khi upload | API 36 ✓ |
| App Store | Xcode 26 + iOS 26 SDK, từ 28/04/2026 | RN 0.72 không build nổi | Xcode 26.4+ ✓ |

Nguồn: [Play target API](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en) ·
[Apple SDK minimums](https://developer.apple.com/news/upcoming-requirements/)

Đó là lý do nhánh này nhảy thẳng SDK 49 → 57 (RN 0.72.6 → 0.86.3, React 18 →
19). Chi tiết những gì phải sửa nằm trong commit `9e248e2`.

## 2. Đã xong trong code

- **SDK 57**, expo-doctor 21/21, bundle được cả Android lẫn iOS.
- **Icon**: App Store từ chối icon có kênh alpha — icon cũ 512×512 và có góc
  trong suốt. Giờ có `icon-ios.png` 1024×1024 phẳng, `adaptive-foreground.png`
  đã thu vào vùng an toàn của Android, và icon thông báo là bóng con heo chứ
  không phải cái đĩa trắng.
- **Splash**: trước đây chỉ được ẩn khi tìm thấy phiên đăng nhập cũ. Người dùng
  mới sẽ đứng ở màn splash trong khi app đã chạy phía dưới — trong Expo Go
  không ai thấy, trong bản store là lỗi không mở được app.
- **Xoá tài khoản ngay trong app** (Cài đặt → Tài khoản). Apple 5.1.1(v) và
  chính sách xoá dữ liệu của Google đều bắt buộc.
- **app.json**: privacy manifest, `ITSAppUsesNonExemptEncryption: false` (khỏi
  bị hỏi export compliance mỗi lần upload), quyền `POST_NOTIFICATIONS`,
  version 1.1.0 / versionCode 2 / buildNumber 2.
- **eas.json**: profile `production` ra `.aab` cho Play; `submit` trỏ vào track
  `internal` ở trạng thái `draft`, nên không có gì tự lên live.
- **PRIVACY.md**: chính sách quyền riêng tư song ngữ, cần được host (xem dưới).

## 3. Việc chỉ bạn làm được

### 3.1 Tài khoản nhà phát triển

- Apple Developer Program — 99 USD/năm. Bắt buộc, không có đường vòng.
- Google Play Console — 25 USD một lần.

### 3.2 Sửa quyền sở hữu project trên EAS

Lần trước lệnh EAS trả về:

```
Entity Not Authorized: AppEntity[7db209aa-666c-4107-90c3-7e2ad38fbebd]
```

`app.json` đang trỏ `owner: "thuantd"` và một `projectId` mà tài khoản bạn đăng
nhập không có quyền đọc. Chọn một trong hai:

```bash
# a) dùng chính tài khoản sở hữu project cũ
npx eas login

# b) hoặc tạo project mới dưới tài khoản đang dùng
npx eas init --force    # ghi lại projectId/owner mới vào app.json
```

### 3.3 Host chính sách quyền riêng tư

Cả hai store đều đòi một URL công khai. Nhanh nhất là GitHub Pages của chính
repo này, hoặc một Gist public. Dán URL đó vào:

- App Store Connect → App Information → Privacy Policy URL
- Play Console → Store settings → Privacy policy

### 3.4 Build và nộp

```bash
# Android
npx eas build --platform android --profile production
npx eas submit --platform android --profile production

# iOS
npx eas build --platform ios --profile production
npx eas submit --platform ios --profile production
```

Build chạy trên máy chủ EAS với đúng Xcode/NDK được yêu cầu, nên **không cần**
Xcode dưới máy và không dính lại lỗi CocoaPods/boost như lần chạy local.

Lần đầu EAS sẽ hỏi tạo credentials (keystore cho Android, certificate +
provisioning profile cho iOS) — cứ để EAS tự quản lý, nó giữ giúp.

### 3.5 Khai báo dữ liệu

Hai bản khai này phải khớp với PRIVACY.md. Theo đúng những gì code đang làm:

**Play Console → Data safety**

| Mục | Trả lời |
|---|---|
| Có thu thập dữ liệu không | Có |
| Mã hoá khi truyền | Có (toàn bộ HTTPS) |
| Người dùng xoá được dữ liệu không | Có — ngay trong app |
| Loại: Personal info → Email address | Thu thập, không chia sẻ, bắt buộc, để đăng nhập |
| Loại: Personal info → Name, Photo | Chỉ khi đăng nhập Google, không chia sẻ, tuỳ chọn |
| Loại: Financial info → *Other financial info* | Thu thập, không chia sẻ, bắt buộc, phục vụ chức năng chính |
| Location, Contacts, Photos, Device ID… | Không |

**App Store Connect → App Privacy**

- Contact Info → Email Address: *Linked to the user*, mục đích **App
  Functionality** (không phải Analytics, không phải Tracking).
- Financial Info → Other Financial Info: *Linked to the user*, **App
  Functionality**.
- User Content → Other User Content (ghi chú giao dịch): *Linked to the user*,
  **App Functionality**.
- Tracking: **No**. App không có SDK quảng cáo hay analytics nào.

### 3.6 Nội dung gian hàng

Cần chuẩn bị: mô tả ngắn và dài (nên có cả tiếng Việt lẫn tiếng Anh vì app
song ngữ), ảnh chụp màn hình (iPhone 6.7" và 6.5"; Android điện thoại + tablet
nếu bật `supportsTablet`), icon 512×512 cho Play, feature graphic 1024×500 cho
Play, phân loại độ tuổi, và email hỗ trợ.

## 4. Những chỗ reviewer có thể vặn

**Guideline 4.8 — Sign in with Apple.** App có đăng nhập Google. Apple yêu cầu
app dùng social login phải có thêm một lựa chọn đăng nhập khác chỉ lấy tên và
email, cho phép giấu email thật, và không theo dõi để quảng cáo. Đăng nhập bằng
email + mật khẩu sẵn có trong app thoả cả ba điều kiện đó, nên nhiều app qua
được review với đúng cấu hình này. Nhưng đây vẫn là lý do bị trả về thường gặp
nhất với app có nút Google. Hai cách xử lý nếu bị trả:

1. Thêm Sign in with Apple (`expo-apple-authentication` + bật capability trong
   tài khoản Apple của bạn) — làm được, chỉ cần tài khoản Apple đã có.
2. Hoặc ẩn nút Google trên iOS. Khi đó 4.8 không còn áp dụng.

**Tên app.** `app.json` ghi "Manage Expense" nhưng toàn bộ giao diện, màn hình
đăng nhập và thông báo đều ghi **MoneyMind**. Reviewer có để ý chuyện tên trên
store không khớp với tên trong app. Tôi không tự đổi vì tên gian hàng là quyết
định của bạn — chọn một tên rồi thống nhất cả hai chỗ.

**Tài khoản demo.** Apple cần một tài khoản đăng nhập sẵn để review. Tạo một
tài khoản email/mật khẩu với vài giao dịch mẫu rồi điền vào App Review
Information, nếu không gần như chắc chắn bị trả về ở bước đăng nhập.

## 5. Việc cần làm trước khi thực sự công khai

**Firebase Realtime Database đang mở hoàn toàn.** Không cần đăng nhập vẫn đọc
và ghi được, tôi đã kiểm chứng bằng `curl`:

```
GET /users.json?shallow=true   → 200 {"hi_tim_gi_the@gmail_com":true}
GET /expenses.json?shallow=true → 200 {...toàn bộ id giao dịch...}
```

Nghĩa là bất kỳ ai biết URL database đều đọc được toàn bộ giao dịch của mọi
người dùng, và ghi đè được. Với một app tài chính thì đây là vấn đề nghiêm
trọng hơn mọi mục ở trên — nó không chặn việc upload, nhưng không nên để
nguyên khi app đã công khai trên store.

Sửa triệt để cần ba bước, và sẽ buộc mọi người đăng nhập lại:

1. Lưu `refreshToken` lúc đăng nhập và tự làm mới `idToken` (hiện token hết hạn
   sau 1 giờ mà không có gì gia hạn).
2. Gắn `?auth=<idToken>` vào mọi lời gọi REST tới database.
3. Đổi rules sang `auth != null`, và sau đó chuyển `/expenses` về dạng lồng
   theo người dùng để một người không đọc được dữ liệu của người khác.

Riêng đăng nhập Google hiện không tạo người dùng Firebase (chỉ lấy access token
của Google để đọc hồ sơ), nên bước 2 còn cần đổi sang `accounts:signInWithIdp`
để có token Firebase thật.
