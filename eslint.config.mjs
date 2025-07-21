import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript関連のルールを緩和
      "@typescript-eslint/no-explicit-any": "warn", // エラーから警告に変更
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      
      // 一般的なルールの調整
      "prefer-const": "warn",
      "no-console": "off", // console.log等を許可
      
      // React関連
      "react-hooks/exhaustive-deps": "warn",
    }
  }
];

export default eslintConfig;
