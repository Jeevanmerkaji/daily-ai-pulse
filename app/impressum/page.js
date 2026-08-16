// app/impressum/page.js
//
// Legal notice required under German law (§ 5 DDG, formerly § 5 TMG) for
// any commercial website operated from Germany.

export const metadata = {
  title: "Impressum",
  description: "Legal notice for Daily AI Pulse, pursuant to § 5 DDG.",
};

export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Impressum</h1>
      <p className="mt-2 text-sm text-zinc-500">Legal notice pursuant to § 5 DDG</p>

      <div className="mt-8 space-y-6 text-zinc-700">
        <section>
          <h2 className="font-semibold text-zinc-900">Information according to § 5 DDG</h2>
          <p className="mt-2">
            Jeevan Merkaji Somanna
            <br />
            Truchtelfingerstrasse 51
            <br />
            72458 Albstadt
            <br />
            Germany
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-zinc-900">Contact</h2>
          <p className="mt-2">
            Email:{" "}
            <a href="mailto:hello@getdailyaipulse.com" className="underline underline-offset-4">
              hello@getdailyaipulse.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-zinc-900">Responsible for content</h2>
          <p className="mt-2">
            Jeevan Merkaji Somanna (address as above), responsible pursuant to § 18 Abs. 2
            MStV.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-zinc-900">EU dispute resolution</h2>
          <p className="mt-2">
            The European Commission provides a platform for online dispute resolution
            (OS):{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              https://ec.europa.eu/consumers/odr
            </a>
            . We are not obliged and not willing to participate in dispute resolution
            proceedings before a consumer arbitration board.
          </p>
        </section>
      </div>
    </div>
  );
}
