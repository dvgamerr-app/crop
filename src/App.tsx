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
      <h1>ตัดต่อวิดีโอ</h1>
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
    </div>
  );
});
