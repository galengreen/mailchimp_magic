from bs4 import BeautifulSoup
import re

def modify_html(html):
    """Modify the HTML to isolate newsletter content, remove footer and LinkedIn section, and set specific background to white."""
    soup = BeautifulSoup(html, 'html.parser')

    # Remove footer (tbody with data-block-id="17")
    footer = soup.find('tbody', {'data-block-id': '17'})
    if footer:
        footer.decompose()

    # Remove LinkedIn section (tr containing table with class "mceSocialFollowBlock")
    social_table = soup.find('table', {'class': 'mceSocialFollowBlock'})
    if social_table:
        social_tr = social_table.find_parent('tr')
        if social_tr:
            social_tr.decompose()

    # Find all elements that have background-color:#252525 in their style attribute
    elements = soup.find_all(lambda tag: tag.has_attr('style') and 'background-color:#252525' in tag['style'])
    for element in elements:
        # Replace the specific background color while preserving other styles
        element['style'] = element['style'].replace('background-color:#252525', 'background-color:white')


    # Adds support for legacy Mailchimp formats - remove if causeing issues
    footer_td = soup.find('td', {'id': 'templateFooter'})
    if footer_td:
        # Find the parent tr and remove it to maintain table structure
        footer_tr = footer_td.find_parent('tr')
        if footer_tr:
            footer_tr.decompose()

    return str(soup)

# Example usage
if __name__ == "__main__":
    # Read the input HTML file
    with open('input.html', 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Modify the HTML
    modified_html = modify_html(html_content)

    # Write the modified HTML to a new file
    with open('output.html', 'w', encoding='utf-8') as f:
        f.write(modified_html)
        