import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import RoutesComponent from './routes';
import './App.css';

function App() {
  return (
    <>
    <Router>
      <RoutesComponent /> {/* 라우팅 정의된 컴포넌트 */}
    </Router>
    </>
    
  );
}

export default App;
