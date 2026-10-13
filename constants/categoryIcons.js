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

// Names people type often start with an emoji — "🍞 Food", "🐶 Pet", "🛠 Tools"
// are all in this app's own data. That emoji is the icon they chose for
// themselves, so it is read out of the name rather than ignored.
//
// Letters stay out of it: Vietnamese sits in Latin Extended, below U+2000,
// while pictographs sit above it. Code points are compared rather than using
// a \p{...} regex, which not every JS engine this runs on supports.
const isSymbol = (char) => (char.codePointAt(0) || 0) > 0x2000;

export const getNameEmoji = (name) => {
  const chars = Array.from(String(name || "").trim());
  const emoji = [];
  for (const char of chars) {
    if (!isSymbol(char)) break;
    emoji.push(char);
  }
  return emoji.join("");
};

// The same name without its emoji, so "🍞 Food" still finds the Food icon.
const withoutEmoji = (name) =>
  Array.from(String(name || "").trim())
    .slice(Array.from(getNameEmoji(name)).length)
    .join("")
    .trim();

export const getCategoryIcon = (name) => {
  if (!name) return null;
  const exact = ICONS[String(name).trim().toLowerCase()];
  if (exact) return exact;
  const stripped = withoutEmoji(name).toLowerCase();
  return (stripped && ICONS[stripped]) || null;
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
//
// By code point, not charAt: an emoji is a surrogate pair, and taking half of
// one renders as a replacement glyph. That is why every emoji-named category
// in this app showed a "?" tile.
export const getInitial = (name) => {
  const first = Array.from(String(name || "").trim())[0];
  return first ? first.toUpperCase() : "?";
};
