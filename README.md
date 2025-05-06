# Mailchimp Magic ✨

A powerful tool that transforms Mailchimp newsletter HTML into clean, optimized content perfect for website embedding. With a wave of its wand, it removes unnecessary elements and standardizes the display for seamless integration into your website.

## ✨ Features

- Removes footer sections from Mailchimp newsletters
- Eliminates LinkedIn social media sections
- Standardizes background colors to white
- Supports both modern and legacy Mailchimp formats
- Preserves the main newsletter content while removing clutter
- Web-based interface with live preview
- Toggle switches for customizing the extraction process

## 🛠️ Requirements

- Python 3.x
- Flask
- BeautifulSoup4

## 🚀 Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/mailchimp-magic.git
cd mailchimp-magic
```

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## 🎮 Usage

### Web Interface

1. Start the web server:
```bash
python app.py
```

2. Open your browser and navigate to `http://localhost:8080`

3. Use the web interface to:
   - Paste your Mailchimp HTML in the input area
   - Toggle different extraction options
   - Preview both input and output in real-time
   - Copy the processed HTML to clipboard

### Command Line

1. Place your Mailchimp newsletter HTML file in the project directory and name it `mailchimp_input.html`

2. Run the script:
```bash
python mailchimp_magic.py
```

3. The processed newsletter will be saved as `mailchimp_output.html`

## 🎯 How It Works

The script performs the following operations on the input HTML:
- Removes the footer section (identified by `data-block-id="17"`)
- Removes LinkedIn social media sections
- Changes any elements with `background-color:#252525` to white
- Removes legacy Mailchimp footer sections

## 📁 File Structure

- `app.py` - Flask web application
- `mailchimp_magic.py` - Core script for processing newsletters
- `templates/index.html` - Web interface template
- `mailchimp_input.html` - Place your Mailchimp newsletter HTML here (for CLI usage)
- `mailchimp_output.html` - Generated clean newsletter HTML (for CLI usage)

## 🤝 Contributing

Feel free to submit issues and enhancement requests! Let's make this magic even more powerful together.

## 📄 License

This project is open source and available under the MIT License.
