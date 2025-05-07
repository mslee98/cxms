

/**
 * PMS comCode용 (Biz, IndClass, ClientCategory)
 */
export interface comCodeType {
    code: string;
    codeNm: string;
    codeOrdr: string;
    codeValue: string;
    deleteAt: string | null;
    firstIndex: number;
    groupCode: string;
    lastIndex: number;
    multiSearchParam: any; // 필요 시 구체적 타입 지정
    ordrType: string;
    pageIndex: number;
    pageSize: number;
    pageUnit: number;
    pagingYn: string;
    pmHnfId: any; // 필요 시 구체적 타입 지정
    recordCountPerPage: number;
    registDe: string; // ISO 날짜 문자열
    rm1: any; // 필요 시 구체적 타입 지정
    searchCondition: string;
    searchCondition2: string;
    searchCondition3: string;
    searchEndDate: string;
    searchKeyword: string;
    searchKeywordFrom: string;
    searchKeywordTo: string;
    searchStartDate: string;
    searchUseYn: string;
    searchYear: string;
    updtDe: string;
    useAt: string;
  }