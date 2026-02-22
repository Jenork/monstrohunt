'use client';

import { useState } from 'react';
import styles from './carousel.module.css';

const SLIDES: { title: string; body: string }[] = [
  {
    title: '1',
    body: 'MONSTROHUNT — ончейн-игра на Base. Всё в ETH, без токенов и NFT.',
  },
  {
    title: '2',
    body: 'Один кошелёк = один монстр. Создаёшь за 0.001–0.01 ETH (Scout / Hunter / Leviathan).',
  },
  {
    title: '3',
    body: 'Раз в 7 дней нужно кормить. Стоимость корма: 5% начального + 5% текущего веса. Всё идёт в вес монстра.',
  },
  {
    title: '4',
    body: 'Забыл покормить — монстр «голодный». Любой может прийти и снять его: 30% веса охотнику, 65% — живым монстрам по весу, 5% — протоколу.',
  },
  {
    title: '5',
    body: 'Охота: кулдаун 20 мин после каждой попытки. Можно продать монстра (99% веса тебе, 1% протоколу), если он не голодный.',
  },
  {
    title: '6',
    body: 'Кормишь вовремя — не теряешь. Вся прибыль — из чужих ошибок. Играй в Base App 👇',
  },
];

export default function CarouselPage() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  return (
    <div className={styles.page}>
      <div className={styles.slideWrap}>
        <div className={styles.slide} id="carousel-slide">
          <div className={styles.logo}>MONSTROHUNT</div>
          <div className={styles.slideNum}>{slide.title}/6</div>
          <p className={styles.body}>{slide.body}</p>
          {index === SLIDES.length - 1 && (
            <div className={styles.hashtags}>#Base #MonstroHunt</div>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.btn}
          onClick={() => setIndex((i) => (i > 0 ? i - 1 : SLIDES.length - 1))}
          aria-label="Предыдущий слайд"
        >
          ← Назад
        </button>
        <span className={styles.indicator}>
          {index + 1} / {SLIDES.length}
        </span>
        <button
          type="button"
          className={styles.btn}
          onClick={() => setIndex((i) => (i < SLIDES.length - 1 ? i + 1 : 0))}
          aria-label="Следующий слайд"
        >
          Вперёд →
        </button>
      </div>

      <p className={styles.hint}>
        Для карусели в X: открой страницу на ширине 1080px (или 100% масштаб на 1080px), переключай слайды и делай скриншот каждого.
      </p>
    </div>
  );
}
