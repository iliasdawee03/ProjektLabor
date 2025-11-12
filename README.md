# ProjektLabor

Álláshírdető full stack MVP három szerepkörrel (Admin, Company, JobSeeker), ASP.NET Core Web API backenddel és React + TypeScript frontenddel.

- Backend: ASP.NET Core 8, Entity Framework Core, Identity (JWT), SQL Server, Swagger
- Frontend: React + Vite + TypeScript, React Query, Tailwind CSS

Részletes projekt-dokumentáció (munkaterv, specifikációk, feladatfelosztás, eddigi munka):

- Word fájlban

Gyors indítás (lokálisan, Windows):

1) Backend (mappa: `ProjektLabor/ProjektLabor`)
	- Állítsd be az adatbázis kapcsolatot az `appsettings.json` fájlban
	- `dotnet ef database update` (adatbázis migrációk alkalmazása)
	- `dotnet run`

2) Frontend (mappa: `ProjektLabor/Frontend`)
	- `npm install`
	- `npm run dev`

Swagger UI: http(s)://localhost:PORT/swagger