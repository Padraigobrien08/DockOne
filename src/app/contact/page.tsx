import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ContactForm } from "./contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Say hi — DockOne",
  description: "Have a question? Found something that should be here? Or just want to chat? I'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Section className="pt-12 pb-4 md:pt-14 md:pb-5 lg:pt-16 lg:pb-6">
        <Container size="wide">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Say hi
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400 md:text-xl">
              Have a question? Found something that should be here? Or just want to chat?
              <br />
              I&apos;m Padraig, and I&apos;d love to hear from you.
            </p>
          </div>
        </Container>
      </Section>

      {/* Contact section with expanded left-side content */}
      <section className="border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            {/* Left column: expanded content */}
            <div>
              <div className="flex items-start gap-4">
                <img 
                  src="/padraig.jpg" 
                  alt="Padraig" 
                  className="h-14 w-14 shrink-0 rounded-full border border-zinc-700/50 object-cover"
                />
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    Get in touch
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-zinc-400 md:text-lg">
                    I&apos;m Padraig, building this solo.
                    <br />
                    Your feedback really helps — whether it&apos;s a bug, a feature idea, or a project that belongs here.
                  </p>
                </div>
              </div>


              {/* FAQ */}
              <div className="mt-8 space-y-6">
                <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                  Quick answers
                </h3>
                <dl className="space-y-5">
                  <div>
                    <dt className="text-sm font-medium text-zinc-200">
                      Is this private?
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                      Yep, it&apos;s just me reading these. I&apos;ll reply when I can.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-200">
                      Can I request a project category/tag?
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                      Absolutely! If there&apos;s a tag or category that would help organize things better, let me know.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-zinc-200">
                      Can I report an issue?
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                      Please do. Bugs, broken links, or anything that seems off — I want to fix it.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Right column: form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
