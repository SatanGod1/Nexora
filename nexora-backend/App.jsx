import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const COLORS = {
  navy: "#0A1628",
  navyLight: "#132040",
  gold: "#F5A623",
  goldLight: "#FFB84D",
  cream: "#FFF8F0",
  slate: "#4A5568",
  muted: "#8896A7",
  white: "#FFFFFF",
  border: "rgba(255,255,255,0.08)",
  cardBg: "rgba(255,255,255,0.04)",
};

const COMPANIES = [
  { name: "Google",   logoUrl: "https://logo.clearbit.com/google.com",   color: "#4285F4", fallback: "G" },
  { name: "Microsoft",logoUrl: "https://logo.clearbit.com/microsoft.com", color: "#00A4EF", fallback: "M" },
  { name: "Apple",    logoUrl: "https://logo.clearbit.com/apple.com",     color: "#555555", fallback: "" },
  { name: "Amazon",   logoUrl: "https://logo.clearbit.com/amazon.com",    color: "#FF9900", fallback: "A" },
  { name: "Meta",     logoUrl: "https://logo.clearbit.com/meta.com",      color: "#1877F2", fallback: "f" },
  { name: "Netflix",  logoUrl: "https://logo.clearbit.com/netflix.com",   color: "#E50914", fallback: "N" },
  { name: "Tesla",    logoUrl: "https://logo.clearbit.com/tesla.com",     color: "#CC0000", fallback: "T" },
  { name: "Spotify",  logoUrl: "https://logo.clearbit.com/spotify.com",   color: "#1DB954", fallback: "S" },
  { name: "Airbnb",   logoUrl: "https://logo.clearbit.com/airbnb.com",    color: "#FF5A5F", fallback: "A" },
  { name: "Uber",     logoUrl: "https://logo.clearbit.com/uber.com",      color: "#000000", fallback: "U" },
  { name: "Swiggy",   logoUrl: "https://logo.clearbit.com/swiggy.com",    color: "#FC8019", fallback: "S" },
  { name: "Zomato",   logoUrl: "https://logo.clearbit.com/zomato.com",    color: "#E23744", fallback: "Z" },
  { name: "Flipkart", logoUrl: "https://logo.clearbit.com/flipkart.com",  color: "#2874F0", fallback: "F" },
  { name: "Infosys",  logoUrl: "https://logo.clearbit.com/infosys.com",   color: "#007CC3", fallback: "I" },
  { name: "TCS",      logoUrl: "https://logo.clearbit.com/tcs.com",       color: "#0033A0", fallback: "T" },
  { name: "Wipro",    logoUrl: "https://logo.clearbit.com/wipro.com",     color: "#221F20", fallback: "W" },
];

// ─── COMPANY LOGO with Framer Motion ─────────────────────────────────────────

function CompanyLogo({ company, size = 36, radius = "50%", bgWhite = true }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <motion.div
      whileHover={{
        scale: 1.2,
        rotate: [0, -8, 8, -4, 4, 0],
        boxShadow: `0 0 0 3px ${company.color}66, 0 10px 28px ${company.color}55`,
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        width: size, height: size,
        borderRadius: radius,
        background: bgWhite ? "#ffffff" : company.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", flexShrink: 0, cursor: "pointer",
        border: bgWhite ? "1px solid rgba(255,255,255,0.15)" : "none",
      }}
    >
      {imgOk ? (
        <img
          src={company.logoUrl}
          alt={company.name}
          onError={() => setImgOk(false)}
          style={{ width: "72%", height: "72%", objectFit: "contain" }}
        />
      ) : (
        <span style={{
          fontWeight: 700,
          fontSize: size * 0.38,
          color: bgWhite ? company.color : "#fff",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {company.fallback}
        </span>
      )}
    </motion.div>
  );
}

function CompanyChip({ company, selected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={`company-chip ${selected ? "selected" : ""}`}
    >
      <CompanyLogo company={company} size={26} radius="50%" bgWhite />
      {company.name}
    </motion.button>
  );
}

const OPPORTUNITIES = [
  { id: "internship", label: "Internship", icon: "💼" },
  { id: "placement", label: "Campus Placement", icon: "🎓" },
  { id: "parttime", label: "Part-time", icon: "⏰" },
  { id: "freelance", label: "Freelance", icon: "🌐" },
  { id: "research", label: "Research", icon: "🔬" },
];

const JOB_TYPES = [
  { id: "fulltime", label: "Full-time", icon: "🏢" },
  { id: "remote", label: "Remote", icon: "🌎" },
  { id: "hybrid", label: "Hybrid", icon: "🔄" },
  { id: "contract", label: "Contract", icon: "📄" },
  { id: "leadership", label: "Leadership", icon: "⭐" },
];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "E-commerce", "EdTech",
  "Media", "Consulting", "Manufacturing", "Startup", "Government",
];

