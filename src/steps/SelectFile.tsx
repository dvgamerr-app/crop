import React from 'react';
import { BsGithub } from 'react-icons/bs';
import { observer } from 'mobx-react-lite';

import styles from './SelectFile.module.scss';
import { mainStore } from '../stores/main';
import { PrepareProgress } from '../components/PrepareProgress';

export const SelectFile: React.FC = observer(() => {
  const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;
  const adsenseSlot = import.meta.env.VITE_ADSENSE_SLOT;

  return (
    <div className={styles.step}>
      {mainStore.fileLoading ? (
        <PrepareProgress />
      ) : (
        <>
          <label>
            <input
              type="file"
              accept="video/*,.mkv,.mov,.mp4,.m4v,.mk3d,.wmv,.asf,.mxf,.ts,.m2ts,.3gp,.3g2,.flv,.webm,.ogv,.rmvb,.avi"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  mainStore.loadVideo(file);
                }
                e.target.value = '';
              }}
            />
            <span>เลือกไฟล์วิดีโอ</span>
          </label>
          
          {/* Google AdSense */}
          {adsenseClient && adsenseSlot && (
            <ins className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={adsenseClient}
              data-ad-slot={adsenseSlot}
              data-ad-format="auto"
              data-full-width-responsive="true"></ins>
          )}
        </>
      )}
      <div className={styles.credits}>
        <ul>
          <li>✔️ ฟรีและเป็นโอเพนซอร์ส</li>
          <li>✔️ ตัด ครอป พลิก หรือปิดเสียงวิดีโอได้อย่างง่ายดาย</li>
          <li>✔️ ไม่มีลายน้ำ</li>
          <li>✔️ ไฟล์วิดีโอของคุณจะอยู่บนคอมพิวเตอร์ของคุณเท่านั้น</li>
        </ul>
        <div>
          💜 ขอบคุณ <a
            href="https://github.com/ffmpegwasm/ffmpeg.wasm"
            rel="noopener noreferrer"
            target="_blank"
          >
            ffmpeg.wasm
          </a> และ <a
            href="https://github.com/mat-sz/crop"
            rel="noopener noreferrer"
            target="_blank"
          >
            mat-sz
          </a>

        </div>
        <div>
          <a
            href="https://github.com/dvgamerr/crop"
            rel="noopener noreferrer"
            target="_blank"
          >
            <BsGithub />
          </a>
        </div>
      </div>
    </div>
  );
});
