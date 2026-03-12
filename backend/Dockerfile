# =============================================================================
# STAGE 1 — BUILD
# Uses the full JDK image to compile and package the Spring Boot application.
# This stage is discarded after the final image is assembled, so build tools
# (Gradle, JDK compiler, downloaded dependencies) never ship to production.
# =============================================================================
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy the Gradle wrapper scripts and wrapper config first.
# Doing this before copying source code allows Docker to cache the dependency
# download layer — it only re-runs when build.gradle or settings.gradle change,
# not on every source code change.
COPY gradlew gradlew
COPY gradle gradle
RUN chmod +x gradlew

# Copy build scripts and pre-download all dependencies into the layer cache.
# The '|| true' ensures the build doesn't fail if the network is slow;
# the actual compilation step below will catch any real dependency errors.
COPY build.gradle settings.gradle ./
RUN ./gradlew dependencies --no-daemon || true

# Copy application source and run the full build.
# '-x test' skips unit tests during the Docker build (run them in CI instead).
# '--no-daemon' prevents Gradle from spawning a background daemon inside Docker.
COPY src src
RUN ./gradlew build -x test --no-daemon

# =============================================================================
# STAGE 2 — RUN
# Uses a minimal JRE-only image. The JRE can execute Java but cannot compile it,
# making the final image significantly smaller than if the JDK were used.
# Only the compiled JAR from Stage 1 is copied across.
# =============================================================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Pull only the packaged JAR from the build stage — nothing else.
COPY --from=build /app/build/libs/*.jar app.jar

# Inform Docker (and docker-compose) that the container listens on port 8080.
EXPOSE 8080

# Run the Spring Boot JAR directly with the JVM.
ENTRYPOINT ["java", "-jar", "app.jar"]
