import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg';
import {
  AudioContext,
  AudioBufferSourceNode,
  GainNode,
  AudioBuffer,
} from 'react-native-audio-api';

interface AudioPlayerProps {
  audioUrl: string;
  onProgressUpdate?: (position: number, duration: number) => void;
  onSeekToTime?: (timeInSeconds: number) => void;
  showVolumeControl?: boolean;
  showSpeedControl?: boolean;
  compactMode?: boolean;
}

export interface AudioPlayerRef {
  seekTo: (timeInSeconds: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
}

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  ({ 
    audioUrl, 
    onProgressUpdate, 
    onSeekToTime, 
    showVolumeControl = false,
    showSpeedControl = false,
    compactMode = true
  }, ref) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const progressBarRef = useRef<View>(null);
  const animationFrameRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    seekTo: seekToTime,
    setVolume: handleVolumeChange,
    setPlaybackRate: changePlaybackRate,
  }));

  useEffect(() => {
    const context = new AudioContext();
    const gain = context.createGain();
    gain.connect(context.destination);

    setAudioContext(context);
    setGainNode(gain);

    const loadAudio = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(audioUrl, {
          headers: { 'Accept': 'audio/*' },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await context.decodeAudioData(arrayBuffer);
        setAudioBuffer(buffer);
        setDuration(buffer.duration);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading audio:', error);
        setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      context.close();
    };
  }, [audioUrl]);

  // Enhanced progress tracking with requestAnimationFrame
  useEffect(() => {
    let lastUpdate = 0;

    const updateProgress = (timestamp: number) => {
      if (isPlaying && audioContext && !isSeeking) {
        // Throttle to ~100ms updates
        if (timestamp - lastUpdate >= 100) {
          const elapsed = audioContext.currentTime - startTime;
          const newCurrentTime = Math.min(elapsed, duration);
          setCurrentTime(newCurrentTime);
          
          if (onProgressUpdate) {
            onProgressUpdate(newCurrentTime, duration);
          }
          
          // Auto-stop when audio reaches the end
          if (newCurrentTime >= duration && duration > 0) {
            if (sourceNode) {
              sourceNode.stop();
            }
            setIsPlaying(false);
            setSourceNode(null);
            setCurrentTime(0);
            setStartTime(0);
            return;
          }
          
          lastUpdate = timestamp;
        }
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying && audioContext && !isSeeking) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, startTime, duration, audioContext, isSeeking, onProgressUpdate, sourceNode]);

  const startPlayback = (startOffset: number = currentTime) => {
    try {
      if (audioContext && gainNode && audioBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = playbackRate;
        source.connect(gainNode);
        
        // Ensure startOffset is within valid range
        const clampedOffset = Math.max(0, Math.min(startOffset, duration));
        source.start(0, clampedOffset);

        source.onEnded = () => {
          setIsPlaying(false);
          setSourceNode(null);
        };

        setSourceNode(source);
        setIsPlaying(true);
        setStartTime(audioContext.currentTime - clampedOffset);
      }
    } catch (error) {
      console.error('Error starting playback:', error);
      setIsPlaying(false);
      setSourceNode(null);
    }
  };

  const handlePlay = () => {
    if (!isPlaying) startPlayback();
  };

  const handlePause = () => {
    try {
      if (sourceNode) {
        sourceNode.stop();
        setSourceNode(null);
      }
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing audio:', error);
      // Ensure we still update the state even if stop() fails
      setIsPlaying(false);
      setSourceNode(null);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (gainNode) gainNode.gain.value = value;
  };

  const seekToTime = (timeInSeconds: number) => {
    try {
      const wasPlaying = isPlaying;
      
      // Clamp time to valid range
      const clampedTime = Math.max(0, Math.min(timeInSeconds, duration));
      
      if (isPlaying) {
        handlePause();
      }
      
      setCurrentTime(clampedTime);
      
      if (wasPlaying) {
        setTimeout(() => startPlayback(clampedTime), 50);
      }
      
      if (onSeekToTime) {
        onSeekToTime(clampedTime);
      }
    } catch (error) {
      console.error('Error during seek operation:', error);
      setIsPlaying(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    const wasPlaying = isPlaying;
    const currentPosition = currentTime;
    
    if (isPlaying) {
      handlePause();
    }
    
    setPlaybackRate(rate);
    
    if (wasPlaying) {
      setTimeout(() => startPlayback(currentPosition), 50);
    }
  };

  const handleSeek = (value: number) => {
    try {
      const wasPlaying = isPlaying;
      
      // Stop current playback if playing
      if (sourceNode && isPlaying) {
        sourceNode.stop();
        setSourceNode(null);
        setIsPlaying(false);
      }
      
      // Update current time
      setCurrentTime(value);
      
      // Restart playback at new position if it was playing
      if (wasPlaying) {
        setTimeout(() => {
          startPlayback(value);
          // Reset seeking state after playback starts
          setTimeout(() => setIsSeeking(false), 100);
        }, 50);
      } else {
        // Reset seeking state immediately if not playing
        setIsSeeking(false);
      }
      
      // Trigger callback
      if (onSeekToTime) {
        onSeekToTime(value);
      }
    } catch (error) {
      console.error('Error during seek operation:', error);
      setIsSeeking(false);
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressBarPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    progressBarRef.current?.measure((x, y, width, _height, _pageX, _pageY) => {
      const seekPosition = (locationX / width) * duration;
      seekToTime(seekPosition);
    });
  };

  return (
    <View style={compactMode ? styles.playerContainer : styles.expandedContainer}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playButton, isLoading && styles.disabledButton]}
          onPress={isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#676767" />
          ) : isPlaying ? (
            <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <Path
                d="M5.33301 3.40039C6.21637 3.40039 6.93358 4.11664 6.93359 5V11C6.93359 11.8834 6.21638 12.5996 5.33301 12.5996C4.44976 12.5995 3.7334 11.8833 3.7334 11V5C3.73341 4.11673 4.44977 3.40054 5.33301 3.40039Z"
                fill="#676767"
              />
              <Path
                d="M10.667 3.40039C11.5502 3.4006 12.2666 4.11677 12.2666 5V11C12.2666 11.8832 11.5502 12.5994 10.667 12.5996C9.78362 12.5996 9.06641 11.8834 9.06641 11V5C9.06642 4.11664 9.78363 3.40039 10.667 3.40039Z"
                fill="#676767"
              />
            </Svg>
          ) : (
            <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29186 3.12296L12.201 7.26863C12.753 7.59967 12.753 8.40082 12.201 8.73186L5.29186 12.8775C4.72363 13.2179 4.00012 12.8084 4.00012 12.1455V3.85415C4.00012 3.19122 4.72363 2.78169 5.29186 3.12296Z"
                fill="#676767"
                stroke="#676767"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={compactMode ? styles.progressContainer : styles.expandedProgressContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        {compactMode ? (
          <TouchableWithoutFeedback onPress={handleProgressBarPress}>
            <View style={styles.progressBar} ref={progressBarRef}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` },
                ]}
              />
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onSlidingStart={() => setIsSeeking(true)}
            onValueChange={(value) => {
              // Only update UI during seeking, don't interfere with progress tracking
              if (isSeeking) {
                setCurrentTime(value);
              }
            }}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#007AFF"
          />
        )}
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Speed Control */}
      {compactMode ? (
        <View style={styles.speedContainer}>
          <TouchableOpacity
            style={styles.speedButton}
            onPress={() => {
              Alert.alert('Playback Speed', '', [
                { text: '0.5x', onPress: () => changePlaybackRate(0.5) },
                { text: '1x', onPress: () => changePlaybackRate(1) },
                { text: '1.5x', onPress: () => changePlaybackRate(1.5) },
                { text: '2x', onPress: () => changePlaybackRate(2) },
              ]);
            }}
          >
            <Text style={styles.speedButtonText}>{`${playbackRate}x`}</Text>
          </TouchableOpacity>
        </View>
      ) : showSpeedControl && (
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Speed: {playbackRate.toFixed(1)}x</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.5}
            maximumValue={2.0}
            value={playbackRate}
            onValueChange={changePlaybackRate}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#007AFF"
          />
        </View>
      )}

      {/* Volume Control - only in expanded mode */}
      {!compactMode && showVolumeControl && (
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Volume: {Math.round(volume * 100)}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#007AFF"
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    height: 42,
    width: '85%',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 25,
  },
  expandedContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
    width: '90%',
  },
  controls: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
  },
  expandedProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: '#ddd',
    borderRadius: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111111',
    borderRadius: 6,
  },
  progressSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  speedButton: {
    borderRadius: 6,
    width: 26,
  },
  speedButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default AudioPlayer;
