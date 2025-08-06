import Audioplayer from './src/components/AudioPlayer';
import { AudioPlayerProvider } from './src/context/AudioPlayerContext';

export default function App() {
  return (
    <AudioPlayerProvider
      connectionId="d6ae24f7-0528-4782-82c0-80247dc8a14c"
      getAccessToken={() => Promise.resolve('token')}
      mode="development"
      callRecApiKey={''}
    >
      <Audioplayer />
    </AudioPlayerProvider>
  );
}