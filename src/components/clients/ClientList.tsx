import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ClientSearch from './ClientSearch';
import Swal from 'sweetalert2';


type Client = {
    atchFileId: string | null;
    bizRegNo: string;
    bizTy: string;
    clientAddr: string;
    clientCategory: string;
    clientCd: string;
    clientNm: string;
    clientSeq: number;
    creditRating: string | null;
    etcInfo: string | null;
    indClass: string;
    modDt: string;
    modId: string | null;
    regDt: string;
    regId: string | null;
  };

type FetchClientsResponse = {
    content: Client[];
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

const getPageRange = (currentPage: number, totalPages: number) => {
    const pageCount = 10;
    const startPage = Math.floor(currentPage / pageCount) * pageCount;
    const endPage = Math.min(startPage + pageCount - 1, totalPages - 1);
  
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i + 1);
  };

const fetchClients = async (page: number, sKeyword: string, sCondition: string): Promise<FetchClientsResponse> => {
    const params = new URLSearchParams({
        reqPage: page.toString(),
      });

      // 키워드와 검색 조건 파라미터 추가
    params.append('sKeyword', sKeyword);
    if (sCondition === 'ALL') {
        params.append('criteria', 'true');
        params.append('sCondition', 'clientNm,clientCategory,bizRegNo');
    } else {
        params.append('sCondition', sCondition);
    }
    
  
    const response = await fetch(`/crm/client/list?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch clients');
    }

    const data: FetchClientsResponse = await response.json();

    return data;
  };

// export type ClientViewType = 'list' | 'edit' | 'view';

// interface ClientListProps {
//     setActiveView: Dispatch<SetStateAction<ClientViewType>>;
// }

const ClientList = () => {
    const queryClient = useQueryClient();

    const [clientList, setClientList] = useState<FetchClientsResponse>();

    const [currentPage, setCurrentPage] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchCondition, setSearchCondition] = useState("ALL")

    const { data: clientListData, isLoading: clientListIsLoading, isError: clientListIsError } = useQuery<FetchClientsResponse, Error>({
        queryKey: ['clients', currentPage, searchKeyword, searchCondition],
        queryFn: () => fetchClients(currentPage, searchKeyword, searchCondition),
        staleTime: 5000,
        placeholderData: (previousData) => previousData,
    });

    useEffect(() => {
        if (clientListData) {
            setClientList(clientListData); // 초기 데이터 로드 시 clientList 상태 업데이트
        }
    }, [clientListData]);

    useEffect(() => {
        setCurrentPage(0); // 검색 조건이 바뀌면 0페이지로 이동
    }, [searchKeyword]);


    const handleClientDelete = async (
        e: React.MouseEvent<HTMLButtonElement>,
        clientSeq: number
    ): Promise<void> => {
        e.preventDefault();
    
        const { isConfirmed } = await Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: '이 작업은 되돌릴 수 없습니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '네, 삭제합니다',
            cancelButtonText: '아니요',
        });
    
        if (isConfirmed) {
            try {
                const response = await fetch(`/crm/client/info/${clientSeq}`, {
                    method: 'DELETE',
                });
    
                if (response.ok) {
                    queryClient.invalidateQueries({ queryKey: ['clients'] });
    
                    await Swal.fire({
                        title: '삭제 완료',
                        text: '고객사가 삭제되었습니다.',
                        icon: 'success',
                        confirmButtonText: '확인',
                    });
                } else {
                    await Swal.fire({
                        title: '삭제 실패',
                        text: '서버 오류로 삭제에 실패했습니다.',
                        icon: 'error',
                        confirmButtonText: '확인',
                    });
                }
            } catch (error: unknown) {
                let message = '알 수 없는 오류가 발생했습니다.';
                if (error instanceof Error) {
                    message = error.message;
                }
    
                await Swal.fire({
                    title: '삭제 실패',
                    text: `오류가 발생했습니다: ${message}`,
                    icon: 'error',
                    confirmButtonText: '확인',
                });
            }
        }
    };

    const handleManagerListModalOpen = (clientSeq:number): void => {
        console.log(`담당자 모달 열기: ${clientSeq}`);
    }

    if (clientListIsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    if (clientListIsError) {
        return <div>Error loading clients</div>;
    }    

    
    const totalPages = clientList?.totalPages || 0;

    const pageRange = getPageRange(currentPage, totalPages);

    return (

        <>
            <ClientSearch 
                searchCondition={searchCondition} 
                setSearchCondition={setSearchCondition}
                searchKeyword={searchKeyword}
                setSearchKeyword={setSearchKeyword} 
            />

            <div className='mt-4 mb-4 text-sm'>총 게시물 <span className='font-bold text-blue-700'>{totalPages}</span>개, 페이지 <span className='font-bold text-blue-700'>{currentPage + 1}</span>/{totalPages}</div>
            
            <table className="w-full table-auto text-center border-collapse">
                <thead className="bg-[#f9fbfd] text-gray-700 border-t border-gray-700">
                    <tr>
                        <th className="px-4 py-2 border border-gray-200">고객사 코드</th>
                        <th className="px-4 py-2 border border-gray-200">고객사 명</th>
                        <th className="px-4 py-2 border border-gray-200">산업 분류</th>
                        <th className="px-4 py-2 border border-gray-200">고객 분류</th>
                        <th className="px-4 py-2 border border-gray-200">기업형태</th>
                        <th className="px-4 py-2 border border-gray-200">사업자번호</th>
                        <th className="px-4 py-2 border border-gray-200">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {clientListData?.content.map((client) => {
                        return (
                            <tr key={client.clientSeq} className="border-t border-gray-200">
                                <td className="px-4 py-2 border border-gray-200">{client.clientCd}</td>
                                <td className="px-4 py-2 border border-gray-200"><Link to={`/client/detail/${client.clientSeq}`}>{client.clientNm}</Link></td>
                                <td className="px-4 py-2 border border-gray-200">{client.indClass}</td>
                                <td className="px-4 py-2 border border-gray-200">{client.clientCategory}</td>
                                <td className="px-4 py-2 border border-gray-200">{client.bizTy}</td>
                                <td className="px-4 py-2 border border-gray-200"></td>
                                <td className="px-4 py-2 border border-gray-200">
                                    <div className="flex justify-center space-x-2">
                                        <button onClick={() => handleManagerListModalOpen(client.clientSeq)} className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded-sm transition">담당자</button>
                                        <Link to={`/client/modify/${client.clientSeq}`} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-sm transition">수정</Link>
                                        <button onClick={(e) => handleClientDelete(e, client.clientSeq)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-sm transition">삭제</button>
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

export default ClientList;