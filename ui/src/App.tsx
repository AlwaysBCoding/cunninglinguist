import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UI_ROUTES } from './helpers/routes';

import { GameProvider } from './contexts/GameContext';

import { HomeScreen } from './screens/HomeScreen';

const App: React.FC = () => {
  return (
    <div className='Container'>
      <GameProvider>
        <Router>
          <Routes>
            <Route path={UI_ROUTES.Home} element={<HomeScreen />} />
          </Routes>
        </Router>
      </GameProvider>
    </div>
  )
}

export default App;
