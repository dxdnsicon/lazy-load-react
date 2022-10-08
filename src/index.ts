/*
 * @Author: shiningding <shiningding@tencent.com>
 * @Date: 2021-09-17 11:30:36
 * @--------------------------------------------------:
 * @LastEditTime: 2022-10-08 16:08:39
 * @Modified By: shiningding <shiningding@tencent.com>
 * @---------------------------------------------------:
 * @Description: dynamic expose, support 'IntersectionObserver' and 'Scroll'
 */

const observeMap: Record<string, any> = {}; // expose state
const observeCallback: Record<string, any> = {}; // expose callback

function checkPassiveEventSupported() {
  let passiveSupported = false;
  try {
    const options = Object.defineProperty({}, 'passive', {
      get: function get() {
        passiveSupported = true;
        return true;
      },
    });
    // @ts-ignore
    window.addEventListener('test', null, options);
  } catch (err) {
    passiveSupported = false;
  }
  return passiveSupported;
}

const passiveEvent = checkPassiveEventSupported() ? { capture: false, passive: true } : false;

export function on(el: any, eventName: string, callback: (event: any) => void, opts?: any) {
  if (el.addEventListener) {
    el.addEventListener(eventName, callback, opts || passiveEvent);
  } else if (el.attachEvent) {
    el.attachEvent(`on${eventName}`, (e: any) => {
      callback.call(el, e || window.event);
    });
  }
}

export function off(el: any, eventName: string, callback: () => void, opts?: any) {
  if (el.removeEventListener) {
    el.removeEventListener(eventName, callback, opts || passiveEvent);
  } else if (el.detachEvent) {
    el.detachEvent(`on${eventName}`, callback);
  }
}
let Observer: any;
if (window?.IntersectionObserver) {
  Observer = new window.IntersectionObserver(
    entries => {
      const showEntries = entries.filter(x => x.isIntersecting);
      const hiddenEntries = entries.filter(x => !x.isIntersecting);

      hiddenEntries.forEach(x => {
        const id = x.target.id;
        if (id && observeCallback[id]) {
          const isHide = id.indexOf('isHide') > -1;
          if (isHide) {
            observeCallback[id](true);
          }
        }
      });

      showEntries.forEach(x => {
        const id = x.target.id;
        const isRepeat = id.indexOf('isRepeat') > -1;
        if (id && observeCallback[id]) {
          observeCallback[id]();
          if (!isRepeat) {
            Observer.unobserve(x.target);
          }
        } else {
          console.error('id is empty', x.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: [0.1],
    },
  );
}

export default function({
  id,
  target,
  parent,
  cb,
  threshold,
  useScroll,
}: {
  id: string;
  target: HTMLElement;
  parent: HTMLElement | null;
  cb: (isHide?: boolean) => void;
  threshold?: number;
  useScroll?: boolean;
}) {
  const isRepeat = id.indexOf('isRepeat') > -1; // If the id contains 'isRepeat', repeated exposure after the callback will still trigger the callback;
  const isHide = id.indexOf('isHide') > -1; // If the id contains 'isHide', it also needs to trigger a callback when it is hidden.
  const dom = target;
  const ratio = isHide ? 0 : threshold || 0.5;
  const wrap = parent || document;
  if (!dom) {
    return console.error('empty dom');
  }
  if (window.IntersectionObserver && !useScroll) {
    if (observeMap[id]) {
      if (observeMap[id] === 2) {
        return;
      }
    }
    if (cb) {
      observeCallback[id] = cb;
    }
    if (Observer && Observer.observe) {
      Observer.observe(dom);
    }
    return observeMap[id];
  } else {
    observeMap[id] = false;
    const scrollHandler = () => {
      try {
        if (observeMap[id] === undefined) return;
        let obserObj = {
          height: window.screen.availHeight,
          width: window.screen.availWidth,
          left: 0,
          top: 0,
        };
        if (parent) {
          obserObj = (parent as any).getBoundingClientRect();
        }
        const { top, left, height, width } = dom.getBoundingClientRect();
        if (isHide) {
          // 判断隐藏逻辑
          if (top > obserObj.height + obserObj.top || top <= 0 - height || left > obserObj.width + obserObj.left || left <= 0 - width) {
            if (observeMap[id] === false) {
              cb && cb(true);
              observeMap[id] = true;
              if (!isRepeat) {
                off(wrap, 'scroll', scrollHandler);
              }
            }
          } else {
            if (observeMap[id] === true) {
              cb && cb(false);
              observeMap[id] = false;
              if (!isRepeat) {
                off(wrap, 'scroll', scrollHandler);
              }
            }
          }
        } else {
          if (
            height * ratio <= obserObj.height + obserObj.top - top &&
            height * ratio > obserObj.top - top &&
            width * ratio <= obserObj.width + obserObj.left - left &&
            width * ratio > obserObj.left - left
          ) {
            cb && cb();
            observeMap[id] = !observeMap[id];
            if (!isRepeat) {
              off(wrap, 'scroll', scrollHandler);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    scrollHandler();
    on(wrap, 'scroll', scrollHandler);
  }
}
