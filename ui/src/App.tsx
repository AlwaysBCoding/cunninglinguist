import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UI_ROUTES } from './helpers/routes';

import { GameProvider } from './contexts/GameContext';

import { HomeScreen } from './screens/HomeScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';
import { LevelShowScreen } from './screens/LevelShowScreen';

const App: React.FC = () => {
  return (
    <div className='Container'>
      <GameProvider>
        <Router>
          <Routes>
            <Route path={UI_ROUTES.Home} element={<HomeScreen />} />
            <Route path={UI_ROUTES.LevelSelect} element={<LevelSelectScreen />} />
            <Route path={UI_ROUTES.LevelShow} element={<LevelShowScreen />} />
          </Routes>
        </Router>
      </GameProvider>
    </div>
  )
}

export default App;
