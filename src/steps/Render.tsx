import React, { useState } from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { BsDownload, BsClipboard, BsClipboardCheck } from 'react-icons/bs';
import { runInAction } from 'mobx';

import styles from './Render.module.scss';
import { mainStore } from '../stores/main';
import { Slider } from '../components/Slider';

export const Render: React.FC = observer(() => {
  const [outputUrl, setOutputUrl] = useState<string>();
  const [logVisible, setLogVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const { ffmpeg, video, file } = mainStore;

  // Check if file size exceeds 1.8GB
  const fileSizeGB = file ? file.size / (1024 * 1024 * 1024) : 0;
  const isLargeFile = fileSizeGB > 1.8;

  if (!ffmpeg.loaded) {
    return (
      <div className={styles.loading}>
        <span>FFmpeg is loading... please wait!</span>
        <progress value={ffmpeg.loadProgress} max={1} />
      </div>
    );
  }

  if (!video) {
    return (
      <div>
        <span>No video selected.</span>
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

    args.push('-c:v', 'libx264');
    args.push('-preset', 'veryfast');

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
    setOutputUrl(undefined);

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

    args.push('-c:v', 'libx264');
    args.push('-preset', 'veryfast');

    if (mute) {
      args.push('-an');
    } else {
      args.push('-c:a', 'copy');
    }

    const newFile = await ffmpeg.exec(mainStore.file!, args);
    setOutputUrl(URL.createObjectURL(newFile));
  };

  // Show ffmpeg command for large files
  if (isLargeFile) {
    return (
      <div className={styles.step}>
        <div className={styles.settings}>
          <div>
            Resolution: {width}px x {height}px
          </div>
          <div>
            Scale: {Math.round(scale * 100) / 100}
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
        </div>
        <div className={styles.largeFileWarning}>
          <h3>⚠️ File Too Large</h3>
          <p>
            Your file is <strong>{fileSizeGB.toFixed(2)} GB</strong>, exceeding the 1.8 GB limit.
          </p>
          <p>
            Chrome cannot process large files in memory due to WebAssembly and Memory limitations.
          </p>
          
          <div className={styles.commandSection}>
            <h4>Solution: Use FFmpeg via Terminal</h4>
            <p>Copy and run this command in your terminal:</p>
            
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
            <h4>Instructions:</h4>
            <ol>
              <li>Install FFmpeg if needed: <a href="https://ffmpeg.org/download.html" target="_blank" rel="noopener noreferrer">ffmpeg.org/download.html</a></li>
              <li>Open Terminal (Mac/Linux) or Command Prompt (Windows)</li>
              <li>Navigate to your video file directory</li>
              <li>Paste the command and press Enter</li>
              <li>Wait for processing to complete, output.mp4 will be created</li>
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
              <span>Cancel</span>
            </button>
          </div>
          <div className={styles.info}>
            <span>Running</span>
            <progress value={ffmpeg.execProgress} max={1} />
            <pre>{ffmpeg.output}</pre>
          </div>
        </>
      ) : (
        <>
          <div className={styles.settings}>
            <div>
              Resolution: {width}px x {height}px
            </div>
            <div>
              Scale: {Math.round(scale * 100) / 100}
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
          </div>
          <div className={styles.actions}>
            <button onClick={crop}>
              <span>Render MP4</span>
            </button>
            {outputUrl && (
              <a
                href={outputUrl}
                download="cropped.mp4"
                className={clsx('button', styles.download)}
              >
                <BsDownload />
                <span>Download</span>
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
      {!!ffmpeg.log && (
        <div className={styles.info}>
          <button onClick={() => setLogVisible(value => !value)}>
            {logVisible ? 'Hide log' : 'Show log'}
          </button>
          {logVisible && <pre>{ffmpeg.log}</pre>}
        </div>
      )}
    </div>
  );
});
