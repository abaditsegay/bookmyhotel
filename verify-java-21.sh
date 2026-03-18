#!/bin/bash
# Quick Java 21 Verification Script
# Run this script to verify your Java 21 setup

echo "🔍 BookMyHotel Java 21 Verification"
echo "===================================="
echo ""

# Check if JAVA_HOME is set
if [ -z "$JAVA_HOME" ]; then
    echo "❌ JAVA_HOME is not set"
    echo "💡 Run: source backend/set-java-21.sh"
    echo ""
else
    echo "✅ JAVA_HOME is set: $JAVA_HOME"
    echo ""
fi

# Check Java version
echo "📦 Java Version:"
java -version 2>&1 | head -n 1
echo ""

# Check Maven version
echo "📦 Maven Version:"
mvn --version | grep "Apache Maven"
mvn --version | grep "Java version"
echo ""

# Verify JAR build
if [ -f "backend/target/backend-1.0.0.jar" ]; then
    echo "✅ Built JAR found"
    echo "📄 JAR Build Info:"
    unzip -p backend/target/backend-1.0.0.jar META-INF/MANIFEST.MF | grep "Build-Jdk-Spec"
else
    echo "ℹ️  No JAR found (run 'mvn clean package' to build)"
fi
echo ""

# Check .java-version
if [ -f ".java-version" ]; then
    echo "✅ .java-version file exists: $(cat .java-version)"
else
    echo "❌ .java-version file not found"
fi
echo ""

# Check if on correct Java version
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | awk -F '.' '{print $1}')
if [ "$JAVA_VERSION" = "21" ]; then
    echo "✅ Java 21 is active"
else
    echo "⚠️  Warning: Java $JAVA_VERSION is active (expected Java 21)"
    echo "💡 Run: source backend/set-java-21.sh"
fi
echo ""

echo "===================================="
echo "📖 For more information, see:"
echo "   - JAVA_21_UPGRADE.md"
echo "   - JAVA_21_UPGRADE_SUMMARY.md"
