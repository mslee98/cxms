import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import InventoryList from '../components/inventories/InventoryList';

const Inventories = () => {
    const location = useLocation();

    const { clientSeq } = useParams<{ clientSeq?: string }>();

    const getTitle = () => {
        if (location.pathname.startsWith('/client/detail')) {
            // detail 페이지일 경우
            return '인벤토리 관리 상세';
        }

        if (location.pathname.startsWith('/client/modify')) {
            // detail 페이지일 경우
            return '인벤토리 관리 수정';
        }

        switch (location.pathname) {
            case '/inventories/list':
                return ' 인벤토리 관리 목록';
            case '/inventories/regist':
                return '인벤토리 관리 등록';
            default:
                return '고객사 관리';
        }
    };

    return (
        <div className="w-full p-4">
            <h2 className="text-2xl font-bold">인벤토리 관리</h2>
            <div className="mt-5 mb-5 w-full border-b border-gray-200"/>

            <div className="bg-white shadow-md w-full rounded-lg p-4">
                <h3 className="p-2 relative inline-block text-xl font-semibold after:content-[''] after:absolute after:left-2 after:bottom-0 after:w-[76px] after:h-[4px] after:bg-[#4e73df] after:rounded-t-md after:right-[40px]">
                    {getTitle()}
                </h3>

                <Routes>
                    <Route path="list" element={<InventoryList />} />

                    <Route path="/" element={<Navigate to="list" />} />
                </Routes>
            </div>

        </div>
    )
}

export default Inventories;