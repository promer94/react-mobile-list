import React, { useRef, useState } from 'react';
import { clamp } from 'lodash';
import { useSpring, animated } from 'react-spring';
import { useGesture } from 'react-with-gesture';

const refresh = () =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });
export function Thing() {
  const [{ y }, set] = useSpring(() => ({ y: 0 }));
  const loading = useRef(false);
  const [state, setstate] = useState(false);
  const bind = useGesture(({ down, delta, velocity }) => {
    velocity = clamp(velocity, 1, 8);
    set({
      y: down ? delta[1] : 100,
      config: { mass: velocity, tension: 500 * velocity, friction: 50 },
    });
    if (!loading.current) {
      loading.current = true;
      setstate(loading.current);
      console.log('queue');
      refresh().then(() => {
        console.log('wtf');
        loading.current = false;
        setstate(loading.current);
        set({
          y: 0,
          config: { mass: velocity, tension: 500 * velocity, friction: 50 },
        });
      });
    }
  });
  return (
    <>
      <div>{state.toString()}</div>
      <animated.div
        className="ball"
        {...bind()}
        style={{
          transform: y.interpolate((y: number) => `translateY(${y}px)`),
        }}
      />
    </>
  );
}
