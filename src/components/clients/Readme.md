

// 고객사 삭제하면 comtnfile / comtnfilrDetail도 삭제 필요

파일 저장은 PMS쪽에서 저장을 하고 COMTNFILE.ATCH_FILE_ID를 반환받아 CRM CLIENT에 저장하는 방식임
경로는 어쩔 수 없이 내 로컬 환경 경로로했음

파일 저장 경로는 
Globals.fileStorePath 정의

// Alais 추가 
public class Globals {
    public static final String FILE_STORE_PATH = EgovProperties.getProperty("Globals.fileStorePath");
}

파일 업로드는 
EgovFileMngUtil egovFileMngUtil 사용

파일 암호화하는 부분 주석처리 해둠 복호화 가이드 없어서
public List<FileVO> parseFileInf(Map<String, MultipartFile> files, String KeyStr, int fileKeyParam, String atchFileId, String storePath) throws FdlException, IllegalStateException, IOException {
		int fileKey = fileKeyParam;

		String storePathString = "";
		String atchFileIdString = "";

		if ("".equals(storePath) || storePath == null) {
			storePathString = EgovProperties.getProperty("Globals.fileStorePath");
		} else {
			storePathString = EgovProperties.getProperty(storePath);
		}

		if ("".equals(atchFileId) || atchFileId == null) {
			atchFileIdString = idgenService.getNextStringId();
		} else {
			atchFileIdString = atchFileId;
		}

		File saveFolder = new File(EgovWebUtil.filePathBlackList(storePathString));

		if (!saveFolder.exists() || saveFolder.isFile()) {
			if (saveFolder.mkdirs()) {
				System.out.println("[file.mkdirs] saveFolder : Creation Success ");
			} else {
				System.out.println("[file.mkdirs] saveFolder : Creation Fail ");
			}
		}

		Iterator<Entry<String, MultipartFile>> itr = files.entrySet().iterator();
		MultipartFile file;
		String filePath = "";
		List<FileVO> result = new ArrayList<FileVO>();
		FileVO fvo;

		while (itr.hasNext()) {
			Entry<String, MultipartFile> entry = itr.next();

			file = entry.getValue();
			String orginFileName = file.getOriginalFilename();

			if (!StringUtils.hasText(orginFileName)) {
				continue;
			}

			int index = orginFileName.lastIndexOf(".");
			String fileExt = orginFileName.substring(index + 1);
			String newName = KeyStr + getTimeStamp() + fileKey;
			long size = file.getSize();

			// 로그 추가: 파일명과 확장자 확인
			System.out.println("Original File Name: " + orginFileName);
			System.out.println("File Extension: " + fileExt);

			if (StringUtils.hasText(orginFileName)) {
				String oriFilePath = storePathString + File.separator + newName + "." + fileExt;

				// 로그 추가: 파일 저장 경로 확인
				System.out.println("Saving File to Path: " + oriFilePath);

				file.transferTo(new File(EgovWebUtil.filePathBlackList(oriFilePath)));

				// 로그 추가: 파일 저장 후 확인
				System.out.println("File saved successfully: " + oriFilePath);

				// 암호화 로직 -- 우선 주석처리함
//				if (!FileUtil.fileEncoding(storePathString + File.separator, newName + "." + fileExt)) {
//					System.out.println("파일 암호화 실패: " + oriFilePath);
//					continue;
//				} else {
//					System.out.println("파일 암호화 성공: " + oriFilePath);
//				}
			}

			fvo = new FileVO();
			fvo.setFileExtsn(fileExt);
			fvo.setFileStreCours(storePathString);
			fvo.setFileMg(Long.toString(size));
			fvo.setOrignlFileNm(orginFileName);
			fvo.setStreFileNm(newName);
			fvo.setAtchFileId(atchFileIdString);
			fvo.setFileSn(String.valueOf(fileKey));

			// 로그 추가: FileVO 내용 확인
			LOGGER.debug("FileVO Created: " + fvo);

			result.add(fvo);

			fileKey++;
		}

		return result;
	}