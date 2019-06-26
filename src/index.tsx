import React, { useRef, useState, useEffect, useReducer } from 'react';
import { clamp } from 'lodash';
import { useSpring, animated } from 'react-spring';
import { useGesture } from 'react-with-gesture';
import ReactLoading from 'react-loading';
import { VariableSizeList as List } from 'react-window';

// These row heights are arbitrary.
// Yours should be based on the content of the row.
const rowHeights = new Array(1000)
  .fill(true)
  .map(() => 25 + Math.round(Math.random() * 50));

const getItemSize = (index: number) => rowHeights[index];

const Row = ({
  index,
  style,
}: {
  index: number;
  style: React.CSSProperties;
}) => <div style={style}>Row {index}</div>;

const refresh = () =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 5000);
  });

type InitialState = {
  width: number;
  height: number;
};
type Action = {
  type: 'UPDATE' | 'RESET';
  playLoad: InitialState;
};
const initialState: InitialState = { width: 0, height: 0 };
const reducer = (state: InitialState, action: Action) => {
  switch (action.type) {
    case 'UPDATE':
      return action.playLoad;
    case 'RESET':
      return { width: 0, height: 0 };
    default:
      return state;
  }
};

const innerDiv = React.forwardRef((props, ref?: React.Ref<HTMLDivElement>) => (
  <div id="__LISTWRAPPER" ref={ref} {...props} />
));
function canRefresh() {
  const list = document.getElementById('__LISTWRAPPER');
  return list && list.scrollTop === 0;
}
export function Thing() {
  const [{ y }, set] = useSpring(() => ({ y: 0 }));
  const [{ op }, setop] = useSpring(() => ({ op: 0 }));
  const loading = useRef(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [state, setstate] = useState(false);
  const [size, dispatch] = useReducer(reducer, initialState);
  const [text, settext] = useState('Pull to refresh');
  useEffect(() => {
    if (listContainerRef.current) {
      const { offsetWidth, offsetHeight } = listContainerRef.current;
      dispatch({
        type: 'UPDATE',
        playLoad: { width: offsetWidth, height: offsetHeight },
      });
    }
  }, []);
  useEffect(() => {});
  const bind = useGesture(({ down, delta, velocity }) => {
    velocity = clamp(velocity, 1, 8);
    if (delta[1] > 0 && canRefresh()) {
      if (down) {
        if (delta[1] <= 75) {
          set({
            y: delta[1],
            config: { mass: velocity, tension: 500 * velocity, friction: 50 },
          });
          if (delta[1] > 70) {
            settext('Release to Refresh');
          } else {
            if (delta[1] >= 25) {
              setop({
                op: delta[1] / 25 - 1,
              });
            }
          }
        }
      } else {
        setop({
          op: 0,
        });
        if (!loading.current) {
          if (delta[1] > 70) {
            loading.current = true;
            setstate(loading.current);
            set({
              y: 50,
              config: { mass: velocity, tension: 500 * velocity, friction: 50 },
            });
            refresh().then(() => {
              loading.current = false;
              setstate(loading.current);
              settext('Pull to refresh');
              set({
                y: 0,
                config: {
                  mass: velocity,
                  tension: 500 * velocity,
                  friction: 50,
                },
              });
            });
          } else {
            set({
              y: 0,
              config: { mass: velocity, tension: 500 * velocity, friction: 50 },
            });
          }
        }
      }
    }
  });
  return (
    <>
      <div
        className="loading"
        style={{
          transform: `translateY(-25px)`,
        }}
      >
        {state ? (
          <ReactLoading
            type="spokes"
            color="#000"
            height={25}
            width={25}
          ></ReactLoading>
        ) : (
          <animated.div
            className="tips"
            style={{
              opacity: op.interpolate(o => o),
              transform: y.interpolate(
                (y: number) => `translateY(${-50 + y}px)`
              ),
            }}
          >
            {text}
          </animated.div>
        )}
      </div>
      <animated.div
        className="List"
        ref={listContainerRef}
        {...bind()}
        style={{
          transform: y.interpolate((y: number) => `translateY(${-100 + y}px)`),
        }}
      >
        <List
          height={size.height}
          itemCount={1000}
          outerElementType={innerDiv}
          itemSize={getItemSize}
          width={size.width}
        >
          {Row}
        </List>
      </animated.div>
    </>
  );
}
