
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY . .
RUN if [ -f "./mvnw" ]; then ./mvnw clean package -DskipTests; else apk add maven && mvn clean package -DskipTests; fi
CMD java -jar target/*.jar
        