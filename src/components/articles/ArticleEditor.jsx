'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Image as ImageIcon,
  Save,
  X,
  Upload,
  FileText,
  Tag,
  User,
  Layers,
  Type,
  Loader2,
  Sparkles,
  Hash,
  ChevronDown,
  Search,
  Plus,
  Minus,
} from 'lucide-react';
import { compressImage } from '@/lib/optimizeImage';
import adminApi from '@/lib/adminApi';
import toast from 'react-hot-toast';

const articleCategories = [
  'Guides',
  'News',
  'Reviews',
  'Tutorials',
  'Buying Tips',
  'Product Updates',
  'Industry',
  'General',
];

const suggestedTags = [
  'DJI',
  'Drone Review',
  'Buying Guide',
  'Bangladesh',
  'Mavic',
  'Mini',
  'Accessories',
  'Photography',
  'Videography',
  'Aerial',
  'FPV',
  'Enterprise',
];

const emptyArticle = {
  title: '',
  slug: '',
  author: 'Drone Bangladesh',
  category: 'Guides',
  status: 'draft',
  excerpt: '',
  content: '',
  imageUrl: '',
  metaDescription: '',
  tags: [],
  productRefs: [],
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function ArticleEditor({ article, onSaved, onCancel }) {
  const [form, setForm] = useState(emptyArticle);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (article) {
      setForm({ ...emptyArticle, ...article, tags: article.tags || [], productRefs: article.productRefs || [] });
      setSlugLocked(Boolean(article.slug));
    } else {
      setForm(emptyArticle);
      setSlugLocked(false);
    }
  }, [article]);

  useEffect(() => {
    if (!slugLocked && form.title) {
      setForm((current) => ({ ...current, slug: slugify(current.title) }));
    }
  }, [form.title, slugLocked]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      update('imageUrl', await compressImage(file, 1600, 0.82));
    } catch (err) {
      console.error('Image compression failed:', err);
      toast.error('Image compression failed.');
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = () => update('imageUrl', '');

  const addTag = (tag) => {
    const value = (tag || tagInput || '').trim();
    if (!value) return;
    if (form.tags.includes(value)) {
      setTagInput('');
      return;
    }
    update('tags', [...form.tags, value]);
    setTagInput('');
  };

  const removeTag = (tag) => update('tags', form.tags.filter((t) => t !== tag));

  const charCountMeta = form.metaDescription?.length || 0;
  const charCountExcerpt = form.excerpt?.length || 0;

  const tabs = useMemo(
    () => [
      { id: 'general', label: 'General', icon: FileText },
      { id: 'content', label: 'Content', icon: Type },
      { id: 'media', label: 'Media', icon: ImageIcon },
      { id: 'seo', label: 'SEO & Tags', icon: Sparkles },
    ],
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return toast.error('Article title is required.');
    if (!form.content.trim()) return toast.error('Article content is required.');

    setSaving(true);
    try {
      const slug = form.slug?.trim() || slugify(form.title);
      const payload = {
        ...form,
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt?.trim() || '',
        content: form.content,
        metaDescription: form.metaDescription?.trim() || '',
        tags: form.tags || [],
        productRefs: form.productRefs || [],
      };
      const result = article?._id
        ? await adminApi.cms.articles.update(article._id, payload)
        : await adminApi.cms.articles.create(payload);

      if (!result.success) throw new Error(result.message);
      toast.success(article ? 'Article updated successfully.' : 'Article created successfully.');
      await onSaved?.();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Unable to save article.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-slate-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {article?._id ? 'Edit Article' : 'Create New Article'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill out the sections below. Click tabs to navigate between fields.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            type="submit"
            disabled={saving || compressing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : article?._id ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-5 p-5">
        {/* ====================== GENERAL TAB ====================== */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            {/* Section Card: Core Metadata */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Core Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Title */}
                <label className="space-y-1.5 md:col-span-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Type className="h-3.5 w-3.5 text-slate-500" /> Title
                    <span className="text-rose-500">*</span>
                  </span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="e.g. Top 10 Drones to Buy in Bangladesh in 2026"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </label>

                {/* Slug */}
                <label className="space-y-1.5 md:col-span-2">
                  <span className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-slate-500" /> URL Slug
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (slugLocked) {
                          setSlugLocked(false);
                        } else {
                          update('slug', slugify(form.title));
                          setSlugLocked(true);
                        }
                      }}
                      className={`text-[11px] font-semibold rounded-full px-2.5 py-1 transition ${
                        slugLocked
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {slugLocked ? 'Auto-generate OFF (locked)' : 'Auto-generate ON'}
                    </button>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 px-3 py-2.5 text-xs font-medium text-slate-500">
                      /articles/
                    </span>
                    <input
                      value={form.slug}
                      onChange={(e) => {
                        setSlugLocked(true);
                        update('slug', slugify(e.target.value));
                      }}
                      disabled={!slugLocked}
                      placeholder="auto-generated-from-title"
                      className={`flex-1 rounded-r-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                        slugLocked ? 'bg-white' : 'bg-slate-50 text-slate-500'
                      }`}
                    />
                  </div>
                </label>

                {/* Author */}
                <label className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-500" /> Author
                  </span>
                  <input
                    value={form.author}
                    onChange={(e) => update('author', e.target.value)}
                    placeholder="Drone Bangladesh"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </label>

                {/* Category */}
                <label className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Layers className="h-3.5 w-3.5 text-slate-500" /> Category
                  </span>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => update('category', e.target.value)}
                      className="appearance-none w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      {articleCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  </div>
                </label>

                {/* Status */}
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-bold text-slate-700">Status</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['draft', 'published', 'scheduled'].map((s) => (
                      <label
                        key={s}
                        className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-xs font-bold capitalize transition ${
                          form.status === s
                            ? s === 'published'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : s === 'draft'
                              ? 'border-slate-500 bg-slate-50 text-slate-700'
                              : 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={s}
                          checked={form.status === s}
                          onChange={(e) => update('status', e.target.value)}
                          className="sr-only"
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ====================== CONTENT TAB ====================== */}
        {activeTab === 'content' && (
          <div className="space-y-5">
            {/* Excerpt */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Excerpt (Short Summary)</h2>
                </div>
                <span
                  className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${
                    charCountExcerpt > 200
                      ? 'bg-rose-50 text-rose-600'
                      : charCountExcerpt > 160
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {charCountExcerpt}/200 chars
                </span>
              </div>
              <textarea
                value={form.excerpt}
                onChange={(e) => update('excerpt', e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="A brief 1-2 line summary that appears in article cards and search results..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Main Content */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Type className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Article Body</h2>
                  <p className="text-[11px] text-slate-500">
                    Full article content. Plain text with line breaks is supported.
                  </p>
                </div>
              </div>
              <textarea
                required
                value={form.content}
                onChange={(e) => update('content', e.target.value)}
                rows={16}
                placeholder={`Write your full article content here...\n\nYou can use:\n• Short paragraphs\n• Bullet points\n• Numbered lists\n\nTip: Break content into small readable paragraphs of 3-4 lines.`}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* ====================== MEDIA TAB ====================== */}
        {activeTab === 'media' && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Featured Image / Thumbnail</h2>
                    <p className="text-[11px] text-slate-500">
                      Displayed in article cards, social shares, and at the top of the article.
                    </p>
                  </div>
                </div>
              </div>

              {form.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
                  <img
                    src={form.imageUrl}
                    alt="Article thumbnail preview"
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="text-white text-xs">
                      <p className="font-bold opacity-90">Thumbnail Preview</p>
                      <p className="opacity-70 text-[11px]">1600px max · Auto WebP compression</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-700"
                    >
                      <X className="h-3.5 w-3.5" /> Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/40 transition cursor-pointer py-14 text-center px-4">
                  {compressing ? (
                    <>
                      <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
                      <p className="text-sm font-bold text-slate-700">Optimizing image...</p>
                      <p className="text-xs text-slate-500 mt-0.5">Auto resizing to 1600px · WebP format</p>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-full bg-slate-100 group-hover:bg-white mb-3 shadow-sm transition">
                        <Upload className="h-7 w-7 text-slate-500 group-hover:text-blue-600 transition" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Click to upload thumbnail</p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG, WebP · Recommended 1200×675 px · Auto Cloudinary upload
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    disabled={compressing}
                    className="hidden"
                  />
                </label>
              )}

              {!form.imageUrl && !compressing && (
                <div className="rounded-lg bg-slate-50 p-3 space-y-1 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-600">Best practices:</p>
                  <ul className="text-[11px] text-slate-500 space-y-0.5 list-disc list-inside">
                    <li>Use high-quality hero images (16:9 ratio works best)</li>
                    <li>Include drone photography or relevant product shots</li>
                    <li>Avoid heavily watermarked or low-resolution images</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================== SEO & TAGS TAB ====================== */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            {/* Meta Description */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Meta Description</h2>
                    <p className="text-[11px] text-slate-500">
                      Used for Google search results and social sharing.
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${
                    charCountMeta > 160
                      ? 'bg-rose-50 text-rose-600'
                      : charCountMeta > 140
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {charCountMeta}/160
                </span>
              </div>
              <textarea
                value={form.metaDescription}
                onChange={(e) => update('metaDescription', e.target.value)}
                rows={3}
                maxLength={200}
                placeholder="Compelling 1-2 sentence description for SEO that includes your primary keywords..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 resize-none"
              />

              {/* SEO Preview Card */}
              <div className="mt-2 rounded-lg border border-slate-200 bg-white p-4 shadow-inner">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Google Preview (approximate)
                </p>
                <p className="text-[15px] font-semibold text-blue-700 leading-tight line-clamp-1">
                  {form.title || 'Your article title appears here'}
                </p>
                <p className="text-[12px] text-emerald-700 mt-0.5 line-clamp-1">
                  {`${adminApi.storeUrl.replace(/^https?:\/\//, '')}/articles/${form.slug || 'your-article-slug'}`}
                </p>
                <p className="text-[13px] text-slate-600 mt-1 line-clamp-2 leading-snug">
                  {form.metaDescription ||
                    form.excerpt ||
                    'Your meta description or excerpt will appear here. Keep it under 160 characters for best results.'}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Tags</h2>
                  <p className="text-[11px] text-slate-500">
                    Topic tags for filtering, search, and related content suggestions.
                  </p>
                </div>
              </div>

              {/* Tag Input */}
              <div className="flex gap-2">
                <label className="relative flex-1 block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Type tag then press Enter or click +"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => addTag()}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              {/* Existing Tags */}
              {form.tags.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-600 mb-2">
                    Current Tags ({form.tags.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 inline-flex items-center justify-center rounded-full bg-white/70 hover:bg-rose-100 text-blue-700 hover:text-rose-600 p-0.5 transition"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Tags */}
              <div>
                <p className="text-[11px] font-bold text-slate-600 mb-2">Suggested Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags
                    .filter((t) => !form.tags.includes(t))
                    .slice(0, 12)
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition"
                      >
                        <Plus className="h-3 w-3" /> {tag}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between rounded-b-2xl">
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${form.title ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            Title
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${form.content ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            Content
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${form.imageUrl ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            Thumbnail
          </span>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || compressing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : article?._id ? 'Save Changes' : 'Create Article'}
          </button>
        </div>
      </div>
    </form>
  );
}
