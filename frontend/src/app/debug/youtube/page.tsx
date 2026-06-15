export default function YouTubeDebugPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>YouTube Debug Test</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        This is a plain iframe test to isolate any playback issues from the application code.
      </p>
      
      <iframe
        width="100%"
        height="500"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="YouTube Test"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
