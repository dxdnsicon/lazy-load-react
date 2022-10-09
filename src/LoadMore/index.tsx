/*
 * @Author: shiningding <shiningding@tencent.com>
 * @Date: 2021-09-22 17:28:07
 * @--------------------------------------------------:
 * @LastEditTime: 2022-10-09 16:27:24
 * @Modified By: shiningding <shiningding@tencent.com>
 * @---------------------------------------------------:
 * @Description: 滚动加载更多，翻页组件
 */

import React, { useState, useRef, useEffect } from 'react';
import ExposeHandler from 'dync_expose';

export type QMLoadMoreProps = {
  /** 曝光唯一标示，同页面不可重复 */
  id: string
  /** 加载文案 */
  loadText?: string | React.ReactElement;
  /** 容器元素的id */
  parentNodeId?: string;
  /** 是否加载完毕 */
  isOver?: boolean;
  /** 加载完毕文案 */
  overText?: string | React.ReactElement;
  /** middle元素距离底部的位置, 这个数值可以用来控制中间曝光元素的位置，数值越大，可以在滑到底部前更早的时机触发加载更多 */
  middleHeight?: number;
  /** 加载更多回调 */
  loadMoreHandler?: () => void;
  /** 子元素 */
  children?: any;
}

function QMLoadMore({ id, loadText = '正在载入...', parentNodeId, children, loadMoreHandler, middleHeight, isOver = false, overText = "加载完毕" }: QMLoadMoreProps): React.ReactElement<QMLoadMoreProps> {
  const checkNum = useRef<number>(0); // 记录当前应该是第几次
  const checkNow = useRef<number>(0); // 记录当前实际是第几次触发
  const canAddNum = useRef<boolean>(false); // 判断当前是否是合理的状态变更，每次只允许变更一次
  const exposeRef = useRef<HTMLElement>(null); // 这个元素用来控制预加载
  const exposeOverRef = useRef<HTMLElement>(null); // 这个元素用来控制见底 兜底加载
  const [loading, setLoading] = useState<number>(0);
  const isLoadOver = useRef(false);
  const loadWrap = useRef<HTMLDivElement>(null);
  const localLoadMore = useRef(loadMoreHandler);
  localLoadMore.current = loadMoreHandler;

  isLoadOver.current = isOver;

  const initExpose = (keyName: string) => {
    const exposeId = `${id}-loadmore-${keyName}-isRepeat`;
    const parent = parentNodeId ? document.querySelector(parentNodeId) as HTMLElement : null;
    ExposeHandler({
      id: exposeId,
      parent,
      cb: () => {
        setLoading(1);
        if (checkNow.current <= checkNum.current && !canAddNum.current) {
          canAddNum.current = true;
          if (isLoadOver.current) {
            // 加载完毕之后不再触发回调
            return;
          }
          checkNow.current++;
          localLoadMore && localLoadMore.current && localLoadMore.current();
        } else if (checkNow.current > checkNum.current) {
          checkNow.current = checkNum.current
        }
      },
    });
  }

  useEffect(() => {
    if (exposeRef && exposeRef.current) {
      initExpose('middle')
    }
    if (exposeOverRef && exposeOverRef.current) {
      initExpose('over')
    }
  }, []);

  useEffect(() => {
    // 监听children变化而变化组件可加载状态
    setLoading(0);
    if (canAddNum.current) {
      checkNum.current++;
      canAddNum.current = false;
    }
  }, [children])

  let loadingText = <></>;

  switch (loading) {
    case 1:
      loadingText = typeof loadText === 'string' ? <div className="qui_loading"><i className="qui_loading__icon c_txt2"></i><span className="qui_loading__text c_txt2">{loadText}</span></div> : loadText;
      break;
    default:
      break;
  }

  if (isOver) {
    loadingText = typeof overText === 'string' ? <div className="qui_loading"><span className="qui_loading__text c_txt2">{overText}</span></div> : overText;
  }

  return (
    <div ref={loadWrap} className="qm_load_more_wrap" style={{ position: 'relative', height: 'auto' }}>
      {children}
      {loadingText}
      <i
        className="load_more_taret"
        ref={exposeRef}
        id={`${id}-loadmore-middle-isRepeat`}
        style={{
          position: 'absolute',
          height: '1px',
          width: '1px',
          bottom: middleHeight ? `${middleHeight}px` : `100px`,
        }}
      ></i>
      <i
        className="load_more_taret"
        ref={exposeOverRef}
        id={`${id}-loadmore-over-isRepeat`}
        style={{
          position: 'absolute',
          height: '1px',
          width: '1px',
          bottom: '5px',
        }}
      ></i>
    </div>
  );
};

export default QMLoadMore;
