import Link from "next/link";
import { navItems } from "@/data/nav";

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 4l4 4 4-4" />
    </svg>
  );
}

export function MainNav() {
  return (
    <nav className="main" aria-label="Categorias">
      <div className="wrap">
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              {item.groups ? (
                <>
                  <button className="navlink">
                    {item.emoji ? `${item.emoji} ` : ""}
                    {item.label} <Chevron />
                  </button>
                  <div className="drop">
                    {item.groups.map((g) => (
                      <div key={g.label}>
                        <span className="grp">{g.label}</span>
                        {g.links.map((l) => (
                          <Link key={l.href} href={l.href}>
                            {l.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Link className="navlink" href={item.href ?? "#"}>
                  {item.emoji ? `${item.emoji} ` : ""}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
