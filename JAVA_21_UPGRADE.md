# Java 21 LTS Upgrade Documentation

## Overview
This project has been upgraded to use Java 21 LTS (Long-Term Support), which provides improved performance, security updates, and new language features.

## Configuration Changes

### 1. Maven Configuration (pom.xml)
- Set `<java.version>21</java.version>` in properties
- Added explicit Maven compiler plugin configuration:
  ```xml
  <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
          <source>21</source>
          <target>21</target>
          <release>21</release>
      </configuration>
  </plugin>
  ```

### 2. Docker Configuration
- Build stage uses: `maven:3.9.6-eclipse-temurin-21`
- Runtime stage uses: `eclipse-temurin:21-jre`

### 3. Development Environment
- Added `.java-version` files for tooling compatibility (jEnv, SDKMAN, etc.)
- Updated VS Code tasks to use Java 21 explicitly via `JAVA_HOME` environment variable

## Java 21 Installation

### Current JDK Installations
The system has the following Java 21 installations:
1. **Microsoft Build of OpenJDK 21.0.8** (Recommended)
   - Path: `/Library/Java/JavaVirtualMachines/microsoft-21.jdk/Contents/Home`
2. **Homebrew OpenJDK 21.0.7**
   - Path: `/usr/local/Cellar/openjdk@21/21.0.7/libexec/openjdk.jdk/Contents/Home`

## Building the Project

### Using Maven with Java 21
```bash
# Set JAVA_HOME to Java 21
export JAVA_HOME=/Library/Java/JavaVirtualMachines/microsoft-21.jdk/Contents/Home

# Build the project
cd backend
mvn clean install
```

### Using VS Code Tasks
The VS Code tasks have been configured to automatically use Java 21:
- `Build Backend` - Compiles the project with Java 21
- `Start Backend` - Runs the application with Java 21

## Running the Application

### Via Maven
```bash
cd backend
export JAVA_HOME=/Library/Java/JavaVirtualMachines/microsoft-21.jdk/Contents/Home
mvn spring-boot:run
```

### Via Docker
The Docker configuration automatically uses Java 21:
```bash
docker-compose -f infra/docker-compose.yml up --build
```

## Verification

### Check Java Version
```bash
# Verify JAVA_HOME
echo $JAVA_HOME

# Check Java version
java -version

# Build and verify
cd backend
mvn clean compile
```

Expected output should show: `Java version: 21.x.x`

## Dependencies Compatibility

All dependencies in the project have been verified to be compatible with Java 21:
- **Spring Boot**: 3.4.0 (full Java 21 support)
- **Spring Framework**: 6.x (Java 21 compatible)
- **MySQL Connector**: Latest version supports Java 21
- **JWT (jjwt)**: 0.12.6 (Java 21 compatible)
- **Stripe SDK**: 26.7.0 (Java 21 compatible)
- **AWS SDK**: 2.27.21 (Java 21 compatible)
- **TestContainers**: 1.20.1 (Java 21 compatible)

## Key Java 21 Features Available

Your project can now leverage Java 21 features:
1. **Virtual Threads** (Project Loom) - For improved concurrency
2. **Pattern Matching for switch** - Simplified code patterns
3. **Record Patterns** - Enhanced data handling
4. **Sequenced Collections** - New collection interfaces
5. **String Templates (Preview)** - Improved string handling

## Troubleshooting

### Issue: Maven uses different Java version
**Solution**: Set JAVA_HOME before running Maven commands
```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/microsoft-21.jdk/Contents/Home
mvn clean install
```

### Issue: IDE not recognizing Java 21
**Solution**: Configure IDE Java SDK:
- **VS Code**: Install "Extension Pack for Java" and set Java 21 as project JDK
- **IntelliJ IDEA**: File → Project Structure → Project SDK → Select Java 21

### Issue: Docker build fails
**Solution**: Ensure Docker has enough resources allocated (minimum 4GB RAM recommended)

## Migration Notes

- The project was previously configured for Java 21 in pom.xml
- This upgrade ensures consistent Java 21 usage across all build tools and environments
- No code changes were required as the codebase was already Java 21 compatible
- Build verification completed successfully

## Resources

- [Java 21 Documentation](https://docs.oracle.com/en/java/javase/21/)
- [Spring Boot 3.x Java 21 Support](https://spring.io/blog/2023/09/09/all-together-now-spring-boot-3-2-graalvm-native-images-java-21-and-virtual)
- [Java 21 Features](https://openjdk.org/projects/jdk/21/)
