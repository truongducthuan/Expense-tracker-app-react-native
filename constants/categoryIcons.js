// Maps a category/account name to an Ionicon so transaction rows get a glyph
// instead of a bare label (IxD 2D — visual; Nielsen #6 — recognise, don't recall).
//
// Keys are lower-cased names for both seeded languages. Categories the user
// creates themselves fall back to an initial-letter avatar, so an unmapped name
// is never a blank tile.
const ICONS = {
  // Expense — en
  food: "restaurant",
  health: "medkit",
  apparel: "shirt",
  transportation: "car",
  accommodation: "home",
  event: "calendar",
  tools: "construct",
  "self-development": "school",
  entertainment: "game-controller",
  book: "book",
  other: "ellipsis-horizontal",

  // Expense — vi
  "ăn uống": "restaurant",
  "sức khoẻ": "medkit",
  "sức khỏe": "medkit",
  "trang phục": "shirt",
  "di chuyển": "car",
  "nhà ở": "home",
  "sự kiện": "calendar",
  "thiết bị": "construct",
  "phát triển bản thân": "school",
  "giải trí": "game-controller",
  sách: "book",
  khác: "ellipsis-horizontal",

  // Income — en / vi
  salary: "cash",
  "lương": "cash",
  bonus: "gift",
  "thưởng": "gift",
  ot: "time",
  "tăng ca": "time",
  interest: "trending-up",
  "lãi suất": "trending-up",

  // Accounts — en / vi
  cash: "wallet",
  "tiền mặt": "wallet",
  accounts: "business",
  "tài khoản": "business",
  card: "card",
  "thẻ": "card",
};

export const getCategoryIcon = (name) => {
  if (!name) return null;
  return ICONS[String(name).trim().toLowerCase()] || null;
};

// Icons offered when creating or renaming a category / account. Grouped by
// theme so the grid is scannable; all are Ionicons filled variants so they
// read consistently at small sizes.
export const ICON_CHOICES = [
  // Everyday spending
  "restaurant", "fast-food", "cafe", "beer", "cart", "basket", "pricetag",
  // Home & bills
  "home", "bed", "bulb", "water", "flame", "wifi", "phone-portrait",
  // Getting around
  "car", "bus", "train", "airplane", "bicycle", "boat",
  // Health & care
  "medkit", "fitness", "heart", "bandage", "cut",
  // Learning & work
  "school", "book", "library", "briefcase", "laptop", "construct",
  // Leisure
  "game-controller", "musical-notes", "film", "football", "gift", "paw",
  // Money
  "cash", "card", "wallet", "business", "trending-up", "trending-down",
  "stats-chart", "pricetags", "time", "calendar",
  // Fallback
  "ellipsis-horizontal",
];

// First character, used when no icon matches.
export const getInitial = (name) =>
  name ? String(name).trim().charAt(0).toUpperCase() : "?";
