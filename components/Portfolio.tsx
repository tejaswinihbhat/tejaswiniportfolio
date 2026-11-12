
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
  teachingSubjects,
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

function getCertificateType(url?: string) {
  if (!url) return "none";

  const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();

  if (cleanUrl.endsWith(".pdf")) return "pdf";

  if (/\.(jpg|jpeg|png|webp)$/.test(cleanUrl)) {
    return "image";
  }

  return "other";
}
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
const certificateSectionDetails = [
  {
    category: "Faculty Development Programs (FDP)",
    id: "fdp",
    title: "Faculty Development Programs",
    eyebrow: "01 / PROFESSIONAL DEVELOPMENT",
    description: "Faculty development programmes, refresher courses and academic training."
  },
  {
    category: "Workshops and Training",
    id: "workshops",
    title: "Workshops and Training",
    eyebrow: "02 / SKILL DEVELOPMENT",
    description: "Technical workshops, hands-on training and professional learning."
  },
  {
    category: "Conferences",
    id: "conferences",
    title: "Conferences",
    eyebrow: "03 / ACADEMIC PARTICIPATION",
    description: "Conference participation, presentations and scholarly events."
  },
  {
    category: "Research and Publications",
    id: "research-recognition",
    title: "Research and Publications",
    eyebrow: "04 / RESEARCH",
    description: "Research achievements and publication-related recognition."
  },
  {
    category: "Professional Certifications",
    id: "certifications",
    title: "Professional Certifications",
    eyebrow: "05 / CREDENTIALS",
    description: "Professional courses, technical certifications and credentials."
  },
  {
    category: "Awards and Recognition",
    id: "awards",
    title: "Awards and Recognition",
    eyebrow: "06 / ACHIEVEMENTS",
    description: "Awards, honours and professional recognition."
  },
  {
    category: "Journal Reviewer",
    id: "journal-reviewer",
    title: "Journal Reviewer",
    eyebrow: "07 / PEER REVIEW",
    description: "Journal peer-review certificates and editorial recognition."
  },
  {
    category: "Conference Reviewer",
    id: "conference-reviewer",
    title: "Conference Reviewer",
    eyebrow: "08 / PEER REVIEW",
    description: "Conference reviewing and technical programme committee recognition."
  },
  {
    category: "Other Recognition",
    id: "other-recognition",
    title: "Other Recognition",
    eyebrow: "09 / PROFESSIONAL RECOGNITION",
    description: "Additional academic and professional achievements."
  }
];

// Point-wise academic and institutional contributions shown under Other Recognition.
const otherRecognitions = [
  "Question paper setter and external evaluator for Nitte University semester examinations.",
  "Department coordinator for the Placement Committee, Cultural Committee and Women Empowerment Club at SMVITM.",
  "Coordinator for institutional fests and NAAC, NBA and Unnat Bharat Abhiyan applications.",
  "Moderator at MITE, Moodbidri."
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
    ["Teaching", "teaching"],
    ["FDP", "fdp"],
["Workshops", "workshops"],
["Conferences", "conferences"],
["Research Recognition", "research-recognition"],
["Certifications", "certifications"],
["Awards", "awards"],
["Journal Reviewer", "journal-reviewer"],
["Conference Reviewer", "conference-reviewer"],
["Other Recognition", "other-recognition"],
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
  aria-expanded={menu}
  aria-controls="portfolio-navigation"
>
  {menu ? <X size={25} /> : <Menu size={25} />}
</button>
        
        <nav
  id="portfolio-navigation"
  className={menu ? "nav open" : "nav"}
>
          {nav.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenu(false)}
            >
              {label}
            </a>
          ))}

         <a
  className="admin-link"
  href="#admin"
  onClick={() => setMenu(false)}
>
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
            <img
  src="/profile.jpg"
  alt="Dr. Tejaswini H"
  className="profile-photo"
