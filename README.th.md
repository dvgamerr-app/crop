# ตัดต่อวิดีโอ.com

ตัดต่อวิดีโอได้อย่างรวดเร็วผ่านเว็บเบราว์เซอร์ สร้างด้วย React และ [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)

https://crop.mov

- ✔️ UI ใช้งานง่าย
- ✔️ ไม่มีลายน้ำ
- ✔️ ไฟล์วิดีโอของคุณจะอยู่บนคอมพิวเตอร์ของคุณเท่านั้น

## การติดตั้ง

ติดตั้งโปรเจคด้วย `yarn` หรือ `bun` แล้วรัน `yarn build` หรือ `bun run build`

## การตั้งค่า Environment Variables

สร้างไฟล์ `.env` จากไฟล์ `.env.example`:

```bash
cp .env.example .env
```

แก้ไขค่าต่อไปนี้ในไฟล์ `.env`:

```env
# Google AdSense Configuration
VITE_ADSENSE_CLIENT=ca-pub-YOUR_PUBLISHER_ID
VITE_ADSENSE_SLOT=YOUR_AD_SLOT_ID
```

### วิธีหา AdSense Client และ Slot:

1. เข้า [Google AdSense](https://www.google.com/adsense/)
2. ไปที่ **Ads** > **Overview** > **By ad unit**
3. สร้าง ad unit ใหม่หรือเลือก ad unit ที่มีอยู่
4. คัดลอก:
   - **Client ID**: `ca-pub-XXXXXXXXXXXXXXXX` (จาก ad code)
   - **Slot ID**: `data-ad-slot="XXXXXXXXXX"` (จาก ad code)

## Multi-core ffmpeg.wasm

เพื่อเปิดใช้งาน multi-core ffmpeg.wasm จำเป็นต้องมี SharedArrayBuffer และตั้งค่า env variable `VITE_ENABLE_MT` เป็น `1`

ฟีเจอร์นี้ยังอยู่ระหว่างพัฒนาและอาจไม่ทำงานตามที่คาดหวัง

### Nginx:

```nginx
server {
  # ...
  add_header Cross-Origin-Embedder-Policy 'require-corp';
	add_header Cross-Origin-Opener-Policy 'same-origin';
  # ...
}
```

ดูเพิ่มเติม: https://developer.chrome.com/blog/enabling-shared-array-buffer/
