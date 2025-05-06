from flask import Flask, render_template, request, jsonify
from bs4 import BeautifulSoup
import re

app = Flask(__name__)

def modify_html(html, options):
    """Modify the HTML based on selected options."""
    soup = BeautifulSoup(html, 'html.parser')

    if options.get('remove_footer', True):
        # Remove footer (tbody with data-block-id="17")
        footer = soup.find('tbody', {'data-block-id': '17'})
        if footer:
            footer.decompose()

    if options.get('remove_social', True):
        # Remove LinkedIn section
        social_table = soup.find('table', {'class': 'mceSocialFollowBlock'})
        if social_table:
            social_tr = social_table.find_parent('tr')
            if social_tr:
                social_tr.decompose()

    if options.get('standardize_bg', True):
        # Find all elements that have background-color:#252525 in their style attribute
        elements = soup.find_all(lambda tag: tag.has_attr('style') and 'background-color:#252525' in tag['style'])
        for element in elements:
            element['style'] = element['style'].replace('background-color:#252525', 'background-color:white')

        # Set background color for the main container
        main_container = soup.find('table', {'class': 'mcnTextBlock'})
        if main_container:
            if main_container.has_attr('style'):
                main_container['style'] = main_container['style'].replace('background-color:#252525', 'background-color:white')
            else:
                main_container['style'] = 'background-color:white'

        # Set background color for the body
        body = soup.find('body')
        if body:
            if body.has_attr('style'):
                body['style'] = body['style'].replace('background-color:#252525', 'background-color:white')
            else:
                body['style'] = 'background-color:white'

        # Set background color for the main table
        main_table = soup.find('table', {'class': 'mcnTextBlockInner'})
        if main_table:
            if main_table.has_attr('style'):
                main_table['style'] = main_table['style'].replace('background-color:#252525', 'background-color:white')
            else:
                main_table['style'] = 'background-color:white'

    if options.get('remove_legacy_footer', True):
        # Remove legacy Mailchimp footer
        footer_td = soup.find('td', {'id': 'templateFooter'})
        if footer_td:
            footer_tr = footer_td.find_parent('tr')
            if footer_tr:
                footer_tr.decompose()

    return str(soup)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    data = request.get_json()
    html_content = data.get('html', '')
    options = data.get('options', {
        'remove_footer': True,
        'remove_social': True,
        'standardize_bg': True,
        'remove_legacy_footer': True
    })
    
    try:
        modified_html = modify_html(html_content, options)
        return jsonify({
            'success': True,
            'output': modified_html
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, port=8080) 