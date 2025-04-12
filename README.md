# LLM HTML Editor Demo

A web-based HTML editor that allows you to create and modify web pages using natural language conversations with an AI assistant. This demo showcases how AI can help with web development by understanding your requirements and making the necessary HTML changes.

## Live Demo

Check out the live demo at: [https://mrtoronto.github.io/static-site-gen-demo/](https://mrtoronto.github.io/static-site-gen-demo/)

## Features

- **Real-time HTML Editor**: Write and edit HTML code with instant preview
- **AI-Powered Assistance**: Get help from an AI assistant to modify your HTML
- **Full Page Preview**: Toggle between editor view and full-page preview
- **Conversation History**: Your chat history is saved locally
- **API Key Management**: Securely store your OpenAI API key
- **Responsive Design**: Works on both desktop and mobile devices

## How to Use

1. **Enter Your API Key**
   - Click on the API key input field in the top-left corner
   - Enter your OpenAI API key
   - Click "Save" to store it securely

2. **Edit Your HTML**
   - Use the left panel to write or edit HTML code
   - Click the "Run" button to see your changes in the preview panel
   - Toggle between editor view and full-page preview using the switch in the top-right corner

3. **Chat with AI**
   - Type your request in the chat input at the bottom
   - The AI will help you modify your HTML based on your requirements
   - Examples of requests:
     - "Add a blue header with my name"
     - "Create a responsive navigation bar"
     - "Add a contact form with validation"
     - "Make the page more modern with a dark theme"

4. **View Changes**
   - The AI will explain the changes it's making
   - The HTML will be automatically updated
   - You can see the changes in the preview panel

## Technical Details

- Built with vanilla JavaScript and HTML
- Uses Tailwind CSS for styling
- Integrates with OpenAI's GPT-4o-mini API for now
- Deployed using GitHub Pages
- Local storage for saving API key and conversation history

## Development

To run this project locally:

1. Clone the repository
2. Open `index.html` in your browser
3. Enter your OpenAI API key to start using the AI features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### TODOs
- Enable the LLM to edit a section of the code rather than rewriting the whole page
    - Could be semantic sections (body, style, etc) or line-based sections (lines 100-200)
- Enable the LLM to lookup relevant images for the page
- Add a reset button
- Add starting templates

## License

This project is open source and available under the MIT License. 
