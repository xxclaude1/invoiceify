import Link from "next/link";
import Button from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section className="bg-surface py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
          Start creating your billing documents online and download them as PDFs
          in just a few steps.
        </h2>
        <div className="mt-8">
          <Link href="/create">
            <Button variant="primary" size="lg">
              Create invoice
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
