/*
 * @Author: shiningding <shiningding@tencent.com>
 * @Date: 2021-09-15 10:37:36
 * @--------------------------------------------------:
 * @LastEditTime: 2022-10-08 17:24:20
 * @Modified By: shiningding <shiningding@tencent.com>
 * @---------------------------------------------------:
 * @Description: 曝光组件
 */

import React, { useEffect, useRef, useState } from 'react';
import ExposeHandler from 'dync_expose';

const showMap: any = {}; // 缓存已加载的结果

export type ExposeProps = {
  /** 父容器， 如果不传默认是document */
  wrap?: string;
  /** 必传，用于区分曝光实例，页面里不能重复 */
  id: string;
  /** 如果有这个字段，默认会走图片懒加载模式，图片地址 */
  src?: string;
  /** 图片懒加载的img元素的class名称 */
  className?: string;
  /** 是否使用scoll模式 */
  useScroll?: boolean;
  /** 是否允许重复曝光触发，默认只会触发一次，触发曝光后移除监听，如果需要重复多次曝光，请设置为true */
  isRepeat?: boolean;
  /** 曝光后触发回调 */
  cb?: () => void;
  /** 子元素 */
  children?: React.ReactElement;
}

function QMExpose({ children, wrap, id = '', cb, src, isRepeat, className, useScroll }: ExposeProps): React.ReactElement<ExposeProps> {
  let exposeId = wrap ? `${wrap}_${id}` : `${id}`;
  exposeId = isRepeat ? `${exposeId}_isRepeat` : exposeId;
  const exposeRef = useRef<any>(null);
  const [show, setShow] = useState<boolean>(showMap[exposeId] || false);

  useEffect(() => {
    if (exposeRef && exposeRef.current) {
      const target: HTMLElement = exposeRef.current;
      const parent = wrap ? (document.querySelector(wrap) as HTMLElement) : null;
      ExposeHandler({
        id: exposeId,
        target,
        parent,
        useScroll,
        cb() {
          cb && cb();
          setShow(true);
          showMap[exposeId] = true;
        },
      });
    }
  }, []);


  const noSpan = !!children?.props?.className;
  if (!noSpan) {
    console.error('children length must be 1')
    return <></>
  }
  
  return <>
    {
      src ? <>
        {show ? <img src={src} className={className} ref={exposeRef} id={exposeId} /> : <div className={className} style={{ border: 0 }} ref={exposeRef} id={exposeId} />}
      </> : <>
        {React.Children.map(children, (child, index: number) => {
          if (!child) return <></>;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const { props } = child;
          const { style } = props;
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...props,
              ...{
                key: index,
                ref: exposeRef,
                id: exposeId,
                style: {
                  ...style,
                },
              },
            });
          }
        })}
      </>
    }
  </>
};

export default QMExpose;
