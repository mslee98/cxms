
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Layout from '../layouts/Layouts';
import ClientMng from '../pages/ClientMng';

const RoutesComponent = () => (
  <Routes>
    <Route path="/" element={<Layout><Home /></Layout>} />
    <Route path="/client" element={<Layout><ClientMng /></Layout>} />
    {/* <Route path="/about" element={<About />} /> */}
    {/* <Route path="*" element={<NotFound />} /> */}
  </Routes>
);

export default RoutesComponent;
