
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/DashBoard';
import Layout from '../layouts/Layouts';
import ClientMng from '../pages/ClientMng';
import Inventories from '../pages/Inventories';

const RoutesComponent = () => (
  <Routes>
    <Route path="/" element={<Layout><Dashboard /></Layout>} />
    <Route path="/client/*" element={<Layout><ClientMng /></Layout>} />
    <Route path="/inventories/*" element={<Layout><Inventories/></Layout>} />
    {/* <Route path="/about" element={<About />} /> */}
    {/* <Route path="*" element={<NotFound />} /> */}
  </Routes>
);

export default RoutesComponent;
