# Manage Expense — Ứng dụng Quản lý Chi tiêu

Ứng dụng quản lý chi tiêu cá nhân xây dựng bằng React Native (Expo). Giúp người dùng theo dõi thu chi hàng ngày, phân loại danh mục, quản lý tài khoản thanh toán và xem thống kê biểu đồ theo thời gian.

## Tính năng

- Đăng nhập bằng Email/Password hoặc Google Account
- Thêm, sửa, xoá giao dịch chi tiêu
- Phân loại theo danh mục chi tiêu và danh mục thu nhập
- Quản lý nhiều tài khoản thanh toán (ví, ngân hàng, thẻ...)
- Biểu đồ thống kê chi tiêu theo tháng và theo năm
- Đồng bộ dữ liệu lên Firebase Realtime Database
- Lưu danh mục và tài khoản cục bộ bằng SQLite

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | React Native + Expo SDK 49 |
| Navigation | React Navigation v6 (Stack, Drawer, BottomTabs) |
| Authentication | Firebase Auth REST API + Google Sign-In |
| Database (cloud) | Firebase Realtime Database |
| Database (local) | expo-sqlite |
| Charts | victory-native |
| State Management | React Context API + useReducer |

---

## Yêu cầu môi trường

Cài đặt các công cụ sau trước khi bắt đầu:

| Công cụ | Phiên bản tối thiểu | Link |
|---|---|---|
| Node.js | 18.x trở lên | https://nodejs.org |
| npm | đi kèm Node.js | — |
| Expo CLI | latest | `npm install -g expo-cli` |
| EAS CLI (để build) | latest | `npm install -g eas-cli` |
| Git | bất kỳ | https://git-scm.com |

---

## Cài đặt dự án

```bash
# 1. Clone repository
git clone <repository-url>
cd Expense-tracker-app-react-native

# 2. Cài dependencies
npm install
```

---

## Chạy ứng dụng

### Cách 1 — Expo Go trên điện thoại thật (nhanh nhất, không cần build)

Đây là cách đơn giản nhất để xem app trên điện thoại thật mà không cần cài Xcode hay Android Studio.

**Bước 1**: Cài ứng dụng **Expo Go** trên điện thoại:
- Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

**Bước 2**: Khởi động Metro bundler:

```bash
npm start
```

**Bước 3**: Kết nối điện thoại và máy tính vào **cùng một mạng Wi-Fi**, sau đó:
- **Android**: Mở app Expo Go → quét QR code hiển thị trong terminal
- **iOS**: Mở Camera → quét QR code → chọn "Open in Expo Go"

> **Lưu ý**: App này dùng `@react-native-firebase` và `@react-native-google-signin` là các native module không được hỗ trợ trong Expo Go thông thường. Cần dùng **Development Build** (xem Cách 3 bên dưới) để chạy đầy đủ tính năng Google Login và Firebase.

---

### Cách 2 — Máy ảo (Emulator / Simulator)

#### Android Emulator

