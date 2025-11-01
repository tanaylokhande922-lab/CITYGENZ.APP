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
          <path d="M12 22a8 8 0 0 0 8-8" />
          <path d="M12 2a8 8 0 0 0-8 8c0 2.2.9 4.2 2.3 5.7" />
          <path d="M12 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
          <path d="M20.3 10c.7 1.2 1.1 2.5 1.1 3.9" />
          <path d="M6.3 5c-.7 1.2-1.1 2.5-1.1 3.9" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        CityZen
      </span>
    </Link>
  );
}
