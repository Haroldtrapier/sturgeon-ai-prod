export default function SturgeonTV() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Sturgeon TV</h1>
      <p className="text-sm text-slate-400">
        Training, tutorials, and government contracting breakdowns.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <VideoCard
          title="Sturgeon Overview"
          url="https://YOUR_VIDEO_LINK_HERE"
        />
        <VideoCard
          title="ContractMatch AI"
          url="https://YOUR_VIDEO_LINK_HERE"
        />
      </div>
    </div>
  );
}

function VideoCard({ title, url }: { title: string; url: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="text-sm mb-2">{title}</div>
      <iframe
        src={url}
        className="w-full aspect-video rounded-xl border border-slate-700"
      />
    </div>
  );
}