**Yêu cầu**: Cài [Android Studio](https://developer.android.com/studio) và tạo ít nhất một AVD (Android Virtual Device).

```bash
# Khởi động Android Emulator từ Android Studio trước, sau đó:
npm run android
# hoặc
npx expo start --android
```

#### iOS Simulator (chỉ trên macOS)

**Yêu cầu**: Cài [Xcode](https://developer.apple.com/xcode/) từ Mac App Store (bao gồm iOS Simulator).

```bash
npm run ios
# hoặc
npx expo start --ios
```

> Nếu bị lỗi khi chạy lần đầu, thử chạy thêm:
> ```bash
> npx expo run:android   # build native cho Android
> npx expo run:ios       # build native cho iOS
> ```

---

### Cách 3 — Development Build (chạy đầy đủ native modules)

Do app dùng native modules (Firebase, Google Sign-In), cần build một bản **Development Client** riêng thay vì dùng Expo Go.

**Bước 1**: Đăng nhập EAS:

```bash
eas login
```

**Bước 2**: Build Development Client:

```bash
# Android (.apk cài trực tiếp)
eas build --profile development --platform android

# iOS (cần Apple Developer Account)
eas build --profile development --platform ios
```

**Bước 3**: Sau khi build xong, tải và cài file `.apk` (Android) hoặc `.ipa` (iOS) lên thiết bị.

**Bước 4**: Khởi động dev server:

```bash
npm start
```

Mở app Development Client trên thiết bị → quét QR code hoặc nhập địa chỉ server.

---

## Build ứng dụng để cài lên máy

Dự án dùng **EAS Build** (Expo Application Services) để tạo file cài đặt. Cấu hình nằm trong file `eas.json`.

### Đăng nhập EAS lần đầu

```bash
eas login
# Đăng ký tại https://expo.dev nếu chưa có tài khoản
```

### Build Android

#### APK (cài trực tiếp, dùng để test nội bộ)

```bash
eas build --profile preview --platform android
```

- Sau khi build xong, EAS cung cấp link tải file `.apk`
- Gửi file này cho bất kỳ ai để cài thẳng lên Android (cần bật "Cài từ nguồn không xác định")

#### AAB (dùng để đăng lên Google Play Store)

```bash
eas build --profile production --platform android
```

- Tạo ra file `.aab` dùng để submit lên Google Play Console

### Build iOS

> **Yêu cầu bắt buộc**: Cần có [Apple Developer Account](https://developer.apple.com/programs/) ($99/năm).

#### IPA để test nội bộ (TestFlight / Ad Hoc)

```bash
eas build --profile preview --platform ios
```

#### IPA để đăng lên App Store

```bash
eas build --profile production --platform ios
```

EAS sẽ tự động xử lý certificates và provisioning profiles.

### Theo dõi tiến trình build

Sau khi chạy lệnh, EAS trả về link dashboard để theo dõi:

```
https://expo.dev/accounts/<username>/projects/expense-stracker-app/builds
```

Hoặc xem danh sách build:

```bash
eas build:list
```

---

## Submit lên Store (tuỳ chọn)

```bash
# Submit lên Google Play Store
eas submit --platform android

# Submit lên Apple App Store
eas submit --platform ios
```

---

## Cấu trúc dự án

```
├── App.js                  # Root: navigation, splash screen, auth check
├── app.json                # Expo config (bundle ID, icons, plugins)
├── eas.json                # EAS Build profiles
├── api/
│   ├── auth.js             # Google Sign-In, Firebase Auth REST
│   └── http.js             # Firebase Realtime Database calls
├── screens/                # Màn hình chính
│   ├── Authentication.js   # Đăng nhập / Đăng ký
│   ├── AllExpense.js       # Danh sách chi tiêu
│   ├── ManageExpense.js    # Thêm / Sửa chi tiêu
│   ├── ExpenseChart.js     # Biểu đồ thống kê
│   ├── ManageItem.js       # Quản lý danh mục & tài khoản
│   ├── AnualYear.js        # Thống kê theo năm
│   └── User.js             # Hồ sơ người dùng
├── store/                  # State management (Context API)
│   ├── authContext.js      # Auth state
│   ├── context.js          # Expense state
│   ├── categoryContext.js  # Danh mục chi tiêu
│   ├── accountContext.js   # Tài khoản thanh toán
│   └── incomeCategory.js   # Danh mục thu nhập
├── components/             # UI components tái sử dụng
├── util/
│   ├── database.js         # SQLite operations
│   ├── date.js             # Tiện ích xử lý ngày
│   └── format.js           # Tiện ích định dạng số
└── constants/
    └── styles.js           # GlobalStyles (màu sắc, spacing)
```

---

## Các lệnh thường dùng

```bash
npm start               # Khởi động Metro bundler
npm run android         # Chạy trên Android Emulator
npm run ios             # Chạy trên iOS Simulator
npm run web             # Chạy trên trình duyệt web

eas build --profile preview --platform android    # Build APK
eas build --profile production --platform android # Build AAB
eas build --profile production --platform ios     # Build IPA
eas build:list                                    # Xem lịch sử build
```

---

## Lưu ý

- File `google-services.json` cần có trong thư mục gốc để Firebase hoạt động trên Android
- Google Sign-In chỉ hoạt động trên **Development Build** hoặc **Production Build**, không chạy trong Expo Go thông thường
- Khi test Google Sign-In, `webClientId` trong `App.js` phải khớp với OAuth Client ID trong Google Cloud Console
