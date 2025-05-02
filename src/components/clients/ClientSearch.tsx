import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Save } from 'lucide-react';

type ClientSearchProps = {
    searchCondition: string;
    setSearchCondition: (value: string) => void;
    searchKeyword: string;
    setSearchKeyword: (value: string) => void;
  };

const ClientSearch: React.FC<ClientSearchProps> = ({searchCondition, setSearchCondition, searchKeyword,setSearchKeyword}) => {
    return (
        <div className="mt-4 p-4 border border-gray-300 flex justify-between items-center shadow-md">
            <Link to="/client/regist" className="bg-blue-500 px-3 py-2 text-white font-semibold h-8 flex justify-center items-center space-x-2 rounded-sm">
                <Save className='w-5 h-5'/>
                <span>등록</span>
            </Link>
            <div className="space-x-2 text-gray-600 flex">
                <select
                    value={searchCondition}  // state와 동기화된 value 사용
                    onChange={(e) => setSearchCondition(e.target.value)}  // 선택된 값으로 searchCondition 업데이트
                    className="p-1 h-8 border border-gray-400 text-sm"
                >
                    <option value="ALL">전체</option>
                    <option value="clientNm">고객사명</option>
                    <option value="clientCategory">고객분류</option>
                    <option value="bizRegNo">사업자등록번호</option>
                </select>
                <input type="text" placeholder="검색어를 입력해 주세요" 
                    className="p-1 h-8 border border-gray-400"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <button className="bg-black text-white px-3 py-1 font-semibold h-8 flex items-center rounded-sm">
                    <Search className='w-4'/>
                    <span>조회</span>
                </button>
            </div>
        </div>
    )
}

export default ClientSearch;