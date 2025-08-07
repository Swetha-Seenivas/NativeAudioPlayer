import Audioplayer from './src/components/AudioPlayer';
import { AudioPlayerProvider } from './src/context/AudioPlayerContext';
import { AudioProvider } from './src/context/AudioContext';

export default function App({
  callRecApiKey,
  getAccessToken,
}: {
  callRecApiKey: string;
  getAccessToken: string;
}) {
  return (
    <AudioPlayerProvider
      connectionId="d6ae24f7-0528-4782-82c0-80247dc8a14c"
      getAccessToken={() => Promise.resolve(getAccessToken)}
      mode="development"
      callRecApiKey={callRecApiKey}
    >
      <AudioProvider>
        <Audioplayer />
      </AudioProvider>
    </AudioPlayerProvider>
  );
}
