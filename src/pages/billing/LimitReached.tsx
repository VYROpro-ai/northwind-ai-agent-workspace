import { useNavigate } from 'react-router';
import AgentLibrary from '@/pages/agents/AgentLibrary';
import { LimitReachedModal } from './components/LimitReachedModal';

/** W11-05 · Upgrade / limit reached — the Agent library with the limit dialog open on top. */
export default function LimitReached() {
  const navigate = useNavigate();
  return (
    <>
      <AgentLibrary />
      <LimitReachedModal open onClose={() => navigate('/agents')} />
    </>
  );
}
