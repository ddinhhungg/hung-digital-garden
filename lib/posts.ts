import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content/notes');

export interface PostMeta {
  slug: string;
  title: string;
  title_en?: string;
  date: string;
  tag: 'note' | 'project' | 'thought';
  readTime: number;
  excerpt: string;
  excerpt_en?: string;
  tags?: string[];
  marginNotes?: { top: number; text: string; style?: 'sage' | 'default' }[];
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(contentDir)) return [];
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
  return files
    .map(file => {
      const slug = file.replace(/\.(mdx|md)$/, '');
      const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8');
      const { data } = matter(raw);
      return { slug, ...data } as PostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const candidates = [
    path.join(contentDir, `${slug}.mdx`),
    path.join(contentDir, `${slug}.md`),
  ];
  const file = candidates.find(f => fs.existsSync(f));
  if (!file) return null;
  const raw = fs.readFileSync(file, 'utf-8');
  const { data, content } = matter(raw);
  return { slug, ...data, content } as Post;
}
