import { Navigate, useSearchParams } from 'react-router';
import Overview from '@/pages/home/Overview';

/** W12-04 · Command palette — the Overview with the ⌘K palette open on the design's “ref” query. */
export default function CommandPaletteState() {
  const [params] = useSearchParams();
  if (!params.has('q')) return <Navigate to="/search?q=ref" replace />;
  return <Overview initialOverlay="command" />;
}
