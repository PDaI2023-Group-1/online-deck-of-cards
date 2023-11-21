dev:
	make -j2 start

deps:
	make -j2 install

start:
	cd frontend && npm start & cd backend/rest && npm run dev

install:
	cd frontend && npm i & cd backend/rest && npm i
	