import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import React, { useEffect, useState } from 'react';
import InventorySearch from './InventorySearch';

export interface tPrjctMaster {
    seq: number;
    exOrderYear: string;
    exOrderQu: string;
    exOrderMonth: string;
    compSeq: string;
    compNm: string;
    deptId: string;
    deptNm: string;
    deptPath: string;
    charger: string;
    chargerNm: string;
    prjctNm: string;
    prjctCd: string;
    prductSe: string | null;
    prtnr: string | null;
    ipcr: string;
    totRcvordAmount: string;
    rcvordRpblty: string;
    rcvordSttus: string;
    contractingParty: string | null;
    performanceSttus: string;
    partcptnStle: string;
    remark: string;
    rfpReflectionRate: string;
    vrbTargetAt: string;
    consortiumRatio: string;
    productCtrctTy: string | null;
    ctrctCmpny: number | null;
    ctrctCmpnyNm: string | null;
    clientSeq: number;
    clientNm: string;
    regId: string | null;
    regDt: string; // ISO 형식의 날짜 문자열
    modId: string;
    modDt: string; // ISO 형식의 날짜 문자열
  }

type FetchPrjctsResponse = {
    content: tPrjctMaster[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: {
        offset: number;
        pageNumber: number;
        pageSize: number;
        paged: boolean;
    };
    totalElements: number;
    totalPages: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
};

// const fetchPrjct = async (page: number, sKeyword: string, sCondition: string): Promise<FetchPrjctsResponse> => {
//     const params = new URLSearchParams({
//         reqPage: page.toString(),
//     });

//     params.append('sKeyword', sKeyword);
//     if (sCondition === 'ALL') {
//         params.append('criteria', 'true');
//         params.append('sCondition', 'prjctNm,prjctCd,bizRegNo');
//     } else {
//         params.append('sCondition', sCondition);
//     }

//     const response = await fetch(`/crm/prjct/list?${params.toString()}`);

//     if (!response.ok) {
//         throw new Error('Failed to fetch clients');
//     }

//     const data: FetchPrjctsResponse = await response.json();

//     return data;
// };

interface FetchPrjctParams {
    pageIndex: number;
    searchKeyword?: string;
    searchCondition?: string;
    chargerNm?: string;
    exOrderYear?: string;
    exOrderMonth?: string;
    rcvordRpblty?: string;
    sortKey?: string;
    sortType?: string;
    seq?: string;
  }

const fetchPrjct = async (paramsObj: FetchPrjctParams): Promise<FetchPrjctsResponse> => {
    const params = new URLSearchParams();
    params.set('reqPage', paramsObj.pageIndex.toString());
  
    if (paramsObj.searchKeyword) params.set('searchKeyword', paramsObj.searchKeyword);
    if (paramsObj.searchCondition) params.set('searchCondition', paramsObj.searchCondition);
    if (paramsObj.chargerNm) params.set('chargerInfo.mberNm', paramsObj.chargerNm);
    if (paramsObj.exOrderYear) params.set('multiSearchParam[exOrderYear]', paramsObj.exOrderYear);
    if (paramsObj.exOrderMonth) params.set('multiSearchParam[exOrderMonth]', paramsObj.exOrderMonth);
    if (paramsObj.rcvordRpblty) params.set('multiSearchParam[rcvordRpblty]', paramsObj.rcvordRpblty);
    if (paramsObj.sortKey) params.set('sortKey', paramsObj.sortKey);
    if (paramsObj.sortType) params.set('sortType', paramsObj.sortType);
    if (paramsObj.seq) params.set('seq', paramsObj.seq);
  
    const response = await fetch(`/crm/prjct/list?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return await response.json();
  };
  

/**
 * 페이지네이션 계산
 * @param currentPage 
 * @param totalPages 
 * @returns 
 */
const getPageRange = (currentPage: number, totalPages: number) => {
    const pageCount = 10;
    const startPage = Math.floor(currentPage / pageCount) * pageCount;
    const endPage = Math.min(startPage + pageCount - 1, totalPages - 1);

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i + 1);
};

const InventoryList = () => {

    const [currentPage, setCurrentPage] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchCondition, setSearchCondition] = useState("ALL");

    const [prjctList, setPrjctList] = useState<FetchPrjctsResponse>();


    const { data: prjctListData, isLoading: clientListIsLoading, isError: clientListIsError } = useQuery<FetchPrjctsResponse, Error>({
        queryKey: ['prjct', currentPage, searchKeyword, searchCondition],
        queryFn: () =>
            fetchPrjct({
              pageIndex: currentPage,
              searchKeyword,
              searchCondition,
            }),
        staleTime: 1000,
        placeholderData: (previousData) => previousData
    });

    console.log(prjctListData)

    useEffect(() => {
        if (prjctListData) {
            setPrjctList(prjctListData); // 초기 데이터 로드 시 clientList 상태 업데이트
        }
    }, [prjctListData]);


    const handlePrjctDelete = (e: React.MouseEvent<HTMLButtonElement>, prjctSeq: number) => {

    }

    const totalPages = prjctList?.totalPages || 0;

    const pageRange = getPageRange(currentPage, totalPages);

    return (
        <>

            <InventorySearch
                searchCondition={searchCondition} 
                setSearchCondition={setSearchCondition}
                searchKeyword={searchKeyword}
                setSearchKeyword={setSearchKeyword} 
            />

<div className='mt-4 mb-4 text-sm'>총 게시물 <span className='font-bold text-blue-700'>{totalPages}</span>개, 페이지 <span className='font-bold text-blue-700'>{currentPage + 1}</span>/{totalPages}</div>
            
            <table className="w-full table-auto text-center border-collapse">
                <thead className="bg-[#f9fbfd] text-gray-700 border-t border-gray-700">
                    <tr>
                        <th className="px-4 py-2 border border-gray-200">프로젝트 코드</th>
                        <th className="px-4 py-2 border border-gray-200">중요도</th>
                        <th className="px-4 py-2 border border-gray-200">고객사</th>
                        <th className="px-4 py-2 border border-gray-200">법인명</th>
                        <th className="px-4 py-2 border border-gray-200">프로젝트 명</th>
                        <th className="px-4 py-2 border border-gray-200">담당자</th>
                        <th className="px-4 py-2 border border-gray-200">수주연도</th>
                        <th className="px-4 py-2 border border-gray-200">수주월</th>
                        <th className="px-4 py-2 border border-gray-200">수주확도</th>
                        <th className="px-4 py-2 border border-gray-200">총 수주금액</th>
                        <th className="px-4 py-2 border border-gray-200">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    
                    {/* {clientListIsError && <tr><td colSpan={7} className="text-center py-4 text-red-500">검색 결과가 없습니다.</td></tr>} */}
                    {prjctListData?.content.map((prjct) => {
                        return (
                            <tr key={prjct.seq} className="border-t border-gray-200">
                                <td className="px-4 py-2 border border-gray-200">{prjct.prjctCd}</td>
                                <td className="px-4 py-2 border border-gray-200">{prjct.ipcr}</td>
                                <td className="px-4 py-2 border border-gray-200">{prjct.clientNm}</td>
                                <td className="px-4 py-2 border border-gray-200">{prjct.compNm}</td>
                                <td className="px-4 py-2 border border-gray-200"><Link to={`/prjct/detail/${prjct.seq}`} className='text-blue-700'>{prjct.prjctNm}</Link></td>
                                <td className="px-4 py-2 border border-gray-200">{prjct.chargerNm}</td>
                                <td className="px-4 py-2 border border-gray-200">{prjct.exOrderYear}</td>
                                <td className="px-4 py-2 border border-gray-200">{prjct.exOrderMonth}</td>
                                <td className="px-4 py-2 border border-gray-200">{prjct.rcvordRpblty} %</td>
                                <td className="px-4 py-2 border border-gray-200">
                                    {Math.floor(parseFloat(prjct.totRcvordAmount) / 1_000_000).toLocaleString('ko-KR')} <span className='text-xs'>(백만 원)</span>
                                </td>
                                <td className="px-4 py-2 border border-gray-200">
                                    <div className="flex justify-center space-x-2">
                                        <Link to={`/client/modify/${prjct.seq}`} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-sm transition">수정</Link>
                                        <button onClick={(e) => handlePrjctDelete(e, prjct.seq)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-sm transition">삭제</button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            <div className='flex justify-center'>
                <nav className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4 bg-white" aria-label="Table navigation">
                    <ul className="inline-flex items-stretch -space-x-px text-sm">

                        <li>
                            <button
                                onClick={() => setCurrentPage((0))}
                                className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-black"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" id="Outline" viewBox="0 0 24 24" className='w-5 h-5'><path d="M10.48,19a1,1,0,0,1-.7-.29L5.19,14.12a3,3,0,0,1,0-4.24L9.78,5.29a1,1,0,0,1,1.41,0,1,1,0,0,1,0,1.42L6.6,11.29a1,1,0,0,0,0,1.42l4.59,4.58a1,1,0,0,1,0,1.42A1,1,0,0,1,10.48,19Z"/><path d="M17.48,19a1,1,0,0,1-.7-.29l-6-6a1,1,0,0,1,0-1.42l6-6a1,1,0,0,1,1.41,0,1,1,0,0,1,0,1.42L12.9,12l5.29,5.29a1,1,0,0,1,0,1.42A1,1,0,0,1,17.48,19Z"/></svg>

                            </button>
                        </li>
                        
                        {/* Prev */}
                        <li>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                                className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-black"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </li>

                        {/* Pages */}
                        {pageRange.map((page) => (
                            <li key={page}>
                                <button
                                    onClick={() => setCurrentPage(page -1)}
                                    className={`flex items-center justify-center py-2 px-3 border border-gray-300 ${
                                        currentPage === page -1
                                            ? "bg-blue-100 text-blue-600 font-semibold"
                                            : "bg-white text-gray-600 hover:bg-gray-100 hover:text-black"
                                    }`}
                                >
                                    {page}
                                </button>
                            </li>
                        ))}

                        {/* Next */}
                        <li>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                className="flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-black"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={() => setCurrentPage((totalPages - 1))}
                                className="flex items-center justify-center h-full py-1.5 px-3 text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-black"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" id="Outline" viewBox="0 0 24 24" className='w-5 h-5'><path d="M13.1,19a1,1,0,0,1-.7-1.71L17,12.71a1,1,0,0,0,0-1.42L12.4,6.71a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0L18.4,9.88a3,3,0,0,1,0,4.24l-4.59,4.59A1,1,0,0,1,13.1,19Z"/><path d="M6.1,19a1,1,0,0,1-.7-1.71L10.69,12,5.4,6.71a1,1,0,0,1,0-1.42,1,1,0,0,1,1.41,0l6,6a1,1,0,0,1,0,1.42l-6,6A1,1,0,0,1,6.1,19Z"/></svg>

                            </button>
                        </li>

                    </ul>
                </nav>
            </div>

        </>
    )
}

export default InventoryList;