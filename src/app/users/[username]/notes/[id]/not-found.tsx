import { Button } from "@/app/_components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col place-content-center place-items-center gap-y-4 overflow-x-hidden bg-primary px-10 pb-28 pt-12 text-h2 text-primary-foreground">
      <h2 className="text-h2">Not Found</h2>
      <p className="text-body-2xl">Could not find requested resource</p>
      <Button asChild variant="secondary">
        <Link href=".">Return Home</Link>
      </Button>
    </div>
  );
}
