import React from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';

import './index.scss';
import { Steps } from './components/Steps';
import { SelectFile } from './steps/SelectFile';
import { mainStore } from './stores/main';
import { Crop } from './steps/Crop';
import { Render } from './steps/Render';

export const App: React.FC = observer(() => {
  const step = mainStore.step;

  return (
    <div className="app">
      <header className="app__header">
        <h1>ตัดต่อวิดีโอออนไลน์ฟรีบนเบราว์เซอร์</h1>
        <p>
          ครอป ตัดต่อ ปรับสัดส่วน และเรนเดอร์วิดีโอได้รวดเร็วด้วย ffmpeg.wasm โดยไม่ต้องติดตั้งโปรแกรมใดๆ
          ไฟล์ของคุณจะไม่ออกจากเครื่อง เพิ่มความปลอดภัยและความเป็นส่วนตัวเต็มที่
        </p>
        <nav className="app__nav" aria-label="ลิงก์ด่วน">
          <a href="#features">ฟีเจอร์เด่น</a>
          <a href="#faq">คำถามที่พบบ่อย</a>
        </nav>
      </header>

      <main>
        <Steps
          current={step}
          onChange={step => {
            runInAction(() => {
              mainStore.step = step;
            });
          }}
          steps={['เลือกไฟล์', 'ตัดต่อ', 'ส่งออก']}
        />

        {step === 0 && <SelectFile />}
        {step === 1 && <Crop />}
        {step === 2 && <Render />}
      </main>
    </div>
  );
});
