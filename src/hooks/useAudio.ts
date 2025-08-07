import { useAudioContext } from '../context/AudioContext';

interface CallRecordingData {
  availableFor: number;
  data: string;
  expiryTime: number;
}

interface UseAudioReturn {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  volume: number;
  playbackRate: number;
  currentTime: number;
  duration: number;
  callRecordingData: CallRecordingData | null;
  refetchAudio: () => void;
  play: () => void;
  pause: () => void;
  setVolume: (value: number) => void;
  setPlaybackRate: (value: number) => void;
  seek: (value: number) => void;
  onSeekStart: () => void;
  onSeekChange: (value: number) => void;
  formatTime: (seconds: number) => string;
  setIsSeeking: (value: boolean) => void;
  isSeeking: boolean;
  setCurrentTime: (value: number) => void;
}

export const useAudio = (): UseAudioReturn => {
  return useAudioContext();
};