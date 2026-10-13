// Does every API this app calls still exist in the package it comes from?
//
// Metro happily bundles `SQLite.openDatabase(...)` after that function has been
// removed: an unknown property is `undefined`, and `undefined is not a
// function` only shows up when the module is first evaluated on a device. That
// is exactly how the SDK upgrade shipped a dead call into a bundle that built
// clean, so the names are now checked against each package's own typings.
const fs = require("fs"), path = require("path");
const { createRequire } = require("module");
const root = path.resolve(__dirname, "..");
const req = createRequire(root + "/package.json");
const babel = req("@babel/core");
const parser = req("@babel/parser");
const traverse = req("@babel/traverse").default;

let problems = 0;

// Packages whose surface is worth checking: the native ones, where an API can
// disappear between SDKs without anything in JS noticing.
const WATCHED = [
  "expo-sqlite", "expo-notifications", "expo-splash-screen", "expo-status-bar",
  "expo-web-browser", "expo-auth-session", "expo-font", "expo-constants",
  "@react-native-async-storage/async-storage", "@react-native-community/datetimepicker",
  "react-native-svg", "react-native-gesture-handler", "react-native-reanimated",
  "@react-navigation/native", "@react-navigation/native-stack",
  "@react-navigation/bottom-tabs", "@react-navigation/drawer",
];

// The package's own declarations, read as text. Crude next to a type checker,
// but it answers the only question asked here: is this name still shipped?
const typesOf = (pkg, seen = new Set()) => {
  if (seen.has(pkg)) return "";
  seen.add(pkg);

  let dir;
  try { dir = path.dirname(req.resolve(pkg + "/package.json")); }
  catch { return null; }
  const out = [];
  const walk = (d, depth = 0) => {
    if (depth > 6) return;
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        // "src" is NOT skipped: @react-navigation ships its typings under
        // lib/typescript/src, and skipping it meant every name from those
        // packages silently passed.
        if (["node_modules", "android", "ios", "__tests__"].includes(e.name)) continue;
        walk(full, depth + 1);
      } else if (e.name.endsWith(".d.ts")) {
        out.push(fs.readFileSync(full, "utf8"));
      }
    }
  };
  walk(dir);
  if (!out.length) return null;

  // `export * from "@react-navigation/core"` is how half of react-navigation's
  // surface arrives. Without following it, every hook looked deleted.
  const text = out.join("\n");
  const reexports = new Set(
    [...text.matchAll(/export\s+\*\s+from\s+["']([^."'][^"']*)["']/g)].map((m) => m[1])
  );
  const extra = [...reexports]
    .map((dep) => typesOf(dep, seen))
    .filter(Boolean);

  return [text, ...extra].join("\n");
};

const typeCache = new Map();
const declares = (pkg, name) => {
  if (!typeCache.has(pkg)) typeCache.set(pkg, typesOf(pkg));
  const src = typeCache.get(pkg);
  if (!src) return true; // no typings shipped: nothing to check against
  const n = name.replace(/[^\w$]/g, "");
  return new RegExp(
    `(export\\s+(declare\\s+)?(const|let|var|function|class|enum|type|interface|abstract\\s+class)\\s+${n}\\b` +
    `|export\\s*\\{[^}]*\\b${n}\\b[^}]*\\}` +
    `|declare\\s+(const|function|class|enum)\\s+${n}\\b` +
    `|^\\s*(readonly\\s+)?${n}\\s*[?:(<]` +
    `|\\b${n}\\s*\\([^)]*\\)\\s*:` +
    `|export\\s+default\\s+${n}\\b)`,
    "m"
  ).test(src);
};

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    if (f === "node_modules" || f.startsWith(".") || f === "docs") continue;
    const p = path.join(d, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (f.endsWith(".js")) files.push(p);
  }
})(root);

for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  let ast;
  try {
    ast = parser.parse(code, { sourceType: "module", plugins: ["jsx"] });
  } catch { continue; }

  const namespaces = new Map(); // local name -> package
  const named = [];             // [package, imported, local]

  traverse(ast, {
    ImportDeclaration(p) {
      const pkg = p.node.source.value;
      if (!WATCHED.includes(pkg)) return;
      for (const s of p.node.specifiers) {
        if (s.type === "ImportNamespaceSpecifier") namespaces.set(s.local.name, pkg);
        else if (s.type === "ImportSpecifier") named.push([pkg, s.imported.name, s.local.name]);
      }
    },
  });

  for (const [pkg, imported] of named) {
    if (!declares(pkg, imported)) {
      problems++;
      console.log(`  MISSING  ${imported} from "${pkg}"`);
      console.log(`           ${path.relative(root, file)}`);
    }
  }

  if (namespaces.size) {
    traverse(ast, {
      MemberExpression(p) {
        const { object, property, computed } = p.node;
        if (computed || object.type !== "Identifier") return;
        const pkg = namespaces.get(object.name);
        if (!pkg) return;
        const name = property.name;
        if (!name || !declares(pkg, name)) {
          problems++;
          console.log(`  MISSING  ${object.name}.${name} — "${pkg}" does not declare it`);
          console.log(`           ${path.relative(root, file)}:${p.node.loc.start.line}`);
        }
      },
    });
  }
}

console.log(
  problems
    ? `\n${problems} calls into packages that no longer declare them`
    : `\nchecked ${files.length} files — every watched API still exists`
);
process.exit(problems ? 1 : 0);
