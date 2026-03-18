#!/bin/bash

# Script to set Java 21 environment for BookMyHotel project

# Set JAVA_HOME to Java 21
export JAVA_HOME=/Library/Java/JavaVirtualMachines/microsoft-21.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

echo "✅ Java environment configured for Java 21"
echo "JAVA_HOME: $JAVA_HOME"
echo ""
java -version
echo ""
echo "You can now run Maven commands with Java 21:"
echo "  mvn clean install"
echo "  mvn spring-boot:run"
echo "  mvn test"
