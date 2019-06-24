import React, { useRef } from 'react';
import { clamp } from 'lodash';
import { useSpring, animated } from 'react-spring';
import { useGesture } from 'react-with-gesture';

const refresh = () =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
export function Thing() {
  const [{ y }, set] = useSpring(() => ({ y: 0 }));
  const loading = useRef(false);
  const bind = useGesture(({ down, delta, velocity }) => {
    velocity = clamp(velocity, 1, 8);
    set({
      y: down ? delta[1] : 100,
      config: { mass: velocity, tension: 500 * velocity, friction: 50 },
    });
    if (!loading.current) {
      loading.current = true;
      console.log('queue');
      refresh().then(() => {
        console.log('wtf');
        loading.current = false;
        set({
          y: 0,
          config: { mass: velocity, tension: 500 * velocity, friction: 50 },
        });
      });
    }
  });
  return (
    <animated.div
      {...bind()}
      style={{
        transform: y.interpolate((y: number) => `translateY(${y}px)`),
      }}
    />
  );
}