/>
          </div>

          <p>
            Curiosity. Knowledge.
            <br />
            Meaningful impact.
          </p>

          <div className="side-line"></div>

          <span className="side-caption">
           COMPUTER SCIENCE AND ENGINEERING
            <br />
            ARTIFICIAL INTELLIGENCE AND DATA SCIENCE
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

   <section id="research" className="research-band">
        <div className="research-intro">
          <span className="eyebrow gold-text">
            03 / RESEARCH FOCUS
          </span>

          <h2>
            Exploring ideas. 
            <br />
            <em>Engineering intelligence.</em>
          </h2>

          <p>
           Research exploring the convergence of artificial intelligence, knowledge engineering, semantic technologies, and applied computing to develop intelligent, knowledge-driven solutions for real-world challenges.
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

       
      </section>

      {/* ACHIEVEMENTS / RECOGNITION & SERVICE */}

      <section
        id="achievements"
        className="section achievements-section"
      >
        <SectionTitle
          eyebrow="05 / RECOGNITION & SERVICE"
          title="Academic contributions"
          text="Peer-review, teaching and institutional contributions are presented in their respective sections."
        />

        <div className="achievement-grid">
          <article className="achievement-card">
            <div className="card-icon">
              <Award />
            </div>
            <h3>Peer-review contributions</h3>
            <p>
              Journal and conference peer-review activities, including
              editorial and technical programme committee contributions.
            </p>
            <a className="text-link" href="#journal-reviewer">
              View journal reviewing <ArrowUpRight size={14} />
            </a>
            <a className="text-link" href="#conference-reviewer">
              View conference reviewing <ArrowUpRight size={14} />
            </a>
          </article>

          <article className="achievement-card">
            <div className="card-icon">
              <BookOpen />
            </div>
            <h3>Academic & institutional service</h3>
            <p>
              Academic evaluation, departmental coordination and
              institutional responsibilities are detailed under Other
              Recognition.
            </p>
            <a className="text-link" href="#other-recognition">
              View other recognition <ArrowUpRight size={14} />
            </a>
          </article>
        </div>
      </section>

      {/* SEPARATE TEACHING EXPERIENCE SECTION */}

      <section id="teaching" className="section teaching-section">
        <SectionTitle
          eyebrow="06 / TEACHING EXPERIENCE"
          title="Subjects handled"
          text="Courses handled across computer science, artificial intelligence and data science."
        />

        <div className="teaching-subject-grid">
          {teachingSubjects.map((subject, index) => (
            <article className="teaching-subject-card" key={`${subject}-${index}`}>
              <span className="teaching-subject-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{subject}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* SEPARATE PROFESSIONAL RECOGNITION SECTIONS */}

{certificateSectionDetails.map((section) => {
  const sectionCertificates = certs.filter(
    (c) =>
      (c.category || "Professional Certifications") ===
      section.category
  );

  return (
    <section
      id={section.id}
      className="section certificate-category-section"
      key={section.id}
    >
      <SectionTitle
        eyebrow={section.eyebrow}
        title={section.title}
        text={section.description}
      />

      {section.id === "journal-reviewer" && (
        <div className="journal-review-summary">
          {reviewerJournals.map((journal) => (
            <article className="journal-review-item" key={journal[0]}>
              <div className="journal-review-top">
                <span className="journal-review-name">{journal[0]}</span>
                <span className="journal-review-quartile">{journal[1]}</span>
              </div>
              <div className="journal-review-count">
                <strong>{journal[2]}</strong>
                <span>{journal[2] === 1 ? "review" : "reviews"}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {section.id === "other-recognition" && (
        <div className="other-recognition-list">
          {otherRecognitions.map((item, index) => (
            <div className="other-recognition-item" key={index}>
              <span className="recognition-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      )}

      {sectionCertificates.length > 0 ? (
        <div className="certificate-grid">
          {sectionCertificates.map((c) => (
            <article className="certificate-card" key={c.id}>
              <div className="certificate-preview">
  {c.file_url ? (
    <a
      href={c.file_url}
      target="_blank"
      rel="noreferrer"
      className="certificate-preview-link"
      aria-label={`View full certificate: ${c.title}`}
    >
      {getCertificateType(c.file_url) === "image" ? (
        <img
          src={c.file_url}
          alt={`Certificate: ${c.title}`}
          loading="lazy"
        />
      ) : getCertificateType(c.file_url) === "pdf" ? (
        <iframe
          src={`${c.file_url}#page=1&toolbar=0&navpanes=0`}
          title={`Certificate preview: ${c.title}`}
          loading="lazy"
        />
      ) : (
        <div className="certificate-file-placeholder">
          <FileText size={35} />
          <span>OPEN CERTIFICATE</span>
        </div>
      )}

      <span className="certificate-preview-label">
        {getCertificateType(c.file_url) === "pdf"
          ? "PDF CERTIFICATE"
          : "VIEW CERTIFICATE"}
      </span>
    </a>
  ) : (
    <div className="certificate-file-placeholder">
      <FileText size={35} />
      <span>CREDENTIAL</span>
    </div>
  )}
</div>

              <div className="certificate-info">
                <h3>{c.title}</h3>

                <p>{c.issuer}</p>

                <small>{c.event_date || c.year}</small>

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
      ) : (
        <p className="empty-certificates">
          Records under this category will be updated soon.
        </p>
      )}
    </section>
  );
})}

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

      <style jsx global>{`
        .journal-review-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin: 30px 0 36px;
        }
        .journal-review-item {
          padding: 20px 22px;
          background: #fff;
          border: 1px solid rgba(16, 36, 58, 0.12);
          border-radius: 14px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .journal-review-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(16, 36, 58, 0.08);
        }
        .journal-review-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .journal-review-name {
          color: #10243a;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.5;
        }
        .journal-review-quartile {
          flex-shrink: 0;
          padding: 4px 9px;
          border-radius: 5px;
          background: #f4eee1;
          color: #94743c;
          font-size: 11px;
          font-weight: 700;
        }
        .journal-review-count {
          display: flex;
          align-items: baseline;
          gap: 7px;
          margin-top: 18px;
          color: #64748b;
          font-size: 12px;
        }
        .journal-review-count strong {
          color: #10243a;
          font-family: Georgia, serif;
          font-size: 27px;
          font-weight: 600;
        }
        .teaching-subject-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 30px;
        }
        .teaching-subject-card {
          min-height: 130px;
          padding: 22px;
          border: 1px solid rgba(16, 36, 58, 0.12);
          border-radius: 14px;
          background: #fff;
        }
        .teaching-subject-number {
          display: block;
          margin-bottom: 16px;
          color: #a88a52;
          font-family: Georgia, serif;
          font-size: 14px;
          font-weight: 600;
        }
        .teaching-subject-card h3 {
          margin: 0;
          color: #10243a;
          font-size: 16px;
          line-height: 1.5;
        }
        .other-recognition-list {
          display: flex;
          flex-direction: column;
          margin: 24px 0 32px;
        }
        .other-recognition-item {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          padding: 19px 0;
          border-bottom: 1px solid rgba(16, 36, 58, 0.12);
        }
        .other-recognition-item:first-child {
          border-top: 1px solid rgba(16, 36, 58, 0.12);
        }
        .recognition-number {
          flex-shrink: 0;
          padding-top: 2px;
          color: #a88a52;
          font-family: Georgia, serif;
          font-size: 15px;
          font-weight: 600;
        }
        .other-recognition-item p {
          margin: 0;
          color: #34465a;
          font-size: 15px;
          line-height: 1.7;
        }
        @media (max-width: 900px) {
          .journal-review-summary,
          .teaching-subject-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 550px) {
          .journal-review-summary,
          .teaching-subject-grid {
            grid-template-columns: 1fr;
          }
          .journal-review-item,
          .teaching-subject-card {
            padding: 18px;
          }
          .other-recognition-item {
            gap: 13px;
          }
        }
      `}</style>
    </main>
  );
}
