import OpenAI from 'openai';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export const parseUserRequest = async (userInput) => {
  // If OpenAI is available, use it for better parsing
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that analyzes user requests for mobile app generation. 
            
Based on the user's description, determine:
1. The best template type (restaurant, business, ecommerce, fitness, directory)
2. Extract customizations like business name, colors, and specific features

Available templates:
- restaurant: For food service, restaurants, cafes, food delivery
- business: For professional services, clinics, consulting, general business
- ecommerce: For online stores, product catalogs, shopping
- fitness: For gyms, wellness, workout tracking, health apps
- directory: For listings, directories, marketplace, search-based apps

Respond with ONLY a JSON object in this format:
{
  "template": "template_name",
  "customizations": {
    "businessName": "extracted_name",
    "primaryColor": "#hexcode",
    "secondaryColor": "#hexcode",
    "backgroundColor": "#hexcode",
    "features": ["feature1", "feature2"]
  }
}

If you can't determine something, use sensible defaults.`
          },
          {
            role: "user",
            content: userInput
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      return parsed;
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      // Fall back to simple parsing
      return fallbackParsing(userInput);
    }
  }
  
  // Fall back to simple keyword matching
  return fallbackParsing(userInput);
};

export const parseModificationRequest = async (userInput, existingCode) => {
  const lowerInput = userInput.toLowerCase();
  const modifiedFiles = { ...existingCode.files };
  let summary = '';
  
  // Check for color change requests
  if (lowerInput.includes('change') && (lowerInput.includes('color') || lowerInput.includes('theme'))) {
    const newCustomizations = extractCustomizations(userInput);
    
    // Update colors in all files
    Object.keys(modifiedFiles).forEach(filename => {
      let content = modifiedFiles[filename];
      
      // Replace color values in style definitions
      if (existingCode.customizations.primaryColor) {
        content = content.replace(
          new RegExp(existingCode.customizations.primaryColor, 'g'), 
          newCustomizations.primaryColor
        );
      }
      if (existingCode.customizations.secondaryColor) {
        content = content.replace(
          new RegExp(existingCode.customizations.secondaryColor, 'g'), 
          newCustomizations.secondaryColor
        );
      }
      if (existingCode.customizations.backgroundColor) {
        content = content.replace(
          new RegExp(existingCode.customizations.backgroundColor, 'g'), 
          newCustomizations.backgroundColor
        );
      }
      
      modifiedFiles[filename] = content;
    });
    
    summary = `Changed colors to: Primary ${newCustomizations.primaryColor}, Secondary ${newCustomizations.secondaryColor}`;
    
    return {
      files: modifiedFiles,
      customizations: { ...existingCode.customizations, ...newCustomizations },
      summary
    };
  }
  
  // Check for adding new features
  if (lowerInput.includes('add') || lowerInput.includes('include')) {
    // Handle adding new screens or features
    if (lowerInput.includes('screen') || lowerInput.includes('page')) {
      summary = 'Added new screen functionality';
      // This would need more complex logic to actually add new screens
    }
    
    // Handle adding new menu items for restaurant apps
    if (existingCode.template === 'Restaurant App' && (lowerInput.includes('menu') || lowerInput.includes('item'))) {
      const menuScreenFile = 'screens/MenuScreen.js';
      if (modifiedFiles[menuScreenFile]) {
        // Extract item details from the request
        const itemMatch = userInput.match(/add\s+(.+?)\s+(?:for|at|priced at)?\s*\$?(\d+(?:\.\d{2})?)/i);
        if (itemMatch) {
          const itemName = itemMatch[1].trim();
          const itemPrice = parseFloat(itemMatch[2]);
          
          // Add new item to the menu array
          const menuItemsMatch = modifiedFiles[menuScreenFile].match(/const menuItems = \[([\s\S]*?)\];/);
          if (menuItemsMatch) {
            const existingItems = menuItemsMatch[1];
            const lastId = (existingItems.match(/id:\s*(\d+)/g) || []).length;
            const newItem = `\n  { id: ${lastId + 1}, name: '${itemName}', price: ${itemPrice}, description: 'Delicious ${itemName.toLowerCase()}' },`;
            
            modifiedFiles[menuScreenFile] = modifiedFiles[menuScreenFile].replace(
              /const menuItems = \[([\s\S]*?)\];/,
              `const menuItems = [${existingItems}${newItem}\n];`
            );
            
            summary = `Added "${itemName}" to the menu for $${itemPrice}`;
          }
        }
      }
    }
  }
  
  // Check for text/content changes
  if (lowerInput.includes('change') && (lowerInput.includes('text') || lowerInput.includes('title') || lowerInput.includes('name'))) {
    // Extract what to change
    const changeMatch = userInput.match(/change\s+(?:the\s+)?(.+?)\s+to\s+["']?(.+?)["']?$/i);
    if (changeMatch) {
      const whatToChange = changeMatch[1].toLowerCase();
      const newValue = changeMatch[2];
      
      // Update business name
      if (whatToChange.includes('name') || whatToChange.includes('title')) {
        Object.keys(modifiedFiles).forEach(filename => {
          modifiedFiles[filename] = modifiedFiles[filename].replace(
            new RegExp(existingCode.customizations.businessName, 'g'),
            newValue
          );
        });
        
        summary = `Changed business name to "${newValue}"`;
        
        return {
          files: modifiedFiles,
          customizations: { ...existingCode.customizations, businessName: newValue },
          summary
        };
      }
    }
  }
  
  // If no specific modification was understood, return original with a note
  return {
    files: modifiedFiles,
    customizations: existingCode.customizations,
    summary: 'No specific changes were made. Try being more specific about what you want to change.'
  };
};

const fallbackParsing = (userInput) => {
  const input = userInput.toLowerCase();
  
  // Simple keyword matching - fallback when OpenAI is not available
  if (input.includes('restaurant') || input.includes('food') || input.includes('menu') || input.includes('order') || input.includes('pizza') || input.includes('cafe')) {
    return {
      template: 'restaurant',
      customizations: extractCustomizations(userInput)
    };
  } else if (input.includes('business') || input.includes('service') || input.includes('company') || input.includes('clinic') || input.includes('office')) {
    return {
      template: 'business',
      customizations: extractCustomizations(userInput)
    };
  } else if (input.includes('shop') || input.includes('store') || input.includes('buy') || input.includes('sell') || input.includes('product') || input.includes('ecommerce')) {
    return {
      template: 'ecommerce',
      customizations: extractCustomizations(userInput)
    };
  } else if (input.includes('fitness') || input.includes('gym') || input.includes('workout') || input.includes('health') || input.includes('wellness')) {
    return {
      template: 'fitness',
      customizations: extractCustomizations(userInput)
    };
  } else if (input.includes('directory') || input.includes('listing') || input.includes('search') || input.includes('find') || input.includes('browse')) {
    return {
      template: 'directory',
      customizations: extractCustomizations(userInput)
    };
  }
  
  // Default to restaurant if unclear
  return {
    template: 'restaurant',
    customizations: extractCustomizations(userInput)
  };
};
  
  export const extractCustomizations = (userInput) => {
    const customizations = {
      primaryColor: '#007AFF',
      secondaryColor: '#FF3B30',
      backgroundColor: '#F2F2F7',
      businessName: 'My Business'
    };
  
    // Extract business name - look for patterns like "called X", "named X", "for X"
    const namePatterns = [
      /(?:called|named)\s+([^,.\n!?]+)/i,
      /(?:for|app for)\s+([^,.\n!?]+)/i,
      /(?:building|build|create|make).*?(?:for|called)\s+([^,.\n!?]+)/i
    ];
  
    for (const pattern of namePatterns) {
      const match = userInput.match(pattern);
      if (match) {
        let name = match[1].trim();
        // Clean up common suffixes
        name = name.replace(/\s+(app|application|mobile app)$/i, '');
        customizations.businessName = name;
        break;
      }
    }
  
    // Extract colors with more variations
    const colorPatterns = {
      red: '#FF3B30',
      blue: '#007AFF', 
      green: '#34C759',
      purple: '#AF52DE',
      orange: '#FF9500',
      pink: '#FF2D92',
      yellow: '#FFCC00',
      teal: '#5AC8FA',
      indigo: '#5856D6'
    };
  
    const lowerInput = userInput.toLowerCase();
    Object.entries(colorPatterns).forEach(([color, hex]) => {
      if (lowerInput.includes(color)) {
        customizations.primaryColor = hex;
        // Set a complementary secondary color
        customizations.secondaryColor = adjustColor(hex, -20);
      }
    });
  
    return customizations;
  };
  
  export const applyCustomizations = (code, customizations) => {
    return code
      .replace(/THEME_PRIMARY/g, customizations.primaryColor)
      .replace(/THEME_SECONDARY/g, customizations.secondaryColor)
      .replace(/THEME_BACKGROUND/g, customizations.backgroundColor)
      .replace(/BUSINESS_NAME/g, customizations.businessName);
  };
  
  // Helper function to adjust color brightness
  const adjustColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };