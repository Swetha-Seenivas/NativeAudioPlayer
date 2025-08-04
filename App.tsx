import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import TranscriptView from './src/components/TranscriptView';
import { getMockAudioUrl, loadMockData } from './src/services/dataService';
import { MockResponseData } from './src/types';
import SummariseIcon from './src/icons/SummariseIcon';
import AudioPlayer, { AudioPlayerRef } from './components/AudioPlayer';

export default function App() {
  const [showSummary, setShowSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | null>(
    'summary',
  );
  const [transcriptData, setTranscriptData] = useState<MockResponseData | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [_duration, setDuration] = useState(0);
  const audioPlayerRef = useRef<AudioPlayerRef>(null);

  useEffect(() => {
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

  const handleProgressUpdate = (position: number, totalDuration: number) => {
    setCurrentTime(position);
    setDuration(totalDuration);
  };

  const seekToTime = (timeInSeconds: number) => {
    audioPlayerRef.current?.seekTo(timeInSeconds);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowContainer}>
        <AudioPlayer
          ref={audioPlayerRef}
          audioUrl={getMockAudioUrl()}
          onProgressUpdate={handleProgressUpdate}
          onSeekToTime={seekToTime}
        />
        <SummariseIcon
          showSummary={showSummary}
          setShowSummary={setShowSummary}
        />
      </View>
      {showSummary && (
        <View style={styles.summaryContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'summary' && styles.activeTabButton,
              ]}
              onPress={() => {
                setActiveTab('summary');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'summary' && styles.activeTabText,
                ]}
              >
                Summary
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'transcript' && styles.activeTabButton,
              ]}
              onPress={() => {
                setActiveTab('transcript');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'transcript' && styles.activeTabText,
                ]}
              >
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
            <View
              style={{
                ...styles.contentContainer,
                ...styles.transcriptionContainer,
              }}
            >
              <View style={styles.transcriptContainer}>
                <TranscriptView
                  words={transcriptData.data.transcript.data.words}
                  speakerLabels={transcriptData.data.transcript.speakerLabels}
                  currentTime={currentTime}
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
    width: '85%',
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
