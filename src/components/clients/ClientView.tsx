import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { tClient, tManager } from '../../typings/client';
import { comCodeType } from '../../typings/common';
import { fetchBizCode, fetchClientCategoryList, fetchIndClass } from '../../utils/comApiUtils';
import { ListEnd, Plus, SquarePen, Trash } from 'lucide-react';
import Swal from 'sweetalert2';

const fetchClientInfo = async (clientSeq: string) => {
    const res = await fetch(`/crm/client/info/${clientSeq}`);
    if (!res.ok) {
        throw new Error('데이터 로드 오류');
    }
    return res.json();
}

const fetchClientContactList = async (clientSeq: string) => {
    const res = await fetch(`/crm/client/contact/list-by-client/${clientSeq}`);
    if (!res.ok) {
        throw new Error('데이터 로드 오류');
    }
    return res.json();
}

const ClientView = () => {

    const queryClient = useQueryClient();

    const { clientSeq } = useParams<{ clientSeq?: string }>();
    const navigate = useNavigate();
    const managerRef = useRef(null);

    const [newManager, setNewManager] = useState<tManager>({
        name: '',
        position: '',
        extnNmbr: '',
        mblPhone: '',
        creator: '',
    });
    const [managers, setManagers] = useState<tManager[]>([])

    const [ showManagerModal, setShowManagerModal] = useState(false);

    const { data: clientInfo, error: clientInfoError, isLoading: clientInfoLoading } = useQuery<tClient>({
        queryKey: ['clientInfo', clientSeq],
        queryFn: () => {
            if (!clientSeq) {
                throw new Error('ClientSeq is required');
            }
            return fetchClientInfo(clientSeq);
        },
        enabled: !!clientSeq,
    });

    const { data: clientContactList, error, isLoading } = useQuery({
        queryKey: ['clientContactList', clientSeq],
        queryFn: () => {
            if (!clientSeq) {
                throw new Error('ClientSeq is required');
            }
            return fetchClientContactList(clientSeq);
        },
        enabled: !!clientSeq,
    });

    useEffect(() => {
        setManagers(clientContactList)
    }, [clientContactList])

    const { data: bizType } = useQuery<comCodeType[]>({
        queryKey: ['bizType'],
        queryFn: () => fetchBizCode(),
        staleTime: 5000,
        placeholderData: (previousData) => previousData,
    });

    const { data: indClass } = useQuery<comCodeType[]>({
        queryKey: ['indClass'],
        queryFn: () => fetchIndClass(),
        staleTime: 5000,
        placeholderData: (previousData) => previousData,
    });

    const { data: clientCategory } = useQuery<comCodeType[]>({
        queryKey: ['clientCategory'],
        queryFn: () => fetchClientCategoryList(),
        staleTime: 5000,
        placeholderData: (previousData) => previousData,
    });

    /**
     * 담당자 삭제
     * @param index 
     * @param seq 
     * @returns 
     */
    const deleteRow = async (index: number, seq: string, ) => {
        const { isConfirmed } = await Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: '한 번 삭제하면 복구할 수 없습니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '네, 삭제합니다',
            cancelButtonText: '아니요',
            buttonsStyling: false,  // <-- SweetAlert 기본 버튼 스타일링 해제
            customClass: {
                popup: 'bg-white p-6 rounded-lg shadow-lg',
                title: 'text-gray-900 text-xl font-semibold',
                htmlContainer: 'text-gray-700',
                confirmButton: 'px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white',
                cancelButton: 'px-4 py-2 ml-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white',
            }
        });
    
        if (!isConfirmed) return;
    
        try {
            const response = await fetch(`/crm/client/contact/info/${seq}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`서버 에러: ${text}`);
            }
    
            setManagers((prev) => prev.filter((_, i) => i !== index));
    
            await Swal.fire({
                title: '삭제되었습니다',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error: unknown) {
            console.error('deleteRow 오류:', error);
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            Swal.fire({
                title: '삭제 중 오류',
                text: errorMessage,
                icon: 'error',
            });
        }
    };

    /**
     * 고객사 삭제
     * @param e 
     */
    const handleClientDelete = async (
        e: React.MouseEvent<HTMLButtonElement>,
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

                    navigate(`/client/list`);
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


    /**
     * 담당자 등록
     * @param e 
     */
    const handleManagerRegist = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (clientSeq) {
            const contactData = [{ ...newManager, clientSeq }];
            const contactResponse = await fetch('/crm/client/contact/info-by-list', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(contactData),
            });
            const contactResult = await contactResponse.text();
            const managerSeq = contactResult.split('_')[0].replace(/\D/g, '');
      
            if (contactResponse.ok) {
              Swal.fire({
                title: '성공',
                text: '고객사 및 담당자 정보가 등록되었습니다.',
                icon: 'success',
                confirmButtonText: '확인',
              });
              addRow(managerSeq);
            }
          }
    }


    /**
     * 담당자 행 추가
     * @param managerSeq 
     * @returns 
     */
    const addRow = (managerSeq: string) => {

        if(!clientSeq) return; 

        const newRow = {
            ...newManager,
            seq: managerSeq,
        };

        setManagers((prevManager) => {
            // prevManager가 배열이 아니면 빈 배열로 초기화
            const updatedManagers = Array.isArray(prevManager) ? prevManager : [];
            return [...updatedManagers, newRow];  // 새로운 행을 추가
        });

        setNewManager({
            name: '',
            position: '',
            extnNmbr: '',
            mblPhone: '',
            creator: '',
        });
        setShowManagerModal(false);

        fetchClientContactList(clientSeq)
    }
    
    return (
        <>
        {showManagerModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
              <h2 className="text-lg font-semibold mb-4">고객사 담당자 등록/수정</h2>
      
              <div>
                <form onSubmit={handleManagerRegist} className='space-y-3'> {/* form 태그에 onSubmit 추가 */}
                  <input
                    className="w-full border px-3 py-2 rounded"
                    placeholder="성명"
                    value={newManager.name}
                    onChange={(e) => setNewManager({...newManager, name: e.target.value})}
                  />
      
                  <input
                    className="w-full border px-3 py-2 rounded"
                    placeholder="직급"
                    value={newManager.position}
                    onChange={(e) => setNewManager({...newManager, position: e.target.value})}
                  />
      
                  <input
                    className="w-full border px-3 py-2 rounded"
                    placeholder="내선번호"
                    value={newManager.extnNmbr}
                    onChange={(e) => setNewManager({...newManager, extnNmbr: e.target.value})}

                  />
      
                  <input
                    className="w-full border px-3 py-2 rounded"
                    placeholder="휴대전화번호"
                    value={newManager.mblPhone}
                    onChange={(e) => setNewManager({...newManager, mblPhone: e.target.value})}
                  />
      
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowManagerModal(false)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      취소
                    </button>
                    <button
                      type="submit" // 버튼을 submit으로 변경
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      저장
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}


        <div className="w-full mx-auto p-6">
            <div className="grid grid-cols-[20rem_1fr_20rem_1fr] border-t border-gray-700">
                {/* 고객사명 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객사명</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <div className="w-full h-10 p-2 rounded">{clientInfo?.clientNm}</div>
                </div>

                {/* 고객사 코드 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객사 코드</label>
                </div>
                <div className="p-2 border-b border-gray-300">
                    <div className="w-full h-10 p-2 rounded">{clientInfo?.clientCd}</div>
                </div>
            </div>

            <div className="grid grid-cols-[20rem_1fr]">
                {/* 고객사 주소 라벨 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객사 주소</label>
                </div>

                {/* 고객사 주소 */}
                <div className="p-2 border-b border-gray-300 space-y-2">
                    <div className="flex w-full gap-2">
                        <div className="w-full h-10 p-2 rounded">{clientInfo?.clientAddr}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[20rem_1fr_20rem_1fr]">
                {/* 기업형태 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">기업형태</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                <div className="w-full h-10 p-2 rounded">
                    {bizType &&
                        bizType
                            .filter((biz) => biz.code === clientInfo?.bizTy)  // code가 일치하는 항목만 필터링
                            .map((biz) => biz.codeNm)  // 일치하는 항목의 codeNm을 출력
                    }
                </div>
                </div>

                {/* 산업분류 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">산업분류</label>
                </div>
                <div className="p-2 border-b border-gray-300">
                    <div className="w-full h-10 p-2 rounded">
                        
                        {indClass &&
                            indClass
                                .filter((ind) => ind.code === clientInfo?.indClass)  // code가 일치하는 항목만 필터링
                                .map((ind) => ind.codeNm)  // 일치하는 항목의 codeNm을 출력
                        }
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-[20rem_1fr_20rem_1fr]">
                {/* 고객분류 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객분류</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <div className="w-full h-10 p-2 rounded">
                        {clientCategory &&
                            clientCategory
                                .filter((category) => category.code === clientInfo?.clientCategory)  // code가 일치하는 항목만 필터링
                                .map((category) => category.codeNm)  // 일치하는 항목의 codeNm을 출력
                        }
                    </div>
                </div>

                {/* 사업자등록번호 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">사업자등록번호</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <div className="w-full h-10 p-2 rounded">{clientInfo?.bizRegNo}</div>
                </div>
            </div>

            <div className="grid grid-cols-[20rem_1fr_20rem_1fr]">
                {/* 첨부파일 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">첨부파일</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <label htmlFor="file-upload" className="w-full h-10 p-2 outline-none border border-gray-300 rounded cursor-pointer flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600 transition">
                        <span>파일 선택</span>
                    </label>
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        // onChange={(e) => console.log(e.target.files[0]?.name)} // 선택한 파일 이름 출력 (예시)
                    />
                </div>

                {/* 신용도 평가 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">신용도 평가</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                <div className="w-full h-10 p-2 rounded">{clientInfo?.creditRating}</div>
                </div>
            </div>

            <div className="grid grid-cols-[20rem_1fr]">
                {/* 비고 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">비고</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <div className="w-full h-10 p-2 rounded">{clientInfo?.etcInfo}</div>
                </div>
            </div>

            <div className="grid grid-cols-[20rem_1fr]">
                {/* 고객사 담당자 */}
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객사 담당자</label>
                </div>
    
                <div className="p-4 border-b border-r border-gray-300 ">

                    <table className="w-full text-sm border border-gray-300 mb-2">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-2 py-1">성명</th>
                                <th className="border px-2 py-1">직급</th>
                                <th className="border px-2 py-1">내선번호</th>
                                <th className="border px-2 py-1">휴대전화번호</th>
                                <th className="border px-2 py-1">등록자명</th>
                                <th className="border px-2 py-1">Action</th>
                            </tr>
                        </thead>
                        <tbody ref={managerRef}>
                        {/* <tbody> */}
                        {managers && managers.map((manager, index) => (
                            <tr key={index}>
                                <td className="border px-2 py-2 text-center">{manager.name}</td>
                                <td className="border px-2 py-2 text-center">{manager.position}</td>
                                <td className="border px-2 py-2 text-center">{manager.extnNmbr}</td>
                                <td className="border px-2 py-2 text-center">{manager.mblPhone}</td>
                                <td className="border px-2 py-2 text-center">{manager.creator}</td>
                                <td className="border px-2 py-2 text-center">
                                {manager.seq !== undefined && (
                                    <button onClick={() => deleteRow(index, String(manager.seq))} className="bg-red-500 text-white px-2 py-1 rounded-medium">
                                        삭제
                                    </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    
                </div>
            </div>
            
            {/* 버튼 영역 */}
            <div className='mt-6 flex justify-between items-center'>
                <Link to="/client/list" className='flex justify-center items-center space-x-2 px-3 py-2 border border-gray-300 hover:bg-gray-600 hover:text-white transition rounded'>
                    <ListEnd className='w-5 h-5'/>
                    <span>목록</span>
                </Link>

                <div className='flex justift-center items-center space-x-2'>
                    <div onClick={() => setShowManagerModal(true)} className='flex justify-center items-center space-x-2 px-3 py-2 bg-blue-500 text-white border border-gray-300 cursor-pointer hover:bg-blue-600 transition rounded'>
                        <Plus className='w-5 h-5'/>
                        <span>담당자 추가</span>
                    </div>

                    <Link to={`/clientModify/${clientSeq}`} className='flex justify-center items-center space-x-2 px-3 py-2 bg-orange-500 text-white border border-gray-300 hover:bg-blue-600 transition rounded'>
                        <SquarePen className='w-5 h-5'/>
                        <span>수정</span>
                    </Link>

                    <button onClick={(e) => handleClientDelete(e)} className='flex justify-center items-center space-x-2 px-3 py-2 bg-red-500 text-white border border-gray-300 hover:bg-blue-600 transition rounded'>
                        <Trash className='w-5 h-5'/>
                        <span>삭제</span>
                    </button>
                </div>
                
            </div>
        </div>
        </>
    )
}

export default ClientView;