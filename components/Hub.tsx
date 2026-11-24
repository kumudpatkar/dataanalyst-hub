
'use client';

import { useEffect, useMemo, useState } from 'react';
import { references, subjects, type Reference } from '@/data/references';
import {
  Search,
  Home,
  Star,
  Clock3,
  Sun,
  Moon,
  Menu,
  X,
  Copy,
  Check,
  ArrowUpRight,
  BookOpen,
  FileText,
  Command,
  ChevronRight,
  Filter,
  Sparkles,
  Hash,
  Download,
  ExternalLink
} from 'lucide-react';

type View = 'Dashboard' | 'Favourites' | 'Recently viewed' | 'Handbooks' | string;

const handbooks = [
  {
    title: 'Excel Handbook',
    description: 'Learn Excel formulas, functions, data cleaning, lookup techniques and reporting.',
    category: 'Spreadsheet & Analysis',
    file: '/handbooks/excel-handbook.pdf'
  },
  {
    title: 'SQL Handbook',
    description: 'Revise SQL queries, joins, filtering, grouping, subqueries and database concepts.',
    category: 'Database & Queries',
    file: '/handbooks/sql-handbook.pdf'
  },
  {
    title: 'Python Handbook',
    description: 'Explore Python basics, syntax, data structures and useful data analysis concepts.',
    category: 'Programming & Analysis',
    file: '/handbooks/python-handbook.pdf'
  },
  {
    title: 'Power BI Handbook',
    description: 'Understand Power BI, data modelling, DAX, visualizations and dashboards.',
    category: 'Business Intelligence',
    file: '/handbooks/power-bi-handbook.pdf'
  },
  {
    title: 'Data Analyst Handbook',
    description: 'Revise essential Data Analyst concepts, workflow, skills and interview topics.',
    category: 'Career & Data Analytics',
    file: '/handbooks/data-analyst-handbook.pdf'
  }
];

const safeText = (value: unknown, fallback = ''): string => {
  if (value === null || value === undefined) return fallback;

  if (typeof value === 'string') return value;

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
};

const toTextArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map(item => safeText(item))
      .filter(item => item.trim().length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n;]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (value && typeof value === 'object') {
    return Object.values(value)
      .map(item => safeText(item))
      .filter(item => item.trim().length > 0);
  }

  return [];
};

