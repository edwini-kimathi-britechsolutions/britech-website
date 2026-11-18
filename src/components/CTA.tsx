import { Phone } from "lucide-react";
import { getSettings } from "@/lib/content";
import { telHref } from "@/lib/data";
import { ButtonLink, Container } from "./ui";

export default async function CTA() {
  const { phone1 } = await getSettings();
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-12 sm:px-12 lg:px-16 lg:py-14">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Let’s build something brilliant together.</h2>
              <p className="mt-4 text-lg text-navy-200">
                Partner with us to design and deliver the digital solutions your organization needs to thrive in a fast-changing world.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <ButtonLink href="/contact" variant="brand">
                Get in Touch
              </ButtonLink>
              <a href={telHref(phone1)} className="inline-flex items-center gap-2 font-medium text-white/80 hover:text-white">
                <Phone className="h-4 w-4 text-white" /> {phone1}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
