// app/components/StoryCard.js
//
// Shared UI for displaying one day's story. Used by both the "today" page
// and the archive's individual story pages so they look identical.

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function StoryCard({ story }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{formatDate(story.date)}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        {story.headline}
      </h1>
      <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-zinc-700">
        {story.summary}
      </p>
      <a
        href={story.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
      >
        Read the full story at {story.source_name} →
      </a>
    </article>
  );
}
