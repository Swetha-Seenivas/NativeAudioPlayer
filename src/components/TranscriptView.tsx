import React, { useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { SpeakerLabels, Word } from '../types';
import TranscriptSegmentComponent from './TranscriptSegment';
import { formatTranscriptData, getCurrentWordIndex } from '../utils/transcriptUtils';
import { useAudio } from '../hooks/useAudio';

interface TranscriptViewProps {
    words: Word[];
    speakerLabels: SpeakerLabels;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({
    words,
    speakerLabels,
}) => {
    const autoScroll = true; // This can be a prop if you want to control it externally
    const scrollViewRef = useRef<ScrollView>(null);
    const { currentTime, seek } = useAudio();
    const segments = useMemo(() => formatTranscriptData(words), [words]);
    const allWords = useMemo(() => words.filter(word => word.type === 'word'), [words]);
    const currentWordIndex = getCurrentWordIndex(currentTime, allWords);

    useEffect(() => {
        if (autoScroll && currentWordIndex >= 0 && scrollViewRef.current) {
            const currentWord = allWords[currentWordIndex];
            if (currentWord) {
                const progress = currentWordIndex / allWords.length;
                const { height } = Dimensions.get('window');
                const scrollPosition = progress * (segments.length * 100);
                scrollViewRef.current.scrollTo({
                    y: Math.max(0, scrollPosition - height / 3),
                    animated: true,
                });
            }
        }
    }, [currentWordIndex, autoScroll, allWords, segments.length]);

    if (!segments.length) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No transcript available</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                bounces={false}
            >
                {segments.map((segment, index) => (
                    <TranscriptSegmentComponent
                        key={`${segment.speaker_id}-${index}`}
                        speakerId={segment.speaker_id}
                        words={segment.words}
                        speakerLabels={speakerLabels}
                        currentTime={currentTime}
                        onWordPress={seek}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingRight: 2,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});

export default TranscriptView;
