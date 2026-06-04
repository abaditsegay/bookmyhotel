#!/bin/bash

# Script to set Java 25 environment for BookMyHotel project

# Keep this script name for backward compatibility, but configure Java 25.
if [ -d "/Users/samuel/.jdk/jdk-25.0.2/jdk-25.0.2+10/Contents/Home" ]; then
	export JAVA_HOME=/Users/samuel/.jdk/jdk-25.0.2/jdk-25.0.2+10/Contents/Home
elif [ -d "/Library/Java/JavaVirtualMachines/microsoft-25.jdk/Contents/Home" ]; then
	export JAVA_HOME=/Library/Java/JavaVirtualMachines/microsoft-25.jdk/Contents/Home
else
	echo "❌ Java 25 JDK not found. Install Java 25 and update this script path."
	return 1 2>/dev/null || exit 1
fi

export PATH=$JAVA_HOME/bin:$PATH

echo "✅ Java environment configured for Java 25"
echo "JAVA_HOME: $JAVA_HOME"
echo ""
java -version
echo ""
echo "You can now run Maven commands with Java 25:"
echo "  mvn clean install"
echo "  mvn spring-boot:run"
echo "  mvn test"
