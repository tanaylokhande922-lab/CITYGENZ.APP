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
          <rect width="16" height="5" x="4" y="16" />
          <path d="M4 16v-5.56a2 2 0 0 1 1.24-1.8L12 6l6.76 2.7A2 2 0 0 1 20 10.44V16" />
          <path d="M12 6V4" />
          <path d="M20 8v2" />
          <path d="M4 8v2" />
          <path d="M12 12V6" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        CityGenz
      </span>
    </Link>
  );
}