const DEGREES = [
  "B.Tech", "B.E.", "B.Sc.", "B.A.", "B.Com.", "B.B.A.", "B.Arch.",
  "M.Tech", "M.E.", "M.Sc.", "M.A.", "M.B.A.", "M.Arch.",
  "Ph.D.", "Diploma", "BCA", "MCA", "B.Pharm.", "M.Pharm.",
];

const COURSES_BY_DEGREE = {
  "B.Tech": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Biotechnology Engineering",
    "Data Science and AI",
    "Artificial Intelligence and ML",
    "Robotics and Automation",
    "Production Engineering",
    "Mining Engineering",
    "Agricultural Engineering",
  ],
  "B.E.": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Industrial Engineering",
    "Instrumentation Engineering",
  ],
  "B.Sc.": [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "Computer Science",
    "Statistics",
    "Biotechnology",
    "Microbiology",
    "Environmental Science",
    "Forensic Science",
    "Nursing",
    "Agriculture",
    "Data Science",
  ],
  "B.A.": [
    "English Literature",
    "History",
    "Political Science",
    "Economics",
    "Sociology",
    "Psychology",
    "Philosophy",
    "Geography",
    "Hindi Literature",
    "Journalism and Mass Communication",
    "Fine Arts",
    "Social Work",
  ],
  "B.Com.": [
    "General",
    "Accounting and Finance",
    "Banking and Insurance",
    "Computer Applications",
    "Taxation",
    "E-Commerce",
  ],
  "B.B.A.": [
    "General Management",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "International Business",
    "Entrepreneurship",
    "Logistics and Supply Chain",
    "Retail Management",
  ],
  "B.Arch.": [
    "Architecture",
    "Urban Planning",
    "Interior Design",
    "Landscape Architecture",
  ],
  "M.Tech": [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "VLSI Design",
    "Embedded Systems",
    "Software Engineering",
    "Data Science and ML",
    "Structural Engineering",
    "Thermal Engineering",
    "Power Systems",
    "Control Systems",
    "Robotics",
    "Cybersecurity",
  ],
  "M.E.": [
    "Computer Science and Engineering",
    "Electronics Engineering",
    "Mechanical Engineering",
    "Structural Engineering",
    "Environmental Engineering",
  ],
  "M.Sc.": [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Statistics",
    "Computer Science",
    "Biotechnology",
    "Data Science",
    "Microbiology",
    "Environmental Science",
  ],
  "M.A.": [
    "English Literature",
    "History",
    "Political Science",
    "Economics",
    "Sociology",
    "Psychology",
    "Journalism",
    "Public Administration",
    "Social Work",
  ],
  "M.B.A.": [
    "Finance",
    "Marketing",
    "Human Resources",
    "Operations Management",
    "Business Analytics",
    "Information Technology",
    "International Business",
    "Supply Chain Management",
    "Entrepreneurship",
    "Healthcare Management",
  ],
  "M.Arch.": [
    "Architecture",
    "Urban Design",
    "Sustainable Architecture",
    "Urban Planning",
  ],
  "Ph.D.": [
    "Computer Science",
    "Electronics Engineering",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Management",
    "Economics",
    "Life Sciences",
    "Environmental Science",
  ],
  "Diploma": [
    "Computer Science",
    "Electronics",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Fashion Design",
    "Hotel Management",
    "Pharmacy",
    "Agriculture",
  ],
  "BCA": [
    "Computer Applications",
    "Cloud Computing",
    "Cyber Security",
    "Data Science",
    "Mobile Application Development",
  ],
  "MCA": [
    "Computer Applications",
    "Cloud Computing and DevOps",
    "Artificial Intelligence",
    "Data Science",
    "Information Security",
  ],
  "B.Pharm.": [
    "Pharmacy",
    "Pharmaceutical Chemistry",
    "Pharmacology",
    "Pharmaceutics",
  ],
  "M.Pharm.": [
    "Pharmaceutical Chemistry",
    "Pharmacology",
    "Pharmaceutics",
    "Pharmacy Practice",
  ],
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0A1628;
    color: #ffffff;
    min-height: 100vh;
  }

  .page { min-height: 100vh; animation: fadeIn 0.5s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .btn-primary {
    background: linear-gradient(135deg, #F5A623, #FFB84D);
    color: #0A1628;
    border: none;
    padding: 14px 32px;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.3px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,166,35,0.35); }

  .btn-ghost {
    background: transparent;
    color: #ffffff;
    border: 1.5px solid rgba(255,255,255,0.2);
    padding: 14px 32px;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-ghost:hover { border-color: #F5A623; color: #F5A623; }

  .input-field {
    width: 100%;
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 14px 18px;
    color: #fff;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s;
  }
  .input-field:focus { border-color: #F5A623; background: rgba(255,255,255,0.08); }
  .input-field::placeholder { color: rgba(255,255,255,0.3); }

  select.input-field option { background: #132040; color: #fff; }

  .card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.2s;
  }
  .card:hover { border-color: rgba(245,166,35,0.3); background: rgba(255,255,255,0.06); }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.12);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
  }
  .tag.selected {
    background: rgba(245,166,35,0.15);
    border-color: #F5A623;
    color: #F5A623;
  }
  .tag:hover { border-color: rgba(245,166,35,0.5); }

  .company-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.1);
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255,255,255,0.03);
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
  }
  .company-chip.selected {
    border-color: #F5A623;
    background: rgba(245,166,35,0.1);
  }
  .company-chip:hover { border-color: rgba(245,166,35,0.4); }

  .logo-bubble {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .step-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 40px;
    justify-content: center;
  }
  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    transition: all 0.3s;
  }
  .step-dot.active { background: #F5A623; width: 24px; border-radius: 4px; }
  .step-dot.done { background: rgba(245,166,35,0.4); }

  .auth-btn {
    width: 100%;
    padding: 14px 24px;
    border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .auth-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }

  .section-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #F5A623;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .heading-display {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.5px;
  }

  .scroll-wrapper { overflow-x: hidden; }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
