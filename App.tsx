import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
import TranscriptView from './src/components/TranscriptView';
import { getMockAudioUrl, loadMockData } from './src/services/dataService';
import { MockResponseData } from './src/types';
import Svg, { Path } from 'react-native-svg';
import SummariseIcon from './src/icons/SummariseIcon';


export default function App() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playbackState = usePlaybackState();
  const progress = useProgress(100);
  const progressBarRef = React.useRef<View>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | null>('summary');
  const [transcriptData, setTranscriptData] = useState<MockResponseData | null>(null);

  useEffect(() => {
    setupPlayer();
    loadTranscriptData();
  }, []);

  const loadTranscriptData = () => {
    try {
      const data = loadMockData();
      setTranscriptData(data);
    } catch (error) {
      console.error('Error loading transcript data:', error);
    }
  };

  const setupPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add({
        id: 'testTrack',
        url: getMockAudioUrl(),
      });
      setIsPlayerReady(true);
    } catch (error) {
      console.error('Error setting up player:', error);
      Alert.alert('Error', 'Failed to setup audio player');
    }
  };

  const togglePlayback = async () => {
    try {
      if (playbackState.state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const seekToTime = async (timeInSeconds: number) => {
    try {
      await TrackPlayer.seekTo(timeInSeconds);
    } catch (error) {
      console.error('Error seeking to time:', error);
    }
  };

  const isPlaying = playbackState.state === State.Playing;
  const isLoading = playbackState.state === State.Loading || playbackState.state === State.Buffering;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isPlayerReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Setting up audio player...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowContainer}>
        <View style={styles.playerContainer}>
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.playButton, isLoading && styles.disabledButton]}
              onPress={togglePlayback}
              disabled={isLoading}
            >
              <Text style={styles.playButtonText}>
                {isLoading ?
                  <ActivityIndicator color='#676767' />
                  : isPlaying ?
                    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <Path d="M5.33301 3.40039C6.21637 3.40039 6.93358 4.11664 6.93359 5V11C6.93359 11.8834 6.21638 12.5996 5.33301 12.5996C4.44976 12.5995 3.7334 11.8833 3.7334 11V5C3.73341 4.11673 4.44977 3.40054 5.33301 3.40039Z" fill="#676767" />
                      <Path d="M10.667 3.40039C11.5502 3.4006 12.2666 4.11677 12.2666 5V11C12.2666 11.8832 11.5502 12.5994 10.667 12.5996C9.78362 12.5996 9.06641 11.8834 9.06641 11V5C9.06642 4.11664 9.78363 3.40039 10.667 3.40039Z" fill="#676767" />
                    </Svg> :
                    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <Path fill-rule="evenodd" clip-rule="evenodd" d="M5.29186 3.12296L12.201 7.26863C12.753 7.59967 12.753 8.40082 12.201 8.73186L5.29186 12.8775C4.72363 13.2179 4.00012 12.8084 4.00012 12.1455V3.85415C4.00012 3.19122 4.72363 2.78169 5.29186 3.12296Z" fill="#676767" stroke="#676767" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                    </Svg>
                }
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
            <TouchableWithoutFeedback
              onPress={(event) => {
                const { locationX } = event.nativeEvent;
                progressBarRef.current?.measure((x, y, width, _height, _pageX, _pageY) => {
                  const seekPosition = (locationX / width) * progress.duration;
                  TrackPlayer.seekTo(seekPosition);
                });
              }}
            >
              <View style={styles.progressBar} ref={progressBarRef}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(progress.position / progress.duration) * 100}%` }
                  ]}
                />
              </View>
            </TouchableWithoutFeedback>
            <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
          </View>
          <View style={styles.speedContainer}>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => {
                Alert.alert(
                  'Playback Speed',
                  '',
                  [
                    { text: '0.5x', onPress: () => { TrackPlayer.setRate(0.5); setPlaybackSpeed(0.5); } },
                    { text: '1x', onPress: () => { TrackPlayer.setRate(1); setPlaybackSpeed(1); } },
                    { text: '1.5x', onPress: () => { TrackPlayer.setRate(1.5); setPlaybackSpeed(1.5); } },
                    { text: '2x', onPress: () => { TrackPlayer.setRate(2); setPlaybackSpeed(2); } },
                  ]
                );
              }}
            >
              <Text style={styles.speedButtonText}>{`${playbackSpeed}x`}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* {showSummary ? 'Hide' : 'Show'} */}
        <SummariseIcon showSummary={showSummary} setShowSummary={setShowSummary} />
      </View>
      {showSummary && (
        <View style={styles.summaryContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'summary' && styles.activeTabButton
              ]}
              onPress={() => {
                setActiveTab('summary');
              }}
            >
              <Text style={[
                styles.tabButtonText,
                activeTab === 'summary' && styles.activeTabText
              ]}>
                Summary
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'transcript' && styles.activeTabButton
              ]}
              onPress={() => {
                setActiveTab('transcript');
              }}
            >
              <Text style={[
                styles.tabButtonText,
                activeTab === 'transcript' && styles.activeTabText
              ]}>
                Transcript
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'summary' && transcriptData && (
            <View style={styles.contentContainer}>
              <Text style={styles.contentText}>
                {transcriptData.data.summary.text}
              </Text>
            </View>
          )}

          {activeTab === 'transcript' && transcriptData && (
            <View style={{ ...styles.contentContainer, ...styles.transcriptionContainer }}>
              <View style={styles.transcriptContainer}>
                <TranscriptView
                  words={transcriptData.data.transcript.data.words}
                  speakerLabels={transcriptData.data.transcript.speakerLabels}
                  currentTime={progress.position}
                  onWordPress={seekToTime}
                  autoScroll={true}
                />
              </View>
            </View>
          )}
        </View>

      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 250,
    margin: 10,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 8,
  },
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
  trackArtist: {
    fontSize: 12,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%'
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
  playButtonText: {
    fontSize: 20,
    color: 'white',
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  speedLabel: {
    fontSize: 12,
    color: '#333',
  },
  speedButton: {
    borderRadius: 6,
    width: 26,
  },
  speedButtonText: {
    fontSize: 12,
    color: '#666',
  },
  summaryContainer: {
    marginHorizontal: 4,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
  },
  tabContainer: {
    backgroundColor: '#fafafa',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 6,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderColor: '#d6dce0',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderColor: '#333',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  contentContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  transcriptionContainer: {
    paddingRight: 0,
    minHeight: 200,
  },
  contentText: {
    fontSize: 12,
    lineHeight: 24,
    color: '#666',
  },
  activeTabText: {
    fontWeight: '600',
  },
  transcriptContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
