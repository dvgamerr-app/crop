import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { BsDownload, BsClipboard, BsClipboardCheck } from 'react-icons/bs';
import { runInAction } from 'mobx';

import styles from './Render.module.scss';
import { mainStore } from '../stores/main';
import { Slider } from '../components/Slider';

export const Render: React.FC = observer(() => {
  const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;
  const adsenseSlot = import.meta.env.VITE_ADSENSE_SLOT;
  const adRef = useRef<HTMLModElement>(null);

  const [logVisible, setLogVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const { ffmpeg, video, file, outputUrl } = mainStore;

  useEffect(() => {
    if (adsenseClient && adsenseSlot && adRef.current && outputUrl) {
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
  }, [adsenseClient, adsenseSlot, outputUrl]);

  // Check if file size exceeds 2GB
  const fileSizeGB = file ? file.size / (1024 * 1024 * 1024) : 0;
  const isLargeFile = fileSizeGB > 1.95;

  if (!ffmpeg.loaded) {
    return (
      <div className={styles.loading}>
        <span>กำลังโหลด FFmpeg... กรุณารอสักครู่!</span>
        <progress value={ffmpeg.loadProgress} max={1} />
      </div>
    );
  }

  if (!video) {
    return (
      <div>
        <span>ไม่ได้เลือกวิดีโอ</span>
      </div>
    );
  }

  const { area, scale = 1 } = mainStore.transform;
  const x = Math.trunc((scale * (area ? area[0] : 0)) / 2) * 2;
  const y = Math.trunc((scale * (area ? area[1] : 0)) / 2) * 2;
  const width =
    Math.trunc((scale * (area ? area[2] : video.videoWidth)) / 2) * 2;
  const height =
    Math.trunc((scale * (area ? area[3] : video.videoHeight)) / 2) * 2;

  const generateFfmpegCommand = () => {
    const filters: string[] = [];
    const args: string[] = [];

    const { flipH, flipV, area, time, mute } = mainStore.transform;

    if (flipH) {
      filters.push('hflip');
    }

    if (flipV) {
      filters.push('vflip');
    }

    if (scale !== 1) {
      filters.push(
        `scale=${Math.trunc((video.videoWidth * scale) / 2) * 2}:${
          Math.trunc((video.videoHeight * scale) / 2) * 2
        }`,
      );
    }

    if (
      area &&
      (area[0] !== 0 || area[1] !== 0 || area[2] !== 1 || area[3] !== 1)
    ) {
      filters.push(`crop=${width}:${height}:${x}:${y}`);
    }

    if (filters.length > 0) {
      args.push('-vf', `"${filters.join(', ')}"`);
    }

    if (time) {
      let start = 0;
      if (time[0] > 0) {
        start = time[0];
        args.push('-ss', `${start}`);
      }

      if (time[1] < video.duration) {
        args.push('-t', `${time[1] - start}`);
      }
    }

    const { reEncode = true } = mainStore.transform;
    
    if (reEncode) {
      args.push('-c:v', 'libx264');
      args.push('-preset', 'veryfast');
    } else {
      args.push('-c:v', 'copy');
    }

    if (mute) {
      args.push('-an');
    } else {
      args.push('-c:a', 'copy');
    }

    const inputFile = file?.name || 'input.mp4';
    return `ffmpeg -i "${inputFile}" ${args.join(' ')} output.mp4`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateFfmpegCommand());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const crop = async () => {
    runInAction(() => {
      mainStore.outputUrl = undefined;
    });

    const args: string[] = [];
    const filters: string[] = [];

    const { flipH, flipV, area, time, mute } = mainStore.transform;

    if (flipH) {
      filters.push('hflip');
    }

    if (flipV) {
      filters.push('vflip');
    }

    if (scale !== 1) {
      filters.push(
        `scale=${Math.trunc((video.videoWidth * scale) / 2) * 2}:${
          Math.trunc((video.videoHeight * scale) / 2) * 2
        }`,
      );
    }

    if (
      area &&
      (area[0] !== 0 || area[1] !== 0 || area[2] !== 1 || area[3] !== 1)
    ) {
      filters.push(`crop=${width}:${height}:${x}:${y}`);
    }

    // Add filters
    if (filters.length > 0) {
      args.push('-vf', filters.join(', '));
    }

    if (time) {
      let start = 0;
      if (time[0] > 0) {
        start = time[0];
        args.push('-ss', `${start}`);
      }

      if (time[1] < video.duration) {
        args.push('-t', `${time[1] - start}`);
      }
    }

    const { reEncode = true } = mainStore.transform;
    
    if (reEncode) {
      args.push('-c:v', 'libx264');
      args.push('-preset', 'veryfast');
    } else {
      args.push('-c:v', 'copy');
    }

    if (mute) {
      args.push('-an');
    } else {
      args.push('-c:a', 'copy');
    }

    const newFile = await ffmpeg.exec(mainStore.file!, args);
    runInAction(() => {
      mainStore.outputUrl = URL.createObjectURL(newFile);
    });
  };

  // Show ffmpeg command for large files
  if (isLargeFile) {
    return (
      <div className={styles.step}>
        <div className={styles.settings}>
          <div>
            ความละเอียด: {width}px x {height}px
          </div>
          <div>
            ขนาด: {Math.round(scale * 100) / 100}
            <Slider
              min={0.1}
              max={1}
              value={scale}
              onChange={value => {
                runInAction(() => {
                  mainStore.transform.scale = value;
                });
              }}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={mainStore.transform.reEncode ?? true}
                onChange={e => {
                  runInAction(() => {
                    mainStore.transform.reEncode = e.target.checked;
                  });
                }}
              />
              <span> เข้ารหัสวิดีโอใหม่ (libx264) - ยกเลิกเพื่อคัดลอก codec (เร็วกว่า ไฟล์ใหญ่กว่า)</span>
            </label>
          </div>
        </div>
        <div className={styles.largeFileWarning}>
          <h3>⚠️ ไฟล์ใหญ่เกินไป</h3>
          <p>
            ไฟล์ของคุณมีขนาด <strong>{fileSizeGB.toFixed(2)} GB</strong> เกินกว่าขีดจำกัด 2 GB
          </p>
          <p>
            Chrome ไม่สามารถประมวลผลไฟล์ขนาดใหญ่ในหน่วยความจำได้ เนื่องจากข้อจำกัดของ WebAssembly
          </p>
          
          <div className={styles.commandSection}>
            <h4>วิธีแก้ไข: ใช้ FFmpeg ผ่าน Terminal</h4>
            <p>คัดลอกและรันคำสั่งนี้ใน terminal ของคุณ:</p>
            
            <div className={styles.commandBox}>
              <pre>{generateFfmpegCommand()}</pre>
              <button 
                onClick={copyToClipboard}
                className={styles.copyButton}
                title="Copy to clipboard"
              >
                {copied ? <BsClipboardCheck /> : <BsClipboard />}
              </button>
            </div>
          </div>

          <div className={styles.instructions}>
            <h4>วิธีการ:</h4>
            <ol>
              <li>ติดตั้ง FFmpeg หากจำเป็น: <a href="https://ffmpeg.org/download.html" target="_blank" rel="noopener noreferrer">ffmpeg.org/download.html</a></li>
              <li>เปิด Terminal (Mac/Linux) หรือ Command Prompt (Windows)</li>
              <li>ไปที่โฟลเดอร์ของไฟล์วิดีโอ</li>
              <li>วางคำสั่งและกด Enter</li>
              <li>รอจนการประมวลผลเสร็จสิ้น ไฟล์ output.mp4 จะถูกสร้างขึ้น</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.step}>
      {ffmpeg.running ? (
        <>
          <div className={styles.actions}>
            <button onClick={() => ffmpeg.cancel()}>
              <span>ยกเลิก</span>
            </button>
          </div>
          <div className={styles.info}>
            <span>กำลังประมวลผล</span>
            <progress value={ffmpeg.execProgress} max={1} />
            <pre>{ffmpeg.output}</pre>
          </div>
        </>
      ) : (
        <>
          {!outputUrl && (<div className={styles.settings}>
            <div>
              ความละเอียด: {width}px x {height}px
            </div>
            <div>
              ขนาด: {Math.round(scale * 100) / 100}
              <Slider
                min={0.1}
                max={1}
                value={scale}
                onChange={value => {
                  runInAction(() => {
                    mainStore.transform.scale = value;
                  });
                }}
              />
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={mainStore.transform.reEncode ?? true}
                  onChange={e => {
                    runInAction(() => {
                      mainStore.transform.reEncode = e.target.checked;
                    });
                  }}
                />
                <span> เข้ารหัสวิดีโอใหม่ (libx264) - ยกเลิกเพื่อคัดลอก codec (เร็วกว่า ไฟล์ใหญ่กว่า)</span>
              </label>
            </div>
          </div>
          )}
          <div className={styles.actions}>
            <button onClick={crop}>
              <span>ส่งออก MP4</span>
            </button>
            {outputUrl && (
              <a
                href={outputUrl}
                download="cropped.mp4"
                className={clsx('button', styles.download)}
              >
                <BsDownload />
                <span>ดาวน์โหลด</span>
              </a>
            )}
          </div>
        </>
      )}
      {outputUrl && !ffmpeg.running && (
        <div>
          <video src={outputUrl} controls />
        </div>
      )}

      {/* Google AdSense */}
      {adsenseClient && adsenseSlot && outputUrl && (
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adsenseClient}
          data-ad-slot={adsenseSlot}
          data-ad-format="autorelaxed"></ins>
      )}

      {!!ffmpeg.log && (
        <div className={styles.info}>
          <button onClick={() => setLogVisible(value => !value)}>
            {logVisible ? 'ซ่อน log' : 'แสดง log'}
          </button>
          {logVisible && <pre>{ffmpeg.log}</pre>}
        </div>
      )}
    </div>
  );
});
