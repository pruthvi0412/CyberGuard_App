import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Animated } from 'react-native';
import Svg, { Circle, Polygon, Path, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const SHAPE_COUNT = 15;
const COLORS = ['#00FFD1', '#00B4FF', '#BD00FF', '#FF00D6'];

export default function CyberBackground() {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  
  // PanResponder to track touch for interactivity
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue({ x: gestureState.moveX, y: gestureState.moveY });
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Generate complex shapes
  const shapes = useMemo(() => {
    return [...Array(SHAPE_COUNT)].map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      type: ['triangle', 'sphere', 'cube'][Math.floor(Math.random() * 3)],
      size: Math.random() * 30 + 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      speed: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  const renderShape = (shape) => {
    const { type, x, y, size, color, rotation } = shape;
    
    // Simple drift animation combined with touch repulsion
    const translateX = pan.x.interpolate({
      inputRange: [0, width],
      outputRange: [10, -10],
      extrapolate: 'clamp',
    });
    const translateY = pan.y.interpolate({
      inputRange: [0, height],
      outputRange: [10, -10],
      extrapolate: 'clamp',
    });

    return (
      <G key={shape.id} transform={`rotate(${rotation}, ${x}, ${y})`}>
        {type === 'triangle' && (
          <Polygon
            points={`${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`}
            fill="transparent"
            stroke={color}
            strokeWidth="1.5"
            opacity="0.3"
          />
        )}
        {type === 'sphere' && (
          <Circle
            cx={x}
            cy={y}
            r={size / 2}
            fill="transparent"
            stroke={color}
            strokeWidth="1"
            opacity="0.3"
          />
        )}
        {type === 'cube' && (
          <Path
            d={`M${x-size/2} ${y-size/2} L${x+size/2} ${y-size/2} L${x+size/2} ${y+size/2} L${x-size/2} ${y+size/2} Z`}
            fill="transparent"
            stroke={color}
            strokeWidth="1"
            opacity="0.3"
          />
        )}
      </G>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Svg height={height} width={width} style={styles.svg}>
        {shapes.map(renderShape)}
      </Svg>
      
      {/* Background glow effects - using opacity and scale instead of blur */}
      <View style={[styles.glow, { top: height * 0.2, left: width * 0.2, backgroundColor: 'rgba(0, 255, 209, 0.15)' }]} />
      <View style={[styles.glow, { bottom: height * 0.1, right: width * 0.1, backgroundColor: 'rgba(189, 0, 255, 0.1)' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  svg: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  }
});

