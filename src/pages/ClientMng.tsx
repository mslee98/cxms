import React, { useState } from 'react';

const ClientMng = () => {

    const [activeView, setActiveView] = useState<'list' | 'edit' | 'view'>('list');

    const handleEditClick = () => {
        setActiveView('edit');
      };
    
      const handleViewClick = () => {
        setActiveView('view');
      };

    return (
        <div className="w-full p-4">
            <h2 className="text-2xl font-bold">고객사 관리</h2>
            <div className="mt-5 mb-5 w-full border-b border-gray-200"/>

            <div className="bg-white shadow-md w-full rounded-lg p-4">
                <h3 className="p-2 relative inline-block text-xl font-semibold after:content-[''] after:absolute after:left-2 after:bottom-0 after:w-[76px] after:h-[4px] after:bg-[#4e73df] after:rounded-t-md after:right-[40px]">
                고객사 관리 {activeView === 'list'
                    ? '목록'
                    : activeView === 'edit'
                    ? '등록'
                    : '수정'}
                </h3>
            </div>

            {/* {activeView === 'list' && <CustomerList />}
            {activeView === 'edit' && <CustomerForm />}
            {activeView === 'view' && <CustomerDetails />} */}

        </div>
    )
}

export default ClientMng;