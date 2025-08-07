import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import {
    AudioContext as WebAudioContext,
    AudioBufferSourceNode,
    GainNode,
    AudioBuffer,
} from 'react-native-audio-api';
import { fetchCallRecordingUrl } from '../services/fetchAudio';
import { useAudioPlayerContext } from './AudioPlayerContext';

interface CallRecordingData {
    availableFor: number;
    data: string;
    expiryTime: number;
}

interface AudioContextType {
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

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
    children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
    const {
        connectionId,
        brandId,
        getAccessToken,
        uniquePin,
        mode,
        callRecApiKey,
        messageSavedTime,
        audioSrc,
    } = useAudioPlayerContext();

    const [audioContext, setAudioContext] = useState<WebAudioContext | null>(null);
    const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
    const [gainNode, setGainNode] = useState<GainNode | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [volume, setVolumeState] = useState(1.0);
    const [playbackRate, setPlaybackRateState] = useState(1.0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [callRecordingData, setCallRecordingData] = useState<CallRecordingData | null>(null);
    const [refetchCount, setRefetchCount] = useState(0);

    useEffect(() => {
        const context = new WebAudioContext();
        const gain = context.createGain();
        gain.connect(context.destination);
        setAudioContext(context);
        setGainNode(gain);
        const loadAudio = async () => {
            try {
                setIsLoading(true);
                let audioUrl: string;
                if (audioSrc) {
                    audioUrl = audioSrc;
                } else {
                    const recordingData = await fetchCallRecordingUrl({
                        connectionId,
                        brandId,
                        getAccessToken,
                        uniquePin,
                        mode,
                        callRecApiKey,
                        messageSavedTime,
                    });
                    setCallRecordingData(recordingData);
                    audioUrl = recordingData.data;
                }
                const response = await fetch(audioUrl, {
                    headers: { Accept: 'audio/*' },
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch audio: ${response.status}`);
                }
                setIsBuffering(true);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = await context.decodeAudioData(arrayBuffer);
                setAudioBuffer(buffer);
                setDuration(buffer.duration);
                setIsLoading(false);
                setIsBuffering(false);
            } catch (error) {
                console.error('Error loading audio:', error);
                setIsLoading(false);
                setIsBuffering(false);
            }
        };
        loadAudio();
        return () => {
            context.close();
        };
    }, [connectionId, brandId, getAccessToken, uniquePin, mode, callRecApiKey, messageSavedTime, audioSrc, refetchCount]);

    useEffect(() => {
        let animationId: number;
        let lastUpdate = 0;
        const updateProgress = (timestamp: number) => {
            if (isPlaying && audioContext && !isSeeking) {
                if (timestamp - lastUpdate >= 100) {
                    const elapsed = audioContext.currentTime - startTime;
                    setCurrentTime(Math.min(elapsed, duration));
                    lastUpdate = timestamp;
                }
                animationId = requestAnimationFrame(updateProgress);
            }
        };
        if (isPlaying && audioContext && !isSeeking) {
            animationId = requestAnimationFrame(updateProgress);
        }
        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [isPlaying, startTime, duration, audioContext, isSeeking]);

    const startPlayback = useCallback(
        (startOffset: number = currentTime) => {
            if (audioContext && gainNode && audioBuffer) {
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer; // Reusing the same AudioBuffer is fine
                source.playbackRate.value = playbackRate;
                source.connect(gainNode);
                source.start(0, startOffset);
                setSourceNode(source);
                setIsPlaying(true);
                setStartTime(audioContext.currentTime - startOffset);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [audioContext, gainNode, audioBuffer, playbackRate, currentTime, duration, isPlaying],
    );

    const play = useCallback(() => {
        if (!isPlaying) startPlayback();
    }, [isPlaying, startPlayback]);

    const pause = useCallback(() => {
        if (sourceNode) {
            sourceNode.stop();
            setSourceNode(null);
        }
        setIsPlaying(false);
    }, [sourceNode]);

    const setVolume = useCallback(
        (value: number) => {
            setVolumeState(value);
            if (gainNode) gainNode.gain.value = value;
        },
        [gainNode],
    );

    const setPlaybackRate = useCallback(
        (value: number) => {
            setPlaybackRateState(value);
            if (sourceNode) sourceNode.playbackRate.value = value;
        },
        [sourceNode],
    );

    const seek = useCallback(
        (value: number) => {
            const wasPlaying = isPlaying;
            if (sourceNode) {
                sourceNode.stop();
                setSourceNode(null);
            }
            setCurrentTime(value);
            setIsSeeking(false);
            setIsPlaying(false);
            if (wasPlaying) startPlayback(value);
        },
        [isPlaying, sourceNode, startPlayback],
    );

    const onSeekStart = useCallback(() => {
        setIsSeeking(true);
    }, []);

    const onSeekChange = useCallback((value: number) => {
        setCurrentTime(value);
        setIsSeeking(true);
    }, []);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const refetchAudio = useCallback(() => {
        setRefetchCount(prev => prev + 1);
    }, []);

    const value: AudioContextType = {
        isPlaying,
        isLoading,
        isBuffering,
        volume,
        playbackRate,
        currentTime,
        duration,
        callRecordingData,
        refetchAudio,
        play,
        pause,
        setVolume,
        setPlaybackRate,
        seek,
        onSeekStart,
        onSeekChange,
        formatTime,
        setIsSeeking,
        isSeeking,
        setCurrentTime,
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudioContext = (): AudioContextType => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudioContext must be used within an AudioProvider');
    }
    return context;
};
