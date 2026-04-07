#!/usr/bin/env node
/**
 * Convert HTML blog posts to WordPress WXR (XML) format
 * Usage: node convert-to-wordpress-xml.js
 * Output: wordpress-import.xml (ready for WordPress import)
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = __dirname;
const OUTPUT_FILE = path.join(BLOG_DIR, 'wordpress-import.xml');

// Your WordPress site URL (change this)
const SITE_URL = 'https://tecxmate.com';
const SITE_NAME = 'TECXMATE';

function parseHtmlBlog(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract metadata from HTML comments
  const titleMatch = content.match(/<!--\s*Title:\s*(.+?)\s*-->/);
  const categoryMatch = content.match(/<!--\s*Category:\s*(.+?)\s*-->/);
  const tagsMatch = content.match(/<!--\s*Tags:\s*(.+?)\s*-->/);

  // Extract the actual HTML content (everything after the metadata comments)
  const contentStart = content.lastIndexOf('-->') + 3;
  let htmlContent = content.substring(contentStart).trim();

  // Clean up: remove the Featured Image comment if it's in the content
  htmlContent = htmlContent.replace(/<!--\s*Featured Image:.*?-->\s*/gs, '');

  return {
    title: titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.html'),
    categories: categoryMatch ? categoryMatch[1].split(',').map(c => c.trim()) : ['Uncategorized'],
    tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : [],
    content: htmlContent,
    filename: path.basename(filePath, '.html')
  };
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapCDATA(content) {
  // Handle nested CDATA by escaping ]]>
  const escaped = content.replace(/\]\]>/g, ']]]]><![CDATA[>');
  return `<![CDATA[${escaped}]]>`;
}

function generateWXR(posts) {
  // Collect all unique categories and tags
  const allCategories = new Set();
  const allTags = new Set();

  posts.forEach(post => {
    post.categories.forEach(c => allCategories.add(c));
    post.tags.forEach(t => allTags.add(t));
  });

  const now = new Date();
  const pubDate = now.toUTCString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
  <title>${escapeXml(SITE_NAME)}</title>
  <link>${SITE_URL}</link>
  <description>TECXMATE Blog Posts</description>
  <pubDate>${pubDate}</pubDate>
  <language>en-US</language>
  <wp:wxr_version>1.2</wp:wxr_version>
  <wp:base_site_url>${SITE_URL}</wp:base_site_url>
  <wp:base_blog_url>${SITE_URL}</wp:base_blog_url>

`;

  // Add categories
  let catId = 1;
  allCategories.forEach(category => {
    const slug = generateSlug(category);
    xml += `  <wp:category>
    <wp:term_id>${catId++}</wp:term_id>
    <wp:category_nicename>${wrapCDATA(slug)}</wp:category_nicename>
    <wp:category_parent></wp:category_parent>
    <wp:cat_name>${wrapCDATA(category)}</wp:cat_name>
  </wp:category>
`;
  });

  // Add tags
  let tagId = 1;
  allTags.forEach(tag => {
    const slug = generateSlug(tag);
    xml += `  <wp:tag>
    <wp:term_id>${tagId++}</wp:term_id>
    <wp:tag_slug>${wrapCDATA(slug)}</wp:tag_slug>
    <wp:tag_name>${wrapCDATA(tag)}</wp:tag_name>
  </wp:tag>
`;
  });

  // Add posts
  let postId = 1;
  posts.forEach(post => {
    const slug = generateSlug(post.title);
    const postDate = now.toISOString().replace('T', ' ').substring(0, 19);

    xml += `
  <item>
    <title>${wrapCDATA(post.title)}</title>
    <link>${SITE_URL}/blog/${slug}/</link>
    <pubDate>${pubDate}</pubDate>
    <dc:creator>${wrapCDATA('admin')}</dc:creator>
    <guid isPermaLink="false">${SITE_URL}/?p=${postId}</guid>
    <description></description>
    <content:encoded>${wrapCDATA(post.content)}</content:encoded>
    <excerpt:encoded>${wrapCDATA('')}</excerpt:encoded>
    <wp:post_id>${postId++}</wp:post_id>
    <wp:post_date>${postDate}</wp:post_date>
    <wp:post_date_gmt>${postDate}</wp:post_date_gmt>
    <wp:post_modified>${postDate}</wp:post_modified>
    <wp:post_modified_gmt>${postDate}</wp:post_modified_gmt>
    <wp:comment_status>open</wp:comment_status>
    <wp:ping_status>open</wp:ping_status>
    <wp:post_name>${wrapCDATA(slug)}</wp:post_name>
    <wp:status>draft</wp:status>
    <wp:post_parent>0</wp:post_parent>
    <wp:menu_order>0</wp:menu_order>
    <wp:post_type>post</wp:post_type>
    <wp:post_password></wp:post_password>
    <wp:is_sticky>0</wp:is_sticky>
`;

    // Add categories
    post.categories.forEach(category => {
      const catSlug = generateSlug(category);
      xml += `    <category domain="category" nicename="${catSlug}">${wrapCDATA(category)}</category>
`;
    });

    // Add tags
    post.tags.forEach(tag => {
      const tagSlug = generateSlug(tag);
      xml += `    <category domain="post_tag" nicename="${tagSlug}">${wrapCDATA(tag)}</category>
`;
    });

    xml += `  </item>
`;
  });

  xml += `</channel>
</rss>`;

  return xml;
}

function main() {
  console.log('Converting HTML blogs to WordPress XML...\n');

  // Find all HTML blog files
  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.html') && f.startsWith('blog-'));

  console.log(`Found ${files.length} blog files:\n`);

  const posts = [];

  files.forEach(file => {
    const filePath = path.join(BLOG_DIR, file);
    const post = parseHtmlBlog(filePath);
    posts.push(post);
    console.log(`  [+] ${post.title}`);
    console.log(`      Categories: ${post.categories.join(', ')}`);
    console.log(`      Tags: ${post.tags.slice(0, 3).join(', ')}${post.tags.length > 3 ? '...' : ''}`);
    console.log('');
  });

  // Generate WXR XML
  const xml = generateWXR(posts);

  // Write output file
  fs.writeFileSync(OUTPUT_FILE, xml, 'utf-8');

  console.log('----------------------------------------');
  console.log(`Generated: ${OUTPUT_FILE}`);
  console.log(`Total posts: ${posts.length}`);
  console.log('');
  console.log('To import into WordPress:');
  console.log('1. Go to Tools → Import → WordPress');
  console.log('2. Install importer if prompted');
  console.log('3. Upload wordpress-import.xml');
  console.log('4. Assign posts to an author');
  console.log('5. Posts will be imported as DRAFTS');
  console.log('   (Review and publish when ready)');
}

main();
