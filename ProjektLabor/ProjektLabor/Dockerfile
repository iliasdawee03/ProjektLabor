# Backend Dockerfile for ASP.NET Core 9 API
# Multi-arch friendly (linux/amd64, linux/arm64) for Raspberry Pi 4+

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Use HTTP (no HTTPS) inside container; reverse proxy / Cloudflare Tunnel will terminate TLS
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# IMPORTANT: docker-compose build context is ./ProjektLabor, so the csproj is directly here
COPY ProjektLabor.csproj ./
RUN dotnet restore "ProjektLabor.csproj"

# Copy the remaining source from the current context
COPY . ./

RUN dotnet publish "ProjektLabor.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Default connection strings and JWT settings can be overridden by environment variables
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "ProjektLabor.dll"]
