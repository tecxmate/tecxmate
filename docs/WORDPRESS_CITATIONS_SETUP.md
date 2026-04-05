# WordPress Citations Setup Guide

This guide explains how to add citations to your WordPress blog posts so they appear in the collapsible citations section at the bottom of each blog post.

## Overview

The citations feature supports multiple methods:
1. **WordPress Custom Fields** (Native - Recommended for WordPress.com)
2. **ACF (Advanced Custom Fields)** (Recommended for self-hosted WordPress)
3. **WordPress Block Editor** (Gutenberg)

---

## Method 1: WordPress Custom Fields (Native)

This method works with both WordPress.com and self-hosted WordPress sites.

### Important Notes:

- **WordPress.com**: Custom fields are automatically exposed via REST API
- **Self-Hosted WordPress**: You need to register the custom field in the REST API (see PHP code snippet below)

### For Self-Hosted WordPress (Required):

Add this PHP code to your theme's `functions.php` file or create a custom plugin:

```php
<?php
/**
 * Register the 'citations' custom field in the REST API
 */
function register_citations_rest_field() {
    register_rest_field(
        'post',
        'citations',
        array(
            'get_callback' => function ($post_object) {
                return get_post_meta($post_object['id'], 'citations', true) ?: '';
            },
            'update_callback' => function ($value, $post_object) {
                return update_post_meta($post_object->ID, 'citations', $value);
            },
            'schema' => array(
                'description' => 'Citations and references for the blog post',
                'type' => 'string',
                'context' => array('view', 'edit'),
            ),
        )
    );
}
add_action('rest_api_init', 'register_citations_rest_field');
```

**File Location**: See `wordpress-rest-api-citations.php` in the project root for the complete code.

### Steps:

1. **Edit a Blog Post**
   - Go to your WordPress admin dashboard
   - Navigate to Posts → All Posts
   - Click "Edit" on the post you want to add citations to

2. **Enable Custom Fields**
   - If you don't see "Custom Fields" section:
     - Click the three dots (⋮) in the top right corner
     - Select "Preferences"
     - Under "Panels", enable "Custom Fields"
     - Click "Enable & Reload"

3. **Add Citations Custom Field**
   - Scroll down to the "Custom Fields" section (usually below the content editor)
   - Click "Add Custom Field"
   - **Name**: Enter `citations` (lowercase, exactly as shown)
   - **Value**: Enter your citations in HTML format
   - Click "Add Custom Field" button
   - Click "Update" to save the post

### Example Citation Value:

```html
<ol>
  <li>Smith, J. (2023). "AI in Business". <em>Tech Journal</em>, 15(3), 45-62.</li>
  <li>Johnson, M. (2024). "Digital Transformation Guide". Retrieved from <a href="https://example.com">https://example.com</a></li>
  <li>Brown, A. (2023). "Machine Learning Applications". <em>Data Science Quarterly</em>, 8(2), 120-135.</li>
</ol>
```

### HTML Formatting Tips:

- Use `<ol>` for numbered lists
- Use `<ul>` for bullet lists
- Use `<li>` for list items
- Use `<p>` for paragraphs
- Use `<a href="url">text</a>` for links
- Use `<em>` or `<i>` for italic text
- Use `<strong>` or `<b>` for bold text

---

## Method 2: ACF (Advanced Custom Fields) Plugin

This method is recommended for self-hosted WordPress sites with more control.

### Prerequisites:

1. **Install ACF Plugin**
   - Go to Plugins → Add New
   - Search for "Advanced Custom Fields"
   - Install and activate the plugin

2. **Install ACF to REST API Plugin** (Required)
   - Go to Plugins → Add New
   - Search for "ACF to REST API"
   - Install and activate the plugin
   - This makes ACF fields available via the REST API

### Steps:

1. **Create Field Group**
   - Go to Custom Fields → Add New
   - Title: "Blog Post Citations"
   - Click "Add Field"
   - Field Label: `Citations`
   - Field Name: `citations` (auto-generated, keep it lowercase)
   - Field Type: `WYSIWYG Editor` or `Textarea`
   - Location Rules: Set to "Post Type is equal to Post"
   - Click "Publish"

