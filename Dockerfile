# 1. 베이스 이미지 선택 (Ubuntu 22.04 LTS)
FROM ubuntu:22.04

# 환경 변수 설정 (패키지 설치 시 대화형 프롬프트 방지)
ENV DEBIAN_FRONTEND=noninteractive

# 2. 시스템 패키지 업데이트 및 필수 도구 설치
RUN apt-get update && apt-get install -y curl gnupg nodejs npm

# 3. MongoDB 설치
# MongoDB의 공식 GPG 키를 가져와서 추가
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
   --dearmor
# MongoDB를 다운로드할 소스 리스트 추가
RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | \
   tee /etc/apt/sources.list.d/mongodb-org-6.0.list
# 패키지 리스트 다시 업데이트하고 MongoDB 설치
RUN apt-get update && apt-get install -y mongodb-org

# 4. 작업 디렉토리 생성 및 설정
WORKDIR /app

# 5. 프로젝트 파일 복사
# 백엔드와 프론트엔드 폴더를 컨테이너 안으로 복사
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# 6. 백엔드/프론트엔드 의존성 설치
RUN cd /app/backend && npm install
RUN cd /app/frontend && npm install

# 7. React 프론트엔드 빌드
# 사용자가 접속할 정적 파일(HTML, JS, CSS)을 생성하는 과정
RUN cd /app/frontend && npm run build

# 8. 컨테이너 외부로 노출할 포트 설정
# 백엔드 서버가 5000번 포트를 사용하므로 외부와 연결
EXPOSE 5000

# 9. 시작 스크립트 복사 및 실행 권한 부여
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 10. 컨테이너가 시작될 때 실행할 최종 명령어
CMD ["/app/start.sh"]
