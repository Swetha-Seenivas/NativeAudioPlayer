import * as React from "react";
import { TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

interface SummariseIconProps {
  showSummary: boolean;
  setShowSummary: (value: boolean) => void;
}

const SummariseIcon = ({ showSummary, setShowSummary }: SummariseIconProps) => (
  <TouchableOpacity
    style={styles.showSummaryButton}
    onPress={() => setShowSummary(!showSummary)}
  >
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.99793 2.49707C4.99793 4.33879 3.50492 5.83179 1.66321 5.83179C3.50492 5.83179 4.99793 7.3248 4.99793 9.16651C4.99793 7.3248 6.49094 5.83179 8.33265 5.83179C6.49094 5.83179 4.99793 4.33879 4.99793 2.49707Z"
        stroke="#111111"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.1684 12.5009C14.1684 10.1987 12.3021 8.33247 10 8.33247C12.3021 8.33247 14.1684 6.46621 14.1684 4.16406C14.1684 6.46621 16.0347 8.33247 18.3368 8.33247C16.0347 8.33247 14.1684 10.1987 14.1684 12.5009Z"
        stroke="#111111"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.1684 12.501V13.3347"
        stroke="#111111"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.1684 4.16474V3.33105"
        stroke="#111111"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.33261 17.5029V18.3366"
        stroke="#111111"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.33261 11.6677V10.834"
        stroke="#111111"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.99789 9.16602V9.9997"
        stroke="#111111"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.99789 1.66309V2.49677"
        stroke="#111111"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.33265 11.251C8.33265 13.0927 6.83964 14.5857 4.99792 14.5857C6.83964 14.5857 8.33265 16.0787 8.33265 17.9204C8.33265 16.0787 9.82565 14.5857 11.6674 14.5857C9.82565 14.5857 8.33265 13.0927 8.33265 11.251Z"
        stroke="#111111"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </TouchableOpacity>

);
export default SummariseIcon;

const styles = {
  showSummaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: 'center' as const,
    marginBottom: 6,
  },
}