const readStorageArray = (key: string): string[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');

    return Array.isArray(value)
      ? value.filter(item => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

export default function Hub() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('Dashboard');
  const [subjectFilter, setSubjectFilter] = useState('All subjects');
  const [selected, setSelected] = useState<Reference | null>(null);

  const [favourites, setFavourites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sort, setSort] = useState('Popular');

  // Prevent saving default values before localStorage has loaded.
  const [hydrated, setHydrated] = useState(false);

  // Load saved preferences after the component mounts.
  useEffect(() => {
    setFavourites(readStorageArray('dah-favourites'));
    setRecent(readStorageArray('dah-recent'));

    try {
      setDark(localStorage.getItem('dah-theme') === 'dark');
    } catch {
      setDark(false);
    }

    setHydrated(true);
  }, []);

  // Save favourites only after initial loading.
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        'dah-favourites',
        JSON.stringify(favourites)
      );
    } catch {
      // Ignore storage errors.
    }
  }, [favourites, hydrated]);

  // Save recently viewed references.
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        'dah-recent',
        JSON.stringify(recent)
      );
    } catch {
      // Ignore storage errors.
    }
  }, [recent, hydrated]);

  // Save theme.
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        'dah-theme',
        dark ? 'dark' : 'light'
      );
    } catch {
      // Ignore storage errors.
    }
  }, [dark, hydrated]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }

      if (e.key === 'Escape') {
        setSelected(null);
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // Open a reference.
  const openReference = (ref: Reference) => {
    setSelected(ref);

    setRecent(prev =>
      [ref.id, ...prev.filter(id => id !== ref.id)].slice(0, 12)
    );

    setView('Dashboard');
    setMobileOpen(false);
  };

  // Add or remove favourites.
  const toggleFavourite = (id: string) => {
    setFavourites(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [id, ...prev]
    );
  };

  // Copy text.
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
    }
  };

  // Search and filter references.
  const filtered = useMemo(() => {
    let data = [...references];

    if (view === 'Favourites') {
      data = data.filter(r => favourites.includes(r.id));
    } else if (view === 'Recently viewed') {
      data = data
        .filter(r => recent.includes(r.id))
        .sort(
          (a, b) =>
            recent.indexOf(a.id) - recent.indexOf(b.id)
        );
    } else if (view !== 'Dashboard' && view !== 'Handbooks') {
      data = data.filter(r => r.subject === view);
    }

    if (subjectFilter !== 'All subjects') {
      data = data.filter(
        r => r.subject === subjectFilter
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();

      data = data.filter(r => {
        const searchableFields = [
          safeText(r.name),
          safeText(r.subject),
          safeText(r.category),
          safeText(r.description),
          safeText(r.syntax),
          safeText(r.example),
          ...toTextArray(r.tags)
        ];

        return searchableFields
          .join(' ')
          .toLowerCase()
          .includes(q);
      });
    }

    if (sort === 'A–Z') {
      data.sort((a, b) =>
        safeText(a.name).localeCompare(safeText(b.name))
      );
    }

    if (sort === 'Subject') {
      data.sort(
        (a, b) =>
          safeText(a.subject).localeCompare(safeText(b.subject)) ||
          safeText(a.name).localeCompare(safeText(b.name))
      );
    }

    return data;
  }, [query, view, subjectFilter, favourites, recent, sort]);

  // Recently viewed references.
  const recentItems = recent
    .map(id => references.find(r => r.id === id))
    .filter(Boolean) as Reference[];

  // Popular references.
  const popularIds = [
    'excel-xlookup',
    'sql-left-join',
    'dax-calculate',
    'py-pandas-groupby',
    'excel-sumifs',
    'sql-row-number'
  ];

  const popular = popularIds
    .map(id => references.find(r => r.id === id))
    .filter(Boolean) as Reference[];

  const isHome = view === 'Dashboard' && !query && !selected;
  const darkClass = dark ? 'dark' : '';

  // Selected reference details.
  const selectedTags = selected
    ? toTextArray(selected.tags)
    : [];

  const selectedExplanation = selected
    ? toTextArray(selected.explanation)
    : [];

  const selectedMistakes = selected
    ? toTextArray(selected.mistakes)
    : [];

  const selectedRelated = selected
    ? toTextArray(selected.related)
    : [];

  const relatedReferences = selected
    ? (
        selectedRelated.length > 0
          ? selectedRelated
              .map(id => references.find(r => r.id === id))
              .filter(Boolean) as Reference[]
          : references.filter(
              r =>
                r.subject === selected.subject &&
                r.id !== selected.id
            ).slice(0, 4)
      )
    : [];

  // Sidebar navigation.
  const sidebar = (
    <>
      <div className="brand">
        <div className="brand-mark">
          <BookOpen size={21} />
        </div>

        <div>
          <div className="brand-name">
            DataAnalyst<span>Hub</span>
          </div>

          <div className="brand-sub">
            YOUR KNOWLEDGE WORKSPACE
          </div>
        </div>
      </div>

      {/* DASHBOARD */}

      <button
        className={`nav-item ${view === 'Dashboard' ? 'active' : ''}`}
        onClick={() => {
          setView('Dashboard');
          setQuery('');
          setSelected(null);
          setSubjectFilter('All subjects');
          setMobileOpen(false);
        }}
      >
        <Home size={17} />
        Dashboard
      </button>

      {/* LIBRARY */}

      <div className="nav-label">LIBRARY</div>

      {subjects.map(s => (
        <button
          key={s.slug}
          className={`nav-item ${view === s.name ? 'active' : ''}`}
          onClick={() => {
            setView(s.name);
            setQuery('');
            setSelected(null);
            setSubjectFilter('All subjects');
            setMobileOpen(false);
          }}
        >
          <span className={`nav-glyph ${s.color}`}>
            {s.icon}
          </span>

          {s.name}

          <span className="nav-count">
            {references.filter(r => r.subject === s.name).length}
          </span>
        </button>
      ))}

      {/* HANDBOOKS SECTION */}

      <button
        type="button"
        className="nav-label space-top handbook-heading"
        onClick={() => {
          setView('Handbooks');
          setQuery('');
          setSelected(null);
          setSubjectFilter('All subjects');
          setMobileOpen(false);
        }}
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          font: 'inherit'
        }}
      >
        HANDBOOKS
        <span className="nav-count" style={{ float: 'right' }}>
          {handbooks.length}
        </span>
      </button>

      {handbooks.map(book => (
        <a
          key={book.file}
          className="nav-item handbook-nav-item"
          href={book.file}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMobileOpen(false)}
          title={`Open ${book.title}`}
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <FileText size={17} />

          <span style={{ flex: 1 }}>
            {book.title}
          </span>

          <ExternalLink size={13} />
        </a>
      ))}

      {/* YOUR SPACE */}

      <div className="nav-label space-top">YOUR SPACE</div>

      <button
        className={`nav-item ${view === 'Favourites' ? 'active' : ''}`}
        onClick={() => {
          setView('Favourites');
          setQuery('');
          setSelected(null);
          setSubjectFilter('All subjects');
          setMobileOpen(false);
        }}
      >
        <Star size={17} />
        Favourites

        <span className="nav-count">
          {favourites.length}
        </span>
      </button>

      <button
        className={`nav-item ${view === 'Recently viewed' ? 'active' : ''}`}
        onClick={() => {
          setView('Recently viewed');
          setQuery('');
          setSelected(null);
          setSubjectFilter('All subjects');
          setMobileOpen(false);
        }}
      >
        <Clock3 size={17} />
        Recently viewed
      </button>

      {/* SIDEBAR FOOTER */}

      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <Sparkles size={16} />
          <b>Quick tip</b>

          <p>
            Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search from anywhere.
          </p>
        </div>

        <div className="sidebar-foot">
          Built for curious data analysts <span>✦</span>
        </div>
      </div>
    </>
  );

  return (
    <div className={`${darkClass} app-shell`}>
      {/* DESKTOP SIDEBAR */}

      <aside className="sidebar">
        {sidebar}
      </aside>

      {/* MOBILE SIDEBAR */}

      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="mobile-sidebar"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="mobile-close"
              onClick={() => setMobileOpen(false)}
            >
              <X size={19} />
            </button>

            {sidebar}
          </aside>
        </div>
      )}

      <main className="main-area">
        {/* TOPBAR */}

        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <b>{selected ? selected.subject : view}</b>
          </div>

          <div className="top-actions">
            <div className="status-pill">
              <span />
              Reference library
            </div>

            <button
              className="icon-btn theme-btn"
              title="Toggle theme"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="avatar">DA</div>
          </div>
        </header>

        <div className="content-wrap">

          {/* REFERENCE DETAIL PAGE */}

          {selected ? (
            <>
              <button
                className="back-link"
                onClick={() => setSelected(null)}
              >
                ← Back to library
              </button>

              <div className="detail-head">
                <div>
                  <div className="eyebrow">
                    {safeText(selected.subject)}
                    <span>/</span>
                    {safeText(selected.category)}
                  </div>

                  <h1>{safeText(selected.name)}</h1>

                  <p>{safeText(selected.description)}</p>
                </div>

                <button
                  className={`favorite-large ${
                    favourites.includes(selected.id) ? 'saved' : ''
                  }`}
                  onClick={() => toggleFavourite(selected.id)}
                >
                  <Star
                    size={17}
                    fill={
                      favourites.includes(selected.id)
                        ? 'currentColor'
                        : 'none'
                    }
                  />

                  {favourites.includes(selected.id)
                    ? 'Saved'
                    : 'Save reference'}
                </button>
              </div>

              <div className="detail-grid">
                <div className="detail-main">

                  {/* SYNTAX */}

                  <section className="panel code-panel">
                    <div className="panel-top">
                      <div>
                        <span className="dot purple-dot" />
                        SYNTAX
                      </div>

                      <button
                        className="copy-btn"
                        onClick={() =>
                          copy(safeText(selected.syntax))
                        }
                      >
                        {copied ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}

                        {copied ? 'Copied' : 'Copy syntax'}
                      </button>
                    </div>

                    <pre>
                      <code>
                        {safeText(selected.syntax, 'No syntax available.')}
                      </code>
                    </pre>
                  </section>

                  {/* PRACTICAL EXAMPLE */}

                  <section className="panel">
                    <div className="section-heading">
                      <h3>Practical example</h3>
                      <span className="mini-tag">EXAMPLE</span>
                    </div>

                    <p className="muted">
                      Try this pattern in your own worksheet, notebook, or query editor.
                    </p>

                    <div className="example-code">
                      <code>
                        {safeText(selected.example, 'No example available.')}
                      </code>

                      <button
                        onClick={() =>
                          copy(safeText(selected.example))
                        }
                        title="Copy example"
                      >
                        <Copy size={15} />
                      </button>
                    </div>

                    <div className="output-row">
                      <span>Expected output</span>
                      <b>
                        {safeText(selected.output, 'Not specified')}
                      </b>
                    </div>
                  </section>

                  {/* EXPLANATION */}

                  <section className="panel">
                    <div className="section-heading">
                      <h3>How it works</h3>

                      <span className="step-count">
                        {selectedExplanation.length}{' '}
                        {selectedExplanation.length === 1 ? 'NOTE' : 'NOTES'}
                      </span>
                    </div>

                    {selectedExplanation.length > 0 ? (
                      <ol className="explain-list">
                        {selectedExplanation.map((line, i) => (
                          <li key={i}>
                            <span>
                              {String(i + 1).padStart(2, '0')}
                            </span>

                            <p>{line}</p>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="muted">
                        No explanation available for this reference.
                      </p>
                    )}
                  </section>

                  {/* COMMON MISTAKES */}

                  <section className="panel">
                    <div className="section-heading">
                      <h3>Common mistakes to avoid</h3>
                    </div>

                    {selectedMistakes.length > 0 ? (
                      <ul className="mistake-list">
                        {selectedMistakes.map((mistake, i) => (
                          <li key={i}>{mistake}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted">
                        No common mistakes have been added yet.
                      </p>
                    )}
                  </section>
                </div>

                {/* RIGHT SIDEBAR */}

                <div className="detail-side">
                  <section className="panel side-panel">
                    <h3>Reference details</h3>

                    <div className="meta-row">
                      <span>Subject</span>
                      <b>{safeText(selected.subject)}</b>
                    </div>

                    <div className="meta-row">
                      <span>Category</span>
                      <b>{safeText(selected.category)}</b>
                    </div>

                    <div className="meta-row">
                      <span>Reference ID</span>
                      <b className="mono">
                        {safeText(selected.id)}
                      </b>
                    </div>

                    <div className="side-divider" />

                    <h4>Search tags</h4>

                    <div className="tag-wrap">
                      {selectedTags.length > 0 ? (
                        selectedTags.map((tag, i) => (
                          <span
                            className="tag"
                            key={`${tag}-${i}`}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="muted">
                          No tags available
                        </span>
                      )}
                    </div>
                  </section>

                  {/* RELATED REFERENCES */}

                  <section className="panel side-panel">
                    <h3>Related references</h3>

                    {relatedReferences.length > 0 ? (
                      relatedReferences.map(r => (
                        <button
                          className="related-item"
                          key={r.id}
                          onClick={() => openReference(r)}
                        >
                          <span>
                            {safeText(r.name)}

                            <small>
                              {safeText(r.subject)} · {safeText(r.category)}
                            </small>
                          </span>

                          <ArrowUpRight size={15} />
                        </button>
                      ))
                    ) : (
                      <p className="muted">
                        No related references available.
                      </p>
                    )}
                  </section>
                </div>
              </div>
            </>
          ) : view === 'Handbooks' ? (

            /* HANDBOOKS OVERVIEW PAGE */

            <>
              <div className="hero">
                <div className="hero-copy">
                  <div className="eyebrow">
                    <span className="eyebrow-star">✦</span>
                    LEARN · REVISE · GROW
                  </div>

                  <h1>Your Learning Handbooks.</h1>

                  <p>
                    Keep essential Data Analyst learning resources in one place.
                    Open a handbook online or download it for later reference.
                  </p>
                </div>

                <div className="hero-decoration">
                  <div className="deco-card deco-one">
                    <span>PDF</span>
                    <small>LEARN</small>
                  </div>

                  <div className="deco-card deco-two">
                    <span>{'{ }'}</span>
                    <small>PRACTICE</small>
                  </div>

                  <div className="deco-card deco-three">
                    <span>↗</span>
                    <small>GROW</small>
                  </div>

                  <div className="deco-orbit" />
                </div>
              </div>

              <div className="section-title-row">
                <div>
                  <div className="eyebrow">YOUR PDF LIBRARY</div>
                  <h2>Available Handbooks</h2>
                </div>

                <span className="subtle-count">
                  {handbooks.length} PDF resources
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '18px',
                  marginTop: '22px'
                }}
              >
                {handbooks.map(book => (
                  <article
                    key={book.file}
                    className="panel"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '250px',
                      padding: '22px',
                      gap: '14px'
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(124, 92, 255, 0.12)'
                      }}
                    >
                      <FileText size={25} />
                    </div>

                    <div>
                      <div className="eyebrow">
                        {book.category}
                      </div>

                      <h3 style={{ marginTop: '8px' }}>
                        {book.title}
                      </h3>

                      <p className="muted" style={{ marginTop: '9px' }}>
                        {book.description}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                        marginTop: 'auto',
                        paddingTop: '10px'
                      }}
                    >
                      <a
                        href={book.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '7px',
                          padding: '10px 13px',
                          borderRadius: '9px',
                          textDecoration: 'none',
                          background: '#7657e8',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 600
                        }}
                      >
                        <ExternalLink size={15} />
                        View PDF
                      </a>

                      <a
                        href={book.file}
                        download
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '7px',
                          padding: '10px 13px',
                          borderRadius: '9px',
                          textDecoration: 'none',
                          border: '1px solid var(--border, #dddddd)',
                          color: 'inherit',
                          fontSize: '13px',
                          fontWeight: 600
                        }}
                      >
                        <Download size={15} />
                        Download
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              <div className="panel" style={{ marginTop: '24px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={20} />
                  <h3>Learning tip</h3>
                </div>

                <p className="muted" style={{ marginTop: '8px' }}>
                  Use these handbooks for quick revision while practising Excel,
                  SQL, Python and Power BI. Download a PDF when you want to keep
                  a local copy on your device.
                </p>
              </div>
            </>
          ) : (

            /* DASHBOARD AND REFERENCE LIBRARY */

            <>
              <div className="hero">
                <div className="hero-copy">
                  <div className="eyebrow">
                    <span className="eyebrow-star">✦</span>
                    YOUR PERSONAL ANALYTICS TOOLKIT
                  </div>

                  <h1>
                    {query
                      ? 'Search your knowledge library'
                      : view === 'Dashboard'
                        ? 'Everything you need.'
                        : ` ${view}.`}
                  </h1>

                  <p>
                    {query
                      ? `Showing matching references for “${query}”.`
                      : 'A searchable home for formulas, functions, queries and concepts. Find what you need, understand how it works, and get back to building.'}
                  </p>
                </div>

                <div className="hero-decoration">
                  <div className="deco-card deco-one">
                    <span>Σ</span>
                    <small>ANALYZE</small>
                  </div>

                  <div className="deco-card deco-two">
                    <span>{'{ }'}</span>
                    <small>BUILD</small>
                  </div>

                  <div className="deco-card deco-three">
                    <span>↗</span>
                    <small>GROW</small>
                  </div>

                  <div className="deco-orbit" />
                </div>
              </div>

              {/* GLOBAL SEARCH */}

              <div className="search-wrap">
                <Search size={20} />

                <input
                  id="global-search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search formulas, functions, queries, concepts..."
                />

                <div className="search-shortcut">
                  <Command size={12} /> K
                </div>

                {query && (
                  <button
                    className="clear-search"
                    onClick={() => setQuery('')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* HOMEPAGE */}

              {isHome && (
                <>
                  <div className="section-title-row">
                    <div>
                      <div className="eyebrow">
                        EXPLORE YOUR TOOLKIT
                      </div>

                      <h2>Browse by subject</h2>
                    </div>

                    <span className="subtle-count">
                      {subjects.length} learning areas
                    </span>
                  </div>

                  <div className="subject-grid">
                    {subjects.map(s => (
                      <button
                        className="subject-card"
                        key={s.slug}
                        onClick={() => {
                          setView(s.name);
                          setSelected(null);
                          setSubjectFilter('All subjects');
                        }}
                      >
                        <div className={`subject-icon ${s.color}`}>
                          {s.icon}
                        </div>

                        <div className="subject-card-copy">
                          <h3>{s.name}</h3>
                          <p>{s.description}</p>
                        </div>

                        <div className="subject-card-bottom">
                          <span>
                            {references.filter(
                              r => r.subject === s.name
                            ).length}{' '}
                            references
                          </span>

                          <ArrowUpRight size={16} />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="section-title-row popular-title">
                    <div>
                      <div className="eyebrow">QUICK ACCESS</div>
                      <h2>Popular references</h2>
                    </div>

                    <button
                      className="text-link"
                      onClick={() => {
                        setView('Dashboard');
                        setQuery('');
                      }}
                    >
                      View library <ArrowUpRight size={14} />
                    </button>
                  </div>

                  <div className="popular-grid">
                    {popular.map((r, i) => (
                      <button
                        key={r.id}
                        className="popular-card"
                        onClick={() => openReference(r)}
                      >
                        <span className="popular-number">
                          0{i + 1}
                        </span>

                        <span className="popular-info">
                          <b>{safeText(r.name)}</b>

                          <small>
                            {safeText(r.subject)} · {safeText(r.category)}
                          </small>
                        </span>

                        <ArrowUpRight size={15} />
                      </button>
                    ))}
                  </div>

                  {recentItems.length > 0 && (
                    <>
                      <div className="section-title-row recent-title">
                        <div>
                          <div className="eyebrow">
                            PICK UP WHERE YOU LEFT OFF
                          </div>

                          <h2>Recently viewed</h2>
                        </div>

                        <button
                          className="text-link"
                          onClick={() => setView('Recently viewed')}
                        >
                          See all <ArrowUpRight size={14} />
                        </button>
                      </div>

                      <div className="recent-strip">
                        {recentItems.slice(0, 4).map(r => (
                          <button
                            key={r.id}
                            className="recent-card"
                            onClick={() => openReference(r)}
                          >
                            <Clock3 size={15} />

                            <span>
                              <b>{safeText(r.name)}</b>
                              <small>{safeText(r.subject)}</small>
                            </span>

                            <ChevronRight size={15} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* SEARCH RESULTS AND SUBJECT LIBRARY */}

              {!isHome && (
                <>
                  <div className="results-toolbar">
                    <div>
                      <div className="eyebrow">
                        {query ? 'SEARCH RESULTS' : 'REFERENCE LIBRARY'}
                      </div>

                      <h2>
                        {filtered.length}{' '}
                        {filtered.length === 1
                          ? 'reference'
                          : 'references'}{' '}
                        <span>found</span>
                      </h2>
                    </div>

                    <div className="filter-controls">
                      <label>
                        <Filter size={14} />

                        <select
                          value={subjectFilter}
                          onChange={e =>
                            setSubjectFilter(e.target.value)
                          }
                        >
                          <option>All subjects</option>

                          {subjects.map(s => (
                            <option key={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <select
                        className="sort-select"
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                      >
                        <option>Popular</option>
                        <option>A–Z</option>
                        <option>Subject</option>
                      </select>
                    </div>
                  </div>

                  <div className="results-list">
                    {filtered.map(r => (
                      <article
                        key={r.id}
                        className="result-card"
                      >
                        <button
                          className="result-open"
                          onClick={() => openReference(r)}
                        >
                          <div className="result-icon">
                            <Hash size={17} />
                          </div>

                          <div className="result-copy">
                            <div className="result-meta">
                              <span>{safeText(r.subject)}</span>
                              <i>·</i>
                              <span>{safeText(r.category)}</span>
                            </div>

                            <h3>{safeText(r.name)}</h3>

                            <p>{safeText(r.description)}</p>

                            <code className="result-syntax">
                              {safeText(r.syntax)}
                            </code>
                          </div>

                          <ArrowUpRight
                            className="result-arrow"
                            size={17}
                          />
                        </button>

                        <button
                          className={`result-star ${
                            favourites.includes(r.id) ? 'saved' : ''
                          }`}
                          onClick={() => toggleFavourite(r.id)}
                          title="Toggle favourite"
                        >
                          <Star
                            size={17}
                            fill={
                              favourites.includes(r.id)
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                      </article>
                    ))}
                  </div>

                  {/* EMPTY STATE */}

                  {filtered.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Search size={25} />
                      </div>

                      <h3>No references found</h3>

                      <p>
                        Try another keyword, or switch the subject filter to All subjects.
                      </p>

                      <button
                        onClick={() => {
                          setQuery('');
                          setSubjectFilter('All subjects');
                          setView('Dashboard');
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* FOOTER */}

          <footer className="footer">
            <span>© 2026 DataAnalyst Hub</span>

            <span>
              Made for learning, building & better analysis <b>✦</b>
            </span>

            <span>{references.length} starter references</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
