export const fetchBizCode = async () => {
    const res = await fetch('/pms/api/common/biztype.do');
    if (!res.ok) {
        throw new Error('데이터 로드 오류');
    }
    return res.json();
};

export const fetchIndClass = async () => {
    const res = await fetch('/pms/api/common/indClassList.do');
    if (!res.ok) {
        throw new Error('데이터 로드 오류');
    }
    return res.json();
}

export const fetchClientCategoryList = async () => {
    const res = await fetch('/pms/api/common/clientCategoryList.do');
    if (!res.ok) {
        throw new Error('데이터 로드 오류');
    }
    return res.json();
}