
"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Mail,
  Menu,
  Microscope,
  ShieldCheck,
  X,
  ExternalLink,
  FileText,
  LogOut,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

import {
  profile,
  education,
  experience,
  publications,
  researchAreas,
  certifications,
  reviewerJournals,
  reviewerConferences,
  teachingSubjects,
  contributions,
  fdpItems,
  professionalLinks
} from "@/lib/content";

import { supabase, supabaseReady } from "@/lib/supabase";

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  year: string;
  category: string;
  event_date?: string;
  file_url?: string;
  storage_path?: string;
  description?: string;
};
const certificateCategories = [
  "Faculty Development Programs (FDP)",
  "Workshops and Training",
  "Conferences",
  "Research and Publications",
  "Professional Certifications",
  "Awards and Recognition",
  "Journal Reviewer",
  "Conference Reviewer",
  "Other Recognition"
];

function SectionTitle({
  eyebrow,
  title,
  text
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-title">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export default function Portfolio() {
  const [menu, setMenu] = useState(false);

const [activeCategory, setActiveCategory] = useState("All");


  const [certs, setCerts] = useState<Certificate[]>(
  certifications.map((c, i) => ({
    ...c,
    id: `sample-${i}`,
    category: "Professional Certifications"
  }))
);

  const [admin, setAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [upload, setUpload] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadCertificates() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setNotice(error.message);
      return;
    }

    if (data) {
      setCerts(data as Certificate[]);
    }
  }

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setAdmin(Boolean(data.session));
      }
    });

    loadCertificates();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAdmin(Boolean(session));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");

    if (!supabase) {
      setNotice("Connect Supabase first using the setup guide.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setNotice(
      error ? error.message : "Signed in successfully."
    );
  }

  async function saveCertificate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!supabase || !admin || !editing) return;

    setBusy(true);
    setNotice("");

    let file_url = editing.file_url || "";
    let storage_path = editing.storage_path || "";

    if (upload) {
      const path = `${Date.now()}-${upload.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "-"
      )}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(path, upload, { upsert: false });

      if (uploadError) {
        setNotice(uploadError.message);
        setBusy(false);
        return;
      }

      storage_path = path;

      const { data } = supabase.storage
        .from("certificates")
        .getPublicUrl(path);

      file_url = data.publicUrl;
    }

 const payload = {
  title: editing.title,
  issuer: editing.issuer,
  year: editing.year,
  category: editing.category || "Professional Certifications",
  event_date: editing.event_date || "",
  description: editing.description || "",
  file_url,
  storage_path
};

    const result =
      editing.id === "new" ||
      editing.id.startsWith("sample-")
        ? await supabase.from("certificates").insert(payload)
        : await supabase
            .from("certificates")
            .update(payload)
            .eq("id", editing.id);

    if (result.error) {
      setNotice(result.error.message);
    } else {
      setNotice("Certificate saved.");
      setEditing(null);
      setUpload(null);
      await loadCertificates();
    }

    setBusy(false);
  }

  async function deleteCertificate(id: string) {
    if (
      !supabase ||
      !admin ||
      !confirm("Delete this certificate entry?")
    ) {
      return;
    }

    const item = certs.find((c) => c.id === id);

    if (item?.storage_path) {
      await supabase.storage
        .from("certificates")
        .remove([item.storage_path]);
    }

    const { error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", id);

    setNotice(
      error ? error.message : "Certificate deleted."
    );

    await loadCertificates();
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setAdmin(false);
  }

  const nav: [string, string][] = [
    ["About", "about"],
    ["Education", "education"],
    ["Research", "research"],
    ["Publications", "publications"],
    ["Achievements", "achievements"],
    ["Certificates", "certificates"],
    ["Professional Links", "professional-links"],
    ["Contact", "contact"]
  ];

  return (
    <main>
      {/* HEADER */}

      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">TH</span>
          <span>
            DR. TEJASWINI H
            <small>ACADEMIC PORTFOLIO</small>
          </span>
        </a>

        <button
          className="mobile-menu"
          onClick={() => setMenu(!menu)}
          aria-label="Toggle navigation"
        >
          {menu ? <X /> : <Menu />}
        </button>

        <nav className={menu ? "nav open" : "nav"}>
          {nav.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenu(false)}
            >
              {label}
            </a>
          ))}

          <a className="admin-link" href="#admin">
            <ShieldCheck size={15} /> Admin
          </a>
        </nav>
      </header>

      {/* HERO */}

      <section id="home" className="hero">
        <div className="hero-glow"></div>

        <div className="hero-content">
          <span className="eyebrow gold-text">
            ACADEMIA · RESEARCH · INNOVATION
          </span>

          <h1>
            Dr. Tejaswini <em>H</em>
          </h1>

          <p className="hero-role">{profile.role}</p>

          <p className="hero-summary">
            {profile.tagline}
          </p>

          <div className="hero-actions">
            <a className="button button-gold" href="#publications">
              Explore Research <ArrowUpRight size={17} />
            </a>

            <a className="button button-outline" href="#contact">
              Get in touch
            </a>
          </div>

          <div className="hero-meta">
            <span>
              <BriefcaseBusiness size={16} />
              SMVITM, Bantakal
            </span>

            <span>
              <GraduationCap size={17} />
              Ph.D. · 2026
            </span>
          </div>
        </div>

        <div className="hero-side">
          <div className="monogram">
            TH<span>✦</span>
          </div>

          <p>
            Curiosity. Knowledge.
            <br />
            Meaningful impact.
          </p>

          <div className="side-line"></div>

          <span className="side-caption">
            COMPUTER ENGINEERING
            <br />
            ARTIFICIAL INTELLIGENCE
            <br />
            DATA SCIENCE
          </span>
        </div>
      </section>

      {/* ABOUT */}

      <section id="about" className="section about-section">
        <div className="about-label">
          <span className="eyebrow">01 / PROFILE</span>

          <h2>
            About
            <br />
            <em>my work.</em>
          </h2>
        </div>

        <div className="about-copy">
          <p className="lead">{profile.summary}</p>

          <p>
            Currently serving as Assistant Professor and
            In-charge Head of the Department of Artificial
            Intelligence and Data Science at SMVITM, Bantakal.
            Completed doctoral research at MAHE, Manipal, on
            ontology-based fish classification and recommender
            systems for aquaculture in estuaries.
          </p>
        </div>
      </section>

      {/* STATISTICS */}

      <section className="stats-band">
        <div>
          <strong>13+</strong>
          <span>Years in academia</span>
        </div>

        <div>
          <strong>5</strong>
          <span>Research publications listed</span>
        </div>

        <div>
          <strong>28</strong>
          <span>Journal & conference reviews*</span>
        </div>

        <div>
          <strong>2026</strong>
          <span>Ph.D. awarded</span>
        </div>

        <small>
          *Journal review counts shown in the supplied profile;
          conference reviews are additional.
        </small>
      </section>

      {/* EDUCATION AND EXPERIENCE */}

      <section id="education" className="section">
        <SectionTitle
          eyebrow="02 / JOURNEY"
          title="Education & experience"
          text="Academic foundations and professional appointments."
        />

        <div className="two-col">
          <div>
            <h3 className="subhead">
              <GraduationCap /> Education
            </h3>

            <div className="timeline">
              {education.map((e, i) => (
                <article className="timeline-item" key={i}>
                  <span className="timeline-year">{e.year}</span>
                  <h4>{e.degree}</h4>
                  <p>{e.institution}</p>
                  <small>{e.detail}</small>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h3 className="subhead">
              <BriefcaseBusiness /> Experience
            </h3>

            <div className="timeline">
              {experience.map((e, i) => (
                <article className="timeline-item" key={i}>
                  <span className="timeline-year">{e.period}</span>
                  <h4>{e.role}</h4>
                  <p>{e.organisation}</p>
                  <small>{e.detail}</small>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RESEARCH */}

      <section className="research-band">
        <div className="research-intro">
          <span className="eyebrow gold-text">
            03 / RESEARCH FOCUS
          </span>

          <h2>
            Questions that
            <br />
            <em>move knowledge.</em>
          </h2>

          <p>
            Interdisciplinary research at the intersection of
            intelligent systems, knowledge representation and
            applied computing.
          </p>
        </div>

        <div className="research-tags">
          {researchAreas.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
      </section>

      {/* PUBLICATIONS */}

      <section id="publications" className="section">
        <SectionTitle
          eyebrow="04 / SCHOLARLY WORK"
          title="Selected publications"
          text="Journal articles and peer-reviewed conference proceedings."
        />

        <div className="publication-list">
          {publications.map((p, i) => (
            <article className="publication" key={i}>
              <div className="pub-year">
                {p.year}
                <span>{p.type}</span>
              </div>

              <div className="pub-body">
                <h3>{p.title}</h3>
                <p>{p.authors}</p>
                <small>
                  {p.venue} · {p.note}
                </small>
              </div>

              <a
                href={p.doi}
                target="_blank"
                rel="noreferrer"
                aria-label="Open DOI"
              >
                <ArrowUpRight />
              </a>
            </article>
          ))}
        </div>

        <p className="source-note">
          Publication details transcribed from the supplied
          profile. Please verify metadata and indexing before
          formal use.
        </p>
      </section>

      {/* ACHIEVEMENTS */}

      <section
        id="achievements"
        className="section achievements-section"
      >
        <SectionTitle
          eyebrow="05 / RECOGNITION & SERVICE"
          title="Academic contributions"
          text="Peer review, faculty development, teaching and institutional service."
        />

        <div className="achievement-grid">
          <article className="achievement-card">
            <div className="card-icon">
              <Award />
            </div>

            <h3>Journal reviewer</h3>

            <p>
              Peer-review contributions recorded in the
              supplied profile.
            </p>

            <div className="review-table">
              {reviewerJournals.map((r) => (
                <div key={r[0]}>
                  <span>{r[0]}</span>
                  <b>{r[1]}</b>
                  <small>{r[2]} reviews</small>
                </div>
              ))}
            </div>
          </article>

          <article className="achievement-card">
            <div className="card-icon">
              <Microscope />
            </div>

            <h3>Conference reviewer</h3>

            <p>Selected international conferences.</p>

            <ul className="compact-list">
              {reviewerConferences.slice(0, 8).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>

            <small className="muted">
              Additional conference review records can be added
              through the admin dashboard in a future content update.
            </small>
          </article>

          <article className="achievement-card">
            <div className="card-icon">
              <BookOpen />
            </div>

            <h3>Teaching & academic service</h3>

            <p>
              Subjects handled and institutional contributions.
            </p>

            <div className="tag-cloud">
              {teachingSubjects.slice(0, 8).map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>

            <ul className="compact-list">
              {contributions.slice(0, 4).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* FACULTY DEVELOPMENT */}

      <section className="fdp-band">
        <div>
          <span className="eyebrow gold-text">
            CONTINUOUS LEARNING
          </span>

          <h2>
            Faculty development
            <br />
            <em>& professional growth.</em>
          </h2>
        </div>

        <ul>
          {fdpItems.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      {/* CERTIFICATES */}

<section id="certificates" className="section">
  <SectionTitle
    eyebrow="06 / CREDENTIALS"
    title="Certificates & professional recognition"
    text="Explore faculty development programmes, workshops, conferences, certifications and academic recognition."
  />

  <div className="category-filter">
    <button
      className={activeCategory === "All" ? "active" : ""}
      onClick={() => setActiveCategory("All")}
    >
      All
    </button>

    {certificateCategories.map((category) => (
      <button
        key={category}
        className={activeCategory === category ? "active" : ""}
        onClick={() => setActiveCategory(category)}
      >
        {category}
      </button>
    ))}
  </div>

  <div className="certificate-grid">
    {certs
      .filter((c) =>
        activeCategory === "All"
          ? true
          : (c.category || "Professional Certifications") === activeCategory
      )
      .map((c) => (
        <article className="certificate-card" key={c.id}>
          <div className="certificate-preview">
            <FileText size={32} />
            <span>
              {c.file_url ? "CERTIFICATE FILE" : "CREDENTIAL"}
            </span>
          </div>

          <div className="certificate-info">
            <span className="eyebrow">
              {c.category || "Professional Certifications"}
            </span>

            <h3>{c.title}</h3>

            <p>{c.issuer}</p>

            <small>
              {c.event_date || c.year}
            </small>

            {c.description && (
              <p className="certificate-description">
                {c.description}
              </p>
            )}

            {c.file_url && (
              <a
                href={c.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                View certificate <ExternalLink size={14} />
              </a>
            )}

            {admin && (
              <div className="item-actions">
                <button onClick={() => setEditing(c)}>
                  <Pencil size={14} /> Edit
                </button>

                {!c.id.startsWith("sample-") && (
                  <button onClick={() => deleteCertificate(c.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
  </div>

  {certs.filter((c) =>
    activeCategory === "All"
      ? true
      : (c.category || "Professional Certifications") === activeCategory
  ).length === 0 && (
    <p className="empty-certificates">
      No certificates have been added under this category yet.
    </p>
  )}
</section>

      {/* PROFESSIONAL LINKS */}

      <section
        id="professional-links"
        className="section professional-links-section"
      >
        <SectionTitle
          eyebrow="07 / PROFESSIONAL PRESENCE"
          title="Professional links"
          text="Access the researcher profiles, scholarly databases and professional contact channels associated with my academic work."
        />

        <div className="professional-link-grid">
          {professionalLinks.map((item) => (
            <a
              className="professional-link-card"
              href={item.href}
              key={item.label}
              target={
                item.href.startsWith("mailto:")
                  ? undefined
                  : "_blank"
              }
              rel={
                item.href.startsWith("mailto:")
                  ? undefined
                  : "noreferrer"
              }
            >
              <span className="professional-link-icon">
                <ExternalLink size={18} />
              </span>

              <span className="professional-link-copy">
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
                <em>{item.value}</em>
              </span>

              <ArrowUpRight
                className="professional-link-arrow"
                size={17}
              />
            </a>
          ))}
        </div>
      </section>

      {/* CONTACT */}

      <section id="contact" className="contact-section">
        <div>
          <span className="eyebrow gold-text">
            08 / CONNECT
          </span>

          <h2>
            Let's connect
            <br />
            <em>and collaborate.</em>
          </h2>

          <p>
            For academic collaboration, research discussions,
            speaking engagements and professional enquiries.
          </p>

          <a
            className="button button-gold"
            href={`mailto:${profile.email}`}
          >
            <Mail size={17} /> {profile.email}
          </a>
        </div>
      </section>

      {/* ADMIN */}

      <section id="admin" className="admin-section">
        <div className="admin-heading">
          <span className="eyebrow">PRIVATE AREA</span>

          <h2>
            Portfolio <em>management.</em>
          </h2>

          <p>
            Sign in to manage certificate records. Profile and
            publication editing can be extended using the same
            admin pattern.
          </p>
        </div>

        {!admin ? (
          <form className="login-form" onSubmit={signIn}>
            <h3>
              <ShieldCheck /> Administrator sign in
            </h3>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Admin email"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
              />
            </label>

            <button className="button button-dark" type="submit">
              Sign in
            </button>

            {!supabaseReady && (
              <small className="warning">
                Supabase is not configured yet. Follow SETUP.md
                to activate the admin dashboard.
              </small>
            )}

            {notice && <small>{notice}</small>}
          </form>
        ) : (
          <div className="admin-panel">
            <div className="admin-panel-top">
              <h3>Certificate manager</h3>

              <button
                className="button button-dark"
                onClick={() =>
                  setEditing({
                  id: "new",
                  title: "",
                  issuer: "",
                  year: "",
                  category: "Faculty Development Programs (FDP)",
                  event_date: "",
                  description: ""
                })
                }
              >
                <Plus size={16} /> Add certificate
              </button>

              <button className="logout" onClick={signOut}>
                <LogOut size={16} /> Sign out
              </button>
            </div>

            <p>
              Manage the certificate gallery displayed on the
              public portfolio.
            </p>

            {notice && <small>{notice}</small>}

            {editing && (
              <form
                className="edit-form"
                onSubmit={saveCertificate}
              >
                <h4>
                  {editing.id === "new" ||
                  editing.id.startsWith("sample-")
                    ? "Add / migrate certificate"
                    : "Edit certificate"}
                </h4>

               <label>
  Certificate title
  <input
    value={editing.title}
    onChange={(e) =>
      setEditing({
        ...editing,
        title: e.target.value
      })
    }
    required
    placeholder="Enter certificate title"
  />
</label>

<label>
  Category
  <select
    value={editing.category || "Professional Certifications"}
    onChange={(e) =>
      setEditing({
        ...editing,
        category: e.target.value
      })
    }
    required
  >
    {certificateCategories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>
</label>

<label>
  Issuing organisation
  <input
    value={editing.issuer}
    onChange={(e) =>
      setEditing({
        ...editing,
        issuer: e.target.value
      })
    }
    required
    placeholder="Enter institution or organisation"
  />
</label>

<label>
  Year
  <input
    value={editing.year}
    onChange={(e) =>
      setEditing({
        ...editing,
        year: e.target.value
      })
    }
    placeholder="e.g. 2026"
  />
</label>

<label>
  Event date
  <input
    type="date"
    value={editing.event_date || ""}
    onChange={(e) =>
      setEditing({
        ...editing,
        event_date: e.target.value
      })
    }
  />
</label>

<label>
  Description
  <textarea
    value={editing.description || ""}
    onChange={(e) =>
      setEditing({
        ...editing,
        description: e.target.value
      })
    }
    placeholder="Enter a brief description of the programme, achievement or recognition"
    rows={4}
  />
</label>

<label>
  Certificate file (PDF, JPG, PNG)
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={(e) =>
      setUpload(e.target.files?.[0] || null)
    }
  />
</label>

                <div className="form-actions">
                  <button
                    className="button button-dark"
                    disabled={busy}
                  >
                    {busy ? "Saving…" : "Save certificate"}
                  </button>

                  <button
                    type="button"
                    className="button button-outline-dark"
                    onClick={() => {
                      setEditing(null);
                      setUpload(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="admin-list">
              {certs.map((c) => (
                <div key={c.id}>
                  <span>
                    {c.title}
                    <small>{c.issuer}</small>
                  </span>

                  <button onClick={() => setEditing(c)}>
                    <Pencil size={14} /> Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}

      <footer>
        <a className="brand" href="#home">
          <span className="brand-mark">TH</span>

          <span>
            DR. TEJASWINI H
            <small>ACADEMIC PORTFOLIO</small>
          </span>
        </a>

        <span>
          © {new Date().getFullYear()} Dr. Tejaswini H.
          All rights reserved.
        </span>

        <a href="#home">Back to top ↑</a>
      </footer>
    </main>
  );
}
