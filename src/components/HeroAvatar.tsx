'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { portfolioConfig } from '@config';

const { personalInfo } = portfolioConfig;
const { avatar } = personalInfo;

/**
 * The looping hero avatar.
 *
 * The clip is matted onto pure white, so `mix-blend-mode: multiply` drops the
 * backdrop out against the paper and lets the ghosted wordmark read through —
 * no alpha codec, and therefore no second WebM encode. The blend lives on the
 * positioned wrapper so it composites against the section rather than against
 * an isolated group of its own.
 *
 * The spoken introduction is a separate <audio> element rather than an audio
 * track on the video, so the file can be swapped without a re-encode and the
 * transcript can stay beside it. Browsers block audible autoplay
 * unconditionally, so sound is always user-initiated.
 *
 * The clip is lip-synced to that voiceover, which makes the two a single unit:
 * they share a t=0 and must always be started together. That invariant is held
 * in the asset, not here: `kartik-intro-clean` was head-trimmed until its t=0
 * matched the video's, so there is no offset arithmetic anywhere in this file —
 * seek both to 0 and they agree.
 *
 * There is no pause button because scrolling is the pause control: an observer
 * stops both tracks the moment the figure leaves the viewport and picks them up
 * again on the way back, which satisfies WCAG 2.2.2 without a chrome element.
 * Both rewind on the way out. The loop used to resume where it left off — fine
 * for a generic gesture cycle, wrong the moment the mouth is forming specific
 * words, because the audio always restarts and the lips would not.
 */
export function HeroAvatar() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  /*
    `soundOn` is the user's *intent*, which outlives any scroll-driven pause —
    so the observer must read the current value without re-subscribing, hence
    the mirror ref. Never derive it from the element's `pause` event: scrolling
    away pauses the audio while the intent is still "on".
  */
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  useEffect(() => {
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!stage || !video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) video.pause();

    /*
      Default threshold 0, which is usefully hysteretic: the figure counts as
      present the instant one pixel of it shows and absent only once every pixel
      has gone. A band like `threshold: 0.15` instead leaves a dead zone you can
      sit inside, which is what made coming back feel late.
    */
    const observer = new IntersectionObserver(([entry]) => {
      const audio = audioRef.current;
      if (entry.isIntersecting) {
        if (!reduced) void video.play().catch(() => undefined);
        // Allowed without a fresh gesture because turning the sound on in the
        // first place was one. Neither needs a seek here — both were rewound on
        // the way out, which also dodges the `AbortError` that a seek
        // immediately before `play()` raises.
        if (soundOnRef.current) void audio?.play().catch(() => undefined);
      } else {
        // Both rewind, never one. The line is a greeting, so it opens on the
        // first word every time — and the lips have to open on that same word,
        // which they only do if the clip restarts with it.
        video.pause();
        video.currentTime = 0;
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const toggleVoice = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) {
      audio.pause();
      audio.currentTime = 0;
      setSoundOn(false);
    } else {
      // Switching sound on mid-loop would drop the voice in against whatever
      // the mouth happened to be saying, so the clip restarts with it.
      const video = videoRef.current;
      audio.currentTime = 0;
      if (video) video.currentTime = 0;
      setSoundOn(true);
      void audio.play().catch(() => setSoundOn(false));
      void video?.play().catch(() => undefined);
    }
  };

  return (
    <>
      {avatar.voiceUrl && (
        <div className="pointer-events-none absolute inset-x-0 top-8 z-30">
          <div className="shell flex justify-end">
            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={soundOn}
              aria-label={
                soundOn ? 'Mute the spoken introduction' : 'Play the spoken introduction'
              }
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full
                border border-rule text-ink-soft transition-colors hover:border-ink hover:text-ink
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-accent aria-pressed:border-ink aria-pressed:text-ink"
            >
              {/* The icon states what is true *now*, not what the click will do. */}
              {soundOn ? (
                <Volume2 size={13} strokeWidth={2} />
              ) : (
                <VolumeX size={13} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      )}

      {avatar.voiceUrl && (
        <>
          <audio
            ref={audioRef}
            src={avatar.voiceUrl}
            // Buffered up front: on the way back the clip has to restart from
            // zero, and `preload="none"` made that a visible stall.
            preload="auto"
            onEnded={() => setSoundOn(false)}
          />
          {/* WCAG 1.2.1 text alternative. Never shown — it is for screen readers. */}
          {avatar.voiceTranscript && <p className="sr-only">{avatar.voiceTranscript}</p>}
        </>
      )}

      {/*
        On mobile the figure sits above the headline rather than behind it, so
        no scrim is needed and the body stays at full strength. From `md` it
        drops to the baseline and the headline overlaps it, as in the reference.
      */}
      <div
        ref={stageRef}
        className="rise-in pointer-events-none absolute bottom-[29%] left-1/2 z-10 h-[46vh] w-auto
          -translate-x-1/2 [mix-blend-mode:multiply] md:bottom-0 md:h-[78vh]"
      >
        <video
          ref={videoRef}
          src={avatar.videoUrl}
          poster={avatar.videoPosterUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={`${personalInfo.fullName}, ${personalInfo.roleTitle}`}
          /*
            The source clip runs off its own bottom edge mid-shoe, so there is
            no frame in which the feet are whole. Below `md` the figure floats
            above the headline and that flat cut hangs in mid-air; the mask
            dissolves the last few percent into the paper instead, which reads
            as a deliberate vignette rather than a rendering fault. From `md` the
            figure sits on the baseline, where the cut lands at the edge of the
            viewport and is already invisible — so the mask comes back off.
            Delete both once the clip is regenerated with the feet in frame.
          */
          className="h-full w-auto object-contain object-bottom
            [mask-image:linear-gradient(to_bottom,#000_92%,transparent_99%)]
            md:[mask-image:none]"
        />
      </div>
    </>
  );
}
