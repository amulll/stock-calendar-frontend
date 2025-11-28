"use client";

import { useState, useEffect, useRef } from "react";
// 👇 1. 引入剛剛建立的 CSS Module
import styles from "./Loading.module.css";

export default function Loading({ text = "努力載入中..." }) {
  const [dogWidth, setDogWidth] = useState(70);
  const [isGrowing, setIsGrowing] = useState(true);
  const animationRef = useRef(null);

  // 自動動畫邏輯
  useEffect(() => {
    const animate = () => {
      setDogWidth((prev) => {
        let nextWidth = prev;
        const speed = 0.5; // 變長的速度

        if (isGrowing) {
          nextWidth += speed;
          if (nextWidth >= 200) setIsGrowing(false); // 最長 200px
        } else {
          nextWidth -= speed * 1; // 縮回速度快一點
          if (nextWidth <= 70) setIsGrowing(true); // 最短 70px
        }
        return nextWidth;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isGrowing]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px] bg-slate-50 overflow-hidden">
      
      {/* 🐶 臘腸狗動畫區塊 */}
      {/* 👇 2. 修改所有的 className，改成使用 styles[...] */}
      <div className={styles['dog-container']}>
        
        {/* 身體 (寬度會動態改變) */}
        <div className={styles.dog} style={{ width: `${dogWidth}px` }}>
          
          {/* 氣球 (顯示進度) */}
          <div className={styles.balloon} style={{ left: `${dogWidth / 2}px` }}>
            {Math.floor(dogWidth - 70)} cm
          </div>

          {/* 前半部 */}
          <div className={styles['dog__front']}>
            <div className={styles['dog__front-body']}>
              <div className={styles['dog__face']} />
              <div className={styles['dog__eye']} />
            </div>
            {/* 腳 (永遠是 active 狀態) */}
            <div className={`${styles['dog__foot']} ${styles.active}`} />
            <div className={`${styles['dog__foot']} ${styles.active}`} />
          </div>

          {/* 後半部 */}
          <div className={styles['dog__back']}>
            <div className={styles['dog__back-body']} />
            <div className={`${styles['dog__foot']} ${styles.active}`} />
            <div className={`${styles['dog__foot']} ${styles.active}`} />
            <div className={styles['dog__tail']} />
          </div>
        
        </div>
      </div>

      {/* 文字提示 */}
      <p className="relative -top-10 text-slate-500 font-medium text-sm tracking-wider animate-pulse bg-white/80 px-5 py-2 rounded-full border border-slate-200 shadow-sm z-10">
        {text}
      </p>
    </div>
  );
}