`;

// ─── LANDING PAGE ────────────────────────────────────────────────────────────

function LandingPage({ onNavigate }) {
  return (
    <div className="page scroll-wrapper" style={{ background: "#0A1628" }}>
      <style>{css}</style>

      {/* Ambient blobs */}
      <div style={{
        position: "fixed", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)",
        pointerEvents: "none", animation: "pulse-glow 6s ease infinite",
      }} />
      <div style={{
        position: "fixed", bottom: "-200px", left: "-200px",
        width: "500px", height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(66,133,244,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* NAV */}
      <nav style={{
        padding: "24px 60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #F5A623, #FFB84D)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "700", fontSize: "18px", color: "#0A1628",
          }}>N</div>
          <span style={{ fontSize: "20px", fontWeight: "600", letterSpacing: "-0.3px" }}>Nexora</span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-ghost" style={{ padding: "10px 24px", fontSize: "14px" }} onClick={() => onNavigate("auth")}>Log in</button>
          <button className="btn-primary" style={{ padding: "10px 24px", fontSize: "14px" }} onClick={() => onNavigate("auth")}>Get started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 60px 80px", maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
        <div style={{ marginBottom: "20px" }}>
          <span style={{
            display: "inline-block", padding: "6px 18px",
            borderRadius: "50px", border: "1px solid rgba(245,166,35,0.3)",
            background: "rgba(245,166,35,0.08)", color: "#F5A623",
            fontSize: "13px", fontWeight: "500",
          }}>
            🚀 10,000+ opportunities listed this month
          </span>
        </div>

        <h1 className="heading-display" style={{ fontSize: "72px", marginBottom: "28px", maxWidth: "800px" }}>
          Your career<br />
          <span style={{ color: "#F5A623" }}>begins here.</span>
        </h1>

        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.55)", maxWidth: "520px", lineHeight: "1.7", marginBottom: "44px" }}>
          Whether you're a student chasing your first internship or a professional ready for the next big leap — Nexora connects you with opportunities that matter.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button className="btn-primary" style={{ fontSize: "16px" }} onClick={() => onNavigate("auth")}>
            Find opportunities →
          </button>
          <button className="btn-ghost" style={{ fontSize: "16px" }}>
            For companies
          </button>
        </div>

        {/* Floating stats */}
        <div style={{ display: "flex", gap: "24px", marginTop: "80px", flexWrap: "wrap" }}>
          {[
            { num: "50K+", label: "Active jobs" },
            { num: "8K+", label: "Companies hiring" },
            { num: "200K+", label: "Students placed" },
            { num: "95%", label: "Satisfaction rate" },
          ].map((s) => (
            <div key={s.label} style={{
              padding: "20px 32px", borderRadius: "16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div className="heading-display" style={{ fontSize: "32px", color: "#F5A623" }}>{s.num}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section style={{ padding: "80px 60px", maxWidth: "1100px", margin: "0 auto" }}>
        <p className="section-label">What we offer</p>
        <h2 className="heading-display" style={{ fontSize: "42px", marginBottom: "48px" }}>
          Everything you need<br />to land your dream role
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {[
            { icon: "🎯", title: "Smart Matching", desc: "AI-powered job recommendations tailored to your skills, goals, and location — no noise, just signal." },
            { icon: "🏫", title: "Campus Connect", desc: "Exclusive placement drives from top companies partnered directly with colleges across India." },
            { icon: "💡", title: "Skill Insights", desc: "Know what skills are in demand and get curated learning paths to stay ahead of the curve." },
            { icon: "🤝", title: "Referral Network", desc: "Connect with alumni and professionals at your dream companies for referrals and mentorship." },
            { icon: "📊", title: "Application Tracker", desc: "Manage all your applications in one dashboard. Never lose track of where you stand." },
            { icon: "🌐", title: "Remote & Global", desc: "Find remote roles and global opportunities with companies open to hiring from anywhere." },
          ].map((item) => (
            <div key={item.title} className="card" style={{ padding: "28px" }}>
              <div style={{ fontSize: "28px", marginBottom: "16px" }}>{item.icon}</div>
              <div style={{ fontSize: "17px", fontWeight: "600", marginBottom: "10px" }}>{item.title}</div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: "1.6" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OPPORTUNITIES */}
      <section style={{ padding: "80px 60px", maxWidth: "1100px", margin: "0 auto" }}>
        <p className="section-label">Opportunities</p>
        <h2 className="heading-display" style={{ fontSize: "42px", marginBottom: "48px" }}>
          Find the right fit<br />for your journey
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          {[
            { tag: "For Students", icon: "🎓", title: "Campus Placements & Internships", desc: "Top companies visit campuses — find out which ones are coming to yours or apply directly.", color: "#F5A623" },
            { tag: "For Professionals", icon: "💼", title: "Full-time & Leadership Roles", desc: "From senior individual contributors to CXO positions — explore roles that match your experience.", color: "#4285F4" },
            { tag: "Flexible Work", icon: "🌐", title: "Freelance & Contract Gigs", desc: "Short-term, high-impact projects with startups and enterprises. Work on your own terms.", color: "#1DB954" },
            { tag: "Early Career", icon: "🚀", title: "Freshers & Entry Level", desc: "Your first job matters. Find companies that actively invest in fresh talent and training programs.", color: "#E83E8C" },
          ].map((item) => (
            <div key={item.title} className="card" style={{ padding: "28px", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <span style={{
                  fontSize: "12px", padding: "4px 12px", borderRadius: "50px",
                  background: `${item.color}18`, color: item.color,
                  fontWeight: "600", border: `1px solid ${item.color}33`,
                }}>{item.tag}</span>
                <span style={{ fontSize: "28px" }}>{item.icon}</span>
              </div>
              <div style={{ fontSize: "19px", fontWeight: "600", marginBottom: "10px" }}>{item.title}</div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: "1.6" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 60px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(66,133,244,0.08) 100%)",
          border: "1px solid rgba(245,166,35,0.2)",
          padding: "64px", textAlign: "center",
        }}>
          <h2 className="heading-display" style={{ fontSize: "48px", marginBottom: "20px" }}>
            Ready to take the leap?
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", marginBottom: "40px" }}>
            Join 200,000+ professionals and students who found their next opportunity on Nexora.
          </p>
          <button className="btn-primary" style={{ fontSize: "16px", padding: "16px 40px" }} onClick={() => onNavigate("auth")}>
            Create your free account →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "32px 60px", borderTop: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
        <span>© 2026 Nexora. All rights reserved.</span>
        <span>Privacy · Terms · Support</span>
      </footer>
    </div>
  );
}

// ─── AUTH PAGE (Backend-Integrated) ──────────────────────────────────────────

const API_BASE = "http://localhost:3001/api";

// Minimal token store using sessionStorage
const tokenStore = {
  setTokens(access, refresh) {
    sessionStorage.setItem("nx_access", access);
    if (refresh) sessionStorage.setItem("nx_refresh", refresh);
  },
  getAccess() { return sessionStorage.getItem("nx_access"); },
  getRefresh() { return sessionStorage.getItem("nx_refresh"); },
  setUserId(id) { sessionStorage.setItem("nx_uid", id); },
  getUserId() { return sessionStorage.getItem("nx_uid"); },
  clear() { ["nx_access", "nx_refresh", "nx_uid"].forEach(k => sessionStorage.removeItem(k)); },
};

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const access = tokenStore.getAccess();
  if (access) headers["Authorization"] = `Bearer ${access}`;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message ?? "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}

// Auth flow stages
// "initial" → email entry → "login" | "register" → success
// If server demands OTP: "otp"
// If server demands 2FA: "2fa"

function AuthPage({ onNavigate }) {
  const [stage, setStage] = useState("initial"); // initial | register | login | otp | 2fa | forgot | reset
  const [isNew, setIsNew] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [twoFAToken, setTwoFAToken] = useState("");
  const [pendingUserId, setPendingUserId] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const clearMessages = () => { setError(""); setInfo(""); };

  // ── Register ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    clearMessages();
    setLoading(true);
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      setPendingUserId(res.data.userId);
      tokenStore.setUserId(res.data.userId);
      setStage("otp");
      setInfo("Check your email for a 6-digit verification code.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Login ───────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (res.data?.requiresOTP) {
        setPendingUserId(res.data.userId);
        setStage("otp");
        setInfo("A one-time code has been sent to your email.");
      } else if (res.data?.requires2FA) {
        setPendingUserId(res.data.userId);
        setStage("2fa");
      } else if (res.data?.tokens) {
        tokenStore.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        tokenStore.setUserId(res.data.user.id);
        onNavigate("onboarding");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    clearMessages();
    setLoading(true);
    const purpose = isNew ? "email_verification" : "login_otp";
    try {
      const res = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: { userId: pendingUserId, otp, purpose },
      });
      if (res.data?.tokens) {
        tokenStore.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
        tokenStore.setUserId(res.data.user.id);
      }
      onNavigate("onboarding");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify 2FA ──────────────────────────────────────────────────────────────
  const handleVerify2FA = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await apiFetch("/auth/verify-2fa", {
        method: "POST",
        body: { userId: pendingUserId, token: twoFAToken },
      });
      tokenStore.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      tokenStore.setUserId(res.data.user.id);
      onNavigate("onboarding");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    clearMessages();
    setLoading(true);
    const purpose = isNew ? "email_verification" : "login_otp";
    try {
      await apiFetch("/auth/resend-otp", {
        method: "POST",
        body: { userId: pendingUserId, purpose },
      });
      setInfo("A new code has been sent to your email.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ─────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    clearMessages();
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setInfo("If an account exists, a reset code has been sent.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (isNew === null) return;
    if (isNew) handleRegister();
    else handleLogin();
  };

  // Shared input/button styles are already in `css` (input-field, btn-primary, etc.)
  const inputStyle = { marginBottom: "12px" };

  const StatusBanner = ({ msg, type }) =>
    msg ? (
      <div style={{
        padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px",
        background: type === "error" ? "rgba(226,75,74,0.12)" : "rgba(34,197,94,0.1)",
        border: `1px solid ${type === "error" ? "rgba(226,75,74,0.35)" : "rgba(34,197,94,0.25)"}`,
        color: type === "error" ? "#f87171" : "#4ade80",
      }}>
        {type === "error" ? "⚠ " : "✓ "}{msg}
      </div>
    ) : null;

  return (
    <div className="page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <style>{css}</style>

      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Back */}
        <button onClick={() => { if (stage === "otp" || stage === "2fa") { setStage("initial"); setIsNew(null); } else onNavigate("landing"); }} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.4)",
          cursor: "pointer", fontSize: "14px", marginBottom: "40px",
          display: "flex", alignItems: "center", gap: "6px",
          fontFamily: "'DM Sans', sans-serif",
        }}>← Back</button>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, #F5A623, #FFB84D)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "700", fontSize: "20px", color: "#0A1628",
          }}>N</div>
          <span style={{ fontSize: "22px", fontWeight: "600" }}>Nexora</span>
        </div>

        <StatusBanner msg={error} type="error" />
        <StatusBanner msg={info} type="info" />

        {/* ── OTP Verification Stage ─────────────────────────────────────── */}
        {stage === "otp" && (
          <>
            <h1 className="heading-display" style={{ fontSize: "34px", marginBottom: "10px" }}>
              {isNew ? "Verify your email" : "Check your email"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px", fontSize: "15px" }}>
              We sent a 6-digit code to <strong style={{ color: "#fff" }}>{email}</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                className="input-field"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={otp}
                maxLength={6}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{ fontSize: "24px", letterSpacing: "8px", textAlign: "center" }}
              />
              <button className="btn-primary" style={{ width: "100%", marginTop: "4px" }} onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
                {loading ? "Verifying…" : "Verify →"}
              </button>
            </div>
            <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
              Didn't receive it?{" "}
              <span style={{ color: "#F5A623", cursor: "pointer", fontWeight: "500" }} onClick={handleResendOTP}>
                Resend code
              </span>
            </p>
          </>
        )}

        {/* ── 2FA Verification Stage ─────────────────────────────────────── */}
        {stage === "2fa" && (
          <>
            <h1 className="heading-display" style={{ fontSize: "34px", marginBottom: "10px" }}>Two-factor auth</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px", fontSize: "15px" }}>
              Open your authenticator app and enter the 6-digit code.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                className="input-field"
                type="text"
                inputMode="numeric"
                placeholder="000 000"
                value={twoFAToken}
                maxLength={6}
                onChange={e => setTwoFAToken(e.target.value.replace(/\D/g, ""))}
                style={{ fontSize: "28px", letterSpacing: "10px", textAlign: "center" }}
              />
              <button className="btn-primary" style={{ width: "100%", marginTop: "4px" }} onClick={handleVerify2FA} disabled={loading || twoFAToken.length !== 6}>
                {loading ? "Verifying…" : "Verify →"}
              </button>
            </div>
          </>
        )}

        {/* ── Forgot Password Stage ──────────────────────────────────────── */}
        {stage === "forgot" && (
          <>
            <h1 className="heading-display" style={{ fontSize: "34px", marginBottom: "10px" }}>Reset password</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px", fontSize: "15px" }}>
              Enter your email and we'll send you a reset code.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              <button className="btn-primary" style={{ width: "100%", marginTop: "4px" }} onClick={handleForgotPassword} disabled={loading}>
                {loading ? "Sending…" : "Send reset code →"}
              </button>
            </div>
            <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
              <span style={{ color: "#F5A623", cursor: "pointer", fontWeight: "500" }} onClick={() => { setStage("initial"); setIsNew(false); }}>
                ← Back to sign in
              </span>
            </p>
          </>
        )}

        {/* ── Initial / Login / Register Stage ──────────────────────────── */}
        {(stage === "initial" || stage === "login" || stage === "register") && (
          <>
            {isNew === null ? (
              <>
                <h1 className="heading-display" style={{ fontSize: "34px", marginBottom: "10px" }}>Welcome back</h1>
                <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px", fontSize: "15px" }}>
                  New here? We'll set everything up in minutes.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                  <button className="auth-btn" onClick={() => setIsNew(false)}>
                    <svg width="20" height="20" viewBox="0 0 20 20"><path fill="#4285F4" d="M19.6 10.23c0-.68-.06-1.36-.18-2.01H10v3.8h5.4a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.3z"/><path fill="#34A853" d="M10 20c2.7 0 4.97-.9 6.63-2.44l-3.24-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.12H1.07v2.58A10 10 0 0010 20z"/><path fill="#FBBC05" d="M4.4 11.9A6 6 0 014.08 10c0-.66.11-1.3.32-1.9V5.52H1.07A10 10 0 000 10c0 1.61.39 3.14 1.07 4.48L4.4 11.9z"/><path fill="#EA4335" d="M10 3.96c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.96 9.96 0 0010 0a10 10 0 00-8.93 5.52L4.4 8.1C5.18 5.72 7.4 3.96 10 3.96z"/></svg>
                    Continue with Google
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>or continue with email</span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                  <input className="input-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                  <button className="btn-primary" style={{ width: "100%", marginTop: "4px" }} onClick={() => { setIsNew(false); handleLogin(); }} disabled={loading}>
                    {loading ? "Signing in…" : "Sign in →"}
                  </button>
                </div>
                <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
                  <span style={{ color: "#F5A623", cursor: "pointer" }} onClick={() => setStage("forgot")}>Forgot password?</span>
                </p>
                <p style={{ textAlign: "center", marginTop: "12px", fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
                  Don't have an account?{" "}
                  <span style={{ color: "#F5A623", cursor: "pointer", fontWeight: "500" }} onClick={() => setIsNew(true)}>
                    Create one
                  </span>
                </p>
              </>
            ) : (
              <>
                <h1 className="heading-display" style={{ fontSize: "34px", marginBottom: "10px" }}>
                  {isNew ? "Create your account" : "Welcome back"}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px", fontSize: "15px" }}>
                  {isNew ? "Join 200K+ members building their careers on Nexora." : "Sign in to continue your journey."}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {isNew && (
                    <input className="input-field" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                  )}
                  <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                  <input className="input-field" type="password" placeholder={isNew ? "Create password (min. 8 chars)" : "Password"} value={password} onChange={e => { setPassword(e.target.value); clearMessages(); }} />
                  {isNew && (
                    <input
                      className="input-field"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); clearMessages(); }}
                    />
                  )}
                  <button className="btn-primary" style={{ width: "100%", marginTop: "8px", opacity: loading ? 0.6 : 1 }} onClick={handleContinue} disabled={loading}>
                    {loading ? (isNew ? "Creating account…" : "Signing in…") : (isNew ? "Create account →" : "Sign in →")}
                  </button>
                </div>
                {!isNew && (
                  <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
                    <span style={{ color: "#F5A623", cursor: "pointer" }} onClick={() => setStage("forgot")}>Forgot password?</span>
                  </p>
                )}
                <p style={{ textAlign: "center", marginTop: "12px", fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
                  {isNew ? "Already have an account?" : "New to Nexora?"}{" "}
                  <span style={{ color: "#F5A623", cursor: "pointer", fontWeight: "500" }} onClick={() => { setIsNew(!isNew); clearMessages(); }}>
                    {isNew ? "Sign in" : "Sign up"}
                  </span>
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

function OnboardingPage({ onNavigate }) {
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState(null);
  const [studentData, setStudentData] = useState({ college: "", degree: "", course: "", year: "", opportunities: [], companies: [] });
  const [proData, setProData] = useState({ title: "", experience: "", industry: "", jobTypes: [], companies: [] });

  const totalSteps = 4;

  const next = () => { if (step < totalSteps - 1) setStep(s => s + 1); else onNavigate("dashboard"); };
  const back = () => { if (step > 0) setStep(s => s - 1); };

  const toggleArr = (arr, val, setter, key) => {
    const cur = arr;
    setter(prev => ({ ...prev, [key]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] }));
  };

  const isValid = () => {
    if (step === 0) return userType !== null;
    if (step === 1 && userType === "student") return studentData.college && studentData.degree && studentData.course && studentData.year;
    if (step === 1 && userType === "professional") return proData.title && proData.experience && proData.industry;
    if (step === 2 && userType === "student") return studentData.opportunities.length > 0;
    if (step === 2 && userType === "professional") return proData.jobTypes.length > 0;
    return true;
  };

  return (
    <div className="page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: "540px" }}>

        {/* Step indicators */}
        <div className="step-indicator">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
          ))}
        </div>

        {/* ── Step 0: Who are you? ── */}
        {step === 0 && (
          <div>
            <p className="section-label">Getting started</p>
            <h1 className="heading-display" style={{ fontSize: "38px", marginBottom: "12px" }}>Who are you?</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px" }}>
              We'll customize your experience based on where you are in your journey.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { id: "student", icon: "🎓", title: "I'm a Student", desc: "Looking for internships, placements, or early career opportunities." },
                { id: "professional", icon: "💼", title: "I'm a Professional", desc: "Experienced professional exploring new roles, leadership positions, or career changes." },
              ].map((opt) => (
                <div key={opt.id} onClick={() => setUserType(opt.id)} style={{
                  padding: "24px", borderRadius: "16px", cursor: "pointer",
                  border: `2px solid ${userType === opt.id ? "#F5A623" : "rgba(255,255,255,0.08)"}`,
                  background: userType === opt.id ? "rgba(245,166,35,0.08)" : "rgba(255,255,255,0.03)",
                  transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "12px" }}>{opt.icon}</div>
                  <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "6px" }}>{opt.title}</div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: "1.5" }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Details ── */}
        {step === 1 && userType === "student" && (
          <div>
            <p className="section-label">Your profile</p>
            <h1 className="heading-display" style={{ fontSize: "38px", marginBottom: "12px" }}>Tell us about yourself</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px" }}>Help companies understand your academic background.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>College / University name</label>
                <input className="input-field" placeholder="e.g. IIT Delhi, BITS Pilani..." value={studentData.college} onChange={e => setStudentData(p => ({ ...p, college: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>Degree</label>
                <select className="input-field" value={studentData.degree} onChange={e => setStudentData(p => ({ ...p, degree: e.target.value, course: "" }))}>
                  <option value="">Select degree</option>
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                  Course / Branch / Specialisation
                  {!studentData.degree && <span style={{ color: "rgba(255,255,255,0.25)", fontStyle: "italic", marginLeft: "6px" }}>— select degree first</span>}
                </label>
                <select
                  className="input-field"
                  value={studentData.course}
                  onChange={e => setStudentData(p => ({ ...p, course: e.target.value }))}
                  disabled={!studentData.degree}
                  style={{ opacity: studentData.degree ? 1 : 0.45, cursor: studentData.degree ? "pointer" : "not-allowed" }}
                >
                  <option value="">
                    {studentData.degree ? `Select course for ${studentData.degree}` : "Select a degree first"}
                  </option>
                  {(COURSES_BY_DEGREE[studentData.degree] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>Expected pass-out year</label>
                <select className="input-field" value={studentData.year} onChange={e => setStudentData(p => ({ ...p, year: e.target.value }))}>
                  <option value="">Select year</option>
                  {[2025, 2026, 2027, 2028, 2029].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && userType === "professional" && (
          <div>
            <p className="section-label">Your profile</p>
            <h1 className="heading-display" style={{ fontSize: "38px", marginBottom: "12px" }}>Your professional background</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px" }}>Help us match you with the right opportunities.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>Current or desired job title</label>
                <input className="input-field" placeholder="e.g. Senior Software Engineer, Product Manager..." value={proData.title} onChange={e => setProData(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>Years of experience</label>
                <select className="input-field" value={proData.experience} onChange={e => setProData(p => ({ ...p, experience: e.target.value }))}>
                  <option value="">Select experience</option>
                  {["0–1 years", "1–3 years", "3–5 years", "5–10 years", "10+ years"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>Industry</label>
                <select className="input-field" value={proData.industry} onChange={e => setProData(p => ({ ...p, industry: e.target.value }))}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Opportunities ── */}
        {step === 2 && userType === "student" && (
          <div>
            <p className="section-label">Preferences</p>
            <h1 className="heading-display" style={{ fontSize: "38px", marginBottom: "12px" }}>What are you looking for?</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px" }}>Select all types of opportunities that interest you.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {OPPORTUNITIES.map((opp) => (
                <button key={opp.id} className={`tag ${studentData.opportunities.includes(opp.id) ? "selected" : ""}`}
                  onClick={() => toggleArr(studentData.opportunities, opp.id, setStudentData, "opportunities")}>
                  {opp.icon} {opp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && userType === "professional" && (
          <div>
            <p className="section-label">Preferences</p>
            <h1 className="heading-display" style={{ fontSize: "38px", marginBottom: "12px" }}>What kind of role?</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "40px" }}>Select the work arrangements you're open to.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {JOB_TYPES.map((jt) => (
                <button key={jt.id} className={`tag ${proData.jobTypes.includes(jt.id) ? "selected" : ""}`}
                  onClick={() => toggleArr(proData.jobTypes, jt.id, setProData, "jobTypes")}>
                  {jt.icon} {jt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Follow companies ── */}
        {step === 3 && (
          <div>
            <p className="section-label">Companies</p>
            <h1 className="heading-display" style={{ fontSize: "38px", marginBottom: "12px" }}>
              {userType === "student" ? "Companies you'd love to work at" : "Your dream employers"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: "32px" }}>
              Follow companies to get notified about their openings. Pick as many as you like.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {COMPANIES.map((c) => {
                const selected = userType === "student"
                  ? studentData.companies.includes(c.name)
                  : proData.companies.includes(c.name);
                const toggle = () => {
                  if (userType === "student") toggleArr(studentData.companies, c.name, setStudentData, "companies");
                  else toggleArr(proData.companies, c.name, setProData, "companies");
                };
                return (
                  <CompanyChip key={c.name} company={c} selected={selected} onClick={toggle} />
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px" }}>
          <button onClick={back} style={{
            background: "none", border: "none", color: step === 0 ? "transparent" : "rgba(255,255,255,0.4)",
            cursor: step === 0 ? "default" : "pointer", fontSize: "15px",
            fontFamily: "'DM Sans', sans-serif", pointerEvents: step === 0 ? "none" : "auto",
          }}>← Back</button>
          <button
            className="btn-primary"
            onClick={next}
            disabled={!isValid()}
            style={{ opacity: isValid() ? 1 : 0.4, cursor: isValid() ? "pointer" : "not-allowed" }}
          >
            {step === totalSteps - 1 ? "Finish setup →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardPage({ onNavigate }) {
  return (
    <div className="page" style={{ background: "#0A1628", minHeight: "100vh" }}>
      <style>{css}</style>

      {/* Nav */}
      <nav style={{
        padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "linear-gradient(135deg, #F5A623, #FFB84D)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "700", fontSize: "17px", color: "#0A1628",
          }}>N</div>
          <span style={{ fontSize: "18px", fontWeight: "600" }}>Nexora</span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {["Explore", "Applications", "Companies", "Messages"].map(t => (
            <span key={t} style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>{t}</span>
          ))}
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #F5A623, #FFB84D)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px", color: "#0A1628", cursor: "pointer" }}>J</div>
        </div>
      </nav>

      <div style={{ padding: "40px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "6px" }}>Good morning 👋</p>
          <h1 className="heading-display" style={{ fontSize: "36px" }}>Welcome to Nexora</h1>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Jobs matched", val: "234", icon: "🎯" },
            { label: "Applications sent", val: "12", icon: "📤" },
            { label: "Companies following", val: "8", icon: "🌟" },
            { label: "Profile views", val: "47", icon: "👁️" },
          ].map(s => (
            <div key={s.label} className="card">
              <div style={{ fontSize: "22px", marginBottom: "12px" }}>{s.icon}</div>
              <div className="heading-display" style={{ fontSize: "28px", color: "#F5A623" }}>{s.val}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recommended jobs */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Recommended for you</h2>
              <span style={{ color: "#F5A623", fontSize: "14px", cursor: "pointer" }}>See all →</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { role: "Software Engineer Intern", company: "Google",   location: "Bangalore",  type: "Internship", salary: "₹50K/mo", match: 98 },
                { role: "Product Manager",          company: "Flipkart", location: "Bangalore",  type: "Full-time",  salary: "₹24 LPA",  match: 91 },
                { role: "Data Science Intern",      company: "Amazon",   location: "Hyderabad",  type: "Internship", salary: "₹45K/mo", match: 87 },
                { role: "UX Designer",              company: "Swiggy",   location: "Remote",     type: "Full-time",  salary: "₹18 LPA",  match: 83 },
              ].map((job) => {
                const co = COMPANIES.find(c => c.name === job.company) || COMPANIES[0];
                return (
                  <motion.div
                    key={job.role}
                    className="card"
                    style={{ padding: "20px", cursor: "pointer" }}
                    whileHover={{ y: -3, borderColor: `${co.color}55` }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                        <CompanyLogo company={co} size={44} radius="12px" bgWhite />
                        <div>
                          <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px" }}>{job.role}</div>
                          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{job.company} · {job.location}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                        <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "50px", background: "rgba(245,166,35,0.12)", color: "#F5A623", border: "1px solid rgba(245,166,35,0.2)", fontWeight: "600" }}>{job.match}% match</span>
                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: "500" }}>{job.salary}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                      <span style={{ fontSize: "12px", padding: "4px 12px", borderRadius: "50px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>{job.type}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Complete your profile</h3>
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Profile strength</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#F5A623" }}>72%</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", marginBottom: "16px" }}>
                  <div style={{ height: "100%", width: "72%", background: "linear-gradient(90deg, #F5A623, #FFB84D)", borderRadius: "3px" }} />
                </div>
                {["Add a resume", "Add skills", "Add work experience"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(245,166,35,0.5)" }} />
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Following</h3>
              <div className="card" style={{ padding: "16px" }}>
                {COMPANIES.slice(0, 5).map((c) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <CompanyLogo company={c} size={32} radius="8px" bgWhite />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "500" }}>{c.name}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>3 new openings</div>
                    </div>
                  </div>
                ))}
                <span style={{ fontSize: "13px", color: "#F5A623", cursor: "pointer" }}>View all companies →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("landing");

  const navigate = (p) => setPage(p);

  if (page === "landing") return <LandingPage onNavigate={navigate} />;
  if (page === "auth") return <AuthPage onNavigate={navigate} />;
  if (page === "onboarding") return <OnboardingPage onNavigate={navigate} />;
  if (page === "dashboard") return <DashboardPage onNavigate={navigate} />;
  return null;
}
