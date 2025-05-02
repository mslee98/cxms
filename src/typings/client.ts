export interface tClient {
    clientAddrMain?: string;
    clientAddrDetail: string;
    regId: string | null; // ID는 nullable string일 수 있음
    regDt: string; // 날짜는 ISO 8601 형식의 문자열
    modId: string | null; // ID는 nullable string일 수 있음
    modDt: string; // 날짜는 ISO 8601 형식의 문자열
    clientSeq: number; // 시퀀스 번호는 숫자
    clientCd: string; // 고객 코드
    clientNm: string; // 고객명
    clientAddr: string; // 고객 주소
    bizTy: string; // 사업 유형
    indClass: string; // 산업 분류
    clientCategory: string; // 고객 카테고리 (비어있을 수 있음)
    bizRegNo: string; // 사업자 등록 번호
    etcInfo: string | null; // 기타 정보 (null일 수 있음)
    atchFileId: string | null; // 첨부 파일 ID (null일 수 있음)
    creditRating: string | null; // 신용 등급 (null일 수 있음)
}

export type tManager = {
    name: string;
    position: string;
    extnNmbr: string;
    mblPhone: string;
    creator: string;
    seq?: string;
};