2. **Add Citations to a Post**
   - Edit any blog post
   - Scroll down to find the "Citations" field
   - Enter your citations (supports rich text if using WYSIWYG)
   - Click "Update" to save

### Field Configuration:

- **Field Type Options:**
  - `WYSIWYG Editor`: Best for rich text formatting
  - `Textarea`: For plain HTML
  - `Text`: For simple text (not recommended)

---

## Method 3: WordPress Block Editor (Alternative)

If you prefer to use blocks, you can add citations as a custom HTML block at the end of your post content. However, this method requires additional parsing and is not recommended.

---

## Citation Format Examples

### Academic Style:

```html
<ol>
  <li>Author, A. (Year). <em>Title of Work</em>. Publisher.</li>
  <li>Author, B., & Author, C. (Year). "Article Title". <em>Journal Name</em>, Volume(Issue), Pages.</li>
</ol>
```

### Website References:

```html
<ul>
  <li>Organization Name. (Year). "Page Title". Retrieved from <a href="https://example.com">https://example.com</a></li>
  <li>Author Name. (Date). "Article Title". <em>Website Name</em>. <a href="https://example.com">https://example.com</a></li>
</ul>
```

### Mixed Format:

```html
<ol>
  <li>
    <strong>Books:</strong>
    <ul>
      <li>Smith, J. (2023). <em>AI Revolution</em>. Tech Books Publishing.</li>
    </ul>
  </li>
  <li>
    <strong>Articles:</strong>
    <ul>
      <li>Johnson, M. (2024). "Digital Transformation". <em>Tech Journal</em>.</li>
    </ul>
  </li>
  <li>
    <strong>Websites:</strong>
    <ul>
      <li>Example.com. (2024). "Guide to AI". <a href="https://example.com">https://example.com</a></li>
    </ul>
  </li>
</ol>
```

---

## Testing Your Citations

1. **Save your post** with citations added
2. **Visit your Next.js site** and navigate to the blog post
3. **Scroll to the bottom** of the post content
4. **Look for "Citations & References"** section (collapsible accordion)
5. **Click to expand** and verify your citations display correctly

---

## Troubleshooting

### Citations Not Appearing:

1. **Check Field Name**
   - Must be exactly `citations` (lowercase)
   - No spaces or special characters

2. **Verify API Access**
   - For WordPress.com: Custom fields are accessible by default
   - For self-hosted: Ensure REST API is enabled
   - For ACF: Ensure "ACF to REST API" plugin is installed

3. **Check Field Value**
   - Ensure the field has content (not empty)
   - HTML should be valid

4. **Clear Cache**
   - Clear WordPress cache if using caching plugins
   - The Next.js site caches for 5 minutes (300 seconds)

### API Debugging:

Check the WordPress REST API response:
```
https://your-site.com/wp-json/wp/v2/posts?slug=your-post-slug&_embed=1
```

Look for:
- `meta.citations` or `meta._citations` (for custom fields)
- `acf.citations` (for ACF fields)

---

## Best Practices

1. **Consistent Formatting**: Use the same citation style throughout your blog
2. **HTML Validation**: Ensure your HTML is well-formed
3. **Accessibility**: Use semantic HTML (`<ol>`, `<ul>`, `<li>`) for better screen reader support
4. **Link Formatting**: Make sure links are properly formatted with `<a>` tags
5. **Content Length**: Keep citations organized and readable

---

## Additional Resources

- [WordPress Custom Fields Documentation](https://wordpress.org/support/article/custom-fields/)
- [ACF Plugin Documentation](https://www.advancedcustomfields.com/resources/)
- [ACF to REST API Plugin](https://wordpress.org/plugins/acf-to-rest-api/)
- [HTML Citation Examples](https://www.easybib.com/guides/citation-guides/)

---

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify the WordPress API is accessible
3. Test with a simple citation first
4. Check that the field name matches exactly (`citations`)

