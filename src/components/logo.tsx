import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group" prefetch={false}>
      <div className="p-2 bg-primary rounded-lg group-hover:bg-primary/90 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M8 3v18" />
          <path d="M12 5v16" />
          <path d="M16 8v13" />
          <path d="M4 21h16" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        CityGenz
      </span>
    </Link>
  );
}
