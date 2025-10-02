import React, { useEffect, useRef } from 'react';
import { BsGithub } from 'react-icons/bs';
import { observer } from 'mobx-react-lite';

import styles from './SelectFile.module.scss';
import { mainStore } from '../stores/main';
import { PrepareProgress } from '../components/PrepareProgress';

export const SelectFile: React.FC = observer(() => {
  const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;
  const adsenseSlot = import.meta.env.VITE_ADSENSE_SLOT;
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (adsenseClient && adsenseSlot && adRef.current) {
      try {
        // Wait for the ad container to be visible
        const checkAndPush = () => {
          if (adRef.current && adRef.current.offsetWidth > 0) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
        };
        
        // Small delay to ensure the container is rendered
        const timer = setTimeout(checkAndPush, 100);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [adsenseClient, adsenseSlot]);

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
      {/* Google AdSense */}
      {adsenseClient && adsenseSlot && (
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adsenseClient}
          data-ad-slot={adsenseSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      )}
      <section className={styles.info} id="features" aria-labelledby="features-heading">
        <h2 id="features-heading">ฟีเจอร์เด่นที่ช่วยให้การตัดต่อวิดีโอเป็นเรื่องง่าย</h2>
        <p>
          crop.dvgamerr.app ถูกออกแบบมาสำหรับผู้สร้างคอนเทนต์ที่ต้องการความเร็วและความปลอดภัย ทุกการประมวลผลทำงานภายในเบราว์เซอร์ของคุณ
          โดยใช้พลังของ ffmpeg.wasm จึงไม่ต้องรออัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์ และไม่มีค่าบริการแอบแฝง
        </p>
        <ul className={styles.infoList}>
          <li>
            <strong>รองรับไฟล์หลากหลาย</strong>
            <span>ใช้งานได้กับไฟล์ยอดนิยมอย่าง MP4, MOV, MKV, AVI, WMV, FLV, WebM และอื่นๆ อีกมากมาย</span>
          </li>
          <li>
            <strong>ควบคุมได้ละเอียด</strong>
            <span>กำหนดสัดส่วนการครอป ปรับมุมมอง หรือปิดเสียงก่อนเรนเดอร์วิดีโอในขั้นตอนเดียว</span>
          </li>
          <li>
            <strong>ออฟไลน์บางส่วน</strong>
            <span>หลังจากโหลดเครื่องมือแล้ว คุณสามารถตัดต่อได้ต่อเนื่องแม้สัญญาณอินเทอร์เน็ตไม่เสถียร</span>
          </li>
          <li>
            <strong>ใช้งานฟรี 100%</strong>
            <span>ไม่มีลายน้ำ ไม่มีข้อจำกัดการส่งออก และไม่ต้องสมัครสมาชิก</span>
          </li>
        </ul>
      </section>
      <section className={styles.faq} id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">คำถามที่พบบ่อยเกี่ยวกับการตัดต่อวิดีโอออนไลน์</h2>
        <details>
          <summary>สามารถตัดต่อวิดีโอออนไลน์ได้ฟรีจริงหรือไม่?</summary>
          <p>
            ใช่ คุณสามารถตัดต่อและครอปวิดีโอออนไลน์ได้ฟรี 100% บน crop.dvgamerr.app โดยไฟล์จะประมวลผลในเครื่องของคุณทั้งหมด
            จึงไม่มีการอัปโหลดหรือเก็บไฟล์ไว้ที่เซิร์ฟเวอร์ภายนอก
          </p>
        </details>
        <details>
          <summary>เว็บไซต์รองรับไฟล์วิดีโอประเภทใดบ้าง?</summary>
          <p>
            เว็บไซต์รองรับไฟล์วิดีโอยอดนิยมแทบทุกชนิด รวมถึง MP4, MOV, MKV, AVI, WMV, FLV, WebM, 3GP และไฟล์กล้องแอ็กชันอย่าง MTS/M2TS
            คุณสามารถลากไฟล์จากอุปกรณ์ของคุณขึ้นมาใช้งานได้ทันที
          </p>
        </details>
        <details>
          <summary>ข้อมูลวิดีโอปลอดภัยหรือไม่?</summary>
          <p>
            ปลอดภัยแน่นอน เพราะ ffmpeg.wasm จะประมวลผลวิดีโอบนเบราว์เซอร์ของคุณโดยตรง ไม่ต้องส่งไฟล์ขึ้นเซิร์ฟเวอร์ใดๆ
            เมื่อรีเฟรชหน้าเว็บ ข้อมูลก็จะถูกล้างทันที
          </p>
        </details>
      </section>
    </div>
  );
});
