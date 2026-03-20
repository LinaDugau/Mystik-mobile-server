import React from 'react';
import { View } from 'react-native';
import Svg, { G, Rect, Polygon, Line, Circle, Text, Path } from 'react-native-svg';

interface MatrixPoint {
  value: number;
  locked?: boolean;
}

interface DestinyMatrixSVGProps {
  matrix: MatrixPoint[];
  width?: number;
  height?: number;
}

export default function DestinyMatrixSVG({ matrix, width = 340, height = 300 }: DestinyMatrixSVGProps) {
  const scale = width / 680;
  
  return (
    <View style={{ width, height: height * scale }}>
      <Svg viewBox="0 0 680 600" width={width} height={height * scale}>
        <G id="matrix-frame">
          <Rect stroke="#9c27b0" strokeWidth="2" fill="none" x="163.63" y="126.14" width="340.16" height="340.16" />
          <Rect stroke="#9c27b0" strokeWidth="2" fill="none" x="227.87" y="127.54" width="340.16" height="340.16" transform="translate(-158.13 367.16) rotate(-45)" />
          <Polygon stroke="#9c27b0" strokeWidth="2" fill="none" points="333.7 7.76 537.64 92.28 622.17 296.22 537.64 501.16 333.7 584.68 129.76 500.16 45.24 296.22 129.76 92.28 333.7 7.76" />
          <Line stroke="#666" strokeWidth="1" x1="333.7" y1="27.76" x2="333.7" y2="564.68" />
          <Line stroke="#666" strokeWidth="1" x1="65.24" y1="296.22" x2="602.17" y2="296.22" />
          
          {/* Male generation line (green) */}
          <G>
            <Line stroke="#4caf50" strokeWidth="1.5" x1="442" y1="405" x2="226" y2="189" />
            <Polygon fill="#4caf50" points="441 402 439 404 442 405 441 402" />
            <Polygon fill="#4caf50" points="226 189 229 190 227 192 226 189" />
            {/* ♂ label */}
            <Text
              fill="#4caf50"
              fontSize="18"
              fontWeight="bold"
              x="280"
              y="230"
            >
              ♂
            </Text>
          </G>
          
          {/* Female generation line (blue) */}
          <G>
            <Line stroke="#2196f3" strokeWidth="1.5" x1="442" y1="189" x2="226" y2="405" />
            <Polygon fill="#2196f3" points="442 189 439 190 441 192 442 189" />
            <Polygon fill="#2196f3" points="226 405 227 402 229 404 226 405" />
            {/* ♀ label */}
            <Text
              fill="#2196f3"
              fontSize="18"
              fontWeight="bold"
              x="375"
              y="230"
            >
              ♀
            </Text>
          </G>
          
          <Line stroke="#666" strokeWidth="1" x1="502" y1="297" x2="335" y2="465" />
          
          {/* Heart icon */}
          <G transform="translate(360, 370)">
            <Path fill="#e91e63" d="M13.5,0c-3.13,0-3.56,3-3.64,3s-0.71-3-3.62-3c-3.5,0-4.46,2.95-4.26,4.73c0.36,3.07,7.87,9.27,7.87,9.27s7.53-6.2,7.89-9.27C17.22,2.95,16.26,0,13.5,0Z" />
          </G>
          
          {/* Dollar sign */}
          <G transform="translate(410, 345)">
            <Text fill="#ffd700" fontSize="24" fontWeight="bold">$</Text>
          </G>
        </G>
        
        <G id="points-basic">
          {/* A - День */}
          <Circle fill="#2a2a3e" stroke="#ffd700" strokeWidth="2" cx="79.2" cy="297" r="33.5" />
          <Text x="79.2" y="302" fontSize="18" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[1].value}</Text>
          
          {/* B - Месяц */}
          <Circle fill="#2a2a3e" stroke="#ffd700" strokeWidth="2" cx="333.7" cy="42" r="33.5" />
          <Text x="333.7" y="47" fontSize="18" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[2].value}</Text>
          
          {/* C - Год */}
          <Circle fill="#2a2a3e" stroke="#ff9800" strokeWidth="2" cx="587.13" cy="297" r="33.5" />
          <Text x="587.13" y="302" fontSize="18" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[3].value}</Text>
          
          {/* D */}
          <Circle fill="#2a2a3e" stroke="#ff9800" strokeWidth="2" cx="332.7" cy="554" r="33.5" />
          <Text x="332.7" y="559" fontSize="18" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[4].value}</Text>
          
          {/* E - Центр */}
          <Circle fill="#1a1a2e" stroke="#ffd700" strokeWidth="3" cx="334" cy="297" r="33.5" />
          <Text x="334" y="302" fontSize="20" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[0].value}</Text>
          
          {/* F */}
          <Circle fill="#2a2a3e" stroke="#9c27b0" strokeWidth="2" cx="151" cy="114.22" r="33.5" />
          <Text x="151" y="119" fontSize="16" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[5].value}</Text>
          
          {/* G */}
          <Circle fill="#2a2a3e" stroke="#9c27b0" strokeWidth="2" cx="515.1" cy="114.22" r="33.5" />
          <Text x="515.1" y="119" fontSize="16" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[6].value}</Text>
          
          {/* I */}
          <Circle fill="#2a2a3e" stroke="#9c27b0" strokeWidth="2" cx="514.1" cy="479.62" r="33.5" />
          <Text x="514.1" y="484" fontSize="16" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[7].value}</Text>
          
          {/* H */}
          <Circle fill="#2a2a3e" stroke="#9c27b0" strokeWidth="2" cx="153" cy="479.62" r="33.5" />
          <Text x="153" y="484" fontSize="16" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[8].value}</Text>
          
          {/* J */}
          <Circle fill="#2a2a3e" stroke="#e91e63" strokeWidth="2" cx="332.59" cy="466" r="21" />
          <Text x="332.59" y="470" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[12].value}</Text>
          
          {/* N */}
          <Circle fill="#2a2a3e" stroke="#e91e63" strokeWidth="2" cx="500" cy="297" r="21" />
          <Text x="500" y="301" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[11].value}</Text>
          
          {/* L */}
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="418.18" cy="380.69" r="21" />
          <Text x="418.18" y="385" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[15].value}</Text>
          
          {/* K */}
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="375" cy="424" r="21" />
          <Text x="375" y="429" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[16].value}</Text>
          
          {/* M */}
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="461" cy="338" r="21" />
          <Text x="461" y="343" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[25].value}</Text>
          
          {/* S */}
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="165.61" cy="297" r="21" />
          <Text x="165.61" y="301" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[9].value}</Text>
          
          {/* T */}
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="333.7" cy="129" r="21" />
          <Text x="333.7" y="133" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[10].value}</Text>
          
          {/* O, P, Q, R */}
          <Circle fill="#2a2a3e" stroke="#00bcd4" strokeWidth="2" cx="127.11" cy="297" r="24" />
          <Text x="127.11" y="302" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[17].value}</Text>
          
          <Circle fill="#2a2a3e" stroke="#00bcd4" strokeWidth="2" cx="333.7" cy="90.62" r="24" />
          <Text x="333.7" y="95" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[18].value}</Text>
          
          <Circle fill="#2a2a3e" stroke="#ff5722" strokeWidth="2" cx="538.5" cy="297" r="24" />
          <Text x="538.5" y="302" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[19].value}</Text>
          
          <Circle fill="#2a2a3e" stroke="#ff5722" strokeWidth="2" cx="333" cy="505" r="24" />
          <Text x="333" y="510" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[20].value}</Text>
          
          {/* W, X */}
          <Circle fill="#2a2a3e" stroke="#9c27b0" strokeWidth="2" cx="245.26" cy="297" r="21" />
          <Text x="245.26" y="301" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[13].value}</Text>
          
          <Circle fill="#2a2a3e" stroke="#9c27b0" strokeWidth="2" cx="333.7" cy="203" r="21" />
          <Text x="333.7" y="207" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[14].value}</Text>
          
          {/* F1, F2 */}
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="212" cy="175.93" r="21" />
          <Text x="212" y="179" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[26].value}</Text>
          
          <Circle fill="#2a2a3e" stroke="#ff5722" strokeWidth="2" cx="184.71" cy="149.53" r="24" />
          <Text x="184.71" y="153" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[27].value}</Text>
          
          {/* G1, G2 */}
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="455.4" cy="177.53" r="21" />
          <Text x="455.4" y="181" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[28].value}</Text>
          
          <Circle fill="#2a2a3e" stroke="#ff5722" strokeWidth="2" cx="480.79" cy="149.13" r="24" />
          <Text x="480.79" y="153" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[29].value}</Text>
          
          {/* I1, I2 */}
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="454.4" cy="416.91" r="21" />
          <Text x="454.4" y="420" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[30].value}</Text>
          
          <Circle fill="#2a2a3e" stroke="#ff5722" strokeWidth="2" cx="479.79" cy="445.31" r="24" />
          <Text x="479.79" y="449" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[31].value}</Text>
          
          {/* H1, H2 */}
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="215" cy="419" r="21" />
          <Text x="215" y="423" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[32].value}</Text>
          
          <Circle fill="#2a2a3e" stroke="#ff5722" strokeWidth="2" cx="188.71" cy="446.7" r="24" />
          <Text x="188.71" y="450" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[33].value}</Text>
          
          {/* U, V */}
          <Circle fill="#2a2a3e" stroke="#ff5722" strokeWidth="2" cx="382" cy="297" r="24" />
          <Text x="382" y="301" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[34].value}</Text>
          
          <Circle fill="#2a2a3e" stroke="#03a9f4" strokeWidth="2" cx="420.54" cy="297" r="21" />
          <Text x="420.54" y="301" fontSize="14" fontWeight="bold" fill="#ffd700" textAnchor="middle">{matrix[35].value}</Text>
        </G>
      </Svg>
    </View>
  );
}
