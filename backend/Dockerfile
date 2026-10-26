FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY FashionStore.sln ./
COPY FashionStore.Domain/FashionStore.Domain.csproj FashionStore.Domain/
COPY FashionStore.Application/FashionStore.Application.csproj FashionStore.Application/
COPY FashionStore.Infrastructure/FashionStore.Infrastructure.csproj FashionStore.Infrastructure/
COPY FashionStore.Api/FashionStore.Api.csproj FashionStore.Api/
COPY FashionStore.Tests/FashionStore.Tests.csproj FashionStore.Tests/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Run tests during build
RUN dotnet test FashionStore.Tests/FashionStore.Tests.csproj -c Release

# Publish API
RUN dotnet publish FashionStore.Api/FashionStore.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FashionStore.Api.dll"]
