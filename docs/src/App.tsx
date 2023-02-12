import './App.css';

import { IKonva } from './components/IKonva';
import { IMarkdown } from './components/IMarkdown';
import { Footer } from './components/Footer';
import { GitActions } from './components/GitActions';
import { MiniprogramLogin } from './components/MiniprogramLogin';
import { ConfigProvider, theme } from 'antd';
import { useState } from 'react';
function App() {
  var themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const [isDark, setIsDark] = useState(themeMedia.matches);
  themeMedia.addEventListener("change", () => {
    setIsDark(!isDark);
  });

  return (
    <ConfigProvider theme={{ algorithm: isDark ? [theme.darkAlgorithm] : [theme.defaultAlgorithm] }} >
      <div className="App ds" >

        <MiniprogramLogin></MiniprogramLogin>
        <Footer isDark={isDark} onClick={() => { setIsDark(!isDark); }}></Footer>
        <div className='z1'>
          <IKonva></IKonva>
          <GitActions></GitActions>
          <IMarkdown></IMarkdown>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
