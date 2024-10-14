import React from 'react';
import './App.css';

const GridCell = ({ type, isAgent }) => {
  let cellClass = 'grid-cell';
  if (isAgent) cellClass += ' agent';
  else if (type === 'treasure') cellClass += ' treasure';
  else if (type === 'obstacle') cellClass += ' obstacle';

  return <div className={cellClass}></div>;
};

export default GridCell;
