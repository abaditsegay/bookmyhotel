#!/bin/bash

# Simple HTML to PDF converter for BookMyHotel Demo
echo "🚀 BookMyHotel Demo PDF Generator"
echo "================================="

INPUT_HTML="BookMyHotel-E2E-Test-Demo-Presentation.html"
OUTPUT_PDF="BookMyHotel-E2E-Test-Demo-Presentation.pdf"

# Check if input file exists
if [ ! -f "$INPUT_HTML" ]; then
    echo "❌ Error: $INPUT_HTML not found"
    exit 1
fi

echo "📄 Converting HTML presentation to PDF..."

# Method 1: Try using system's built-in print-to-PDF (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Using macOS native HTML to PDF conversion..."
    
    # Use textutil or try wkhtmltopdf if available
    if command -v wkhtmltopdf &> /dev/null; then
        echo "📦 Using wkhtmltopdf for high-quality conversion..."
        wkhtmltopdf \
            --page-size A4 \
            --margin-top 15mm \
            --margin-bottom 15mm \
            --margin-left 10mm \
            --margin-right 10mm \
            --print-media-type \
            --enable-local-file-access \
            --javascript-delay 1000 \
            "$INPUT_HTML" "$OUTPUT_PDF"
    else
        echo "⚠️  wkhtmltopdf not found. Trying alternative methods..."
        
        # Alternative: Use Chrome/Chromium headless
        if command -v google-chrome &> /dev/null; then
            echo "🌐 Using Chrome headless for PDF conversion..."
            google-chrome --headless --disable-gpu --print-to-pdf="$OUTPUT_PDF" "$INPUT_HTML"
        elif command -v chromium &> /dev/null; then
            echo "🌐 Using Chromium headless for PDF conversion..."
            chromium --headless --disable-gpu --print-to-pdf="$OUTPUT_PDF" "$INPUT_HTML"
        elif command -v /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome &> /dev/null; then
            echo "🌐 Using Chrome.app for PDF conversion..."
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --print-to-pdf="$OUTPUT_PDF" "$INPUT_HTML"
        else
            echo "📝 Creating instructions for manual conversion..."
            cat > "PDF_CONVERSION_INSTRUCTIONS.txt" << EOF
📄 BookMyHotel Demo PDF Conversion Instructions
=============================================

Since automated PDF conversion tools are not available, please follow these steps:

OPTION 1: Browser Print-to-PDF (Recommended)
1. Open: BookMyHotel-E2E-Test-Demo-Presentation.html in your web browser
2. Press Cmd+P (Mac) or Ctrl+P (Windows/Linux)
3. Select "Save as PDF" as destination
4. Choose appropriate settings:
   - Layout: Portrait
   - Paper size: A4
   - Margins: Default
   - Scale: 100%
5. Save as: BookMyHotel-E2E-Test-Demo-Presentation.pdf

OPTION 2: Install wkhtmltopdf (For Future Use)
macOS: brew install wkhtmltopdf
Ubuntu: sudo apt-get install wkhtmltopdf
Windows: Download from https://wkhtmltopdf.org/downloads.html

OPTION 3: Online Conversion
1. Upload HTML file to online converter like:
   - https://html-pdf-convert.com/
   - https://www.sejda.com/html-to-pdf
2. Download the resulting PDF

The HTML file is fully styled and print-optimized for professional presentation use.
EOF
            echo "📋 Created PDF_CONVERSION_INSTRUCTIONS.txt with manual steps"
            echo "🌐 You can open the HTML file directly in your browser and print to PDF"
            echo ""
            echo "📖 To open the HTML presentation:"
            echo "   macOS: open BookMyHotel-E2E-Test-Demo-Presentation.html"
            echo "   Linux: xdg-open BookMyHotel-E2E-Test-Demo-Presentation.html"
            echo "   Windows: start BookMyHotel-E2E-Test-Demo-Presentation.html"
        fi
    fi
fi

# Check if PDF was created successfully
if [ -f "$OUTPUT_PDF" ]; then
    echo ""
    echo "✅ PDF created successfully!"
    echo "📄 File: $OUTPUT_PDF"
    echo "📊 Size: $(du -h "$OUTPUT_PDF" | cut -f1)"
    echo ""
    echo "🎯 Ready for demo and presentation!"
    echo ""
    echo "📖 To open the PDF:"
    echo "   macOS: open \"$OUTPUT_PDF\""
    echo "   Linux: xdg-open \"$OUTPUT_PDF\""
    echo "   Windows: start \"$OUTPUT_PDF\""
else
    echo ""
    echo "📱 HTML presentation is ready for use!"
    echo "📄 File: $INPUT_HTML"
    echo ""
    echo "🌐 To view the presentation:"
    echo "   macOS: open \"$INPUT_HTML\""
    echo "   Linux: xdg-open \"$INPUT_HTML\""
    echo "   Windows: start \"$INPUT_HTML\""
    echo ""
    echo "💡 The HTML file is print-optimized. Use Cmd+P/Ctrl+P to save as PDF"
fi

echo ""
echo "🚀 Demo presentation ready!"