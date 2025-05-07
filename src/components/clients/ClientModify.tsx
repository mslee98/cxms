import { useQuery } from '@tanstack/react-query';
import { ListEnd, Save } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { comCodeType } from '../../typings/common';
import Swal from 'sweetalert2';
import { fetchBizCode, fetchClientCategoryList, fetchIndClass } from '../../utils/comApiUtils';
import { tClient, tManager } from '../../typings/client';

const fetchClientFileInfo = async (atchFileId: string) => {
    const res = await fetch(`/pms/api/common/clientFiles/${atchFileId}.do`);
    if (!res.ok) {
        throw new Error('데이터 로드 오류');
    }
    return res.json();
}

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

const ClientModify = () => {

    const { clientSeq } = useParams<{ clientSeq?: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        clientNm: "",
        clientAddrMain: "",
        clientAddrDetail: "",
        clientAddr: "",
        bizTy: "",
        indClass: "",
        clientCategory: "",
        bizRegNo: "",
        creditRating: "",
        etcInfo: "",
        clientCd: "",
        atchFileId: "",
    });
    const managerRef = useRef(null);
    const [ daumModalYn, setDaumModalYn ] = useState(false)
    const [newManager, setNewManager] = useState<tManager>({
        name: '',
        position: '',
        extnNmbr: '',
        mblPhone: '',
        regNm: '',
    });
    const [managers, setManagers] = useState<tManager[]>([])
    const [ showManagerModal, setShowManagerModal] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [deletedFileSns, setDeletedFileSns] = useState<number[]>([]);
    const [deleteFileArr, setDeleteFileArr] = useState<string>('');

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

    useEffect(() => {
        if (clientInfo) {
            setFormData({
                clientNm: clientInfo.clientNm || "",
                clientAddrMain: clientInfo.clientAddrMain || "",
                clientAddrDetail: clientInfo.clientAddrDetail || "",
                clientAddr: clientInfo.clientAddr,
                bizTy: clientInfo.bizTy || "",
                indClass: clientInfo.indClass || "",
                clientCategory: clientInfo.clientCategory || "",
                bizRegNo: clientInfo.bizRegNo || "",
                creditRating: clientInfo.creditRating || "",
                etcInfo: clientInfo.etcInfo || "",
                clientCd: clientInfo.clientCd,
                atchFileId: clientInfo.atchFileId || "",
            });
        }
    }, [clientInfo]);

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

    const [clientFiles, setClientFiles] = useState<any[]>([]);
    
        useEffect(() => {
            if (clientInfo && clientInfo.atchFileId) {
                fetchClientFileInfo(clientInfo.atchFileId)
                    .then((files) => {
                        setClientFiles(files); // 조회된 파일 목록 상태에 저장
                    })
                    .catch((error) => {
                        console.error("파일 조회 오류:", error);
                    });
            }
        }, [clientInfo]); 

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {

        
            const fileForm = new FormData();
        
            selectedFiles.forEach(file => {
                fileForm.append('file', file);
            });
        
            if (deletedFileSns.length > 0) {
                // atchFileId와 fileSn을 결합하여 `${atchFileId};${fileSn}` 형식으로 전송
                const deleteFileArr = deletedFileSns.map(fileSn => `${clientInfo?.atchFileId};${fileSn}`).join(',');
                fileForm.append('deleteFileArr', deleteFileArr);
            }
        
            console.log("요청 atchFileId:", clientInfo?.atchFileId);
        
            const fnRes = await fetch(`/pms/api/common/clientFileInfo/${clientInfo?.atchFileId}.do`, {
                method: 'POST',
                body: fileForm,
            });
        
            if (!fnRes.ok) {
                const errorText = await fnRes.text();
                console.error("❌ 요청 실패:", fnRes.status, fnRes.statusText);
                console.error("❌ 응답 내용:", errorText);
                alert(`업로드 실패: ${fnRes.status}`);
                return;
            }
        
            const result = await fnRes.text();
            

            const dataToSend = {
                ...formData,
                clientAddr: formData.clientAddrMain + formData.clientAddrDetail
            };

            const response = await fetch(`/crm/client/info/${clientSeq}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend), // formData를 JSON으로 전송
            });

            if(clientSeq && managers) {

                const contactData = managers.map(manager => ({
                    ...manager,
                    clientSeq: clientSeq, // 담당자 등록할 때 clientSeq 추가
                }));


                const contactResponse = await fetch('/crm/client/contact/info-by-list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(contactData),
                });
            }

            Swal.fire({
                icon: 'success',
                title: '수정 완료',
                text: '고객 정보가 성공적으로 수정되었습니다.',
              }).then(() => {
                navigate(`/client/detail/${clientSeq}`);
              });

        } catch(error) {
            console.error('Error submitting form:', error);

            Swal.fire({
                icon: 'error',
                title: '오류 발생',
                text: '데이터 전송 중 오류가 발생했습니다.',
            });
        }
    
    }

    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value, 
        }));
    }, []);

    // 주소 선택 후 모달 닫기
    const handleComplete = (data: any) => {
        setFormData({
            ...formData,
            clientAddr: data.address,
            clientAddrMain: data.address, // 주소 필드에 선택된 주소를 설정
        });
        setDaumModalYn(false); // 주소 검색 모달 닫기
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files) {
                const fileArray = Array.from(files);
                setSelectedFiles((prev) => [...prev, ...fileArray]);
            }
        };

    const addRow = () => {
        const newRow = newManager;

        setManagers((prevManager) => {
            const updatedManagers = Array.isArray(prevManager) ? prevManager : [];
            return [...updatedManagers, newRow];
        });
        setNewManager({
            name: '',
            position: '',
            extnNmbr: '',
            mblPhone: '',
            regNm: ''
        });
        setShowManagerModal(false);
    }

    const deleteRow = (index: number) => {
        setManagers((prevManagers) => prevManagers.filter((_, i) => i !== index));
    }

    const handleDeleteExisting = (fileSn: number) => {
        // 삭제 배열 추가
        const newEntry = `${clientInfo?.atchFileId};${fileSn}`;
        setDeleteFileArr(prev =>
          prev ? `${prev},${newEntry}` : newEntry
        );
    
        // UI에서도 제거
        setDeletedFileSns(prev => [...prev, fileSn]);
      };

    return (
        <>
        {/* DaumPostcode 모달 */}
        {daumModalYn && (
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
                onClick={() => setDaumModalYn(false)} // 배경 클릭 시 모달 닫기
            >
                <div
                    className="bg-white p-6 rounded-lg shadow-lg w-[90%] sm:w-[60%] md:w-[50%] lg:w-[40%] xl:w-[30%]" // 크기 조정
                    onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 배경 클릭 방지
                >
                    <h2 className="text-xl font-bold mb-4">주소 검색</h2>
                    <DaumPostcode onComplete={handleComplete} />
                    <button
                        className="w-full py-2 bg-gray-500 text-white rounded mt-4"
                        onClick={() => setDaumModalYn(false)} // 모달 닫기
                    >
                        닫기
                    </button>
                </div>
            </div>
        )}

        {/* 담당자 등록 모달 */}
        {showManagerModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
                    <h2 className="text-lg font-semibold mb-4">고객사 담당자 등록/수정</h2>

                    <div className="space-y-3">
                        <input
                            className="w-full border px-3 py-2 rounded"
                            placeholder="성명"
                            value={newManager.name}
                            onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                        />
                        <input
                            className="w-full border px-3 py-2 rounded"
                            placeholder="직급"
                            value={newManager.position}
                            onChange={(e) => setNewManager({ ...newManager, position: e.target.value })}
                        />
                        <input
                            className="w-full border px-3 py-2 rounded"
                            placeholder="내선번호"
                            value={newManager.extnNmbr}
                            onChange={(e) => setNewManager({ ...newManager, extnNmbr: e.target.value })}
                        />
                        <input
                            className="w-full border px-3 py-2 rounded"
                            placeholder="휴대전화번호"
                            value={newManager.mblPhone}
                            onChange={(e) => setNewManager({ ...newManager, mblPhone: e.target.value })}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={() => setShowManagerModal(false)}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            취소
                        </button>
                        <button
                            onClick={addRow}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="w-full mx-auto p-6">
            <div className="grid grid-cols-[20rem_1fr_20rem_1fr] border-t border-gray-700">
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객사명</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <input
                        name='clientNm'
                        className="w-full h-10 p-2 outline-none border border-gray-300 rounded"
                        placeholder="고객사명을 입력하세요"
                        value={formData.clientNm}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객사 코드</label>
                </div>
                <div className="p-2 border-b border-gray-300">
                    <input
                        name='clientCd'
                        className="w-full h-10 p-2 outline-none border border-gray-300 bg-gray-300 rounded"
                        placeholder="고객사명을 입력하세요"
                        value={formData.clientCd}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
            </div>

            <div className="grid grid-cols-[20rem_1fr]">
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객사 주소</label>
                </div>

                <div className="p-2 border-b border-gray-300 space-y-2">
                    <div className="flex w-full gap-2">
                        <input
                            className="w-full h-10 p-2 outline-none border border-gray-300 rounded"
                            name="clientAddr"
                            value={formData.clientAddr}
                            onClick={() => setDaumModalYn(true)}
                        />
                        <button
                            type="button"
                            className="w-28 h-10 px-4 bg-blue-500 text-white hover:bg-blue-600 transition rounded"
                            onClick={() => setDaumModalYn(true)}
                        >
                            주소검색
                        </button>
                    </div>

                    <input
                        name="clientAddrDetail"
                        className="w-full h-10 p-2 outline-none border border-gray-300 rounded"
                        placeholder="상세주소를 입력하세요"
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-[20rem_1fr_20rem_1fr]">
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">기업형태</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <select
                        name="bizTy"
                        className="w-full h-10 p-2 outline-none border border-gray-300 rounded"
                        value={formData.bizTy}
                        onChange={handleChange}
                    >
                        <option>기업형태 선택</option>
                        {bizType && bizType.map((biz) => (
                            <option key={biz.code} value={biz.code}>{biz.codeNm}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">산업분류</label>
                </div>
                <div className="p-2 border-b border-gray-300">
                    <select
                        name="indClass"
                        className="w-full h-10 p-2 outline-none border border-gray-300 rounded"
                        value={formData.indClass}
                        onChange={handleChange}
                    >
                        <option>산업분류 선택</option>
                        {indClass && indClass.map((ind) => (
                            <option key={ind.code} value={ind.code}>{ind.codeNm}</option>
                        ))}
                    </select>
                </div>
            </div>


            <div className="grid grid-cols-[20rem_1fr_20rem_1fr]">
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객분류</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <select
                        name="clientCategory"
                        className="w-full h-10 p-2 outline-none border border-gray-300 rounded"
                        value={formData.clientCategory}
                        onChange={handleChange}
                    >
                        <option>고객분류 선택</option>
                        {clientCategory && clientCategory.map((category) => (
                            <option key={category.code} value={category.code}>{category.codeNm}</option>
                        ))}
                    </select>
                    <span className='text-xs text-red-500'>*계약업체 선택 시 사업자등록번호 및 사업자등록증 첨부 필수</span>
                </div>

                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">사업자등록번호</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <input
                        name="bizRegNo"
                        className="w-full h-10 p-2 outline-none border border-gray-300 rounded"
                        placeholder=""
                        value={formData.bizRegNo}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-[20rem_1fr_20rem_1fr]">
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">첨부파일</label>
                </div>

                <div className="p-4 border-b border-r border-gray-300 space-y-3">
                    {/* 파일 업로드 버튼 */}
                    <div className="flex items-center space-x-3">
                        <label
                        htmlFor="file-upload"
                        className="inline-block cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded"
                        >
                        파일 선택
                        </label>

                        <div className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 bg-white">
                        {selectedFiles.length > 0
                            ? `${selectedFiles.length}개의 파일 선택됨`
                            : '파일을 선택하세요'}
                        </div>

                        <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        />
                    </div>

                    {/* 새로 선택된 파일 목록 */}
                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <div
                            key={index}
                            className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                            >
                            <span className="truncate text-sm text-gray-800 max-w-[80%]">
                                {file.name}
                            </span>
                            <button
                                onClick={() =>
                                setSelectedFiles(prev => prev.filter((_, i) => i !== index))
                                }
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                삭제
                            </button>
                            </div>
                        ))}
                        </div>
                    )}

                    {/* 기존 파일 목록 */}
                    {clientFiles
                        .filter(file => !deletedFileSns.includes(file.fileSn))
                        .map(file => (
                        <div
                            key={file.fileSn}
                            className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                        >
                            <span className="truncate text-sm text-gray-800 max-w-[80%]">
                            {file.orignlFileNm}
                            </span>
                            <button
                                onClick={() => handleDeleteExisting(file.fileSn)}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                            삭제
                            </button>
                        </div>
                        ))}

                        {/* 서버로 전달할 삭제파일 목록 hidden input */}
                        <input
                            type="hidden"
                            id="deleteFileArr"
                            name="deleteFileArr"
                            value={deleteFileArr}
                        />
                    </div>

                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">신용도 평가</label>
                </div>

                <div className="p-2 border-b border-r border-gray-300">
                    <input
                        name="creditRating"
                        className="w-full h-10 p-2 outline-none border border-gray-300 rounded"
                        value={formData.creditRating ?? ""}
                        onChange={handleChange}
                    />
                </div>

            </div>

            <div className="grid grid-cols-[20rem_1fr]">
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">비고</label>
                </div>
                <div className="p-2 border-b border-r border-gray-300">
                    <textarea
                        name="etcInfo"
                        rows={4}
                        cols={4}
                        className="w-full p-2 outline-none border border-gray-300 rounded"
                        value={formData.etcInfo ?? ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-[20rem_1fr]">
                <div className="flex items-center justify-start bg-gray-50 px-4 border-b border-r border-gray-300">
                    <label className="font-medium text-lg">고객사 담당자</label>
                </div>
                
    
                <div className="p-4 border-b border-r border-gray-300 ">

                    <div className="flex justify-end mb-2">
                        <button
                            type="button"
                            onClick={() => setShowManagerModal(true)}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                        >
                            담당자 추가
                        </button>
                    </div>
                    

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
                        {managers && managers.map((manager, index) => (
                            <tr key={index}>
                                <td className="border px-2 py-2 text-center">{manager.name}</td>
                                <td className="border px-2 py-2 text-center">{manager.position}</td>
                                <td className="border px-2 py-2 text-center">{manager.extnNmbr}</td>
                                <td className="border px-2 py-2 text-center">{manager.mblPhone}</td>
                                <td className="border px-2 py-2 text-center">{manager.regNm}</td>
                                <td className="border px-2 py-2 text-center">
                                    <button onClick={() => deleteRow(index)} className="bg-red-500 text-white px-2 py-1 rounded-medium">삭제</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    
                </div>
            </div>

            <div className='mt-6 flex justify-between items-center'>
                <Link to="/client/list" className='flex justify-center items-center space-x-2 px-3 py-2 border border-gray-300 hover:bg-gray-600 hover:text-white transition rounded'>
                    <ListEnd className='w-5 h-5'/>
                    <span>목록</span>
                </Link>
                <button type="submit" className='flex justify-center items-center space-x-2 px-3 py-2 bg-blue-500 text-white border border-gray-300 hover:bg-blue-600 transition rounded'>
                    <Save className='w-5 h-5'/>
                    <span>수정</span>
                </button>
            </div>
        </form>
        </>
        
    )
}
export default ClientModify;