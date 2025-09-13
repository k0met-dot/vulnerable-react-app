#!/bin/bash

# 1. MongoDB 데이터 디렉토리 생성
mkdir -p /data/db

# 2. MongoDB 서버를 백그라운드에서 실행
# --fork: 백그라운드 실행, --logpath: 로그 파일 경로 지정
mongod --fork --logpath /var/log/mongodb/mongod.log

# 3. 백엔드 서버 실행
# Node.js 서버를 실행하여 API 요청을 처리하고 프론트엔드 파일을 제공
cd /app/backend && node server.js