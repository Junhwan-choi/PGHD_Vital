import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
// import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import DataStatus from './components/DataStatus'

import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <RecoilRoot>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/datastatus" element={<DataStatus />} />
            <Route path="/" element={<Login/>} />
          </Routes>
        </RecoilRoot>
      </Router>
    </div>
  );
}
export default App;