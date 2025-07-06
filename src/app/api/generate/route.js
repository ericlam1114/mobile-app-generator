import { NextResponse } from 'next/server';
import { generateAppCode } from '../../templates/templateGenerator.js';
import { parseUserRequest, parseModificationRequest } from '../../../utils/aiParser.js';
import JSZip from 'jszip';

export async function POST(request) {
  try {
    const { userInput, downloadType, customFiles, existingCode, isModification } = await request.json();
    
    if (!userInput) {
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      );
    }

    // Handle modification requests differently
    if (isModification && existingCode) {
      try {
        // Parse the modification request
        const modifications = await parseModificationRequest(userInput, existingCode);
        
        // Apply modifications to existing code
        const modifiedApp = {
          ...existingCode,
          files: modifications.files,
          customizations: modifications.customizations || existingCode.customizations
        };
        
        return NextResponse.json({
          ...modifiedApp,
          isModification: true,
          modificationSummary: modifications.summary
        });
      } catch (modError) {
        console.error('Modification error:', modError);
        // Fall back to regenerating the entire app
      }
    }

    // Parse the user request for new app generation
    const parsed = await parseUserRequest(userInput);
    
    // Generate the app code using the new template generator
    const generatedApp = generateAppCode(parsed.template, parsed.customizations);
    
    if (!generatedApp) {
      return NextResponse.json(
        { error: 'Failed to generate app' },
        { status: 400 }
      );
    }

    const appName = parsed.customizations.businessName.replace(/\s+/g, '') + 'App';

    // If downloadType is 'zip', create and return zip file
    if (downloadType === 'zip') {
      const zip = new JSZip();
      
      // Use custom files if provided (from code editor), otherwise use generated files
      const filesToZip = customFiles || generatedApp.files;
      
      // Add all files to the zip
      Object.entries(filesToZip).forEach(([filename, content]) => {
        zip.file(filename, content);
      });
      
      // Generate the zip file
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      
      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${appName}.zip"`,
        },
      });
    }

    // Default: return JSON response for preview
    const result = {
      appName,
      template: generatedApp.name,
      features: generatedApp.features,
      files: generatedApp.files,
      customizations: parsed.customizations,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error generating app:', error);
    return NextResponse.json(
      { error: 'Failed to generate app', details: error.message },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    message: 'Mobile App Generator API',
    endpoints: {
      'POST /api/generate': 'Generate mobile app code from user input'
    }
  });
}