# --- Build stage ---
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy the gradle wrapper and build files first for layer caching
COPY gradlew gradlew
COPY gradle gradle
RUN chmod +x gradlew

COPY build.gradle settings.gradle ./
RUN ./gradlew dependencies --no-daemon || true

COPY src src
RUN ./gradlew build -x test --no-daemon

# --- Run stage ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
