'use client';

import { trpc } from '../utils/trpc';

export default function Home() {
  const statusQuery = trpc.status.useQuery();
  const runMutation = trpc.run.useMutation();
  const pauseMutation = trpc.pause.useMutation();
  const resumeMutation = trpc.resume.useMutation();

  const handleRun = async () => {
    await runMutation.mutateAsync({ reason: 'manual' });
    statusQuery.refetch();
  };

  const handlePause = async () => {
    await pauseMutation.mutateAsync();
    statusQuery.refetch();
  };

  const handleResume = async () => {
    await resumeMutation.mutateAsync();
    statusQuery.refetch();
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Turn Daemon Status: {statusQuery.data}</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={handleRun} disabled={runMutation.isLoading}>
          Run Turn
        </button>
        <button onClick={handlePause} disabled={pauseMutation.isLoading}>
          Pause
        </button>
        <button onClick={handleResume} disabled={resumeMutation.isLoading}>
          Resume
        </button>
      </div>

      {runMutation.isSuccess && <p>Last run triggered successfully</p>}
      {runMutation.isError && <p>Error: {runMutation.error.message}</p>}
    </main>
  );
}
