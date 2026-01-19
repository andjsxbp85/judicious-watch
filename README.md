# Frontend Installation Guide

Dokumentasi ini menjelaskan cara melakukan instalasi dan menjalankan **Frontend (Vite + React)**.

---

## 1. Clone Project

Jalankan perintah berikut di terminal:

```bash
git clone https://github.com/andjsxbp85/judicious-watch.git
```

---

## 2. Masuk ke Folder Project

Setelah proses clone selesai, masuk ke folder project:

```bash
cd judicious-watch
```

---

## 3. Install Dependency

Pastikan **Node.js** sudah terinstall, lalu jalankan:

```bash
npm install
```

---

## 4. Buat File `.env`

Buat file `.env` di root project (sejajar dengan `package.json`), lalu isi seperti berikut:

```env
VITE_API_URL=
VITE_APP_NAME=
VITE_APP_DOMAIN=
VITE_APP_COOKIE_NAME=auth_token
```

> Pastikan value `VITE_API_URL`, `VITE_APP_NAME`, dan `VITE_APP_DOMAIN` diisi sesuai kebutuhan environment kamu.

---

## 5. Konfigurasi `vite.config.ts`

Pastikan file `vite.config.ts` berisi konfigurasi berikut (proxy API dan alias path):

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 443,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

---

## 6. Build Frontend

Untuk build project (akan menghasilkan folder `dist`):

```bash
npm run build
```

---

## 7. Run Frontend (Preview Mode)

Menjalankan hasil build:

```bash
npm run preview
```

---

## Notes

- Pastikan backend sudah berjalan pada:

  ```
  http://127.0.0.1:3000
  ```

- Semua request dari frontend ke endpoint:

  ```
  /api
  ```

  akan otomatis diteruskan (proxy) ke backend.

---
