import os
from bs4 import BeautifulSoup

def process_html(html_content, options=None):
    if options is None:
        options = {
            'remove_footer': True,
            'remove_social': True,
            'standardize_bg': True,
            'remove_legacy_footer': True
        }

    soup = BeautifulSoup(html_content, 'html.parser')

    # Remove footer
    if options.get('remove_footer', True):
        footer = soup.find(attrs={'data-block-id': '17'})
        if footer:
            footer.decompose()

    # Remove social media
    if options.get('remove_social', True):
        social_sections = soup.find_all('a', href=lambda x: x and 'linkedin.com' in x)
        for section in social_sections:
            parent = section.find_parent('td', style=lambda x: x and 'text-align: center' in x)
            if parent:
                parent.decompose()

    # Standardize background
    if options.get('standardize_bg', True):
        elements = soup.find_all(style=lambda x: x and 'background-color:#252525' in x)
        for element in elements:
            element['style'] = element['style'].replace('background-color:#252525', 'background-color:white')

    # Remove legacy footer
    if options.get('remove_legacy_footer', True):
        legacy_footer = soup.find('td', style=lambda x: x and 'font-size: 12px' in x)
        if legacy_footer:
            legacy_footer.decompose()

    return str(soup)

def main():
    # Check if input file exists
    if not os.path.exists('mailchimp_input.html'):
        print("Error: mailchimp_input.html not found!")
        return

    # Read input file
    with open('mailchimp_input.html', 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Process HTML
    processed_html = process_html(html_content)

    # Write output file
    with open('mailchimp_output.html', 'w', encoding='utf-8') as f:
        f.write(processed_html)

    print("Processing complete! Check mailchimp_output.html for results.")

if __name__ == '__main__':
    main()
        