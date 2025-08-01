import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import {
  AudioContext,
  AudioBufferSourceNode,
  GainNode,
  AudioBuffer,
} from 'react-native-audio-api';

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(
    null,
  );
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    const context = new AudioContext();
    const gain = context.createGain();
    gain.connect(context.destination);

    setAudioContext(context);
    setGainNode(gain);

    const loadAudio = async () => {
      try {
        const response = await fetch(audioUrl, {
          headers: { 'Accept': 'audio/*' },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await context.decodeAudioData(arrayBuffer);
        setAudioBuffer(buffer);
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    loadAudio();

    return () => {
      context.close();
    };
  }, [audioUrl]);

  const handlePlay = () => {
    if (audioContext && gainNode && audioBuffer && !isPlaying) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = playbackRate;
      source.connect(gainNode);
      source.start();

      setSourceNode(source);
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (sourceNode && isPlaying) {
      sourceNode.stop();
      setIsPlaying(false);
      setSourceNode(null);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (gainNode) {
      gainNode.gain.value = value;
    }
  };

  const handlePlaybackRateChange = (value: number) => {
    setPlaybackRate(value);
    if (sourceNode) {
      sourceNode.playbackRate.value = value;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Player</Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isPlaying && styles.activeButton]}
          onPress={isPlaying ? handlePause : handlePlay}
        >
          <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Volume: {Math.round(volume * 100)}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={handleVolumeChange}
        />
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Speed: {playbackRate.toFixed(1)}x</Text>
        <Slider
          style={styles.slider}
          minimumValue={0.5}
          maximumValue={2.0}
          value={playbackRate}
          onValueChange={handlePlaybackRateChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  controls: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  activeButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
