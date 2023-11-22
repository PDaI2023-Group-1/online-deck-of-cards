dev:
	make -j3 start

deps:
	make -j3 install

start:
	cd frontend && npm start & cd backend/rest && npm run dev & cd backend/ws && npm run dev

install:
	cd frontend && npm i & cd backend/rest && npm i & cd backend/ws && npm i
	