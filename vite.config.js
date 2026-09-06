import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/*
  base هو السبب رقم ١ لظهور صفحة بيضاء على GitHub Pages.
  الموقع يُنشر على https://<user>.github.io/<repo>/ فلازم كل الملفات تشير إلى /<repo>/.
  هنا نستخرج اسم المستودع تلقائيًا من متغيّر البيئة اللي يوفّره GitHub Actions،
  ونرجع إلى "/" في حالتين: مستودع <user>.github.io، أو نطاق مخصص.
*/
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserSite = repo.endsWith(".github.io");
const base = !repo || isUserSite || process.env.CUSTOM_DOMAIN ? "/" : `/${repo}/`;

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: "dist",
  },
});
