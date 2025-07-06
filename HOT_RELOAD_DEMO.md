# Hot Reload Demo Guide

## How Chat-Based Hot Reload Works

The application now supports hot reload when users request changes via chat. Here's how it works:

### 1. Initial App Generation
- Go to `http://localhost:3000`
- Enter: "Build me a restaurant app called Pizza Palace with red colors"
- Click send or press Enter
- The app will be generated and you'll be redirected to the project page

### 2. Making Live Changes via Chat

Once your app is generated, you can modify it using natural language commands:

#### **Change Colors**
- Type: "Change the color to blue"
- The app will instantly update with blue as the primary color
- No page reload needed!

#### **Change Business Name**
- Type: "Change the name to Mario's Pizza"
- All instances of the business name will update throughout the app

#### **Add Menu Items** (for restaurant apps)
- Type: "Add Pepperoni Pizza for $15.99"
- A new menu item will be added to the menu screen
- The preview updates immediately

### 3. How It Works Technically

1. **Smart Detection**: The system detects whether you're creating a new app or modifying an existing one
2. **Targeted Updates**: Instead of regenerating the entire app, it only updates the specific parts you requested
3. **Live Preview**: Changes are immediately reflected in the preview without losing your current state
4. **Code Sync**: The code editor also updates to show the modified code

### 4. Supported Modifications

Currently supported modification commands:
- **Color changes**: "change color to [color]", "make it [color]", "use [color] theme"
- **Name changes**: "change the name to [new name]", "rename to [new name]"
- **Menu items** (restaurant apps): "add [item name] for $[price]"
- More features coming soon!

### 5. Tips for Best Results

- Be specific in your requests
- Use clear action words like "change", "add", "update", "modify"
- For colors, use common color names (red, blue, green, purple, orange, etc.)
- For menu items, include both the name and price

### 6. Manual Code Editing

You can also:
1. Click the "Code" tab to see the code editor
2. Make manual changes to any file
3. Switch back to "Preview" to see your changes
4. The chat understands the current state, so you can mix manual edits with chat commands

### Example Workflow

1. Generate: "Build a restaurant app called Tony's Pizza with red theme"
2. Modify color: "Change the theme to blue"
3. Add item: "Add Margherita Pizza for $12.99"
4. Rename: "Change the name to Antonio's Pizzeria"
5. Manual edit: Switch to Code tab and adjust styles
6. Download: Click Download to get your customized app

All changes happen instantly without page reloads! 