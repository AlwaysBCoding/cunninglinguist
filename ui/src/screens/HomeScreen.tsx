import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LEVELS } from '../const/levels';
import { getLevelShowRoute } from '../helpers/routes';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleLevelClick = (ident: string) => {
    navigate(getLevelShowRoute(ident));
  };
  
  return (
    <div className='Screen home-screen'>
      <h1 className='title'>HOME SCREEN</h1>
      <div className='levels-list'>
        {LEVELS.map((level) => (
          <button
            key={level.ident}
            onClick={() => handleLevelClick(level.ident)}
            className='level-button'
          >
            {level.display_name}
          </button>
        ))}
      </div>
    </div>
  );
}
